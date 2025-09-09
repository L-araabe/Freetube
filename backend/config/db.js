cat > config/db.js << 'EOF'
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'freetube_db',
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
  console.log('Connexion à PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('Erreur PostgreSQL:', err);
});

module.exports = pool;
EOF