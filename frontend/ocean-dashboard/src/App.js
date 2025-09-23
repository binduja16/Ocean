import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import FishermanDashboard from './FishermanDashboard';
import ResearcherDashboard from './ResearcherDashboard';
import './App.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌊 Ocean AI Platform</h1>
      <p style={styles.subtitle}>Choose your role to continue</p>
      
      <div style={styles.buttonContainer}>
        <button 
          style={styles.button}
          onClick={() => navigate('/fisherman-dashboard')}
        >
          🎣 Fisherman Dashboard
        </button>
        
        <button 
          style={styles.button}
          onClick={() => navigate('/researcher-dashboard')}
        >
          🔬 Researcher Dashboard
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fisherman-dashboard" element={<FishermanDashboard />} />
        <Route path="/researcher-dashboard" element={<ResearcherDashboard />} />
      </Routes>
    </Router>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f8ff',
    padding: '20px',
  },
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#34495e',
    marginBottom: '40px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    padding: '15px 30px',
    fontSize: '1.1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '200px',
  },
};

export default App;