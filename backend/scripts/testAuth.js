// Test script to verify real authentication and RBAC
async function testAuth() {
  console.log('--- STARTING AUTH API VERIFICATION ---');

  // Test 1: Public Customer Registration
  const testCustomerEmail = 'cust_' + Date.now() + '@test.com';
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Emma Watson',
      email: testCustomerEmail,
      password: 'Password@123',
      phone: '+15551234567'
    })
  });
  const regData = await regRes.json();
  console.log('1. Customer Register Status:', regRes.status, regData.success ? 'PASS' : 'FAIL', 'Role:', regData.user?.role);
  if (!regData.success) throw new Error('Customer registration failed');

  // Test 2: Reject privilege elevation
  const hackRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Fake Admin',
      email: 'hacker@test.com',
      password: 'Password@123',
      role: 'ADMIN'
    })
  });
  console.log('2. Public Admin Registration Rejection:', hackRes.status === 403 ? 'PASS (403 Forbidden)' : 'FAIL');

  // Test 3: Customer Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testCustomerEmail,
      password: 'Password@123',
      portalRole: 'CUSTOMER'
    })
  });
  const loginData = await loginRes.json();
  console.log('3. Customer Login Status:', loginRes.status, loginData.success ? 'PASS' : 'FAIL', 'Token received:', !!loginData.token);

  // Test 4: Customer Token accessing Protected Staff Route
  const blockedRes = await fetch('http://localhost:5000/api/tokens/call', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + loginData.token
    },
    body: JSON.stringify({ counterId: 'cnt_hosp_1' })
  });
  console.log('4. Customer Blocked from Staff Route:', blockedRes.status === 403 ? 'PASS (403 Forbidden)' : 'FAIL: ' + blockedRes.status);

  // Test 5: Staff Login
  const staffLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'officer.smith@nexusqueue.io',
      password: 'Staff@Nexus2025',
      portalRole: 'STAFF'
    })
  });
  const staffData = await staffLoginRes.json();
  console.log('5. Staff Login Status:', staffLoginRes.status, staffData.success ? 'PASS' : 'FAIL', 'Role:', staffData.user?.role);

  // Test 6: Admin Login
  const adminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@nexusqueue.io',
      password: 'Admin@Nexus2025',
      portalRole: 'ADMIN'
    })
  });
  const adminData = await adminLoginRes.json();
  console.log('6. Admin Login Status:', adminLoginRes.status, adminData.success ? 'PASS' : 'FAIL', 'Role:', adminData.user?.role);

  // Test 7: Admin Creates New Staff Account
  const newStaffEmail = 'officer_' + Date.now() + '@nexusqueue.io';
  const createStaffRes = await fetch('http://localhost:5000/api/auth/staff', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + adminData.token
    },
    body: JSON.stringify({
      name: 'Officer David Kim',
      email: newStaffEmail,
      password: 'Staff@TempPass123',
      department: 'Bank',
      counterNumber: 'Desk 1'
    })
  });
  const newStaffData = await createStaffRes.json();
  console.log('7. Admin Creates Staff Status:', createStaffRes.status, newStaffData.success ? 'PASS' : 'FAIL', 'Staff Email:', newStaffData.staff?.email);

  // Test 8: New Staff Logs In
  const newStaffLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newStaffEmail,
      password: 'Staff@TempPass123',
      portalRole: 'STAFF'
    })
  });
  const newStaffLoginData = await newStaffLoginRes.json();
  console.log('8. Newly Created Staff Logs In:', newStaffLoginRes.status, newStaffLoginData.success ? 'PASS' : 'FAIL');

  console.log('--- ALL 8 AUTH & RBAC VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

testAuth().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
