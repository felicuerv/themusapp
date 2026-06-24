# Frontend - Plataforma Legal MVP

Aplicación Angular para la plataforma de conexión entre clientes y abogados.

## Stack Tecnológico

- Angular 18 (standalone components)
- TypeScript
- RxJS
- HttpClient para consumo de API

## Instalación

```bash
npm install
```

## Configuración

El archivo de configuración está en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## Ejecución

### Modo desarrollo
```bash
npm start
# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### Build de producción
```bash
npm run build
```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── auth/               # Login y Registro
│   │   │   ├── cliente/            # Componentes para clientes
│   │   │   ├── abogado/            # Componentes para abogados
│   │   │   ├── admin/              # Componentes para admin
│   │   │   └── shared/             # Componentes compartidos
│   │   ├── guards/                 # Guards de autenticación
│   │   ├── interceptors/           # HTTP Interceptors
│   │   ├── models/                 # Interfaces TypeScript
│   │   ├── services/               # Servicios de API
│   │   ├── app.component.ts
│   │   ├── app.routes.ts           # Configuración de rutas
│   │   └── app.config.ts           # Configuración de la app
│   ├── environments/               # Configuraciones de entorno
│   ├── styles.css                  # Estilos globales
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Rutas de la Aplicación

### Públicas
- `/login` - Inicio de sesión
- `/register` - Registro de usuario

### Cliente (requiere autenticación + rol cliente)
- `/cliente/casos` - Lista de mis casos
- `/cliente/casos/nuevo` - Crear nuevo caso
- `/cliente/casos/:id` - Ver detalle y postulaciones

### Abogado (requiere autenticación + rol abogado)
- `/abogado/perfil` - Completar perfil profesional
- `/abogado/casos` - Ver casos disponibles
- `/abogado/casos/:id` - Ver detalle y postularse

### Admin (requiere autenticación + rol admin)
- `/admin/abogados` - Gestionar abogados
- `/admin/casos` - Gestionar casos

## Guards

- `authGuard` - Verifica que el usuario esté autenticado
- `clienteGuard` - Verifica que el usuario sea cliente
- `abogadoGuard` - Verifica que el usuario sea abogado
- `adminGuard` - Verifica que el usuario sea admin

## Servicios

### AuthService
- Registro y login
- Gestión de tokens JWT
- Estado del usuario autenticado
- Validación de roles

### CaseService
- CRUD de casos
- Listado de casos por rol
- Postulaciones a casos

### LawyerService
- Gestión de perfiles de abogados
- Actualización de información profesional

### MessageService
- Chat entre cliente y abogado (para futuras implementaciones)

## Interceptores

### AuthInterceptor
Agrega automáticamente el token JWT a todas las peticiones HTTP.

## Características del MVP

1. **Autenticación**
   - Login y registro
   - Selección de rol (cliente/abogado)
   - Tokens JWT

2. **Cliente**
   - Publicar casos
   - Ver mis casos
   - Ver postulaciones recibidas

3. **Abogado**
   - Completar perfil profesional
   - Ver casos disponibles
   - Postularse a casos

4. **Admin**
   - Verificar abogados
   - Gestionar casos
   - Ver todos los usuarios

## Estilos

Los estilos globales están en `src/styles.css` con:
- Reset CSS básico
- Estilos para formularios
- Botones con variantes (primary, secondary, success, danger)
- Cards
- Badges
- Navbar
- Clases de utilidad

## Próximos Pasos (fuera del MVP)

- Chat en tiempo real con WebSockets
- Notificaciones
- Adjuntar documentos
- Sistema de pagos
- Calificaciones y reseñas
- Búsqueda avanzada de casos
- Panel de estadísticas
