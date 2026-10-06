const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host :'localhost',
    user: 'root',
    password:'YseeMR496@',
    database: 'flash_sale',
    connectionLimit: 10,
    queueLimit: 0
});



async function buyItemAtomic(userId) {
  try{
    const [result] = await pool.query(
    'UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0'
  );
  return result.affectedRows >0
} catch(err){
    return false; //connection error or timeout under heavy load
}
  

 
}
// Function to run the test
async function runLoadTest() {
  const TOTAL_USERS = 100000;
  console.log(`🚀 Starting load test: ${TOTAL_USERS} users competing for 10 items...\n`);

  const startTime = Date.now();


  // Create 100,000 promises simultaneously
  const requests = Array.from({ length: TOTAL_USERS }, (_, i) => buyItemAtomic(i + 1));

  const results = await Promise.all(requests);

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  const successfulPurchases = results.filter(res => res === true).length;
  const failedPurchases = results.filter(res => res === false).length;

  console.log(`⏱️ Total Time Taken: ${duration} seconds`);
  console.log(`✅ Successful Purchases: ${successfulPurchases}`);
  console.log(`❌ Failed Purchases (Out of stock or timed out): ${failedPurchases}`);

  // Check final stock in DB
  const [rows] = await pool.query('SELECT stock FROM products WHERE id = 1');
  console.log(`\nFinal stock remaining in DB: ${rows[0].stock}`);

  await pool.end();
}

runLoadTest();