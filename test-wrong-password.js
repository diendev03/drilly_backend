// Test login with correct account but wrong password
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testWrongPassword() {
    console.log('🧪 Testing Wrong Password\n');

    // First, create a test account
    console.log('Creating test account...');
    try {
        await axios.post(`${BASE_URL}/user/create`, {
            name: 'Test User',
            email: 'testuser@drilly.com',
            phone: '0123456789',
            password: 'correctpassword123'
        });
        console.log('✅ Test account created\n');
    } catch (err) {
        if (err.response?.data?.message?.includes('đã tồn tại')) {
            console.log('ℹ️  Test account already exists\n');
        } else {
            console.log('Error creating account:', err.response?.data);
        }
    }

    // Now test wrong password
    console.log('Test: Login with wrong password');
    try {
        const res = await axios.post(`${BASE_URL}/user/login`, {
            email: 'testuser@drilly.com',
            password: 'wrongpassword456'
        });
        console.log('❌ Should have failed');
    } catch (err) {
        console.log('✅ Response:', err.response?.data);
    }

    console.log('\n✅ Test completed!');
}

testWrongPassword().catch(console.error);
