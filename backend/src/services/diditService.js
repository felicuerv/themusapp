// =====================================================================
// diditService.js
// =====================================================================
// Capa de integracion con la API de Didit (https://docs.didit.me).
// Todo el codigo que sabe "como hablarle a Didit" vive aca. El resto
// del backend (controllers) no conoce URLs, headers ni el formato de
// los webhooks: solo llama a las funciones de este archivo.
//
// Variables de entorno requeridas (ver backend/.env.example):
//   DIDIT_API_KEY            -> header x-api-key en cada request
//   DIDIT_WEBHOOK_SECRET_KEY -> para validar la firma HMAC del webhook
//   DIDIT_WORKFLOW_ID        -> workflow de KYC creado en el Business
//                               Console (ID + Liveness + Face Match)
//   DIDIT_API_BASE_URL       -> default https://verification.didit.me
// =====================================================================

const crypto = require('crypto');

const BASE_URL = process.env.DIDIT_API_BASE_URL || 'https://verification.didit.me';

/**
 * Crea una sesion de verificacion en Didit para un usuario puntual.
 * Devuelve una URL (session_url) a la que hay que redirigir al usuario
 * para que complete la captura de documento + selfie. Didit maneja
 * toda esa UI: nuestro backend nunca recibe ni guarda esas imagenes.
 *
 * @param {number} userId - id interno del usuario que se va a verificar
 * @returns {Promise<{ sessionId: string, sessionUrl: string }>}
 */
async function crearSesionVerificacion(userId) {
  const response = await fetch(`${BASE_URL}/v3/session/`, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.DIDIT_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: process.env.DIDIT_WORKFLOW_ID,
      // vendor_data es el campo que Didit nos devuelve intacto en cada
      // webhook. Lo usamos para saber a que usuario nuestro corresponde
      // la sesion, sin tener que guardar un mapeo aparte.
      vendor_data: String(userId),
    }),
  });

  if (!response.ok) {
    const detalle = await response.text().catch(() => '');
    throw new Error(
      `Didit respondio ${response.status} al crear la sesion: ${detalle}`
    );
  }

  const data = await response.json();
  return {
    sessionId: data.session_id,
    sessionUrl: data.session_url,
  };
}

/**
 * Consulta el detalle/decision completa de una sesion. Util como
 * respaldo si el webhook no llego (red caida, etc.) o para que el
 * admin/usuario puedan consultar el estado a demanda.
 *
 * @param {string} sessionId
 */
async function obtenerDecision(sessionId) {
  const response = await fetch(
    `${BASE_URL}/v3/session/${sessionId}/decision/`,
    {
      headers: { 'x-api-key': process.env.DIDIT_API_KEY },
    }
  );

  if (!response.ok) {
    const detalle = await response.text().catch(() => '');
    throw new Error(
      `Didit respondio ${response.status} al consultar la decision: ${detalle}`
    );
  }

  return response.json();
}

/**
 * Valida que un webhook efectivamente provenga de Didit, comparando
 * la firma HMAC-SHA256 que viene en el header contra una firma propia
 * calculada con nuestro secreto compartido.
 *
 * IMPORTANTE: 'rawBody' tiene que ser el body CRUDO (string/Buffer,
 * sin pasar por JSON.parse ni por express.json()). Si se recalcula a
 * partir de JSON.stringify(req.body), la firma puede no coincidir por
 * diferencias de formato (espacios, orden de claves), aun cuando el
 * contenido sea "el mismo". Por eso el index.js de este proyecto
 * captura el rawBody especificamente para esta ruta, antes del parser
 * JSON global (ver express.json con verify en index.js).
 *
 * @param {string|Buffer} rawBody
 * @param {string} signatureHeader - valor del header X-Signature
 * @returns {boolean}
 */
function validarFirmaWebhook(rawBody, signatureHeader) {
  if (!signatureHeader) return false;

  const secret = process.env.DIDIT_WEBHOOK_SECRET_KEY;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const firmaEsperada = hmac.digest('hex');

  const bufferEsperado = Buffer.from(firmaEsperada, 'utf8');
  const bufferRecibido = Buffer.from(signatureHeader, 'utf8');

  // Mismo largo antes de timingSafeEqual: si no, la funcion misma
  // tira excepcion en vez de devolver false.
  if (bufferEsperado.length !== bufferRecibido.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferEsperado, bufferRecibido);
}

/**
 * Traduce el status que manda Didit (en ingles, con mayusculas
 * variables) al enum 'verification_status' de nuestra base de datos.
 * Los estados intermedios (In Progress, Not Started, etc.) se
 * mantienen como 'pendiente'.
 *
 * @param {string} diditStatus
 * @returns {'pendiente'|'verificado'|'rechazado'}
 */
function mapearEstado(diditStatus) {
  switch (diditStatus) {
    case 'Approved':
      return 'verificado';
    case 'Declined':
      return 'rechazado';
    default:
      // 'Not Started', 'In Progress', 'In Review', 'Abandoned', 'Expired'
      return 'pendiente';
  }
}

module.exports = {
  crearSesionVerificacion,
  obtenerDecision,
  validarFirmaWebhook,
  mapearEstado,
};
