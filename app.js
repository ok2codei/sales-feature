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


  
// Define the Lua script
const luaScript = `
  local current = tonumber(redis.call('get', KEYS[1]))
  if current and current > 0 then
      redis.call('decr', KEYS[1])
      return 1
  else
      return 0
  end
`;

async function buyItemLua(userId) {
  try {
    // eval(script, numberOfKeys, keyName)
    // Returns 1 if purchase succeeded, 0 if out of stock
    const result = await redis.eval(luaScript, 1, 'stock:product_1');
    return result === 1;
  } catch (err) {
    return false;
  }
}
// Function to run the test
async function runRedisLoadTest() {
  const TOTAL_USERS = 100000;
  console.log(`🚀 Starting Lua-based Redis load test: ${TOTAL_USERS} users competing for 10 items...\n`);

  // Reset stock in Redis to 10 before starting
  await redis.set('stock:product_1', 10);

  const startTime = Date.now();


  // Create 100,000 promises simultaneously

  const requests = Array.from({ length: TOTAL_USERS }, (_, i) => buyItemLua(i + 1));
  const results = await Promise.all(requests);

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  const successfulPurchases = results.filter(res => res === true).length;
  const failedPurchases = results.filter(res => res === false).length;

  console.log(`⏱️ Total Time Taken: ${duration.toFixed(2)} seconds`);
  console.log(`⏱️  Total Time Taken: ${duration.toFixed(2)} seconds`);
  console.log(`✅ Successful Purchases: ${successfulPurchases}`);
  console.log(`❌ Failed Purchases (Out of stock or errors): ${failedPurchases}`);

// Check final stock in Redis
  const finalStock = await redis.get('stock:product_1');
  console.log(`📦 Final Stock in Redis: ${finalStock}`);

  redis.quit();
}

runRedisLoadTest();

