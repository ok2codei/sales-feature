const mysql = require('mysql2/promise');
const Redis = require('ioredis');

// Connect to local Redis instance
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379
});

const pool = mysql.createPool({
    host :'localhost',
    user: 'root',
    password:'YseeMR496@',
    database: 'flash_sale',
    connectionLimit: 10,
    queueLimit: 0
});



async function buyItemRedis(userId) {
  try{
  const newStock = await redis.decr('stock:product_1');
  
  if (newStock >=0){
    return true;
  } else{
    await redis.incr('stock:product_1')
  }
} catch(err){
    return false; //connection error or timeout under heavy load
}
  

 
}
// Function to run the test
async function runRedisLoadTest() {
  const TOTAL_USERS = 100000;
  console.log(`🚀 Starting load test: ${TOTAL_USERS} users competing for 10 items...\n`);

  const startTime = Date.now();


  // Create 100,000 promises simultaneously
  const requests = Array.from({ length: TOTAL_USERS }, (_, i) => buyItemRedis(i + 1));

  const results = await Promise.all(requests);

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  const successfulPurchases = results.filter(res => res === true).length;
  const failedPurchases = results.filter(res => res === false).length;

  console.log(`⏱️ Total Time Taken: ${duration.toFixed(2)} seconds`);
  console.log(`✅ Successful Purchases: ${successfulPurchases}`);
  console.log(`❌ Failed Purchases (Out of stock or timed out): ${failedPurchases}`);

// Check final stock in Redis
  const finalStock = await redis.get('stock:product_1');
  console.log(`📦 Final Stock in Redis: ${finalStock}`);

  redis.quit();
}

runRedisLoadTest();