import React from 'react';
import AppContent from './AppContent';
import { ThemeProvider } from './ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
