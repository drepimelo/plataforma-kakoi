import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion'; // 1. Importe o 'motion'

// Este componente recebe as "páginas filhas" como uma propriedade especial 'children'
function MainLayout({ children }) {
  const layoutStyle = {
    display: 'flex'
  };

  const contentStyle = {
    flexGrow: 1,
    padding: '20px',
    marginLeft: '250px' // O espaço para a Sidebar fixa
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      {/* 2. Troque 'main' por 'motion.main' e adicione as propriedades de animação */}
      <motion.main
        style={contentStyle}
        initial={{ opacity: 0, y: 20 }} // Estado inicial: invisível e 20px para baixo
        animate={{ opacity: 1, y: 0 }}   // Estado final: visível e na posição original
        exit={{ opacity: 0, y: -20 }}   // Estado de saída: invisível e 20px para cima
        transition={{ duration: 0.5 }}   // Duração da animação
      >
        {children} {/* Aqui é onde as outras páginas serão renderizadas */}
      </motion.main>
    </div>
  );
}

export default MainLayout;