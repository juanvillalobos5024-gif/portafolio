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
  try {
    const res = await redis.get(REDIS_KEY);
    if (res) {
      let data = res.replace(/&nbsp;/g, ' ');
      data = data.replace(/mconsolid/g, 'consolid');
      await redis.set(REDIS_KEY, data);
      console.log('Fixed typo and non-breaking spaces in Redis for key:', REDIS_KEY);
    } else {
      console.log('No content in Redis for key:', REDIS_KEY);
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

fix();
