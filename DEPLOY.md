# Deploy to Render - Guía de Despliegue

## 📋 Configuración Previa

### 1. Variables de Entorno Necesarias
Configura estas variables en el dashboard de Render:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key  
ENCRYPTION_KEY=your-32-character-encryption-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
FRONTEND_URL=https://your-frontend-url.com
```

### 2. MongoDB Atlas Setup
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un cluster gratuito
3. Configura el usuario de base de datos
4. Añade tu IP a la whitelist (o 0.0.0.0/0 para cualquier IP)
5. Obtén la connection string

## 🚀 Pasos de Despliegue en Render

### Opción 1: Con render.yaml (Recomendado)
1. Sube tu código a GitHub
2. Conecta tu repositorio a Render
3. Render detectará automáticamente el `render.yaml`
4. Configura las variables de entorno
5. Despliega

### Opción 2: Manual
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`
   - **Health Check Path**: `/api/v1/health`

### 3. Configurar Variables de Entorno
En el dashboard de Render, ve a Environment y añade:
- `NODE_ENV`: production
- `JWT_SECRET`: (genera una clave segura)
- `JWT_REFRESH_SECRET`: (genera otra clave segura)
- `ENCRYPTION_KEY`: (32 caracteres para AES-256)
- `MONGODB_URI`: (tu connection string de MongoDB Atlas)

## 🔧 Características del Dockerfile

- ✅ Multi-stage build para reducir tamaño
- ✅ Usuario no-root para seguridad
- ✅ Health check incluido
- ✅ Optimizado para Render
- ✅ Cache de dependencies
- ✅ Alpine Linux para menor tamaño

## 🏥 Health Check

El endpoint `/api/v1/health` está configurado para:
- Verificar que la aplicación responda
- Timeout de 2 segundos
- Reinicio automático si falla

## 📱 CORS Configuration

Configurado para:
- Desarrollo: localhost:5173, localhost:3000
- Producción: Tu dominio de frontend
- Soporte para cookies y autenticación

## 🔐 Seguridad

- Variables de entorno para secretos
- Headers de seguridad configurados
- Rate limiting (si se implementa)
- Validación de entrada con class-validator

## 🚦 Monitoreo

Una vez desplegado:
1. Verifica el health check: `https://tu-app.onrender.com/api/v1/health`
2. Prueba los endpoints principales
3. Revisa los logs en el dashboard de Render

## 💡 Tips de Optimización

1. **Base de datos**: Usa MongoDB Atlas con índices apropiados
2. **Caching**: Implementa Redis si es necesario
3. **Logs**: Usa winston para logging estructurado
4. **Monitoring**: Considera usar servicios como Sentry

## 🛠️ Troubleshooting

### Error común: "Application failed to respond to HTTP requests"
- Verifica que la app escuche en `0.0.0.0` y puerto `process.env.PORT`
- Confirma que el health check endpoint funcione

### Error de conexión a MongoDB
- Verifica la connection string
- Asegúrate de que la IP esté en la whitelist
- Confirma que el usuario tenga permisos

### Variables de entorno no definidas
- Verifica que todas las variables estén configuradas en Render
- Usa valores por defecto cuando sea apropiado

---

¡Tu aplicación NestJS está lista para producción! 🎉
