const express = require('express');
const { body } = require('express-validator');
const {
  getMessagesByCase,
  sendMessage
} = require('../controllers/messagesController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /messages/:caseId - Obtener mensajes de un caso
router.get('/:caseId', authenticateToken, getMessagesByCase);

// POST /messages/:caseId - Enviar mensaje
router.post('/:caseId', [
  authenticateToken,
  body('toUserId').isInt().withMessage('El destinatario es requerido'),
  body('contenido').notEmpty().withMessage('El contenido es requerido')
], sendMessage);

module.exports = router;
