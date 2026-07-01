import axios from 'axios';
import { CustomerStatus, CustomerSource } from '@prisma/client';

const API_URL = 'http://localhost:3333';
let primaryToken = '';
let activeCompanyId = '';
let fullToken = '';
let customerId = '';

async function runTests() {
  console.log('--- STARTING CUSTOMERS API TESTS ---\n');
  try {
    // 1. Auth Setup
    console.log('[Prep] Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'teste@clienteemdia.com',
      password: '123456'
    });
    primaryToken = loginRes.data.token;
    const company = loginRes.data.companies[0];
    activeCompanyId = company.id;

    const selectRes = await axios.post(`${API_URL}/auth/select-company`, {
      companyId: activeCompanyId
    }, {
      headers: { Authorization: `Bearer ${primaryToken}` }
    });
    fullToken = selectRes.data.token;
    console.log('Login successful. Full token obtained.\n');

    // 2. Negative Tests
    console.log('[Negative] GET /customers without token');
    try {
      await axios.get(`${API_URL}/customers`);
    } catch (e: any) {
      console.log(`Status: ${e.response?.status}`);
      console.log(`Body:`, e.response?.data, '\n');
    }

    console.log('[Negative] GET /customers with primary token only (no activeCompanyId)');
    try {
      await axios.get(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${primaryToken}` }
      });
    } catch (e: any) {
      console.log(`Status: ${e.response?.status}`);
      console.log(`Body:`, e.response?.data, '\n');
    }

    console.log('[Negative] POST /customers trying to inject companyId');
    try {
      const res = await axios.post(`${API_URL}/customers`, {
        name: 'Hacker',
        phone: '11999999999',
        companyId: 'uuid-fake-1234'
      }, {
        headers: { Authorization: `Bearer ${fullToken}` }
      });
      console.log('Created, but lets check if companyId was ignored (it should use token activeCompanyId)');
      console.log(`Returned companyId: ${res.data.companyId}`);
      console.log(`Expected companyId: ${activeCompanyId}`);
    } catch (e: any) {
      console.log('Error:', e.response?.data);
    }

    // 3. Positive CRUD Tests
    console.log('\n[Positive] POST /customers (Create)');
    const createRes = await axios.post(`${API_URL}/customers`, {
      name: 'Maria Teste',
      phone: '13988887777',
      email: 'maria@teste.com',
      source: CustomerSource.WHATSAPP
    }, {
      headers: { Authorization: `Bearer ${fullToken}` }
    });
    customerId = createRes.data.id;
    console.log(`Created customer with ID: ${customerId}\n`);

    console.log('[Positive] GET /customers (List)');
    const listRes = await axios.get(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${fullToken}` }
    });
    console.log(`Total customers found: ${listRes.data.pagination.total}`);
    console.log(`First customer name: ${listRes.data.data[0]?.name}\n`);

    console.log('[Positive] GET /customers/:id (FindById)');
    const getRes = await axios.get(`${API_URL}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${fullToken}` }
    });
    console.log(`Fetched customer name: ${getRes.data.name}\n`);

    console.log('[Positive] PATCH /customers/:id (Edit)');
    const editRes = await axios.patch(`${API_URL}/customers/${customerId}`, {
      name: 'Maria Editada'
    }, {
      headers: { Authorization: `Bearer ${fullToken}` }
    });
    console.log(`Updated customer name: ${editRes.data.name}\n`);

    console.log('[Positive] PATCH /customers/:id/status (Change Status)');
    const statusRes = await axios.patch(`${API_URL}/customers/${customerId}/status`, {
      status: CustomerStatus.INACTIVE
    }, {
      headers: { Authorization: `Bearer ${fullToken}` }
    });
    console.log(`Updated customer status: ${statusRes.data.status}\n`);

    console.log('--- CUSTOMERS API TESTS COMPLETED ---');
  } catch (error: any) {
    console.error('Fatal Test Error:', error.response?.data || error.message);
  }
}

runTests();
