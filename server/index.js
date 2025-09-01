// File: server/index.js

// Import required packages
const express = require('express');
const cors = require('cors');

// This line is crucial: it imports the database connection from database.js
// AND runs the code in that file, setting up our tables.
const db = require('./database.js');

const app = express();
const PORT = 5000;

// Middleware - lets our server accept JSON data and allows cross-origin requests from our React app
app.use(cors());
app.use(express.json());

// --- A simple test route ---
app.get('/', (req, res) => {
  res.send('API is working!');
});


// --- CUSTOMER API ENDPOINTS ---

/**
 * GET: Fetch all customers with FILTERING and PAGINATION.
 * This is the final, most advanced version of this endpoint.
 * - Filters by: city, state, pincode
 * - Paginates by: page, limit
 */
app.get('/api/customers', (req, res) => {
  const { city, state, pincode } = req.query;
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 5);
  const offset = (page - 1) * limit;

  let dataSql = `SELECT DISTINCT c.id, c.firstName, c.lastName, c.phoneNumber FROM customers c`;
  let countSql = `SELECT COUNT(DISTINCT c.id) as count FROM customers c`;

  const params = [];
  const whereClauses = [];

  if (city || state || pincode) {
    const joinClause = ' LEFT JOIN addresses a ON c.id = a.customer_id';
    dataSql += joinClause;
    countSql += joinClause;
  }

  if (city) { whereClauses.push('a.city LIKE ?'); params.push(`%${city}%`); }
  if (state) { whereClauses.push('a.state LIKE ?'); params.push(`%${state}%`); }
  if (pincode) { whereClauses.push('a.pincode LIKE ?'); params.push(`%${pincode}%`); }

  if (whereClauses.length > 0) {
    const whereString = ' WHERE ' + whereClauses.join(' AND ');
    dataSql += whereString;
    countSql += whereString;
  }

  db.get(countSql, params, (err, countRow) => {
    if (err) { return res.status(500).json({ "error": err.message }); }

    const totalRecords = countRow.count;
    const totalPages = Math.ceil(totalRecords / limit);

    dataSql += ' ORDER BY c.firstName, c.lastName LIMIT ? OFFSET ?';
    const dataParams = [...params, limit, offset];

    db.all(dataSql, dataParams, (err, rows) => {
      if (err) { return res.status(500).json({ "error": err.message }); }
      
      res.json({
        data: rows,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalRecords: totalRecords
        }
      });
    });
  });
});

// GET: Fetch a single customer by ID
app.get('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM customers WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) { return res.status(500).json({ "error": err.message }); }
    if (!row) { return res.status(404).json({ "error": "Customer not found" }); }
    res.json(row);
  });
});

// POST: Create a new customer
app.post('/api/customers', (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;
  if (!firstName || !lastName || !phoneNumber) {
    return res.status(400).json({ "error": "Missing required fields" });
  }

  const sql = 'INSERT INTO customers (firstName, lastName, phoneNumber) VALUES (?, ?, ?)';
  db.run(sql, [firstName, lastName, phoneNumber], function(err) {
    if (err) { return res.status(500).json({ "error": err.message }); }
    res.status(201).json({ "message": "Success", "customerId": this.lastID });
  });
});

// PUT: Update an existing customer by ID
app.put('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phoneNumber } = req.body;

  if (!firstName || !lastName || !phoneNumber) {
    return res.status(400).json({ "error": "Missing required fields" });
  }

  const sql = `UPDATE customers SET firstName = ?, lastName = ?, phoneNumber = ? WHERE id = ?`;
  const params = [firstName, lastName, phoneNumber, id];
  db.run(sql, params, function(err) {
    if (err) { return res.status(500).json({ "error": err.message }); }
    if (this.changes === 0) { return res.status(404).json({ "error": "Customer not found" }); }
    res.json({ "message": "success", "data": req.body, "changes": this.changes });
  });
});

// DELETE: Remove a customer by ID
app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM customers WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) { return res.status(500).json({ "error": err.message }); }
    if (this.changes === 0) { return res.status(404).json({ "error": "Customer not found" }); }
    res.json({ "message": "deleted", "changes": this.changes });
  });
});


// --- ADDRESSES API ENDPOINTS ---

// GET: Fetch all addresses for a specific customer
app.get('/api/customers/:customerId/addresses', (req, res) => {
  const { customerId } = req.params;
  const sql = "SELECT * FROM addresses WHERE customer_id = ?";
  db.all(sql, [customerId], (err, rows) => {
    if (err) { return res.status(500).json({ "error": err.message }); }
    res.json(rows);
  });
});

// POST: Add a new address for a specific customer
app.post('/api/customers/:customerId/addresses', (req, res) => {
  const { customerId } = req.params;
  const { addressLine1, city, state, pincode } = req.body;

  if (!addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({ "error": "All address fields are required" });
  }

  const sql = 'INSERT INTO addresses (customer_id, addressLine1, city, state, pincode) VALUES (?, ?, ?, ?, ?)';
  const params = [customerId, addressLine1, city, state, pincode];
  db.run(sql, params, function(err) {
    if (err) { return res.status(500).json({ "error": err.message }); }
    res.status(201).json({ "message": "Address added", "addressId": this.lastID });
  });
});

// PUT: Update a specific address by its ID
app.put('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;
  const { addressLine1, city, state, pincode } = req.body;

  if (!addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({ error: "All address fields are required" });
  }

  const sql = `UPDATE addresses SET addressLine1 = ?, city = ?, state = ?, pincode = ? WHERE id = ?`;
  const params = [addressLine1, city, state, pincode, addressId];
  db.run(sql, params, function(err) {
    if (err) { return res.status(500).json({ error: err.message }); }
    res.json({ message: "Address updated", changes: this.changes });
  });
});

// DELETE: Delete a specific address by its ID
app.delete('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;
  const sql = 'DELETE FROM addresses WHERE id = ?';
  db.run(sql, [addressId], function(err) {
    if (err) { return res.status(500).json({ error: err.message }); }
    if (this.changes === 0) { return res.status(404).json({ error: "Address not found" }); }
    res.json({ message: "Address deleted", changes: this.changes });
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for the developer
  res.status(500).send({ error: 'An unexpected error occurred!' }); // Send a generic message to the client
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});