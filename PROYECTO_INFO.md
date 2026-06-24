# Información del Proyecto - Plataforma Legal MVP

## Resumen Ejecutivo

Plataforma web que conecta clientes que necesitan servicios legales con abogados independientes. El MVP permite a los clientes publicar casos y a los abogados postularse para tomarlos.

## Tecnologías Utilizadas

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Seguridad:** bcryptjs para hash de contraseñas
- **Validación:** express-validator

### Frontend
- **Framework:** Angular 18 (standalone components)
- **Lenguaje:** TypeScript
- **HTTP Client:** Angular HttpClient
- **Routing:** Angular Router
- **Gestión de estado:** RxJS + Services

## Arquitectura

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Angular   │ ──HTTP──→│   Express   │ ──SQL──→│  PostgreSQL  │
│  Frontend   │ ←─JSON──│   Backend   │ ←─Data──│   Database   │
│  (Port 4200)│         │  (Port 3000)│         │              │
└─────────────┘         └─────────────┘         └──────────────┘
```

## Entidades de Base de Datos

### users
- Almacena todos los usuarios del sistema
- Campos: id, nombre, email, password (hasheado), rol
- Roles: cliente, abogado, admin

### lawyer_profiles
- Perfil profesional de abogados
- Campos: matricula, especialidades[], bio, verificado, ciudad
- Relación 1:1 con users

### client_profiles
- Perfil de clientes
- Campos: ciudad, telefono
- Relación 1:1 con users

### cases
- Casos legales publicados por clientes
- Campos: titulo, descripcion, tipo, urgencia, estado
- Estados: abierto, en_proceso, cerrado

### applications
- Postulaciones de abogados a casos
- Relación muchos a muchos entre lawyers y cases

### messages
- Mensajes entre usuarios (preparado para chat)

## Credenciales de Prueba

### Usuario Administrador
```
Email: admin@plataforma-legal.com
Password: admin123
```

### Usuarios de Prueba (crear manualmente)
```
Cliente:
Email: cliente@test.com
Password: test123

Abogado:
Email: abogado@test.com
Password: test123
```

## Funcionalidades Implementadas

### ✅ Autenticación y Autorización
- [x] Registro de usuarios (cliente/abogado)
- [x] Login con JWT
- [x] Guards por roles
- [x] Interceptor HTTP para tokens

### ✅ Módulo de Cliente
- [x] Publicar casos legales
- [x] Ver mis casos
- [x] Ver postulaciones recibidas
- [x] Filtrar por estado

### ✅ Módulo de Abogado
- [x] Completar perfil profesional
- [x] Ver casos disponibles
- [x] Postularse a casos
- [x] Ver si ya se postuló a un caso

### ✅ Módulo de Admin
- [x] Verificar abogados
- [x] Gestionar casos (cambiar estado)
- [x] Ver todos los abogados
- [x] Ver todos los casos

### ✅ API REST Completa
- [x] CRUD de casos
- [x] Sistema de postulaciones
- [x] Gestión de perfiles
- [x] Endpoints de administración

## Seguridad Implementada

1. **Contraseñas hasheadas** con bcryptjs (salt rounds: 10)
2. **JWT tokens** para autenticación stateless
3. **Guards de autorización** por rol
4. **Validación de inputs** con express-validator
5. **CORS configurado** para origen específico
6. **SQL parametrizado** para prevenir SQL injection

## Endpoints Principales

### Autenticación (`/auth`)
```
POST   /auth/register    - Registro de usuario
POST   /auth/login       - Iniciar sesión
GET    /auth/me          - Usuario actual
```

### Casos (`/cases`)
```
POST   /cases            - Crear caso (cliente)
GET    /cases/mine       - Mis casos (cliente)
GET    /cases/open       - Casos abiertos (abogado)
GET    /cases/:id        - Detalle de caso
PATCH  /cases/:id        - Actualizar caso
```

### Abogados (`/lawyers`)
```
GET    /lawyers/:id      - Perfil de abogado
PUT    /lawyers/:id      - Actualizar perfil
GET    /lawyers          - Todos los abogados (admin)
```

### Postulaciones (`/applications`)
```
POST   /applications/:caseId    - Postularse a caso
GET    /applications/:caseId    - Ver postulaciones
```

### Admin (`/admin`)
```
PATCH  /admin/lawyers/:id       - Verificar abogado
PATCH  /admin/cases/:id         - Actualizar caso
GET    /admin/cases             - Todos los casos
```

## Rutas del Frontend

```
/login                    - Inicio de sesión
/register                 - Registro

