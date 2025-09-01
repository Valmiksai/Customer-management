// File: client/src/App.js

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CustomerListPage from './CustomerListPage';
import CustomerFormPage from './CustomerFormPage';
import CustomerDetailPage from './CustomerDetailPage';

function App() {
  return (
    <Router>
      {/* ✅ Use the main container class for consistent padding and centering */}
      <div className="container">
        <nav>
          <Link to="/">Home</Link> | <Link to="/new-customer">Add Customer</Link>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<CustomerListPage />} />
          <Route path="/new-customer" element={<CustomerFormPage />} />
          <Route path="/customer/:id" element={<CustomerDetailPage />} />
          <Route path="/edit-customer/:id" element={<CustomerFormPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;