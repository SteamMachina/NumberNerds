/**************** */
/* INITIALISATION */
/**************** */

require('dotenv').config(); // import dotenv

const express = require('express'); // import express
const mysql = require('mysql2'); // import mysql2
const app = express(); // create an express app
const bcrypt = require('bcrypt'); // encryption node.js extension used to hash passwords
const saltRounds = 10; //parameter used by bcrypt to determine how many times the password hashing algorithm is applied.
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

// Add a new friendship (bidirectional)
app.post('/befriend', (req, res) => {
  const { user_id, friend_id } = req.body;
  // Check if friend_id exists in the database
  db.query('SELECT * FROM users WHERE user_id = ?', [friend_id], (err, results) => {
    if (err) {
      console.error('Error retrieving user:', err);
      res.status(500).send('Server error');
    } else if (results.length === 0) {
      res.status(404).send('User not found');
    } else {
      // Check if the friendship already exists in either direction
      db.query(
        'SELECT * FROM befriend WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
        [user_id, friend_id, friend_id, user_id],
        (err, results) => {
          if (err) {
            console.error('Error checking if friendship exists:', err);
            res.status(500).send('Server error');
          } else if (results.length === 0) {
            // Add friendship in both directions
            db.query(
              'INSERT INTO befriend (user_id, friend_id) VALUES (?, ?), (?, ?)',
              [user_id, friend_id, friend_id, user_id],
              (err, results) => {
                if (err) {
                  console.error('Error befriending user:', err);
                  res.status(500).send('Server error');
                } else {
                  res.status(204).send('Users befriended successfully');
                }
              }
            );
          } else {
            res.status(200).send('Friendship already exists');
          }
        }
      );
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

// Display all shared operations with a specific friend
app.get('/operations/shared/', (req, res) => {
  const { user_id, receiver_id } = req.body;
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
                // modify total_money in users
                db.query(
                  `UPDATE users
                  SET total_money = total_money - ?
                  WHERE user_id = ?;`,
                  [amount, payer_id],
                  (err, results) => {
                    if (err) {
                      console.error('Error updating total money:', err);
                    } else {
                      res.status(200).send('Operation added successfully');
                    }
                  }
                );
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
      // update total_money in users
      db.query(
        `UPDATE users
        SET total_money = total_money + ?
        WHERE user_id = ?;`,
        [results[0].amount, results[0].payer_id],
        (err, updateResults) => {
          if (err) {
            console.error('Error updating total money:', err);
          } else {
            // Delete operation from shares table
            db.query('DELETE FROM shares WHERE operation_id = ?', [operation_id], (err, shareResults) => {
              if (err) {
                console.error('Error deleting operation from shares:', err);
                res.status(500).send('Server error');
              } else {
                // Delete operation from the operations table
                db.query('DELETE FROM operations WHERE operation_id = ?', [operation_id], (err, deleteResults) => {
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
        }
      );
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
      // Check if receiver_id and user_id are friends
      db.query('SELECT * FROM befriend WHERE user_id = ? and friend_id = ?', [results[0].payer_id, receiver_id], (err, results) => {
        if (err) {
          console.error('Error retrieving user:', err);
          res.status(500).send('Server error');
        } else if (results.length === 0) {
          res.status(404).send('receiver not friend or nonexistent');
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
                // Update owed money for both users
                db.query('SELECT amount, payer_id FROM operations WHERE operation_id = ?', [operation_id], (err, opResults) => {
                  if (err) {
                    console.error('Error retrieving operation amount:', err);
                    res.status(500).send('Server error');
                  } else if (opResults.length === 0) {
                    res.status(404).send('Operation not found');
                  } else {
                    const operation_amount = opResults[0].amount;
                    const payer_id = opResults[0].payer_id;
                    // First update: increment owed_money for the share
                    db.query(
                      `UPDATE befriend
                      SET owed_money = owed_money + (? / 100 * ?)
                      WHERE user_id = ? AND friend_id = ?;`,
                      [percentage, operation_amount, receiver_id, payer_id],
                      (err, results) => {
                        if (err) {
                          console.error('Error updating owed money:', err);
                        } else {
                          // Second update: sync the reverse direction
                          db.query(
                            `UPDATE befriend b1
                            JOIN befriend b2 ON b1.user_id = b2.friend_id AND b1.friend_id = b2.user_id
                            SET b2.owed_money = -b1.owed_money
                            WHERE b1.user_id = ? AND b1.friend_id = ?;`,
                            [receiver_id, payer_id],
                            (err, results) => {
                              if (err) {
                                console.error('Error updating owed money (reverse):', err);
                              } else {
                                console.log('Owed money incremented successfully (both directions)');
                              }
                            }
                          );
                        }
                      }
                    );
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

// Display all operations of a user, including operations shared with the user
app.get('/operations/:user_id', (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT * FROM operations WHERE payer_id = ?
    UNION
    SELECT o.* FROM operations o
    JOIN shares s ON o.operation_id = s.operation_id
    WHERE s.receiver_id = ?;
  `;
  db.query(query, [user_id, user_id], (err, results) => {
    if (err) {
      console.error('Error retrieving operations:', err);
      res.status(500).send('Server error');
    } else {
      // Format the date to YYYY-MM-DD
      results.forEach(op => {
        op.date = op.date.toISOString().substring(0, 10);
      });
      res.json(results);
    }
  });
});

// Delete a share by operation_id and receiver_id (use both as URL params)
app.delete('/shares/:operation_id/:receiver_id', (req, res) => {
  const { operation_id, receiver_id } = req.params;
  // Check if share exists
  db.query('SELECT * FROM shares WHERE receiver_id = ? AND operation_id = ?;', [receiver_id, operation_id], (err, shareResults) => {
    if (err) {
      console.error('Error checking if share exists:', err);
      res.status(500).send('Server error');
    } else if (shareResults.length === 0) {
      res.status(404).send('Share not found');
    } else {
      // Delete share from the database; trigger will update owed_money
      db.query('DELETE FROM shares WHERE receiver_id = ? AND operation_id = ?', [receiver_id, operation_id], (err, results) => {
        if (err) {
          console.error('Error deleting share:', err);
          res.status(500).send('Server error');
        } else {
          res.status(200).send('Share deleted successfully');
        }
      });
    }
  });
});

// Edit an operation
app.put('/operations', (req, res) => {
  const { operation_id, amount, category, label, date } = req.body;

  // Check if operation exists in the database
  db.query('SELECT * FROM operations WHERE operation_id = ?', [operation_id], (err, results) => {
    if (err) {
      console.error('Error retrieving operation:', err);
      res.status(500).send('Server error');
    } else if (results.length === 0) {
      res.status(404).send('Operation not found');
    } else {
      // Saving original amount
      const original_amount = results[0].amount;
      const payer_id = results[0].payer_id;
      // Check if category exists
      db.query('SELECT * FROM categories WHERE name = ?', [category], (err, results) => {
        if (err) {
          console.error('Error checking if category exists:', err);
          res.status(500).send('Server error');
        } else if (results.length === 0) {
          res.status(404).send('Category not found');
        } else {
          // Update operation in the database
          db.query(
            'UPDATE operations SET amount = ?, category = ?, label = ?, date = ? WHERE operation_id = ?',
            [amount, category, label, date, operation_id],
            (err, results) => {
              if (err) {
                console.error('Error adding operation:', err);
                res.status(500).send('Server error');
              } else {
                // Update shares if the amount has changed
                if (amount !== original_amount) {
                  // Get all shares for this operation
                  db.query('SELECT * FROM shares WHERE operation_id = ?', [operation_id], (err, shareResults) => {
                    if (err) {
                      console.error('Error retrieving shares:', err);
                      res.status(500).send('Server error');
                    } else {
                      // since amount changed, we also need to update total_money in users
                      db.query(
                        `UPDATE users
                        SET total_money = total_money + ? - ?
                        WHERE user_id = ?;`,
                        [original_amount, amount, payer_id],
                        (err, results) => {
                          if (err) {
                            console.error('Error updating total money:', err);
                            return res.status(500).send('Server error');
                          }
                          if (!shareResults || shareResults.length === 0) {
                            return res.status(201).send('Operation updated successfully');
                          }
                          let completed = 0;
                          let hasError = false;
                          shareResults.forEach(share => {
                            const originaly_owed = (share.percentage / 100) * original_amount;
                            const newly_owed = (share.percentage / 100) * amount;
                            const owed_difference = originaly_owed - newly_owed;
                            db.query(
                              `UPDATE befriend
                              SET owed_money = owed_money - ?
                              WHERE user_id = ? AND friend_id = ?;`,
                              [owed_difference, share.receiver_id, payer_id],
                              (err, results) => {
                                if (err && !hasError) {
                                  hasError = true;
                                  console.error('Error updating owed money:', err);
                                  return res.status(500).send('Server error');
                                }
                                completed++;
                                if (completed === shareResults.length && !hasError) {
                                  return res.status(201).send('Operation updated successfully');
                                }
                              }
                            );
                          });
                        }
                      );
                    }
                  });
                } else {
                  res.status(201).send('Operation updated successfully');
                }
              }
            }
          );
        }
      });
    }
  });
});



// display the total_money of a user
app.get('/profil/:user_id', (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT user_id, email, name, total_money
    FROM users
    WHERE user_id = ?;`;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error retrieving user information:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// register
app.post('/register', (req, res) => {
  const {email, password, name} = req.body;
  bcrypt.hash(password, saltRounds, function(err, hash) {
  db.query(`
      INSERT INTO user (name, email, password_hash) values (?,?,?)`,
      [name, email, hash],
      (err, results) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).send('Server error');
        }
      }
    )
    if (err){
      console.error('Error encrypting password:', err);
      return res.status(500).send('Server error');
    }
  });
})



//return codes
// error handling on params and bodies

/************** */
/* START SERVER */
/************** */

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});