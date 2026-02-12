// Test login error messages
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testLoginErrors() {
    console.log('🧪 Testing Login Error Messages\n');

    // Test 1: Empty credentials
    console.log('Test 1: Empty email/password');
    try {
        const res = await axios.post(`${BASE_URL}/user/login`, {
            email: '',
            password: ''
        });
        console.log('❌ Should have failed');
    } catch (err) {
        console.log('✅ Response:', err.response?.data);
    }
    console.log('');

    // Test 2: Account not found
    console.log('Test 2: Account not found');
    try {
        const res = await axios.post(`${BASE_URL}/user/login`, {
            email: 'notexist@test.com',
            password: '123456'
        });
        console.log('❌ Should have failed');
    } catch (err) {
        console.log('✅ Response:', err.response?.data);
    }
    console.log('');

    // Test 3: Wrong password (assuming test@test.com exists)
    console.log('Test 3: Wrong password');
    try {
        const res = await axios.post(`${BASE_URL}/user/login`, {
            email: 'test@test.com',
            password: 'wrongpassword123'
        });
        console.log('❌ Should have failed');
    } catch (err) {
        console.log('✅ Response:', err.response?.data);
    }
    console.log('');

    // Test 4: Missing password
    console.log('Test 4: Missing password');
    try {
        const res = await axios.post(`${BASE_URL}/user/login`, {
            email: 'test@test.com'
        });
        console.log('❌ Should have failed');
    } catch (err) {
        console.log('✅ Response:', err.response?.data);
    }

    console.log('\n✅ All tests completed!');
}

testLoginErrors().catch(console.error);
