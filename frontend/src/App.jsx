import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Tags,
  Wallet, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';
import Autenticacao from './pages/Autenticacao';
import Painel from './pages/Painel';
import Transacoes from './pages/Transacoes';
import Categorias from './pages/Categorias';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [usuario, setUsuario] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState('painel');
  const [sidebarEncolhida, setSidebarEncolhida] = useState(false);

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
      <aside 
        style={{
          ...styles.sidebar,
          width: sidebarEncolhida ? '72px' : '260px',
          padding: sidebarEncolhida ? '1.5rem 0.5rem' : '1.5rem',
        }}
      >
        <div>
          {/* CABEÇALHO DA SIDEBAR INTERATIVO */}
          <button 
            onClick={() => setSidebarEncolhida(!sidebarEncolhida)} 
            style={{
              ...styles.brandHeaderBtn,
              justifyContent: sidebarEncolhida ? 'center' : 'flex-start',
            }}
            title={sidebarEncolhida ? "Expandir menu" : "Encolher menu"}
          >
            <div style={styles.iconWrapper}>
              <Wallet size={24} color="var(--primary)" />
            </div>

            {!sidebarEncolhida && (
              <span style={styles.brandTitle}>
                Gestão Financeira
              </span>
            )}
          </button>

          {/* NAVEGAÇÃO */}
          <nav style={styles.nav}>
            <button
              onClick={() => setPaginaAtual('painel')}
              title={sidebarEncolhida ? "Visão Geral" : ""}
              style={{
                ...styles.navBtn,
                justifyContent: sidebarEncolhida ? 'center' : 'flex-start',
                backgroundColor: paginaAtual === 'painel' ? 'var(--primary)' : 'transparent',
                color: paginaAtual === 'painel' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <LayoutDashboard size={20} />
              {!sidebarEncolhida && <span>Visão Geral</span>}
            </button>

            <button
              onClick={() => setPaginaAtual('transacoes')}
              title={sidebarEncolhida ? "Transações" : ""}
              style={{
                ...styles.navBtn,
                justifyContent: sidebarEncolhida ? 'center' : 'flex-start',
                backgroundColor: paginaAtual === 'transacoes' ? 'var(--primary)' : 'transparent',
                color: paginaAtual === 'transacoes' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <ArrowLeftRight size={20} />
              {!sidebarEncolhida && <span>Transações</span>}
            </button>

            <button
              onClick={() => setPaginaAtual('categorias')}
              title={sidebarEncolhida ? "Categorias" : ""}
              style={{
                ...styles.navBtn,
                justifyContent: sidebarEncolhida ? 'center' : 'flex-start',
                backgroundColor: paginaAtual === 'categorias' ? 'var(--primary)' : 'transparent',
                color: paginaAtual === 'categorias' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <Tags size={20} />
              {!sidebarEncolhida && <span>Categorias</span>}
            </button>
          </nav>
        </div>

        {/* RODAPÉ DA SIDEBAR */}
        <div style={styles.sidebarFooter}>
          <button 
            onClick={toggleTheme} 
            style={{
              ...styles.footerBtn,
              justifyContent: sidebarEncolhida ? 'center' : 'flex-start',
            }}
            title={sidebarEncolhida ? `Modo ${theme === 'light' ? 'Escuro' : 'Claro'}` : ""}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {!sidebarEncolhida && <span>Modo {theme === 'light' ? 'Escuro' : 'Claro'}</span>}
          </button>

          <button 
            onClick={handleLogout} 
            style={{ 
              ...styles.footerBtn, 
              color: '#ef4444',
              justifyContent: sidebarEncolhida ? 'center' : 'flex-start',
            }}
            title={sidebarEncolhida ? "Sair" : ""}
          >
            <LogOut size={18} />
            {!sidebarEncolhida && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={styles.content}>
        {paginaAtual === 'painel' && <Painel usuario={usuario} />}
        {paginaAtual === 'transacoes' && <Transacoes />}
        {paginaAtual === 'categorias' && <Categorias />}
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
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'width 0.2s ease, padding 0.2s ease',
  },
  brandHeaderBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    background: 'transparent',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    outline: 'none',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  },
  brandTitle: {
    fontWeight: 'bold',
    fontSize: '1.05rem',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0.85rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
    width: '100%',
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
    whiteSpace: 'nowrap',
    width: '100%',
  },
  content: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
};