/cliente/casos            - Lista de casos del cliente
/cliente/casos/nuevo      - Crear nuevo caso
/cliente/casos/:id        - Ver detalle y postulaciones

/abogado/perfil           - Completar perfil profesional
/abogado/casos            - Ver casos disponibles
/abogado/casos/:id        - Ver detalle y postularse

/admin/abogados           - Gestionar abogados
/admin/casos              - Gestionar casos
```

## Scripts Disponibles

### Backend
```bash
npm run dev          # Servidor desarrollo con nodemon
npm start            # Servidor producción
npm run db:setup     # Crear base de datos y schema
npm run create-admin # Crear/actualizar usuario admin
```

### Frontend
```bash
npm start            # Desarrollo (ng serve)
npm run build        # Build producción
npm run watch        # Build con watch mode
```

## Variables de Entorno Requeridas

```env
# Backend (.env)
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=plataforma_legal
JWT_SECRET=clave_secreta_aleatoria
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
```

## Características Técnicas Destacadas

### Backend
- ✅ API RESTful bien estructurada
- ✅ Separación de concerns (routes, controllers, middleware)
- ✅ Manejo de errores centralizado
- ✅ Validación de datos con express-validator
- ✅ Conexión pool a PostgreSQL
- ✅ Logs de requests

### Frontend
- ✅ Standalone components (Angular moderno)
- ✅ Lazy loading de rutas
- ✅ Guards funcionales
- ✅ Interceptor HTTP
- ✅ Reactive programming con RxJS
- ✅ Tipado estricto con TypeScript
- ✅ Arquitectura escalable

## Limitaciones del MVP

**Lo que NO incluye este MVP:**
- ❌ Chat en tiempo real (WebSockets)
- ❌ Adjuntar documentos/archivos
- ❌ Sistema de pagos
- ❌ Notificaciones push/email
- ❌ Calificaciones y reseñas
- ❌ Búsqueda avanzada con filtros
- ❌ Geolocalización
- ❌ Estadísticas y dashboards
- ❌ Recuperación de contraseña
- ❌ Verificación de email
- ❌ Tests automatizados

## Próximas Funcionalidades Sugeridas

### Fase 2 - Comunicación
1. Chat en tiempo real con Socket.io
2. Notificaciones por email
3. Sistema de notificaciones in-app

### Fase 3 - Profesionalización
4. Adjuntar documentos PDF
5. Video llamadas
6. Firma digital de contratos
7. Sistema de pagos (Stripe/MercadoPago)

### Fase 4 - Mejoras
8. Calificaciones y reseñas
9. Búsqueda avanzada con filtros
10. Panel de estadísticas
11. Reporte de casos en PDF
12. Sistema de FAQ

## Consideraciones de Producción

Antes de llevar a producción:

1. **Seguridad:**
   - Cambiar JWT_SECRET a valor aleatorio fuerte
   - Implementar HTTPS
   - Configurar rate limiting
   - Agregar helmet.js para headers de seguridad
   - Implementar refresh tokens

2. **Base de datos:**
   - Configurar backups automáticos
   - Implementar migraciones con herramientas como Knex
   - Optimizar queries con índices adicionales

3. **Frontend:**
   - Build optimizado para producción
   - Implementar lazy loading de imágenes
   - Agregar Service Worker para PWA
   - Configurar analytics

4. **Infraestructura:**
   - Usar variables de entorno seguras
   - Implementar logging robusto (Winston, Morgan)
   - Monitoreo de errores (Sentry)
   - CI/CD pipeline
   - Contenedorización con Docker

5. **Testing:**
   - Tests unitarios (Jest)
   - Tests de integración
   - Tests E2E (Cypress/Playwright)

## Métricas del Proyecto

- **Líneas de código (aprox):** 3000+
- **Endpoints API:** 20+
- **Componentes Angular:** 10+
- **Servicios:** 4
- **Guards:** 4
- **Tablas de BD:** 6
- **Tiempo de desarrollo estimado:** 40-60 horas

## Licencia

MIT License - Ver archivo LICENSE para más detalles

## Autor

Proyecto creado como MVP para plataforma de servicios legales.

## Contacto y Soporte

Para dudas o problemas técnicos, revisar:
- README.md principal
- GUIA_INICIO.md
- backend/README.md
- frontend/README.md
