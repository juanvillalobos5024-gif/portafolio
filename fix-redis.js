const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let kvUrl = '';
env.split('\n').forEach(line => {
  if(line.startsWith('REDIS_URL=')) kvUrl = line.substring(10).trim().replace(/^"|"$/g, '');
});

console.log('Connecting to:', kvUrl);

const Redis = require('ioredis');
const redis = new Redis(kvUrl);

async function fix() {
  try {
    const res = await redis.get('content');
    if (res) {
      let data = res.replace(/&nbsp;/g, ' ');
      data = data.replace(/mconsolid/g, 'consolid');
      await redis.set('content', data);
      console.log('Fixed typo and non-breaking spaces in Redis');
    } else {
      console.log('No content in Redis');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

fix();
