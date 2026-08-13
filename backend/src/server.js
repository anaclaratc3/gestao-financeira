const express = require('express');
const cors = require('cors');
require('dotenv').config();

const categoriaRoutes = require('./routes/categoriaRoutes');
const transacaoRoutes = require('./routes/transacaoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/categorias', categoriaRoutes);
app.use('/api/transacoes', transacaoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Healthcheck
app.get('/healthcheck', (req, res) => {
  res.json({ status: 'OK', message: 'API rodando e conectada ao banco!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});