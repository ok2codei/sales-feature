const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host :'localhost',
    user: 'root',
    password:'YseeMR496@',
    database: 'flash_sale'
});


async function buyItemNaive(userId) {
  // Step A: Read stock
  const [rows] = await pool.query('SELECT stock FROM products WHERE id = 1');
  const currentStock = rows[0].stock;

  // Step B: Check if stock > 0
  if (currentStock > 0) {
    // Step C: Deduct 1 from stock
    await pool.query('UPDATE products SET stock = ? WHERE id = 1', [currentStock - 1]);
    console.log(`User ${userId}: Purchase SUCCESS! (Saw stock: ${currentStock})`);
  } else {
    console.log(`User ${userId}: Purchase FAILED! (Out of stock)`);
  }
}

// Function to run the test
async function runTest() {
  console.log('Simulating 5 users clicking "Buy Now" at the exact same millisecond...\n');

  // Fire 5 requests simultaneously using Promise.all
  await Promise.all([
    buyItemNaive(1),
    buyItemNaive(2),
    buyItemNaive(3),
    buyItemNaive(4),
    buyItemNaive(5)
  ]);

  // Check final stock in DB
  const [rows] = await pool.query('SELECT stock FROM products WHERE id = 1');
  console.log(`\nFinal stock remaining in DB: ${rows[0].stock}`);

  await pool.end();
}

runTest();