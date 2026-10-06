const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host :'localhost',
    user: 'root',
    password:'YseeMR496@',
    database: 'flash_sale'
});


// Function using Atomic SQL Update directly in MySQL
async function buyItemAtomic(userId) {
  // Directly decrement stock ONLY IF stock > 0
  const [result] = await pool.query(
    'UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0'
  );

  // result.affectedRows tells us if the update actually modified a row
  if (result.affectedRows > 0) {
    console.log(`User ${userId}: Purchase SUCCESS!`);
  } else {
    console.log(`User ${userId}: Purchase FAILED! (Out of stock)`);
  }
}
// Function to run the test
async function runTest() {
  console.log('Simulating 5 users clicking "Buy Now" at the exact same millisecond...\n');

  // Fire 5 requests simultaneously using Promise.all
  await Promise.all([
    buyItemAtomic(1),
    buyItemAtomic(2),
    buyItemAtomic(3),
    buyItemAtomic(4),
    buyItemAtomic(5)
  ]);

  // Check final stock in DB
  const [rows] = await pool.query('SELECT stock FROM products WHERE id = 1');
  console.log(`\nFinal stock remaining in DB: ${rows[0].stock}`);

  await pool.end();
}

runTest();