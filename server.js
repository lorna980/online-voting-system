const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(express.json());

const SECRET = 'your_jwt_secret'; // choose a strong secret

// Registration route
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, role],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('User registered successfully');
    }
  );
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).send('User not found');

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  });
});

// Middleware for role-based access
function authorizeRole(role) {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('No token provided');

    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) return res.status(401).send('Unauthorized');
      if (decoded.role !== role) return res.status(403).send('Forbidden');
      next();
    });
  };
}

// Protected routes
app.get('/admin', authorizeRole('admin'), (req, res) => {
  res.send('Welcome Admin');
});

app.get('/voter', authorizeRole('voter'), (req, res) => {
  res.send('Welcome Voter');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});