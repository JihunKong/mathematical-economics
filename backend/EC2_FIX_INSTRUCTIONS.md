# EC2 Deployment Fix Instructions

## Problem
The class creation was failing with a 500 error on the EC2 deployment due to:
1. Teacher registration requiring a class code
2. JWT tokens from local development not being valid on EC2

## Solution Applied

### 1. Fixed Registration Validation
- Modified `src/utils/validators.ts` to make `classCode` optional for teachers
- Teachers can now register without a class code
- Students still require a class code to join a class

### 2. Created Teacher Setup Script
- Added `scripts/createTeacherAccount.ts` to create default teacher accounts
- Script creates demo teachers with known credentials

### 3. Enhanced Error Logging
- Added detailed logging to `teacherController.ts` for better debugging
- Logs now include user info, request body, and error details

## Deployment Steps on EC2

1. **SSH into EC2 server:**
   ```bash
   ssh ubuntu@43.203.121.32
   ```

2. **Navigate to project directory:**
   ```bash
   cd /path/to/mathematical-economics
   ```

3. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

4. **Rebuild backend container:**
   ```bash
   docker-compose -f docker-compose.prod.yml build backend
   docker-compose -f docker-compose.prod.yml up -d backend
   ```

5. **Run teacher account setup (inside container):**
   ```bash
   docker exec -it math-econ-backend npm run create:teachers
   ```

   This will create the following teacher accounts:
   - Email: `teacher@matheconomics.com`, Password: `Teacher123!`
   - Email: `teacher2@matheconomics.com`, Password: `Teacher123!`
   - Email: `demo.teacher@matheconomics.com`, Password: `DemoTeacher123!`

6. **Verify the fix:**
   - Login to the frontend with one of the teacher accounts
   - Try creating a new class
   - Check logs if issues persist:
     ```bash
     docker logs math-econ-backend --tail 100
     ```

## Testing the Fix

### Test Teacher Registration (without EC2 access):
```bash
curl -X POST http://43.203.121.32:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testteacher@example.com",
    "password": "password123",
    "name": "Test Teacher",
    "role": "TEACHER"
  }'
```

### Test Class Creation:
```bash
# First login to get token
TOKEN=$(curl -X POST http://43.203.121.32:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@matheconomics.com",
    "password": "Teacher123!"
  }' | jq -r '.data.accessToken')

# Then create class
curl -X POST http://43.203.121.32:5001/api/teacher/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Class",
    "startDate": "2025-06-15T00:00:00Z"
  }'
```

## Monitoring

Watch the backend logs for any errors:
```bash
docker logs -f math-econ-backend
```

## Rollback Plan

If issues persist after deployment:
1. Check the database connection in the container
2. Verify environment variables are set correctly
3. Ensure Redis is running and accessible
4. Roll back to previous version if necessary:
   ```bash
   git checkout <previous-commit>
   docker-compose -f docker-compose.prod.yml build backend
   docker-compose -f docker-compose.prod.yml up -d backend
   ```