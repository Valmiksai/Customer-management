// File: client/src/CustomerFormPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function CustomerFormPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from the URL if it exists
  const isEditMode = Boolean(id); // Check if we are in edit mode

  // If in edit mode, fetch the customer data when the component loads
  useEffect(() => {
    if (isEditMode) {
      axios.get(`/api/customers/${id}`)
        .then(response => {
          const { firstName, lastName, phoneNumber } = response.data;
          setFirstName(firstName);
          setLastName(lastName);
          setPhoneNumber(phoneNumber);
        })
        .catch(error => console.error("Error fetching customer data:", error));
    }
  }, [id, isEditMode]); // Effect depends on the id

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!firstName || !lastName || !phoneNumber) {
      alert('Please fill out all fields.');
      return;
    }

    const customerData = { firstName, lastName, phoneNumber };

    try {
      if (isEditMode) {
        // In edit mode, send a PUT request
        await axios.put(`/api/customers/${id}`, customerData);
        alert('Customer updated successfully!');
        navigate(`/customer/${id}`); // Go back to the detail page
      } else {
        // In create mode, send a POST request
        await axios.post('/api/customers', customerData);
        alert('Customer created successfully!');
        navigate('/'); // Go back to the customer list
      }
    } catch (error) {
      console.error('There was an error saving the customer:', error);
      alert('Failed to save customer. The phone number might already exist.');
    }
  };

  return (
    <div>
      {/* Change the title based on the mode */}
      <h2>{isEditMode ? 'Edit Customer' : 'Add a New Customer'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <label>Phone Number:</label>
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <button type="submit">Save Customer</button>
      </form>
    </div>
  );
}

export default CustomerFormPage;