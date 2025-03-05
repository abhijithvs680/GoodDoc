import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Form1 from './pages/Form1';
import AddNewPatient from './pages/AddNewPatient';
import Booking from './pages/Booking';
import ShowExistingPatients from './pages/ShowExistingPatients';

function App() {
  return (
    <div style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
    <Router basename="/register">
      <AppLayout>
        <Routes>
          <Route path="/" element={<Form1 />} />
          <Route path="/add-new-patient" element={<AddNewPatient />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/showexistingpatients" element={<ShowExistingPatients />} />
        </Routes>
      </AppLayout>
    </Router>
    </div>
  );
}

export default App;