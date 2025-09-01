# API Endpoints Documentation

## Base URL
```
http://localhost:3004/api/v1
```

## Authentication Endpoints

### Register User
- **URL:** `POST /api/v1/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Login
- **URL:** `POST /api/v1/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Refresh Token
- **URL:** `POST /api/v1/auth/refresh`
- **Body:**
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

### Logout
- **URL:** `POST /api/v1/auth/logout`
- **Headers:** `Authorization: Bearer your_access_token`

### Get Profile
- **URL:** `GET /api/v1/auth/profile`
- **Headers:** `Authorization: Bearer your_access_token`

## Users Endpoints

### Get All Users (Paginated)
- **URL:** `GET /api/v1/users`
- **Query Params:** `?page=1&limit=10&role=developer&isActive=true`
- **Headers:** `Authorization: Bearer your_access_token`

### Get Users with Advanced Filters
- **URL:** `GET /api/v1/users/filtered`
- **Query Params:** 
  - `page`, `limit`, `sortBy`, `sortOrder`
  - `role`, `isActive`, `search`
  - `createdAfter`, `createdBefore`
- **Headers:** `Authorization: Bearer your_access_token`

### Create User (Admin Only)
- **URL:** `POST /api/v1/users`
- **Headers:** `Authorization: Bearer your_admin_access_token`
- **Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123!",
  "role": "manager"
}
```

### Search Users
- **URL:** `GET /api/v1/users/search?q=john`
- **Headers:** `Authorization: Bearer your_access_token`

### Get User by ID
- **URL:** `GET /api/v1/users/:id`
- **Headers:** `Authorization: Bearer your_access_token`

### Update User
- **URL:** `PUT /api/v1/users/:id`
- **Headers:** `Authorization: Bearer your_access_token`

### Delete User (Soft Delete)
- **URL:** `DELETE /api/v1/users/:id`
- **Headers:** `Authorization: Bearer your_access_token`

## Projects Endpoints

### Get All Projects
- **URL:** `GET /api/v1/projects`
- **Headers:** `Authorization: Bearer your_access_token`

### Create Project
- **URL:** `POST /api/v1/projects`
- **Headers:** `Authorization: Bearer your_access_token`

### Get Project by ID
- **URL:** `GET /api/v1/projects/:id`
- **Headers:** `Authorization: Bearer your_access_token`

### Update Project
- **URL:** `PUT /api/v1/projects/:id`
- **Headers:** `Authorization: Bearer your_access_token`

### Delete Project
- **URL:** `DELETE /api/v1/projects/:id`
- **Headers:** `Authorization: Bearer your_access_token`

## Tasks Endpoints

### Get All Tasks
- **URL:** `GET /api/v1/tasks`
- **Headers:** `Authorization: Bearer your_access_token`

### Get Task by ID
- **URL:** `GET /api/v1/tasks/:id`
- **Headers:** `Authorization: Bearer your_access_token`

### Update Task
- **URL:** `PUT /api/v1/tasks/:id`
- **Headers:** `Authorization: Bearer your_access_token`

### Delete Task
- **URL:** `DELETE /api/v1/tasks/:id`
- **Headers:** `Authorization: Bearer your_access_token`

## Important Notes

1. **Authentication Required:** Most endpoints require JWT authentication via Bearer token
2. **Admin Endpoints:** Some endpoints like creating users require admin role
3. **Validation:** All endpoints have robust validation with detailed error messages
4. **Pagination:** List endpoints support pagination with metadata
5. **Soft Delete:** Delete operations don't permanently remove data

## Error Responses

All errors follow this structure:
```json
{
  "statusCode": 400,
  "timestamp": "2025-08-30T22:55:19.000Z",
  "path": "/api/v1/auth/register",
  "method": "POST",
  "error": "BadRequestException",
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password must contain at least one uppercase letter..."]
  }
}
```
