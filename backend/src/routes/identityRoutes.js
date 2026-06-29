const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  iniciarVerificacion,
  obtenerEstado,
  recibirWebhook,
} = require('../controllers/identityController');

const router = express.Router();

// POST /identity/start -> usuario autenticado inicia su verificacion
router.post('/start', authenticateToken, iniciarVerificacion);

// GET /identity/status -> estado actual de verificacion del usuario
router.get('/status', authenticateToken, obtenerEstado);

// POST /identity/webhook -> llamado por Didit, SIN authenticateToken.
// La seguridad la da la verificacion de firma HMAC dentro del
// controller (recibirWebhook), no un JWT nuestro.
router.post('/webhook', recibirWebhook);

module.exports = router;
