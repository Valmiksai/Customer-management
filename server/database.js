// File: server/database.js

const path = require('path');
const db = require('better-sqlite3')(path.join(__dirname, 'customers.db'), { verbose: console.log });

const setupSql = `
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phoneNumber TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    addressLine1 TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
  );
`;

// .exec() runs all the statements in the string
db.exec(setupSql);
console.log('Database is ready.');

module.exports = db;