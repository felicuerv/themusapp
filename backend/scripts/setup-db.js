const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Conectar a la base por defecto primero
  });

  try {
    await client.connect();
    console.log('🔌 Conectado a PostgreSQL');

    // Crear base de datos si no existe
    const dbName = process.env.DB_NAME;
    const checkDB = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDB.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de datos '${dbName}' creada`);
    } else {
      console.log(`ℹ️  Base de datos '${dbName}' ya existe`);
    }

    await client.end();

    // Conectar a la base de datos creada para ejecutar el schema
    const appClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
    });

    await appClient.connect();

    // Ejecutar schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await appClient.query(schema);
    console.log('✅ Schema de base de datos creado exitosamente');

    await appClient.end();
    console.log('🎉 Setup de base de datos completado');

  } catch (error) {
    console.error('❌ Error en setup de base de datos:', error);
    process.exit(1);
  }
}

setupDatabase();
