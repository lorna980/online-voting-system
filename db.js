const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@Lynnbett21', // replace with your actual MySQL root password
  database: 'online_voting',
  port: 3307 // only if your MySQL is running on 3307, otherwise remove this line
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

module.exports = db;