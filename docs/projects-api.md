# API de Gestión de Proyectos

## Rutas Implementadas

### 🔐 Todas las rutas requieren autenticación JWT
**Header requerido:** `Authorization: Bearer <jwt_token>`

---

## 📋 **GET /projects** - Listar proyectos (con filtros y paginación)

### Query Parameters:
- `page` (number, default: 1) - Página actual
- `limit` (number, default: 10) - Elementos por página
- `status` (string, opcional) - Filtrar por estado: planning | in_progress | completed | canceled
- `priority` (string, opcional) - Filtrar por prioridad: low | medium | high
- `managerId` (string, opcional) - Filtrar por ID del manager

### Ejemplo:
```bash
GET /projects?page=1&limit=5&status=in_progress&priority=high
```

### Respuesta:
```json
{
  "projects": [...],
  "total": 25,
  "page": 1,
  "totalPages": 5
}
```

---

## ➕ **POST /projects** - Crear nuevo proyecto

### Body:
```json
{
  "name": "Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "status": "planning",
  "priority": "medium",
  "startDate": "2025-09-01",
  "endDate": "2025-12-31",
  "managerId": "64a1b2c3d4e5f6789abcdef0",
  "developersIds": [
    "64a1b2c3d4e5f6789abcdef1",
    "64a1b2c3d4e5f6789abcdef2"
  ]
}
```

### Campos requeridos:
- `name` (string)
- `managerId` (string - ObjectId)

### Campos opcionales:
- `description`, `status`, `priority`, `startDate`, `endDate`, `developersIds`

---

## 🔍 **GET /projects/:id** - Obtener proyecto específico

### Ejemplo:
```bash
GET /projects/64a1b2c3d4e5f6789abcdef0
```

### Respuesta:
```json
{
  "_id": "64a1b2c3d4e5f6789abcdef0",
  "name": "Proyecto Ejemplo",
  "description": "Descripción del proyecto",
  "status": "in_progress",
  "priority": "high",
  "startDate": "2025-09-01T00:00:00.000Z",
  "endDate": "2025-12-31T00:00:00.000Z",
  "managerId": {
    "_id": "64a1b2c3d4e5f6789abcdef1",
    "name": "Juan Manager",
    "email": "manager@example.com",
    "role": "manager"
  },
  "developersIds": [
    {
      "_id": "64a1b2c3d4e5f6789abcdef2",
      "name": "Ana Developer",
      "email": "dev1@example.com",
      "role": "developer"
    }
  ],
  "createdAt": "2025-08-30T10:00:00.000Z",
  "updatedAt": "2025-08-30T15:30:00.000Z"
}
```

---

## ✏️ **PUT /projects/:id** - Actualizar proyecto

### Body (todos los campos son opcionales):
```json
{
  "name": "Proyecto Actualizado",
  "description": "Nueva descripción",
  "status": "completed",
  "priority": "low",
  "endDate": "2026-01-31",
  "developersIds": [
    "64a1b2c3d4e5f6789abcdef1"
  ]
}
```

---

## 🗑️ **DELETE /projects/:id** - Eliminar proyecto

### Ejemplo:
```bash
DELETE /projects/64a1b2c3d4e5f6789abcdef0
```

### Respuesta:
```json
{
  "message": "Project deleted successfully"
}
```

---

## 🔧 **Rutas Adicionales**

### **GET /projects/manager/:managerId** - Proyectos de un manager específico
```bash
GET /projects/manager/64a1b2c3d4e5f6789abcdef0
```

### **GET /projects/developer/:developerId** - Proyectos de un developer específico
```bash
GET /projects/developer/64a1b2c3d4e5f6789abcdef0
```

---

## 📊 **Enums Disponibles**

### ProjectStatus:
- `planning` - En planificación
- `in_progress` - En progreso
- `completed` - Completado
- `canceled` - Cancelado

### Priority:
- `low` - Baja
- `medium` - Media
- `high` - Alta

---

## ⚠️ **Códigos de Error**

- `400` - Bad Request (ID inválido, datos incorrectos)
- `401` - Unauthorized (Token JWT inválido)
- `404` - Not Found (Proyecto no encontrado)
- `500` - Internal Server Error

---

## 📝 **Notas**

1. Todas las fechas deben estar en formato ISO 8601
2. Los IDs deben ser ObjectId válidos de MongoDB
3. La paginación comienza en página 1
4. Los campos de referencia se populan automáticamente con información básica del usuario
