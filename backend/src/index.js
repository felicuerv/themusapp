const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const casesRoutes = require('./routes/casesRoutes');
const lawyersRoutes = require('./routes/lawyersRoutes');
const applicationsRoutes = require('./routes/applicationsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const adminRoutes = require('./routes/adminRoutes');
const identityRoutes = require('./routes/identityRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
}));

// express.json() con 'verify' guarda el body crudo en req.rawBody
// SOLO para /identity/webhook. Ese endpoint necesita el string crudo
// (sin re-serializar) para poder validar la firma HMAC que manda
// Didit; el resto de las rutas no lo necesita y no vale la pena
// guardar el raw body de cada request.
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl === '/identity/webhook') {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/cases', casesRoutes);
app.use('/lawyers', lawyersRoutes);
app.use('/applications', applicationsRoutes);
app.use('/messages', messagesRoutes);
app.use('/admin', adminRoutes);
app.use('/identity', identityRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API Plataforma Legal MVP',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      cases: '/cases',
      lawyers: '/lawyers',
      applications: '/applications',
      messages: '/messages',
      admin: '/admin',
      identity: '/identity'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS habilitado para: ${process.env.CORS_ORIGIN || 'http://localhost:4200'}\n`);
});

module.exports = app;
