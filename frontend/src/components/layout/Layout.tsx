import type { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="container">{children}</div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>🚀 Vault Strategy - Automated Leverage Management</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Demo Implementation • Powered by EMA Signals & Aave
          </p>
        </div>
      </footer>
    </div>
  );
};
