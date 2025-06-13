const bcrypt = require('bcrypt');

async function testAuth() {
  const password = 'password123';
  const hash = '$2b$10$1.kiJA.nEr/dk2B8f6RDjOscbpo/gMAbfXVW4qynsXmz1hbq61zeO';
  
  console.log('Testing password:', password);
  console.log('Against hash:', hash);
  
  const result = await bcrypt.compare(password, hash);
  console.log('Result:', result);
}

testAuth().catch(console.error);