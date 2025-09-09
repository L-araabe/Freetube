require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',  // 'postgres' est le nom du service Docker
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'freetube_db',
  port: process.env.DB_PORT || 5432,
});

const createTables = async () => {
  try {
    console.log('🔄 Connexion à PostgreSQL...');
    
    // Test de connexion
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion à PostgreSQL établie');

    // Créer la table users
    console.log('🔄 Création de la table users...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255),
        photo VARCHAR(500),
        google_id VARCHAR(100),
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_email UNIQUE (email),
        CONSTRAINT unique_username UNIQUE (username)
      );
    `);

    // Créer les index
    console.log('🔄 Création des index...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    // Vérifier si la table a été créée
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Table users créée avec succès !');
      
      // Afficher la structure de la table
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Structure de la table users:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔚 Connexion fermée');
  }
};

// Attendre que PostgreSQL soit prêt
const waitForPostgres = async (retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ PostgreSQL est prêt !');
      return;
    } catch (error) {
      console.log(`⏳ Tentative ${i + 1}/${retries} - PostgreSQL pas encore prêt...`);
      if (i === retries - 1) {
        throw new Error('PostgreSQL n\'est pas accessible après plusieurs tentatives');
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const main = async () => {
  try {
    await waitForPostgres();
    await createTables();
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
};

main();