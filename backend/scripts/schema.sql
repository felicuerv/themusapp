-- =====================================================================
-- SCHEMA - Plataforma Legal (v2)
-- =====================================================================
-- Este schema reemplaza al MVP inicial. Resumen del modelo de negocio:
--
--  - El cliente publica un caso de forma PUBLICA y ANONIMA (sin datos
--    sensibles): solo titulo, especialidad e info breve generica.
--  - La info sensible (descripcion detallada, domicilio, documentacion
--    del conflicto) NUNCA pasa por el sistema. Se conversa por fuera,
--    en la reunion entre cliente y abogado.
--  - Tanto cliente como abogado pasan por verificacion facial +
--    documento de identidad via un proveedor externo. El sistema solo
--    guarda el resultado (estado + referencia), nunca el archivo.
--  - El admin NO revisa el contenido de los casos (la verificacion
--    facial es la garantia de veracidad). El admin unicamente valida
--    titulo y matricula del abogado.
--  - Varios abogados pueden postularse a un mismo caso. El cliente
--    negocia/charla presupuesto con cualquiera de ellos, sin limite.
--    No hay "seleccion unica": el cliente cierra el caso entero con
--    el boton de "finalizar busqueda profesional" cuando ya eligio
--    con quien seguir (la eleccion final no se registra en el sistema).
--  - El cliente puede dar de baja un caso con un motivo. El/los
--    abogado(s) excluidos no vuelven a ver ESE caso puntual si se
--    reabre (no es exclusion permanente).
--  - Busqueda libre: el cliente puede contactar a un abogado
--    directamente desde su perfil publico, sin caso de por medio.
--  - El chat (conversations/messages) esta desacoplado del caso:
--    puede nacer de una postulacion o de la busqueda libre.
--  - Calificaciones: el cliente califica al abogado despues de
--    trabajar juntos, con o sin caso de por medio.
--  - El abogado paga una suscripcion mensual ($10) para poder
--    postularse a casos. Sin suscripcion activa, no puede postular.
--  - Matchmaking por especialidad + cercania geografica real
--    (lat/long). Alcance inicial: solo Cordoba capital (la
--    restriccion de provincia se valida a nivel de aplicacion, no
--    de esquema, para poder ampliar sin tocar la base).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Limpieza (re-ejecucion del script en desarrollo)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS case_exclusions CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS lawyer_especialidades CASCADE;
DROP TABLE IF EXISTS especialidades CASCADE;
DROP TABLE IF EXISTS lawyer_subscriptions CASCADE;
DROP TABLE IF EXISTS lawyer_profiles CASCADE;
DROP TABLE IF EXISTS client_profiles CASCADE;
DROP TABLE IF EXISTS identity_verifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS case_status CASCADE;
DROP TYPE IF EXISTS case_urgency CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS meeting_modalidad CASCADE;
DROP TYPE IF EXISTS meeting_status CASCADE;

-- ---------------------------------------------------------------------
-- Tipos ENUM
-- ---------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('cliente', 'abogado', 'admin');

CREATE TYPE verification_status AS ENUM ('pendiente', 'verificado', 'rechazado');

CREATE TYPE subscription_status AS ENUM ('activa', 'vencida', 'cancelada');

-- 'abierto'      -> recien publicado, recibe postulaciones
-- 'en_busqueda'  -> tiene al menos una postulacion activa
-- 'cerrado'      -> el cliente finalizo la busqueda profesional
-- 'dado_de_baja' -> el cliente lo dio de baja con motivo (soft delete)
CREATE TYPE case_status AS ENUM ('abierto', 'en_busqueda', 'cerrado', 'dado_de_baja');

CREATE TYPE case_urgency AS ENUM ('baja', 'media', 'alta');

-- 'activa'   -> el abogado sigue disponible para que el cliente lo evalue
-- 'retirada' -> el abogado retiro su postulacion (o el caso se cerro)
CREATE TYPE application_status AS ENUM ('activa', 'retirada');

