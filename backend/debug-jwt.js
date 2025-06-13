const jwt = require('jsonwebtoken');

const jwtConfig = {
  secret: 'your_jwt_secret_here_change_this_in_production',
  expiresIn: '7d',
  refreshExpiresIn: '30d',
};

const user = {
  id: 'test123',
  email: 'teacher@example.com',
  role: 'TEACHER'
};

const payload = {
  id: user.id,
  email: user.email,
  role: user.role,
};

try {
  console.log('Payload:', payload);
  console.log('Secret:', jwtConfig.secret);
  console.log('ExpiresIn:', jwtConfig.expiresIn);
  
  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: 'HS256',
  });
  
  console.log('Access token generated successfully');
  console.log('Token length:', accessToken.length);
  
  const refreshToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    algorithm: 'HS256',
  });
  
  console.log('Refresh token generated successfully');
} catch (error) {
  console.error('Error:', error);
}