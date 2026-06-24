# Plataforma Legal MVP

Plataforma web que conecta clientes que necesitan servicios legales con abogados independientes. Los clientes publican casos y los abogados se postulan para tomarlos.

## Stack Tecnológico

- **Frontend:** Angular 18 (standalone components)
- **Backend:** Node.js + Express (API REST)
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT con roles (cliente, abogado, admin)

## Características Principales

### Para Clientes
- Publicar casos legales con descripción detallada
- Ver todas sus publicaciones
- Recibir y revisar postulaciones de abogados
- Ver perfiles de abogados interesados

### Para Abogados
- Crear perfil profesional (matrícula, especialidades, bio)
- Explorar casos disponibles
- Postularse a casos de interés
- Presentarse a los clientes

### Para Administradores
- Verificar abogados
- Gestionar casos (cambiar estados)
- Moderar la plataforma

## Estructura del Proyecto

```
plataforma-legal/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/            # Configuración de BD
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── middleware/        # Autenticación JWT
│   │   ├── routes/            # Rutas de la API
│   │   └── index.js           # Servidor Express
│   ├── scripts/
│   │   ├── setup-db.js        # Script de setup de BD
│   │   ├── schema.sql         # Schema de PostgreSQL
│   │   └── create-admin.js    # Crear usuario admin
│   └── package.json
│
├── frontend/                   # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Componentes UI
│   │   │   ├── services/      # Servicios de API
│   │   │   ├── guards/        # Guards de autenticación
│   │   │   ├── models/        # Interfaces TypeScript
│   │   │   └── interceptors/  # HTTP Interceptors
│   │   ├── environments/      # Configuración
│   │   └── styles.css         # Estilos globales
│   └── package.json
│
├── GUIA_INICIO.md             # Guía de instalación detallada
├── PROYECTO_INFO.md           # Información completa del proyecto
└── README.md                  # Este archivo
```

## Inicio Rápido

### Requisitos Previos
- Node.js v18+
- PostgreSQL v12+
- npm

### 1. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
npm run db:setup        # Crear base de datos y tablas
npm run create-admin    # Crear usuario admin
npm run dev             # Iniciar servidor en http://localhost:3000
```

### 2. Configurar Frontend

```bash
cd frontend
npm install
npm start               # Iniciar app en http://localhost:4200
```

### 3. Credenciales de Prueba

**Admin:**
- Email: `admin@plataforma-legal.com`
- Password: `admin123`

**Crear usuarios de prueba en la app:**
- Registrar un cliente
- Registrar un abogado

## Funcionalidades Implementadas

✅ Registro y login con roles (cliente/abogado/admin)
✅ Perfiles profesionales para abogados
✅ Publicación de casos por clientes
✅ Sistema de postulaciones de abogados
✅ Panel de administración
✅ Autenticación JWT con guards
✅ API REST completa
✅ Base de datos PostgreSQL con relaciones

## Arquitectura

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Angular    │ ──HTTP─→│   Express    │ ──SQL─→│  PostgreSQL  │
│   Frontend   │←──JSON──│   Backend    │←─Data──│   Database   │
│  Port 4200   │         │  Port 3000   │        │              │
└──────────────┘         └──────────────┘        └──────────────┘
```

## Endpoints Principales

- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Usuario actual
- `POST /cases` - Crear caso
- `GET /cases/mine` - Mis casos (cliente)
- `GET /cases/open` - Casos abiertos (abogado)
- `POST /applications/:caseId` - Postularse a caso
- `GET /applications/:caseId` - Ver postulaciones
- `PATCH /admin/lawyers/:id` - Verificar abogado

## Documentación Completa

- **[GUIA_INICIO.md](GUIA_INICIO.md)** - Guía paso a paso de instalación
- **[PROYECTO_INFO.md](PROYECTO_INFO.md)** - Información técnica completa
- **[backend/README.md](backend/README.md)** - Documentación del backend
- **[frontend/README.md](frontend/README.md)** - Documentación del frontend

## Tecnologías y Librerías

### Backend
- express - Framework web
- pg - Driver de PostgreSQL
- bcryptjs - Hash de contraseñas
- jsonwebtoken - Tokens JWT
- express-validator - Validación de datos
- cors - Cross-Origin Resource Sharing
- dotenv - Variables de entorno

### Frontend
- @angular/core - Framework Angular
- @angular/router - Routing
- @angular/common/http - Cliente HTTP
- rxjs - Programación reactiva
- TypeScript - Tipado estático

## Seguridad

- Contraseñas hasheadas con bcryptjs
- JWT tokens para autenticación
- Guards de autorización por rol
- Validación de inputs
- SQL parametrizado (prevención de SQL injection)
- CORS configurado

## Lo que NO incluye este MVP

- Chat en tiempo real (WebSockets)
- Adjuntar archivos/documentos
- Sistema de pagos
- Notificaciones por email
- Calificaciones y reseñas
- Recuperación de contraseña
- Tests automatizados

## Próximos Pasos

1. Implementar chat en tiempo real con Socket.io
2. Agregar sistema de notificaciones
3. Permitir adjuntar documentos
4. Integrar sistema de pagos
5. Agregar sistema de calificaciones
6. Implementar tests (Jest, Cypress)

## Variables de Entorno

Ver [backend/.env.example](backend/.env.example) para la configuración completa necesaria.

## Licencia

MIT License

## Soporte

Para problemas de instalación o configuración, consulta [GUIA_INICIO.md](GUIA_INICIO.md)
