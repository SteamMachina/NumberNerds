require('dotenv').config(); // import dotenv

const express = require('express'); // import express
const mysql = require('mysql2'); // import mysql2
const app = express(); // create an express app

const port = process.env.PORT || 3000; // port to listen on

// create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test the connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the MySQL database');
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
        console.error('Error retrieving users:', err);
        res.status(500).send('Server error');
        } else {
        res.json(results);
        }
    });
})



app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});