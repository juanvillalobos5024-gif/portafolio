const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let kvUrl = '';
env.split('\n').forEach(line => {
  if(line.startsWith('REDIS_URL=')) kvUrl = line.substring(10).trim().replace(/^"|"$/g, '');
});
const Redis = require('ioredis');
const redis = new Redis(kvUrl);
const REDIS_KEY = 'contex_portfolio_content';

async function fix() {
  const data = await redis.get(REDIS_KEY);
  let fixed = data.replace(/&nbsp;/g, ' ');
  fixed = fixed.replace(/\\u00a0/g, ' ');
  fixed = fixed.replace(/\u00a0/g, ' ');
  fixed = fixed.replace(/mconsolid/g, 'consolid');
  
  if (data === fixed) {
    console.log("NO CHANGES DETECTED. The regex did not match!");
  } else {
    console.log("CHANGES DETECTED. Applying fix...");
    await redis.set(REDIS_KEY, fixed);
  }
  process.exit(0);
}
fix();
