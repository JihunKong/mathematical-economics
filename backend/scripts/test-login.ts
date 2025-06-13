import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login with teacher@example.com...');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'teacher@example.com',
      password: 'teacher123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
  } catch (error: any) {
    console.error('Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();