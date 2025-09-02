// File: server/index.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client/build')));

// --- CUSTOMER API ENDPOINTS ---

app.get('/api/customers', (req, res) => {
  try {
    const { city, state, pincode } = req.query;
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 5);
    const offset = (page - 1) * limit;

    let baseSql = `FROM customers c`;
    const params = [];
    const whereClauses = [];

    if (city || state || pincode) {
      baseSql += ' LEFT JOIN addresses a ON c.id = a.customer_id';
    }
    if (city) { whereClauses.push('a.city LIKE ?'); params.push(`%${city}%`); }
    if (state) { whereClauses.push('a.state LIKE ?'); params.push(`%${state}%`); }
    if (pincode) { whereClauses.push('a.pincode LIKE ?'); params.push(`%${pincode}%`); }
    if (whereClauses.length > 0) {
      baseSql += ' WHERE ' + whereClauses.join(' AND ');
    }

    const countSql = `SELECT COUNT(DISTINCT c.id) as count ${baseSql}`;
    const totalRecords = db.prepare(countSql).get(params).count;
    const totalPages = Math.ceil(totalRecords / limit);

    const dataSql = `SELECT DISTINCT c.id, c.firstName, c.lastName, c.phoneNumber ${baseSql} ORDER BY c.firstName, c.lastName LIMIT ? OFFSET ?`;
    const rows = db.prepare(dataSql).all(...params, limit, offset);

    res.json({
      data: rows,
      pagination: { currentPage: page, totalPages: totalPages, totalRecords: totalRecords }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', (req, res) => {
  try {
    const sql = "SELECT * FROM customers WHERE id = ?";
    const row = db.prepare(sql).get(req.params.id);
    if (!row) return res.status(404).json({ "error": "Customer not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    if (!firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ "error": "Missing required fields" });
    }
    const sql = 'INSERT INTO customers (firstName, lastName, phoneNumber) VALUES (?, ?, ?)';
    const info = db.prepare(sql).run(firstName, lastName, phoneNumber);
    res.status(201).json({ "message": "Success", "customerId": info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    if (!firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ "error": "Missing required fields" });
    }
    const sql = `UPDATE customers SET firstName = ?, lastName = ?, phoneNumber = ? WHERE id = ?`;
    const info = db.prepare(sql).run(firstName, lastName, phoneNumber, req.params.id);
    if (info.changes === 0) return res.status(404).json({ "error": "Customer not found" });
    res.json({ "message": "success", "data": req.body, "changes": info.changes });
  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    const sql = 'DELETE FROM customers WHERE id = ?';
    const info = db.prepare(sql).run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ "error": "Customer not found" });
    res.json({ "message": "deleted", "changes": info.changes });
  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
});

// --- ADDRESSES API ENDPOINTS ---

app.get('/api/customers/:customerId/addresses', (req, res) => {
  try {
    const sql = "SELECT * FROM addresses WHERE customer_id = ?";
    const rows = db.prepare(sql).all(req.params.customerId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
});

app.post('/api/customers/:customerId/addresses', (req, res) => {
  try {
    const { addressLine1, city, state, pincode } = req.body;
    if (!addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ "error": "All address fields are required" });
    }
    const sql = 'INSERT INTO addresses (customer_id, addressLine1, city, state, pincode) VALUES (?, ?, ?, ?, ?)';
    const info = db.prepare(sql).run(req.params.customerId, addressLine1, city, state, pincode);
    res.status(201).json({ "message": "Address added", "addressId": info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
});

app.put('/api/addresses/:addressId', (req, res) => {
  try {
    const { addressLine1, city, state, pincode } = req.body;
    if (!addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ error: "All address fields are required" });
    }
    const sql = `UPDATE addresses SET addressLine1 = ?, city = ?, state = ?, pincode = ? WHERE id = ?`;
    const info = db.prepare(sql).run(addressLine1, city, state, pincode, req.params.addressId);
    res.json({ message: "Address updated", changes: info.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/addresses/:addressId', (req, res) => {
  try {
    const sql = 'DELETE FROM addresses WHERE id = ?';
    const info = db.prepare(sql).run(req.params.addressId);
    if (info.changes === 0) return res.status(404).json({ error: "Address not found" });
    res.json({ message: "Address deleted", changes: info.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});