// File: server/database.js

const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './customers.db';

// This connects to the database file `customers.db`. It will create the file if it doesn't exist.
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');
    // db.serialize ensures that the following commands are executed one after another.
    db.serialize(() => {
      // This command creates the 'customers' table IF IT DOESN'T ALREADY EXIST.
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          phoneNumber TEXT UNIQUE NOT NULL
        );
      `);
      // This command creates the 'addresses' table IF IT DOESN'T ALREADY EXIST.
      db.run(`
        CREATE TABLE IF NOT EXISTS addresses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          addressLine1 TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          pincode TEXT NOT NULL,
          FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
        );
      `);
    });
  }
});

// We export the database connection object to be used in our main server file.
module.exports = db;