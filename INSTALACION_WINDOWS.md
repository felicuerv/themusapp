# Guía de Instalación en Windows

Esta guía te ayudará a configurar el proyecto en Windows paso a paso.

## 1. Instalar PostgreSQL en Windows

### Descargar PostgreSQL

1. Ve a https://www.postgresql.org/download/windows/
2. Descarga el instalador de PostgreSQL (versión 12 o superior)
3. Ejecuta el instalador `postgresql-XX-windows-x64.exe`

### Durante la Instalación

1. **Directorio de instalación:** Deja el predeterminado `C:\Program Files\PostgreSQL\XX`
2. **Componentes:** Asegúrate de seleccionar:
   - PostgreSQL Server
   - pgAdmin 4 (herramienta visual)
   - Command Line Tools
3. **Password:** Ingresa una contraseña para el usuario `postgres` y **¡RECUÉRDALA!**
4. **Puerto:** Deja el puerto predeterminado `5432`
5. **Locale:** Deja el predeterminado

### Verificar Instalación

Abre PowerShell o CMD y ejecuta:
```cmd
psql --version
```

Deberías ver algo como: `psql (PostgreSQL) 16.x`

Si el comando no se encuentra, agrega PostgreSQL al PATH:
1. Busca "Variables de entorno" en el menú inicio
2. En "Variables del sistema", edita `Path`
3. Agrega: `C:\Program Files\PostgreSQL\XX\bin`

## 2. Instalar Node.js en Windows

### Descargar Node.js

1. Ve a https://nodejs.org/
2. Descarga la versión LTS (Long Term Support)
3. Ejecuta el instalador `node-vXX.X.X-x64.msi`
4. Durante la instalación, acepta las opciones predeterminadas

### Verificar Instalación

Abre una nueva ventana de PowerShell o CMD:
```cmd
node --version
npm --version
```

## 3. Clonar o Descargar el Proyecto

Si tienes el proyecto en una carpeta:
```cmd
cd C:\Users\tu_usuario\plataforma-legal
```

## 4. Configurar el Backend

### Instalar Dependencias

```cmd
cd backend
npm install
```

### Crear Archivo de Configuración

```cmd
copy .env.example .env
```

### Editar el Archivo .env

Abre el archivo `.env` con el Bloc de notas o VS Code:

```cmd
notepad .env
```

Configura las siguientes variables (usa la contraseña de PostgreSQL que configuraste):

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_DE_POSTGRES_AQUI
DB_NAME=plataforma_legal

JWT_SECRET=mi_clave_super_secreta_12345
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:4200
```

Guarda y cierra el archivo.

### Crear la Base de Datos

```cmd
npm run db:setup
```

Deberías ver:
```
✅ Base de datos 'plataforma_legal' creada
✅ Schema de base de datos creado exitosamente
```

### Crear Usuario Administrador

```cmd
npm run create-admin
```

Deberías ver:
```
✅ Usuario admin creado
📧 Email: admin@plataforma-legal.com
🔑 Password: admin123
```

### Iniciar el Servidor Backend

```cmd
npm run dev
```

Si todo está bien, verás:
```
🚀 Servidor corriendo en http://localhost:3000
📚 Ambiente: development
```

**¡Deja esta ventana abierta!**

## 5. Configurar el Frontend

Abre una **NUEVA** ventana de PowerShell o CMD:

```cmd
cd C:\Users\tu_usuario\plataforma-legal\frontend
```

### Instalar Dependencias

```cmd
npm install
```

Esto puede tomar varios minutos...

### Iniciar la Aplicación Angular

```cmd
npm start
```

Espera a que compile. Verás algo como:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

## 6. Abrir la Aplicación

Abre tu navegador y ve a:
```
http://localhost:4200
```

Deberías ver la pantalla de login de la plataforma.

## 7. Probar la Aplicación

### Crear Usuario Cliente

1. Haz clic en "Regístrate aquí"
2. Completa el formulario:
   - Nombre: Cliente Test
   - Email: cliente@test.com
   - Contraseña: test123
   - Tipo: Cliente (Busco abogado)
3. Haz clic en "Registrarse"

### Publicar un Caso

1. Deberías estar en la pantalla "Mis Casos"
2. Haz clic en "+ Nuevo Caso"
3. Completa el formulario:
   - Título: Asesoría laboral
   - Tipo: Laboral
   - Descripción: Necesito asesoría sobre despido injustificado
   - Urgencia: Media
4. Haz clic en "Publicar caso"

### Crear Usuario Abogado

1. Cierra sesión (botón arriba a la derecha)
2. Haz clic en "Regístrate aquí"
3. Completa el formulario:
   - Nombre: Abogado Test
   - Email: abogado@test.com
   - Contraseña: test123
   - Tipo: Abogado (Ofrezco servicios)
4. Haz clic en "Registrarse"

### Completar Perfil de Abogado

1. Completa tu perfil:
   - Matrícula: 12345
   - Ciudad: Buenos Aires
   - Especialidades: Laboral, Civil
   - Biografía: Abogado con 5 años de experiencia...
2. Haz clic en "Guardar perfil"

### Postularse a un Caso

1. Haz clic en "Casos" en el menú
2. Verás el caso que publicó el cliente
3. Haz clic en "Postularme"
4. Escribe un mensaje de presentación
5. Haz clic en "Enviar postulación"

### Verificar como Admin

1. Cierra sesión
2. Inicia sesión con:
   - Email: admin@plataforma-legal.com
   - Password: admin123
3. Haz clic en "Abogados"
4. Verás al abogado que creaste
5. Haz clic en "Verificar"

## Comandos Útiles

### Detener el Servidor

En cualquier ventana de terminal que esté ejecutando código:
- Presiona `Ctrl + C`

### Reiniciar el Backend

```cmd
cd backend
npm run dev
```

### Reiniciar el Frontend

```cmd
cd frontend
npm start
```

### Ver Logs del Backend

Los logs aparecen en la terminal donde ejecutaste `npm run dev`

### Limpiar y Reinstalar Dependencias

Si algo no funciona:

```cmd
# Backend
cd backend
rmdir /s node_modules
del package-lock.json
npm install

