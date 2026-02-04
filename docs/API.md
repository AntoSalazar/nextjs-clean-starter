# API Reference

## Authentication

All API endpoints (except public ones) require authentication via either:
- **JWT Access Token**: For user sessions
- **API Key**: For programmatic access

### Using JWT

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Using API Key

Include the API key in the Authorization header:

```
Authorization: Bearer sk_<api_key>
```

---

## Auth Endpoints

### POST /api/auth/login

Login and get access tokens.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2024-01-01T00:15:00.000Z",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "fullName": "Super Admin",
    "role": "admin"
  }
}
```

**Cookies Set:**
- `access_token`: HTTP-only cookie with JWT
- `refresh_token`: HTTP-only cookie with refresh token

### POST /api/auth/logout

Logout and invalidate refresh token.

**Response (200):**
```json
{
  "success": true
}
```

### POST /api/auth/refresh

Refresh the access token.

**Request (optional):**
```json
{
  "rotate": true  // Optionally rotate refresh token
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2024-01-01T00:15:00.000Z"
}
```

### GET /api/auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "fullName": "Super Admin",
  "role": "admin",
  "permissions": ["admin:*"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "authMethod": "jwt"
}
```

---

## User Management (Admin Only)

### GET /api/admin/users

List all users.

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "fullName": "Super Admin",
      "role": "admin",
      "permissions": ["admin:*"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/admin/users

Create a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "role": "user",
  "permissions": []
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "permissions": [],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/admin/users/:id

Get a specific user.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "permissions": [],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/admin/users/:id

Update a user.

**Request:**
```json
{
  "fullName": "Jane Doe",
  "role": "admin",
  "isActive": false
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "role": "admin",
    "permissions": [],
    "isActive": false,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/admin/users/:id

Delete a user.

**Response (200):**
```json
{
  "success": true
}
```

---

## API Keys

### GET /api/api-keys

List API keys for the authenticated user.

**Response (200):**
```json
{
  "apiKeys": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Production API",
      "keyPrefix": "a1b2c3d4",
      "scopes": [],
      "isActive": true,
      "lastUsedAt": null,
      "expiresAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/api-keys

Create a new API key.

**Request:**
```json
{
  "name": "Production API",
  "scopes": [],
  "expiresInDays": 30  // Optional
}
```

**Response (201):**
```json
{
  "apiKey": {
    "id": "uuid",
    "userId": "uuid",
    "name": "Production API",
    "keyPrefix": "a1b2c3d4",
    "scopes": [],
    "isActive": true,
    "lastUsedAt": null,
    "expiresAt": "2024-02-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "rawKey": "sk_a1b2c3d4e5f6g7h8..."  // Only shown once!
  },
  "message": "Save this API key securely. It will not be shown again."
}
```

### DELETE /api/api-keys/:id

Revoke an API key.

**Response (200):**
```json
{
  "success": true
}
```

---

## Health Check

### GET /api/health

Check application health.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

**Response (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "disconnected"
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "errors": [  // For validation errors
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `TOKEN_EXPIRED` | 401 | JWT expired |
| `TOKEN_INVALID` | 401 | Invalid JWT |
| `USER_INACTIVE` | 401 | Account disabled |
| `REFRESH_TOKEN_INVALID` | 401 | Invalid refresh token |
| `API_KEY_INVALID` | 401 | Invalid API key |
| `API_KEY_EXPIRED` | 401 | API key expired |
| `INTERNAL_ERROR` | 500 | Server error |
