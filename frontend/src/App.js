import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import TrendsPage from './pages/TrendsPage';
import ContentGenerator from './pages/ContentGenerator';
import Header from './components/Header';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/generate" element={<ContentGenerator />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
