const { Pool } = require('pg');
require('dotenv').config();

// Configura as conexões com o PostgreSQL usando a URL do .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Evento para confirmar a conexão bem-sucedida no log
pool.on('connect', () => {
  console.log('⚡ Conectado ao banco de dados PostgreSQL com sucesso!');
});

// Trata erros inesperados na conexão
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no cliente do PostgreSQL:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};