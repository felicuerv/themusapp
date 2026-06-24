const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function createAdmin() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('🔌 Conectado a la base de datos');

    // Hash de la contraseña "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Verificar si ya existe el admin
    const checkAdmin = await client.query(
      "SELECT * FROM users WHERE email = 'admin@plataforma-legal.com'"
    );

    if (checkAdmin.rows.length > 0) {
      // Actualizar el password
      await client.query(
        "UPDATE users SET password = $1 WHERE email = 'admin@plataforma-legal.com'",
        [hashedPassword]
      );
      console.log('✅ Contraseña del admin actualizada');
    } else {
      // Crear nuevo admin
      await client.query(
        "INSERT INTO users (nombre, email, password, rol) VALUES ($1, $2, $3, $4)",
        ['Administrador', 'admin@plataforma-legal.com', hashedPassword, 'admin']
      );
      console.log('✅ Usuario admin creado');
    }

    console.log('\n📧 Email: admin@plataforma-legal.com');
    console.log('🔑 Password: admin123\n');

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
