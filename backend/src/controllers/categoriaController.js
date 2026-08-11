const pool = require('../config/db'); 

// Listar todas as categorias de um usuário
const listarCategorias = async (req, res) => {
  try {
    const { usuario_id } = req.query; 
    const result = await pool.query(
      'SELECT * FROM categorias WHERE usuario_id = $1 ORDER BY nome ASC',
      [usuario_id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

// Criar uma nova categoria
const criarCategoria = async (req, res) => {
  try {
    const { usuario_id, nome, tipo, cor_hex } = req.body;

    if (!usuario_id || !nome || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const result = await pool.query(
      `INSERT INTO categorias (usuario_id, nome, tipo, cor_hex) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [usuario_id, nome, tipo, cor_hex]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar categoria' });
  }
};

module.exports = {
  listarCategorias,
  criarCategoria,
};