-- Criar extensão para UUID se necessário ou usar IDs seriais
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
-- Aceita 'ENTRADA', 'SAIDA', 'RECEITA' e 'DESPESA' na trava CHECK
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA', 'RECEITA', 'DESPESA')),
    cor_hex VARCHAR(7),
    limite_mensal DECIMAL(10, 2) DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Transações
-- Inclui o campo 'observacao' e aceita variações do tipo na trava CHECK
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA', 'RECEITA', 'DESPESA')),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    observacao TEXT DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);