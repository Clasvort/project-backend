# 🚀 Guía Completa para Probar la API con Postman

## 📋 Configuración Inicial

### 1. URL Base
```
http://localhost:3004/api/v1
```

### 2. Headers Comunes
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (para rutas autenticadas)

---

## 🔐 AUTENTICACIÓN - Paso a Paso

### ✅ 1. Verificar que el servidor esté funcionando

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/api/v1/health`
- **Headers:** Ninguno necesario

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-31T21:53:10.000Z",
  "uptime": 45.2,
  "message": "API is running successfully",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/v1/auth",
    "users": "/api/v1/users",
    "projects": "/api/v1/projects",
    "tasks": "/api/v1/tasks"
  }
}
```

### ✅ 2. Registrar un nuevo usuario

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/api/v1/auth/register`
- **Headers:** 
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a5c2e8b1234567890abc",
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "role": "developer"
  }
}
```

### ✅ 3. Hacer Login

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/api/v1/auth/login`
- **Headers:** 
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a5c2e8b1234567890abc",
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "role": "developer"
  }
}
```

### ✅ 4. Obtener el perfil del usuario

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/api/v1/auth/profile`
- **Headers:** 
  ```
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

**Respuesta esperada:**
```json
{
  "id": "64f8a5c2e8b1234567890abc",
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "role": "developer",
  "isActive": true
}
```

---

## 👥 USUARIOS - CRUD Completo

### ✅ 5. Listar usuarios (con paginación)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/api/v1/users?page=1&limit=10`
- **Headers:** 
  ```
  Authorization: Bearer {tu_access_token}
  ```

### ✅ 6. Buscar usuarios

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/api/v1/users/search?q=juan`
- **Headers:** 
  ```
  Authorization: Bearer {tu_access_token}
  ```

### ✅ 7. Crear usuario (Solo Admin)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/api/v1/users`
- **Headers:** 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_access_token}
  ```
- **Body (raw JSON):**
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "password": "Password123!",
  "role": "manager"
}
```

---

## 📊 PROYECTOS

### ✅ 8. Listar proyectos

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/api/v1/projects`
- **Headers:** 
  ```
  Authorization: Bearer {tu_access_token}
  ```

### ✅ 9. Crear proyecto

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/api/v1/projects`
- **Headers:** 
  ```
  Content-Type: application/json
  Authorization: Bearer {tu_access_token}
  ```
- **Body (raw JSON):**
```json
{
  "name": "Proyecto Web",
  "description": "Aplicación web moderna",
  "status": "in_progress",
  "priority": "high",
  "managerId": "64f8a5c2e8b1234567890abc",
  "developersIds": ["64f8a5c2e8b1234567890def"]
}
```

---

## ✅ TAREAS

### ✅ 10. Listar tareas

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/api/v1/tasks`
- **Headers:** 
  ```
  Authorization: Bearer {tu_access_token}
  ```

### ✅ 11. Obtener tarea específica

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/api/v1/tasks/{task_id}`
- **Headers:** 
  ```
  Authorization: Bearer {tu_access_token}
  ```

---

## 🔄 REFRESH TOKEN

### ✅ 12. Renovar token de acceso

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/api/v1/auth/refresh`
- **Headers:** 
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🚪 LOGOUT

### ✅ 13. Cerrar sesión

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/api/v1/auth/logout`
- **Headers:** 
  ```
  Authorization: Bearer {tu_access_token}
  ```

---

## 🧪 COLECCIÓN DE POSTMAN

### Configurar Variables de Entorno en Postman:

1. **Crear un Environment:**
   - Name: `API Development`
   - Variables:
     ```
     base_url: http://localhost:3004/api/v1
     access_token: {{access_token}}
     refresh_token: {{refresh_token}}
     ```

2. **Script para guardar tokens automáticamente:**

En la pestaña **Tests** de las requests de login/register, agregar:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const responseJson = pm.response.json();
    if (responseJson.access_token) {
        pm.environment.set("access_token", responseJson.access_token);
    }
    if (responseJson.refresh_token) {
        pm.environment.set("refresh_token", responseJson.refresh_token);
    }
}
```

---

## ❗ Errores Comunes y Soluciones

### Error 404 - Cannot GET /auth/register
**❌ Incorrecto:** `GET http://localhost:3004/auth/register`
**✅ Correcto:** `POST http://localhost:3004/api/v1/auth/register`

### Error 401 - Unauthorized
**Problema:** Token no incluido o expirado
**Solución:** Incluir header `Authorization: Bearer {token}`

### Error 400 - Validation failed
**Problema:** Datos no válidos en el body
**Solución:** Verificar que el JSON tenga todos los campos requeridos

### Error 403 - Forbidden
**Problema:** No tienes permisos para esa acción
**Solución:** Usar un token de admin para endpoints restringidos

---

## 🎯 Orden Recomendado de Pruebas

1. ✅ Health Check
2. ✅ Register User
3. ✅ Login
4. ✅ Get Profile
5. ✅ List Users
6. ✅ Create Project
7. ✅ List Projects
8. ✅ List Tasks
9. ✅ Refresh Token
10. ✅ Logout

¡Con esta guía podrás probar completamente toda la API! 🚀
