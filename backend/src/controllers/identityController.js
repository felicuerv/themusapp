const pool = require('../config/database');
const diditService = require('../services/diditService');

/**
 * POST /identity/start
 * El usuario autenticado (cliente o abogado) inicia su verificacion
 * de identidad. Creamos la sesion en Didit, guardamos la referencia
 * en 'pendiente', y devolvemos la URL a la que el frontend debe
 * redirigir (o abrir en un iframe/popup) para que el usuario complete
 * la captura de documento + selfie.
 */
const iniciarVerificacion = async (req, res) => {
  try {
    const userId = req.user.id;

    // Si ya hay una verificacion 'verificado' vigente, no tiene sentido
    // generar una sesion nueva.
    const existente = await pool.query(
      `SELECT id, estado FROM identity_verifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (existente.rows.length > 0 && existente.rows[0].estado === 'verificado') {
      return res.status(400).json({
        error: 'Tu identidad ya esta verificada',
      });
    }

    const { sessionId, sessionUrl } = await diditService.crearSesionVerificacion(userId);

    await pool.query(
      `INSERT INTO identity_verifications
         (user_id, estado, proveedor_externo, referencia_externa)
       VALUES ($1, 'pendiente', 'didit', $2)`,
      [userId, sessionId]
    );

    res.status(201).json({
      message: 'Sesion de verificacion creada',
      session_url: sessionUrl,
    });
  } catch (error) {
    console.error('Error al iniciar verificacion de identidad:', error);
    res.status(500).json({ error: 'No se pudo iniciar la verificacion de identidad' });
  }
};

/**
 * GET /identity/status
 * Estado actual de verificacion del usuario autenticado (el frontend
 * lo usa para decidir si mostrar el gate de "verifica tu identidad"
 * o dejar pasar al usuario).
 */
const obtenerEstado = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT estado, motivo_rechazo, verificado_en, created_at
       FROM identity_verifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ estado: 'sin_iniciar' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estado de verificacion:', error);
    res.status(500).json({ error: 'No se pudo obtener el estado de verificacion' });
  }
};

/**
 * POST /identity/webhook
 * Recibido directamente por Didit, SIN autenticacion JWT (Didit no
 * tiene nuestro token). La seguridad de este endpoint depende
 * exclusivamente de validar la firma HMAC contra DIDIT_WEBHOOK_SECRET_KEY.
 *
 * Requiere que 'req.rawBody' este disponible (ver index.js: el
 * middleware de captura de raw body debe ejecutarse ANTES de
 * express.json() para esta ruta especifica).
 */
const recibirWebhook = async (req, res) => {
  try {
    const firma = req.headers['x-signature-v2'] || req.headers['x-signature'];

    if (!req.rawBody) {
      console.error('Webhook de Didit recibido sin rawBody disponible');
      return res.status(500).json({ error: 'Configuracion de servidor incompleta' });
    }

    const firmaValida = diditService.validarFirmaWebhook(req.rawBody, firma);
    if (!firmaValida) {
      console.warn('Webhook de Didit con firma invalida, descartado');
      return res.status(401).json({ error: 'Firma invalida' });
    }

    const payload = JSON.parse(req.rawBody);
    const { session_id, status, vendor_data } = payload;

    const estado = diditService.mapearEstado(status);

    // motivo de rechazo, si Didit lo incluyo dentro de 'decision'
    const motivoRechazo =
      estado === 'rechazado' && payload.decision
        ? JSON.stringify(payload.decision.warnings || payload.decision.status || null)
        : null;

    const verificadoEn = estado === 'verificado' ? new Date() : null;

    const updateResult = await pool.query(
      `UPDATE identity_verifications
       SET estado = $1,
           motivo_rechazo = $2,
           verificado_en = COALESCE($3, verificado_en),
           updated_at = CURRENT_TIMESTAMP
       WHERE referencia_externa = $4
       RETURNING user_id`,
      [estado, motivoRechazo, verificadoEn, session_id]
    );

    if (updateResult.rows.length === 0) {
      // No deberia pasar en condiciones normales (toda sesion la
      // creamos nosotros con su referencia guardada), pero si pasa,
      // lo logueamos para investigar en vez de fallar silenciosamente.
      console.warn(
        `Webhook de Didit para session_id=${session_id} (vendor_data=${vendor_data}) no coincide con ninguna fila de identity_verifications`
      );
    }

    // Didit espera 200 rapido; el procesamiento pesado (si hiciera
    // falta) deberia ir a una cola, no bloquear esta respuesta.
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error al procesar webhook de Didit:', error);
    // Devolvemos 200 igual para evitar reintentos infinitos de un
    // payload que nunca vamos a poder procesar (p.ej. JSON corrupto).
    // Si el error es transitorio (DB caida), Didit reintenta solo con
    // su politica de retry al recibir un status distinto de 2xx.
    res.status(500).json({ error: 'Error interno al procesar el webhook' });
  }
};

module.exports = { iniciarVerificacion, obtenerEstado, recibirWebhook };
