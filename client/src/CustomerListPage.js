import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', state: '', pincode: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.pincode) params.append('pincode', filters.pincode);
      
      params.append('page', currentPage);
      params.append('limit', 5);

      const response = await axios.get(`/api/customers?${params.toString()}`);
      
      setCustomers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);

    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError('Could not load customer data. Please check your connection or try again later.');
    }
    setIsLoading(false);
  }, [filters, currentPage]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };
  
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchCustomers();
  };

  const handleClearFilters = () => {
    setFilters({ city: '', state: '', pincode: '' });
    setCurrentPage(1);
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <h2>Customer List</h2>
      
      <form onSubmit={handleFilterSubmit} className="filter-form">
        <input name="city" value={filters.city} onChange={handleFilterChange} placeholder="Filter by City" />
        <input name="state" value={filters.state} onChange={handleFilterChange} placeholder="Filter by State" />
        <input name="pincode" value={filters.pincode} onChange={handleFilterChange} placeholder="Filter by Pincode" />
        <button type="submit">🔍 Filter</button>
        <button type="button" onClick={handleClearFilters}>Clear Filters</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {isLoading ? (
        <p>Loading customers...</p>
      ) : (
        <ul>
          {customers.map(customer => (
            <li key={customer.id}>
              <Link to={`/customer/${customer.id}`}>
                {customer.firstName} {customer.lastName}
              </Link>
               - {customer.phoneNumber}
            </li>
          ))}
        </ul>
      )}
      {!isLoading && !error && customers.length === 0 && <p>No customers found.</p>}

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>
          &laquo; Previous
        </button>
        <span style={{ margin: '0 15px' }}>
          Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
        </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading}>
          Next &raquo;
        </button>
      </div>
    </div>
  );
}

export default CustomerListPage;