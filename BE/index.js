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
                res.status(204).send('User befriended successfully');
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

// Remove a friendship
app.delete('/befriend', (req, res) => {
const {user_id, friend_id} = req.body;
  // Check if the user is in friend list
  db.query('SELECT * FROM befriend WHERE user_id = ? AND friend_id = ?', [user_id, friend_id], (err, results) => {
    if (err) {
      console.error('Error checking if user in list of friends:', err);
      res.status(500).send('Server error');
    } else {
      // If friendship exists
      if (results.length !== 0) {
        // Remove friendship from the database
        db.query('DELETE FROM befriend WHERE user_id = ? AND friend_id = ?', [user_id, friend_id], (err, results) => {
          if (err) {
            console.error('Error unfriending user:', err);
            res.status(500).send('Server error');
          } else {
            res.status(204).send('User unfriended successfully');
          }
        });
      } else {
        // If friendship already exists
        res.status(200).send('Friendship does not exist');
      }
    }
  });
});

// Display all friends of a user
app.get('/friends/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.query('SELECT * FROM befriend WHERE user_id = ?', [user_id], (err, results) => {
    if (err) {
      console.error('Error retrieving friends:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// Display all operations of a user
app.get('/operations/:payer_id', (req, res) => {
  const { payer_id } = req.params;
  db.query('SELECT * FROM operations WHERE payer_id = ?', [payer_id], (err, results) => {
    if (err) {
      console.error('Error retrieving operations:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// Display all shared operations with a specific friend
app.get('/operations/shared/:user_id/:receiver_id', (req, res) => {
  const { user_id, receiver_id } = req.params;
  const query = `
    SELECT 
      operations.*,
      shares.percentage
    FROM operations
    JOIN shares ON operations.operation_id = shares.operation_id
    WHERE operations.payer_id = ? AND shares.receiver_id = ?;
  `;
  db.query(query, [user_id, receiver_id], (err, results) => {
    if (err) {
      console.error('Error retrieving shared operations:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// Display all operations of a user with a specific category
app.get('/operations/category/:user_id/:category', (req, res) => {
  const { user_id, category } = req.params;
  db.query('SELECT * FROM operations WHERE payer_id = ? AND category = ?', [user_id, category], (err, results) => {
    if (err) {
      console.error('Error retrieving operations:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// Display all categories
app.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      console.error('Error retrieving categories:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// Add new category
app.post('/category', (req, res) => {
  const { name } = req.body;
  // Check if category already exists
  db.query('SELECT * FROM categories WHERE name = ?', [name], (err, results) => {
    if (err) {
      console.error('Error checking if category exists:', err);
      res.status(500).send('Server error');
    } else if (results.length > 0) {
      res.status(400).send('Category already exists');
    } else {
      // Add category to the database
      db.query('INSERT INTO categories (name) VALUES (?)', [name], (err, results) => {
        if (err) {
          console.error('Error adding category:', err);
          res.status(500).send('Server error');
        } else {
          res.status(201).send('Category added successfully');
        }
      });
    }
  });
});

// Delete a category by name
app.delete('/category/:name', (req, res) => {
  const { name } = req.params;
  // Check if category exists
  db.query('SELECT * FROM categories WHERE name = ?', [name], (err, results) => {
    if (err) {
      console.error('Error checking if category exists:', err);
      res.status(500).send('Server error');
    } else if (results.length <= 0) {
      res.status(400).send('Category does not exist');
    } else {
      // Delete category from the database
      db.query('DELETE FROM categories WHERE name = ?', [name], (err, results) => {
        if (err) {
          console.error('Error deleting category:', err);
          res.status(500).send('Server error');
        } else {
          res.status(200).send('Category deleted successfully');
        }
      });
    }
  });
});

// Add a new operation
app.post('/operations', (req, res) => {
  const { payer_id, amount, category, label, date } = req.body;

  // Check if payer_id exists in the database
  db.query('SELECT * FROM users WHERE user_id = ?', [payer_id], (err, results) => {
    if (err) {
      console.error('Error retrieving user:', err);
      res.status(500).send('Server error');
    } else if (results.length === 0) {
      res.status(404).send('User not found');
    } else {
      // Check if category exists
      db.query('SELECT * FROM categories WHERE name = ?', [category], (err, results) => {
        if (err) {
          console.error('Error checking if category exists:', err);
          res.status(500).send('Server error');
        } else if (results.length === 0) {
          res.status(404).send('Category not found');
        } else {
          // Add operation to the database
          db.query(
            'INSERT INTO operations (payer_id, amount, category, label, date) VALUES (?, ?, ?, ?, ?)',
            [payer_id, amount, category, label, date],
            (err, results) => {
              if (err) {
                console.error('Error adding operation:', err);
                res.status(500).send('Server error');
              } else {
                res.status(201).send('Operation added successfully');
              }
            }
          );
        }
      });
    }
  });
});

// Delete an operation
app.delete('/operations/:operation_id', (req, res) => {
  const { operation_id } = req.params;
  // Check if operation exists
  db.query('SELECT * FROM operations WHERE operation_id = ?', [operation_id], (err, results) => {
    if (err) {
      console.error('Error checking if operation exists:', err);
      res.status(500).send('Server error');
    } else if (results.length === 0) {
      res.status(404).send('Operation not found');
    } else {
      // Delete operation from shares table
      db.query('DELETE FROM shares WHERE operation_id = ?', [operation_id], (err, results) => {
        if (err) {
          console.error('Error deleting operation from shares:', err);
          res.status(500).send('Server error');
        } else {
          // Delete operation from the operations table
          db.query('DELETE FROM operations WHERE operation_id = ?', [operation_id], (err, results) => {
            if (err) {
              console.error('Error deleting operation:', err);
              res.status(500).send('Server error');
            } else {
              res.status(200).send('Operation deleted successfully');
            }
          });
        }
      });
    }
  });
});

// Create a new share
app.post('/shares', (req, res) => {
  const { operation_id, receiver_id, percentage } = req.body;
  // Check if operation_id exists in the database
  db.query('SELECT * FROM operations WHERE operation_id = ?', [operation_id], (err, results) => {
    if (err) {
      console.error('Error retrieving operation:', err);
      res.status(500).send('Server error');
    } else if (results.length === 0) {
      res.status(404).send('Operation not found');
    } else {
      // Check if receiver_id exists in the database
      db.query('SELECT * FROM users WHERE user_id = ?', [receiver_id], (err, results) => {
        if (err) {
          console.error('Error retrieving user:', err);
          res.status(500).send('Server error');
        } else if (results.length === 0) {
          res.status(404).send('User not found');
        } else {
          // Add share to the database
          db.query(
            'INSERT INTO shares (operation_id, receiver_id, percentage) VALUES (?, ?, ?)',
            [operation_id, receiver_id, percentage],
            (err, results) => {
              if (err) {
                console.error('Error adding share:', err);
                res.status(500).send('Server error');
              } else {
                res.status(201).send('Share added successfully');
                const query = `
                  UPDATE befriend b
                  JOIN (
                    SELECT
                      s.receiver_id AS user_id,
                      o.payer_id AS friend_id,
                      SUM(s.percentage / 100 * o.amount) AS total_owed
                    FROM shares s
                    JOIN operations o ON s.operation_id = o.operation_id
                    GROUP BY s.receiver_id, o.payer_id
                  ) calc ON b.user_id = calc.user_id AND b.friend_id = calc.friend_id
                  SET b.owed_money = calc.total_owed
                `;
                db.query(query, (err, results) => {
                  if (err) {
                    console.error('Error updating owed money:', err);
                  } else {
                    console.log('Owed money updated successfully');
                  }
                });
              }
            }
          );
        }
      });
    }
  });
});

// Display owed money with friends
app.get('/owed_money/:user_id', (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT b.friend_id, u.name AS friend_name, b.owed_money
    FROM befriend b
    JOIN users u ON b.friend_id = u.user_id
    WHERE b.user_id = ?;`;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error retrieving owed money:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

/************** */
/* START SERVER */
/************** */

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});