CREATE TYPE meeting_modalidad AS ENUM ('normal', 'emergencia');
CREATE TYPE meeting_status AS ENUM ('propuesta', 'confirmada', 'realizada', 'cancelada');

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- identity_verifications
-- Verificacion facial + documento de identidad, compartida entre
-- clientes y abogados. El sistema NUNCA guarda el archivo de la
-- selfie/documento: solo el resultado que devuelve el proveedor
-- externo (tipo Veriff/Didit/onfido) y una referencia para auditoria.
-- Se permite mas de un intento por usuario (ej: rechazado -> reintenta).
-- ---------------------------------------------------------------------
CREATE TABLE identity_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    estado verification_status NOT NULL DEFAULT 'pendiente',
    proveedor_externo VARCHAR(100),
    referencia_externa VARCHAR(255),
    documento_identidad_ref VARCHAR(255),
    motivo_rechazo TEXT,
    verificado_en TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- client_profiles
-- lat/long para poder calcular cercania real con casos/abogados.
-- ---------------------------------------------------------------------
CREATE TABLE client_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ciudad VARCHAR(100),
    telefono VARCHAR(20),
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- lawyer_profiles
-- 'titulo_verificado_admin' es independiente de la verificacion facial:
-- la identidad la valida el proveedor externo (identity_verifications),
-- el titulo/matricula los valida un humano (admin) a mano.
-- 'rating_promedio' es una columna cacheada (no fuente de verdad: se
-- recalcula desde 'ratings'), util para ordenar listados sin agregar
-- en cada query.
-- ---------------------------------------------------------------------
CREATE TABLE lawyer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matricula VARCHAR(50),
    titulo_doc_ref VARCHAR(255),
    bio TEXT,
    ciudad VARCHAR(100),
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    titulo_verificado_admin BOOLEAN NOT NULL DEFAULT FALSE,
    perfil_completo BOOLEAN NOT NULL DEFAULT FALSE,
    rating_promedio DECIMAL(3, 2),
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- lawyer_subscriptions
-- Gate de pago: sin una fila con estado='activa' y vence_el >= hoy,
-- el abogado no puede postularse a casos. 'proveedor_pago' queda listo
-- para enchufar Stripe/MercadoPago sin tocar el esquema.
-- ---------------------------------------------------------------------
CREATE TABLE lawyer_subscriptions (
    id SERIAL PRIMARY KEY,
    lawyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    estado subscription_status NOT NULL DEFAULT 'vencida',
    monto DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
    vence_el DATE,
    proveedor_pago VARCHAR(50),
    referencia_pago VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- especialidades
-- Catalogo cerrado. Reemplaza al texto libre que tenia el MVP original
-- (lawyer_profiles.especialidades TEXT[] y cases.tipo VARCHAR) para que
-- el matchmaking pueda comparar valores exactos en vez de string
-- libre con riesgo de sinonimos/typos.
-- ---------------------------------------------------------------------
CREATE TABLE especialidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Relacion muchos a muchos: un abogado puede dominar varias especialidades.
CREATE TABLE lawyer_especialidades (
    lawyer_profile_id INTEGER NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    especialidad_id INTEGER NOT NULL REFERENCES especialidades(id) ON DELETE CASCADE,
    PRIMARY KEY (lawyer_profile_id, especialidad_id)
);

-- ---------------------------------------------------------------------
-- cases
-- Solo datos PUBLICOS. 'info_breve' es la version generica y anonima
-- de lo que antes era 'descripcion' (sin domicilio, sin datos del
-- cliente, sin detalle que identifique a las partes).
-- lat/long del caso (no necesariamente igual a la del cliente) para
-- que el matchmaking por cercania compare caso<->abogado.
-- 'motivo_baja' solo se usa cuando estado = 'dado_de_baja'.
-- ---------------------------------------------------------------------
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    especialidad_id INTEGER NOT NULL REFERENCES especialidades(id),
    titulo VARCHAR(200) NOT NULL,
    info_breve TEXT NOT NULL,
    urgencia case_urgency NOT NULL DEFAULT 'media',
    estado case_status NOT NULL DEFAULT 'abierto',
    ciudad VARCHAR(100),
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    motivo_baja TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- applications
-- Ya no tiene aceptada/rechazada: el cliente no "acepta" una sola.
-- Varias pueden estar 'activa' a la vez; se pasan a 'retirada' cuando
-- el abogado se retira o cuando el caso se cierra/da de baja.
-- ---------------------------------------------------------------------
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    lawyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    estado application_status NOT NULL DEFAULT 'activa',
    propuesta_breve TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, lawyer_id)
);

