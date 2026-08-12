import { useState, useEffect } from 'react';
import { LayoutDashboard, ArrowLeftRight, Wallet, LogOut, Sun, Moon } from 'lucide-react';
import Autenticacao from './pages/Autenticacao';
import Painel from './pages/Painel';
import Transacoes from './pages/Transacoes';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [usuario, setUsuario] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState('painel'); // 'painel' ou 'transacoes'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if (!usuario) {
    return <Autenticacao onLoginSuccess={setUsuario} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <Wallet size={28} color="var(--primary)" />
          <span style={styles.brandTitle}>Gestão Financeira</span>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => setPaginaAtual('painel')}
            style={{
              ...styles.navBtn,
              backgroundColor: paginaAtual === 'painel' ? 'var(--primary)' : 'transparent',
              color: paginaAtual === 'painel' ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            <LayoutDashboard size={18} /> Visão Geral
          </button>

          <button
            onClick={() => setPaginaAtual('transacoes')}
            style={{
              ...styles.navBtn,
              backgroundColor: paginaAtual === 'transacoes' ? 'var(--primary)' : 'transparent',
              color: paginaAtual === 'transacoes' ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            <ArrowLeftRight size={18} /> Transações
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={toggleTheme} style={styles.footerBtn}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            Modo {theme === 'light' ? 'Escuro' : 'Claro'}
          </button>

          <button onClick={handleLogout} style={{ ...styles.footerBtn, color: '#ef4444' }}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={styles.content}>
        {paginaAtual === 'painel' && <Painel usuario={usuario} />}
        {paginaAtual === 'transacoes' && <Transacoes />}
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  brandTitle: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s',
  },
  sidebarFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)',
  },
  footerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
};