# Frontend
cd frontend
rmdir /s node_modules
del package-lock.json
npm install
```

## Solución de Problemas Comunes

### Error: "psql no se reconoce como comando"

**Solución:** Agrega PostgreSQL al PATH:
1. Panel de Control → Sistema → Configuración avanzada
2. Variables de entorno
3. Edita PATH del sistema
4. Agrega: `C:\Program Files\PostgreSQL\XX\bin`
5. Reinicia la terminal

### Error: "no pg_hba.conf entry"

**Solución:** El archivo `.env` tiene la contraseña incorrecta de PostgreSQL.
Verifica que `DB_PASSWORD` coincida con la contraseña que configuraste.

### Error: "Port 3000 is already in use"

**Solución:** Otro programa está usando el puerto 3000.

Opción 1 - Cambiar el puerto:
```env
# En backend/.env
PORT=3001
```

Opción 2 - Matar el proceso:
```cmd
netstat -ano | findstr :3000
taskkill /PID XXXX /F
```

### Error: "Port 4200 is already in use"

**Solución:**
```cmd
# Usa otro puerto
ng serve --port 4300
```

Luego actualiza `CORS_ORIGIN` en `backend/.env`:
```env
CORS_ORIGIN=http://localhost:4300
```

### Error de CORS en el navegador

**Solución:** Verifica que:
1. El backend esté corriendo en el puerto 3000
2. `CORS_ORIGIN` en `.env` sea `http://localhost:4200`
3. Reinicia el backend después de cambiar `.env`

### npm install falla con errores de permisos

**Solución:** Ejecuta PowerShell como Administrador:
1. Busca PowerShell en el menú inicio
2. Clic derecho → "Ejecutar como administrador"
3. Ejecuta `npm install` nuevamente

### Base de datos ya existe

**Solución:** Si quieres empezar de cero:

```cmd
# Conectarse a PostgreSQL
psql -U postgres

# Eliminar la base de datos
DROP DATABASE plataforma_legal;

# Salir
\q

# Volver a ejecutar setup
npm run db:setup
npm run create-admin
```

## Herramientas Útiles

### pgAdmin 4

Para ver y administrar la base de datos visualmente:

1. Busca "pgAdmin 4" en el menú inicio
2. Abre pgAdmin
3. Ingresa tu contraseña de PostgreSQL
4. Expande: Servers → PostgreSQL XX → Databases → plataforma_legal

### VS Code (Recomendado)

Editor de código ideal para este proyecto:

1. Descarga de https://code.visualstudio.com/
2. Instala las extensiones:
   - Angular Language Service
   - PostgreSQL
   - ESLint

## Próximos Pasos

Ahora que todo funciona, puedes:

1. Revisar el código en `backend/src`
2. Personalizar componentes en `frontend/src/app/components`
3. Modificar estilos en `frontend/src/styles.css`
4. Agregar nuevas funcionalidades

## Recursos Adicionales

- [GUIA_INICIO.md](GUIA_INICIO.md) - Guía multiplataforma
- [PROYECTO_INFO.md](PROYECTO_INFO.md) - Información técnica
- [backend/README.md](backend/README.md) - Documentación del backend
- [frontend/README.md](frontend/README.md) - Documentación del frontend
