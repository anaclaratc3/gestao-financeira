-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
    cor_hex VARCHAR(7),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 2.1 Ajuste Tabela Categorias
ALTER TABLE categorias 
ADD COLUMN IF NOT EXISTS limite_mensal NUMERIC(10, 2) DEFAULT NULL;

-- 3. Tabela de Transações
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    descricao VARCHAR(150) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    data DATE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);