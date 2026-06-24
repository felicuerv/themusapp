# Backend - Plataforma Legal MVP

API REST para la plataforma de conexión entre clientes y abogados.

## Stack Tecnológico

- Node.js + Express
- PostgreSQL
- JWT para autenticación
- bcryptjs para hash de contraseñas

## Instalación

```bash
npm install
```

## Configuración

1. Copiar el archivo de ejemplo de variables de entorno:
```bash
cp .env.example .env
```

2. Editar `.env` con tus configuraciones:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=plataforma_legal
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
```

3. Asegúrate de tener PostgreSQL instalado y corriendo.

## Setup de Base de Datos

Ejecutar el script de setup para crear la base de datos y las tablas:

```bash
npm run db:setup
```

Este script:
- Crea la base de datos si no existe
- Ejecuta el schema SQL
- Crea un usuario admin por defecto (email: admin@plataforma-legal.com, password: admin123)

## Ejecución

### Modo desarrollo (con nodemon)
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints

### Autenticación (`/auth`)

- `POST /auth/register` - Registrar nuevo usuario
  - Body: `{ nombre, email, password, rol }`
  - Roles: `cliente` o `abogado`

- `POST /auth/login` - Iniciar sesión
  - Body: `{ email, password }`
  - Response: `{ user, token }`

- `GET /auth/me` - Obtener usuario autenticado
  - Headers: `Authorization: Bearer <token>`

### Casos (`/cases`)

- `POST /cases` - Crear caso (solo cliente)
- `GET /cases/mine` - Obtener mis casos (cliente)
- `GET /cases/open` - Obtener casos abiertos (abogado)
- `GET /cases/:id` - Obtener caso por ID
- `PATCH /cases/:id` - Actualizar caso

### Abogados (`/lawyers`)

- `GET /lawyers` - Listar abogados (admin)
- `GET /lawyers/:id` - Obtener perfil de abogado
- `PUT /lawyers/:id` - Actualizar perfil de abogado

### Postulaciones (`/applications`)

- `POST /applications/:caseId` - Postularse a un caso (abogado)
- `GET /applications/:caseId` - Obtener postulaciones (cliente/admin)

### Mensajes (`/messages`)

- `GET /messages/:caseId` - Obtener mensajes de un caso
- `POST /messages/:caseId` - Enviar mensaje
  - Body: `{ toUserId, contenido }`

### Admin (`/admin`)

- `PATCH /admin/lawyers/:id` - Verificar abogado
- `PATCH /admin/cases/:id` - Actualizar estado de caso
- `GET /admin/cases` - Obtener todos los casos

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Configuración de PostgreSQL
│   ├── controllers/          # Lógica de negocio
│   │   ├── authController.js
│   │   ├── casesController.js
│   │   ├── lawyersController.js
│   │   ├── applicationsController.js
│   │   ├── messagesController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js           # Middleware de autenticación
│   ├── routes/               # Definición de rutas
│   │   ├── authRoutes.js
│   │   ├── casesRoutes.js
│   │   ├── lawyersRoutes.js
│   │   ├── applicationsRoutes.js
│   │   ├── messagesRoutes.js
│   │   └── adminRoutes.js
│   └── index.js             # Entrada de la aplicación
├── scripts/
│   ├── setup-db.js          # Script de setup de BD
│   └── schema.sql           # Schema SQL
├── package.json
├── .env.example
└── README.md
```

## Roles y Permisos

### Cliente
- Crear casos
- Ver sus propios casos
- Ver postulaciones a sus casos
- Chatear con abogados postulados

### Abogado
- Ver casos abiertos
- Postularse a casos
- Completar perfil profesional
- Chatear con clientes

### Admin
- Ver todos los casos y abogados
- Verificar abogados
- Cambiar estado de casos

## Base de Datos

### Entidades principales:

- `users` - Usuarios del sistema
- `lawyer_profiles` - Perfiles de abogados
- `client_profiles` - Perfiles de clientes
- `cases` - Casos legales
- `applications` - Postulaciones a casos
- `messages` - Mensajes entre usuarios

Ver `scripts/schema.sql` para el schema completo.
