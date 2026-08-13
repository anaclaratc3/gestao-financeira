import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import api from '../services/api';

export default function Painel() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [saldo, setSaldo] = useState(0);

  useEffect(() => {
    carregarResumo();
  }, []);

  const carregarResumo = async () => {
    try {
      const response = await api.get('/transacoes');
      const dados = response.data;
      setTransacoes(dados);

      let totalEntradas = 0;
      let totalSaidas = 0;

      dados.forEach((t) => {
        const valorNum = parseFloat(t.valor) || 0;
        if (t.tipo === 'ENTRADA') {
          totalEntradas += valorNum;
        } else if (t.tipo === 'SAIDA') {
          totalSaidas += valorNum;
        }
      });

      setEntradas(totalEntradas);
      setSaidas(totalSaidas);
      setSaldo(totalEntradas - totalSaidas);
    } catch (error) {
      console.error('Erro ao carregar dados do painel:', error);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    try {
      // Trata strings do Postgres (AAAA-MM-DD ou ISO) sem erro de fuso horário
      const partes = dataString.split('T')[0].split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return new Date(dataString).toLocaleDateString('pt-BR');
    } catch (e) {
      return '-';
    }
  };

  return (
    <div style={styles.container}>
      <div>
        <h2 style={styles.pageTitle}>Olá, Ana</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Visão geral das suas finanças
        </span>
      </div>

      {/* CARDS DE RESUMO */}
      <div style={styles.gridCards}>
        <div style={styles.cardResumo}>
          <div>
            <span style={styles.cardLabel}>Entradas</span>
            <h3 style={{ ...styles.cardValor, color: '#22c55e' }}>
              R$ {entradas.toFixed(2)}
            </h3>
          </div>
          <ArrowUpCircle size={28} color="#22c55e" />
        </div>

        <div style={styles.cardResumo}>
          <div>
            <span style={styles.cardLabel}>Saídas</span>
            <h3 style={{ ...styles.cardValor, color: '#ef4444' }}>
              R$ {saidas.toFixed(2)}
            </h3>
          </div>
          <ArrowDownCircle size={28} color="#ef4444" />
        </div>

        <div style={styles.cardResumo}>
          <div>
            <span style={styles.cardLabel}>Saldo Total</span>
            <h3 style={{ ...styles.cardValor, color: saldo >= 0 ? '#22c55e' : '#ef4444' }}>
              R$ {saldo.toFixed(2)}
            </h3>
          </div>
          <DollarSign size={28} color="#22c55e" />
        </div>
      </div>

      {/* ÚLTIMAS MOVIMENTAÇÕES */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Últimas Movimentações</h3>
        {transacoes.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '2rem 0' }}>
            Nenhuma movimentação cadastrada.
          </p>
        ) : (
          <div style={styles.tabelaWrapper}>
            <table style={styles.tabela}>
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
                    <td style={styles.td}>
                      <strong>{t.descricao}</strong>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: t.tipo === 'ENTRADA' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: t.tipo === 'ENTRADA' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {t.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 'bold',
                        color: t.tipo === 'ENTRADA' ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {t.tipo === 'ENTRADA' ? '+ ' : '- '}
                      R$ {Number(t.valor).toFixed(2)}
                    </td>
                    <td style={styles.td}>{formatarData(t.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  pageTitle: { margin: 0, fontSize: '1.4rem' },
  gridCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' },
  cardResumo: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: '0.8rem', color: 'var(--text-secondary)' },
  cardValor: { margin: '0.3rem 0 0 0', fontSize: '1.4rem' },
  card: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' },
  sectionTitle: { marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' },
  tabelaWrapper: { overflowX: 'auto' },
  tabela: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '0.75rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '0.75rem', fontSize: '0.9rem' },
};