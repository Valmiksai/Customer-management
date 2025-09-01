// File: client/src/CustomerDetailPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// A sub-component for the address form.
function AddAddressForm({ customerId, onAddressAdded }) {
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addressLine1 || !city || !state || !pincode) {
      alert('Please fill all address fields.');
      return;
    }
    const newAddress = { addressLine1, city, state, pincode };
    try {
      await axios.post(`http://localhost:5000/api/customers/${customerId}/addresses`, newAddress);
      setAddressLine1('');
      setCity('');
      setState('');
      setPincode('');
      onAddressAdded();
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('Failed to add address.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
      <h4>Add New Address</h4>
      <div><input style={{ width: '95%', marginBottom: '5px' }} value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="Address Line 1" /></div>
      <div><input style={{ width: '95%', marginBottom: '5px' }} value={city} onChange={e => setCity(e.target.value)} placeholder="City" /></div>
      <div><input style={{ width: '95%', marginBottom: '5px' }} value={state} onChange={e => setState(e.target.value)} placeholder="State" /></div>
      <div><input style={{ width: '95%', marginBottom: '5px' }} value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Pincode" /></div>
      <button type="submit">Add Address</button>
    </form>
  );
}

// The main component for the Customer Detail Page.
function CustomerDetailPage() {
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchAddresses = () => {
    axios.get(`http://localhost:5000/api/customers/${id}/addresses`)
      .then(response => setAddresses(response.data))
      .catch(error => console.error('Error fetching addresses:', error));
  };

  useEffect(() => {
    axios.get(`http://localhost:5000/api/customers/${id}`)
      .then(response => setCustomer(response.data))
      .catch(error => console.error('Error fetching customer details:', error));
    fetchAddresses();
  }, [id]);

  // ✅ THIS IS THE CORRECTED FUNCTION
  const handleCustomerDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        alert('Customer deleted successfully!');
        navigate('/');
      } catch (error) {
        console.error('There was an error deleting the customer:', error);
        alert('Failed to delete customer.');
      }
    }
  };

  const handleAddressDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await axios.delete(`http://localhost:5000/api/addresses/${addressId}`);
        fetchAddresses();
      } catch (error) {
        console.error('Failed to delete address:', error);
        alert('Failed to delete address.');
      }
    }
  };

  const handleAddressEdit = (address) => {
    setEditingAddressId(address.id);
    setEditFormData(address);
  };
  
  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/addresses/${editingAddressId}`, editFormData);
      setEditingAddressId(null);
      fetchAddresses();
    } catch (error) {
      console.error('Failed to update address:', error);
      alert('Failed to update address.');
    }
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  if (!customer) return <p>Loading customer details...</p>;

  return (
    <div>
      <h2>Customer Details</h2>
      <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
      <p><strong>Phone:</strong> {customer.phoneNumber}</p>
      {addresses.length === 1 && (
        <p style={{ color: 'green', fontWeight: 'bold', fontStyle: 'italic' }}>
          🏷️ Status: Only One Address
        </p>
      )}
      <Link to={`/edit-customer/${id}`}><button style={{marginRight: '10px'}}>✏️ Edit Customer</button></Link>
      <button onClick={handleCustomerDelete} style={{backgroundColor: 'red', color: 'white'}}>🗑️ Delete Customer</button>
      <hr />
      
      <h3>Addresses</h3>
      {addresses.map(addr => (
        <div key={addr.id} className="address-item">
          {editingAddressId === addr.id ? (
            <form onSubmit={handleAddressUpdate}>
              <input name="addressLine1" value={editFormData.addressLine1} onChange={handleEditFormChange} />
              <input name="city" value={editFormData.city} onChange={handleEditFormChange} />
              <input name="state" value={editFormData.state} onChange={handleEditFormChange} />
              <input name="pincode" value={editFormData.pincode} onChange={handleEditFormChange} />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingAddressId(null)}>Cancel</button>
            </form>
          ) : (
            <div>
              <p>{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
              <button onClick={() => handleAddressEdit(addr)}>Edit</button>
              <button onClick={() => handleAddressDelete(addr.id)} style={{ marginLeft: '10px' }}>Delete</button>
            </div>
          )}
        </div>
      ))}

      {addresses.length === 0 && <p>This customer has no addresses.</p>}
      
      <AddAddressForm customerId={id} onAddressAdded={fetchAddresses} />
    </div>
  );
}

export default CustomerDetailPage;