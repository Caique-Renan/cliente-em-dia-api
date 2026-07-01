import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const api = axios.create({
  baseURL: 'http://localhost:3333',
  validateStatus: () => true 
});

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- STARTING TESTS ---');

  // Create a blocked user for testing
  const passwordHash = await bcrypt.hash('123456', 10);
  const blockedUserEmail = `blocked_${Date.now()}@test.com`;
  await prisma.user.create({
    data: {
      name: 'Blocked User',
      email: blockedUserEmail,
      passwordHash,
      status: 'BLOCKED'
    }
  });

  // Login successful
  console.log('\n[Prep] POST /auth/login (Valid) to get tokens for negative tests');
  let res = await api.post('/auth/login', {
    email: 'teste@clienteemdia.com',
    password: '123456'
  });
  const primaryToken = res.data.token;

  // 1. Login wrong password
  console.log('\n[Negative] POST /auth/login (Wrong Password)');
  res = await api.post('/auth/login', {
    email: 'teste@clienteemdia.com',
    password: 'wrongpassword'
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body:`, res.data);

  // 2. User INACTIVE or BLOCKED
  console.log('\n[Negative] POST /auth/login (Blocked User)');
  res = await api.post('/auth/login', {
    email: blockedUserEmail,
    password: '123456'
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body:`, res.data);

  // 3. /auth/me sem token
  console.log('\n[Negative] GET /auth/me (No Token)');
  res = await api.get('/auth/me');
  console.log(`Status: ${res.status}`);
  console.log(`Body:`, res.data);

  // 4. /auth/me com token primário (sem activeCompanyId)
  console.log('\n[Negative] GET /auth/me (Primary Token without activeCompanyId)');
  res = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${primaryToken}` }
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body:`, res.data);

  // 5. /auth/select-company com payload inválido no zod (companyId que não é uuid)
  console.log('\n[Negative] POST /auth/select-company (Invalid Payload for Zod)');
  res = await api.post('/auth/select-company', { companyId: 'not-a-uuid' }, {
    headers: { Authorization: `Bearer ${primaryToken}` }
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body:`, res.data);

  // 6. /auth/select-company com empresa inexistente/não pertencente
  console.log('\n[Negative] POST /auth/select-company (Inexistent/Not belonging company)');
  res = await api.post('/auth/select-company', { companyId: '00000000-0000-0000-0000-000000000000' }, {
    headers: { Authorization: `Bearer ${primaryToken}` }
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body:`, res.data);

  // 7. Token inválido ou expirado
  console.log('\n[Negative] GET /auth/me (Invalid token)');
  res = await api.get('/auth/me', {
    headers: { Authorization: `Bearer invalid.token.here` }
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body:`, res.data);

  console.log('\n--- TESTS COMPLETED ---');
  await prisma.$disconnect();
}

runTests().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
