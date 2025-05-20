/**************** */
/* INITIALISATION */
/**************** */

require('dotenv').config(); // import dotenv

const express = require('express'); // import express
const mysql = require('mysql2'); // import mysql2
const app = express(); // create an express app

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

/******** */
/* ROUTES */
/******** */

// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Display all users
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

// Add a new friendship
app.post('/befriend', (req, res) => {
  const {user_id, friend_id} = req.body;
  // Check if friend_id exists in the database
  db.query('SELECT * FROM users WHERE user_id = ?', [friend_id], (err, results) => {
    if (err) {
      console.error('Error retrieving user:', err);
      res.status(500).send('Server error');
    } else if (results.length === 0) {
      res.status(404).send('User not found');
    } else {
      // Check if the user is already a friend
      db.query('SELECT * FROM befriend WHERE user_id = ? AND friend_id = ?', [user_id, friend_id], (err, results) => {
        if (err) {
          console.error('Error checking if friendship exists:', err);
          res.status(500).send('Server error');
        } else {
          // If friendship doesn't already exist
          if (results.length === 0) {
            // Add friendship to the database
            db.query('INSERT INTO befriend (user_id, friend_id) VALUES (?, ?)', [user_id, friend_id], (err, results) => {
              if (err) {
                console.error('Error befriending user:', err);
                res.status(500).send('Server error');
              } else {
                res.status(200).send('User befriended successfully');
              }
            });
          } else {
            // If friendship already exists
            res.status(200).send('Friendship already exists');
          }
        }
      });
    }
  });
});
     
/************** */
/* START SERVER */
/************** */

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});