-- ---------------------------------------------------------------------
-- case_exclusions
-- Cuando el cliente da de baja un caso con motivo, el/los abogados
-- que estaban postulados quedan excluidos de ESE caso puntual (no de
-- futuros casos del mismo cliente). Si el cliente publica un caso
-- nuevo, este abogado puede volver a verlo sin problema.
-- ---------------------------------------------------------------------
CREATE TABLE case_exclusions (
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    lawyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    motivo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, lawyer_id)
);

-- ---------------------------------------------------------------------
-- meetings
-- Reunion entre cliente y abogado. Base para el calendario con
-- disponibilidad/recordatorios (eso se modela en un bloque aparte con
-- mas detalle: franjas horarias del abogado, jobs de recordatorio).
-- Por ahora cubre la propuesta/confirmacion de fecha y la modalidad.
-- ---------------------------------------------------------------------
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    modalidad meeting_modalidad NOT NULL DEFAULT 'normal',
    estado meeting_status NOT NULL DEFAULT 'propuesta',
    fecha_propuesta TIMESTAMP,
    fecha_confirmada TIMESTAMP,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- conversations / messages
-- El chat ya no depende obligatoriamente de un caso: 'case_id' es
-- nullable porque una conversacion puede nacer de la busqueda libre
-- (cliente contacta a un abogado desde su perfil publico, sin caso).
-- Siempre es 1 a 1 entre un cliente y un abogado especifico.
-- ---------------------------------------------------------------------
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, client_id, lawyer_id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- ratings
-- 'case_id' nullable: la calificacion puede venir de una relacion
-- iniciada por busqueda libre (sin caso) o por un caso publicado.
-- ---------------------------------------------------------------------
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puntaje SMALLINT NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Indices
-- ---------------------------------------------------------------------
CREATE INDEX idx_identity_verifications_user ON identity_verifications(user_id);

CREATE INDEX idx_lawyer_profiles_ciudad ON lawyer_profiles(ciudad);
CREATE INDEX idx_lawyer_profiles_geo ON lawyer_profiles(latitud, longitud);
CREATE INDEX idx_lawyer_profiles_rating ON lawyer_profiles(rating_promedio);

CREATE INDEX idx_lawyer_subscriptions_lawyer ON lawyer_subscriptions(lawyer_id);
CREATE INDEX idx_lawyer_subscriptions_estado ON lawyer_subscriptions(estado);

CREATE INDEX idx_lawyer_especialidades_lawyer ON lawyer_especialidades(lawyer_profile_id);
CREATE INDEX idx_lawyer_especialidades_especialidad ON lawyer_especialidades(especialidad_id);

CREATE INDEX idx_cases_client ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(estado);
CREATE INDEX idx_cases_especialidad ON cases(especialidad_id);
CREATE INDEX idx_cases_geo ON cases(latitud, longitud);

CREATE INDEX idx_applications_case ON applications(case_id);
CREATE INDEX idx_applications_lawyer ON applications(lawyer_id);
CREATE INDEX idx_applications_estado ON applications(estado);

CREATE INDEX idx_case_exclusions_lawyer ON case_exclusions(lawyer_id);

CREATE INDEX idx_meetings_case ON meetings(case_id);
CREATE INDEX idx_meetings_lawyer ON meetings(lawyer_id);
CREATE INDEX idx_meetings_client ON meetings(client_id);

CREATE INDEX idx_conversations_case ON conversations(case_id);
CREATE INDEX idx_conversations_client ON conversations(client_id);
CREATE INDEX idx_conversations_lawyer ON conversations(lawyer_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_from ON messages(from_user_id);

CREATE INDEX idx_ratings_lawyer ON ratings(lawyer_id);
CREATE INDEX idx_ratings_client ON ratings(client_id);

-- ---------------------------------------------------------------------
-- Seed: catalogo inicial de especialidades
-- ---------------------------------------------------------------------
INSERT INTO especialidades (nombre) VALUES
    ('Laboral'),
    ('Familia'),
    ('Penal'),
    ('Civil'),
    ('Comercial'),
    ('Tributario'),
    ('Inmobiliario'),
    ('Sucesiones'),
    ('Defensa del Consumidor'),
    ('Accidentes de Transito');

-- Nota: el usuario admin se crea con el script create-admin.js despues del setup

SELECT 'Schema v2 creado exitosamente' as status;
