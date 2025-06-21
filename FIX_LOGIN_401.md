# Fix for Login 401 Unauthorized Error

## Issue Summary
The login API at https://xn--289aykm66cwye.com/api/auth/login is returning 401 Unauthorized due to:
1. JWT_SECRET not properly configured in production
2. Possible database connection issues
3. Admin user may not exist in production database

## Resolution Steps

### 1. Update JWT Secret (COMPLETED)
The following files have been updated with a secure JWT secret:
- `/backend/.env.production` - JWT_SECRET updated
- `/backend/.env.production.ssl` - JWT_SECRET updated
- `/docker-compose.prod.yml` - Added JWT_SECRET to backend environment variables

New JWT Secret: `ciQVI2bSK04ecciOY50057W2Y8d6y3St/qSxRlD3Bao=`

### 2. Deploy Changes to Production Server

SSH into your production server and run:

```bash
# Navigate to project directory
cd /path/to/mathematical-economics

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 3. Create Admin User in Production

After the containers are running, execute:

```bash
# Access the backend container
docker exec -it mathematical-economics-backend sh

# Install dependencies if needed
cd /app
npm install

# Run the admin creation script
npx ts-node scripts/createProductionAdmin.ts

# Or if ts-node is not available, compile and run
npx tsc scripts/createProductionAdmin.ts
node scripts/createProductionAdmin.js

# Exit container
exit
```

### 4. Verify the Fix

Test the login endpoint:

```bash
# Test with admin credentials
curl -X POST https://xn--289aykm66cwye.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"alsk2004A!@#"}'
```

Expected response should include:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 5. Additional Troubleshooting

If the issue persists:

1. **Check Database Connection**:
   ```bash
   docker exec -it mathematical-economics-backend sh
   npx prisma db push
   ```

2. **Verify Environment Variables**:
   ```bash
   docker exec mathematical-economics-backend env | grep JWT
   ```

3. **Check Container Logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs backend | grep -E "(error|Error|ERROR)"
   ```

4. **Database Credentials Issue**:
   Note that docker-compose.prod.yml uses different database credentials:
   - Database: `mathematical_economics`
   - User: `mathuser`
   - Password: `mathpass123`
   
   Ensure these match what's actually deployed.

## Important Notes

- The JWT secret has been changed from placeholder values to a secure random string
- Make sure to keep the JWT secret confidential and never commit it to public repositories
- Consider using environment variable files or secrets management for production
- The admin user credentials are hardcoded in the script - consider changing the password after first login

## Security Recommendations

1. Use environment variables or Docker secrets for sensitive data
2. Rotate JWT secrets periodically
3. Implement proper logging and monitoring
4. Use HTTPS for all API communications (already in place)
5. Consider implementing refresh token rotation