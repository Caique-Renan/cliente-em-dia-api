import axios from 'axios';
import { z } from 'zod';

const API_URL = 'http://localhost:3333';

async function runTests() {
  try {
    console.log('--- STARTING ATTENDANCES API TESTS ---');

    const randomEmail = `test${Date.now()}@test.com`;
    // Register
    console.log('1. Registering new user...');
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: randomEmail,
      password: 'password123',
      companyName: 'Test Company'
    });
    
    // Login
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: randomEmail,
      password: 'password123',
    });
    const token = loginRes.data.token;
    
    // Select company
    console.log('Fetching me...');
    const companiesRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const companyId = companiesRes.data.user?.companies?.[0]?.companyId || companiesRes.data.companies?.[0]?.company?.id || companiesRes.data.companies?.[0]?.companyId;
    console.log('Selecting company...', companyId);
    const selectRes = await axios.post(`${API_URL}/auth/select-company`, { companyId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const finalToken = selectRes.data.token;
    const axiosInstance = axios.create({ headers: { Authorization: `Bearer ${finalToken}` } });

    // 2. Create a customer to attach the attendance to
    console.log('2. Creating customer...');
    const customerRes = await axiosInstance.post('/customers', {
      name: 'Cliente para Atendimento Teste',
      phone: '11999999999'
    });
    const customerId = customerRes.data.id;

    // 3. Create attendance
    console.log('3. Creating attendance...');
    const createRes = await axiosInstance.post('/attendances', {
      customerId,
      title: 'Dúvida sobre orçamento',
      description: 'Cliente ligou querendo saber valores.',
      priority: 'HIGH',
      potentialValueCents: 15000 // R$ 150,00
    });
    console.log('Attendance created:', createRes.data.id);
    const attendanceId = createRes.data.id;

    // 4. Update attendance
    console.log('4. Updating attendance...');
    const updateRes = await axiosInstance.patch(`/attendances/${attendanceId}`, {
      description: 'Cliente ligou querendo saber valores. Informou que tem pressa.',
    });
    if (updateRes.data.description.includes('pressa')) {
      console.log('Update OK');
    }

    // 5. Update Status
    console.log('5. Updating status to IN_PROGRESS...');
    const statusRes = await axiosInstance.patch(`/attendances/${attendanceId}/status`, {
      status: 'IN_PROGRESS'
    });
    if (statusRes.data.status === 'IN_PROGRESS') {
      console.log('Status update OK');
    }

    // 6. List attendances for this customer
    console.log('6. Listing attendances...');
    const listRes = await axiosInstance.get(`/attendances?customerId=${customerId}`);
    console.log(`Found ${listRes.data.pagination.total} attendances for customer.`);

    console.log('--- ALL TESTS PASSED ---');
  } catch (error: any) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

runTests();
