import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import api from '../services/api';

export default function Painel({ usuario }) {
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    api.get('/transacoes')
      .then((res) => setTransacoes(res.data))
      .catch((err) => console.error('Erro ao carregar resumo:', err));
  }, []);

  const totalEntradas = transacoes
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalSaidas = transacoes
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldoTotal = totalEntradas - totalSaidas;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Olá, {usuario.nome}</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Visão geral das suas finanças
        </span>
      </div>

      {/* CARDS DE RESUMO */}
      <section style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Entradas</span>
            <ArrowUpCircle size={22} color="#10b981" />
          </div>
          <p style={{ ...styles.cardValue, color: '#10b981' }}>
            R$ {totalEntradas.toFixed(2)}
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Saídas</span>
            <ArrowDownCircle size={22} color="#ef4444" />
          </div>
          <p style={{ ...styles.cardValue, color: '#ef4444' }}>
            R$ {totalSaidas.toFixed(2)}
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Saldo Total</span>
            <DollarSign size={22} color="var(--primary)" />
          </div>
          <p style={{ ...styles.cardValue, color: saldoTotal >= 0 ? '#10b981' : '#ef4444' }}>
            R$ {saldoTotal.toFixed(2)}
          </p>
        </div>
      </section>

      {/* ÚLTIMAS TRANSAÇÕES */}
      <section style={styles.sectionCard}>
        <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>Últimas Movimentações</h3>
        {transacoes.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '1.5rem 0' }}>
            Nenhuma movimentação registrada.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Descrição</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Valor</th>
                <th style={styles.th}>Data</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.slice(0, 5).map((t) => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>{t.descricao}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: t.tipo === 'receita' ? '#10b98120' : '#ef444420',
                        color: t.tipo === 'receita' ? '#10b981' : '#ef4444',
                      }}
                    >
                      {t.tipo === 'receita' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      fontWeight: 'bold',
                      color: t.tipo === 'receita' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {t.tipo === 'receita' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    {new Date(t.data_transacao).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const styles = {
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  cardValue: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    margin: '0.5rem 0 0 0',
  },
  sectionCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  th: {
    padding: '0.75rem 0.5rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    borderBottom: '2px solid var(--border-color)',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '0.75rem 0.5rem',
  },
};