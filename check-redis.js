const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let kvUrl = '';
env.split('\n').forEach(line => {
  if(line.startsWith('REDIS_URL=')) kvUrl = line.substring(10).trim().replace(/^"|"$/g, '');
});
const Redis = require('ioredis');
const redis = new Redis(kvUrl);
async function check() {
  const data = await redis.get('contex_portfolio_content');
  console.log(data.substring(0, 500));
  process.exit(0);
}
check();
