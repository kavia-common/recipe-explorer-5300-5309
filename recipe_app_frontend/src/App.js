import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';

/**
 * Root application component setting up the router and base layout.
 * Includes theme toggle via CSS variables for light mode by default.
 *
 * Layout:
 * - Top navbar
 * - Content area with sidebar (categories) and main area
 * - Footer
 */
// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className="app-shell">
        <Navbar onToggleTheme={toggleTheme} theme={theme} />
        <div className="content-wrap">
          <Sidebar />
          <main className="main" role="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/recipe/:id" element={<RecipeDetailsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
