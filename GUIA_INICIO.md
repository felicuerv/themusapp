# Guía de Inicio Rápido - Plataforma Legal MVP

Esta guía te ayudará a poner en marcha el proyecto completo en tu máquina local.

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## Paso 1: Instalar PostgreSQL

### Windows
1. Descarga PostgreSQL desde https://www.postgresql.org/download/windows/
2. Ejecuta el instalador
3. Durante la instalación, recuerda la contraseña que configures para el usuario `postgres`
4. Por defecto, PostgreSQL corre en el puerto 5432

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Paso 2: Configurar el Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Copiar el archivo de configuración
cp .env.example .env
```

### Editar el archivo `.env`

Abre `backend/.env` y configura tus credenciales:

```env
PORT=3000
NODE_ENV=development

# Configurar según tu instalación de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_de_postgres
DB_NAME=plataforma_legal

JWT_SECRET=cambia_esto_por_una_clave_segura_aleatoria
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:4200
```

### Crear la base de datos

```bash
# Ejecutar script de setup (crea la BD y las tablas)
npm run db:setup

# Crear usuario admin
npm run create-admin
```

Esto creará un usuario administrador con:
- Email: `admin@plataforma-legal.com`
- Password: `admin123`

### Iniciar el servidor backend

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# O modo producción
npm start
```

El servidor estará corriendo en `http://localhost:3000`

Para verificar que funciona, abre en tu navegador:
- http://localhost:3000 (debe mostrar info de la API)
- http://localhost:3000/health (debe mostrar status OK)

## Paso 3: Configurar el Frontend

En otra terminal:

```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar la aplicación Angular
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Paso 4: Probar la Aplicación

### Registrar usuarios de prueba

1. Abre http://localhost:4200
2. Haz clic en "Regístrate aquí"
3. Crea un usuario cliente:
   - Nombre: Cliente Test
   - Email: cliente@test.com
   - Contraseña: test123
   - Tipo: Cliente

4. Cierra sesión y crea un usuario abogado:
   - Nombre: Abogado Test
   - Email: abogado@test.com
   - Contraseña: test123
   - Tipo: Abogado

### Flujo de prueba completo

1. **Como Cliente:**
   - Login con `cliente@test.com`
   - Crear un nuevo caso legal
   - Ver el caso publicado

2. **Como Abogado:**
   - Login con `abogado@test.com`
   - Ir a "Mi Perfil" y completar información profesional
   - Ir a "Casos" y ver casos disponibles
   - Postularse a un caso

3. **Como Admin:**
   - Login con `admin@plataforma-legal.com`
   - Ir a "Abogados" y verificar al abogado
   - Ir a "Casos" y gestionar estados

## Estructura del Proyecto

```
plataforma-legal/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── config/       # Configuración DB
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middleware/   # Autenticación
│   │   ├── routes/       # Rutas de la API
│   │   └── index.js      # Entrada
│   ├── scripts/          # Scripts de setup
│   └── package.json
│
├── frontend/             # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Componentes UI
│   │   │   ├── services/    # Servicios API
│   │   │   ├── guards/      # Guards de auth
│   │   │   └── models/      # Interfaces TS
│   │   └── environments/
│   └── package.json
│
└── README.md
```

## Endpoints de la API

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener usuario actual

### Casos
- `POST /cases` - Crear caso (cliente)
- `GET /cases/mine` - Mis casos (cliente)
- `GET /cases/open` - Casos abiertos (abogado)
- `GET /cases/:id` - Detalle de caso

### Postulaciones
- `POST /applications/:caseId` - Postularse (abogado)
- `GET /applications/:caseId` - Ver postulaciones (cliente)

### Admin
- `GET /admin/cases` - Todos los casos
- `PATCH /admin/cases/:id` - Actualizar caso
- `GET /lawyers` - Todos los abogados (admin)
- `PATCH /admin/lawyers/:id` - Verificar abogado

## Solución de Problemas

### Error de conexión a PostgreSQL

Si ves el error "no pg_hba.conf entry" o "password authentication failed":

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # Windows
   services.msc  # Buscar PostgreSQL

   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. Verifica tus credenciales en el archivo `.env`

### Error CORS en el frontend

Si ves errores de CORS en la consola del navegador:

1. Verifica que el backend esté corriendo en el puerto 3000
2. Verifica la variable `CORS_ORIGIN` en `backend/.env`

### Puerto ya en uso

Si el puerto 3000 o 4200 está ocupado:

**Backend:**
- Cambia `PORT=3000` en `backend/.env`

**Frontend:**
- Ejecuta: `ng serve --port 4300`
- Actualiza `CORS_ORIGIN` en `backend/.env`

## Comandos Útiles

### Backend
```bash
npm run dev           # Modo desarrollo
npm start             # Modo producción
npm run db:setup      # Crear base de datos
npm run create-admin  # Crear usuario admin
```

### Frontend
```bash
npm start             # Iniciar app
npm run build         # Build de producción
ng generate component nombre  # Crear componente
```

## Próximos Pasos

Una vez que tengas todo funcionando:

1. Personaliza los estilos en `frontend/src/styles.css`
2. Agrega más tipos de casos en el formulario
3. Implementa el módulo de mensajería completo
4. Agrega validaciones adicionales
5. Implementa carga de archivos para documentos
6. Agrega notificaciones por email

## Soporte

Si encuentras algún problema:

1. Revisa los logs en la terminal del backend
2. Revisa la consola del navegador para errores del frontend
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate de que PostgreSQL esté corriendo

## Seguridad - IMPORTANTE

Antes de llevar a producción:

1. Cambia `JWT_SECRET` a una clave aleatoria y segura
2. Cambia la contraseña del admin
3. Configura HTTPS
4. Revisa y endurece las políticas de CORS
5. Implementa rate limiting
6. Agrega validaciones adicionales en el backend
