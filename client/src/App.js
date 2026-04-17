import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingWidget from './components/BookingWidget';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<BookingWidget />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
