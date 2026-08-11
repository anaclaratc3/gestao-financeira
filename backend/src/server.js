const express = require('express');
const cors = require('cors');
require('dotenv').config();

const categoriaRoutes = require('./routes/categoriaRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite receber JSON no req.body

// Rotas da API
app.use('/api/categorias', categoriaRoutes);

// Healthcheck
app.get('/healthcheck', (req, res) => {
  res.json({ status: 'OK', message: 'API rodando e conectada ao banco!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Servidor rodando na porta http://localhost:${PORT}`);
});