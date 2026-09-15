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
  if (!data) {
    console.log("No data found.");
    process.exit(0);
  }
  
  // Parse data
  let obj = JSON.parse(data);
  
  // Recursive replace
  function traverseAndFix(node) {
    if (typeof node === 'string') {
      // Replace non-breaking spaces (\u00a0, &nbsp;) AND any other space-like characters (\s) EXCEPT newline
      let s = node.replace(/&nbsp;/g, ' ');
      // Replace all unicode spaces with standard space
      // \u00A0 is non-breaking space
      // \u202F is narrow no-break space
      // \uFEFF is zero width no-break space
      // \s matches all of them, but we want to keep newlines (\n, \r)
      s = s.replace(/[^\S\r\n]/g, ' '); 
      s = s.replace(/mconsolid/g, 'consolid');
      return s;
    } else if (Array.isArray(node)) {
      return node.map(traverseAndFix);
    } else if (typeof node === 'object' && node !== null) {
      const newObj = {};
      for (const key in node) {
        newObj[key] = traverseAndFix(node[key]);
      }
      return newObj;
    }
    return node;
  }
  
  const fixedObj = traverseAndFix(obj);
  const fixedStr = JSON.stringify(fixedObj);
  
  if (data === fixedStr) {
    console.log("NO CHANGES DETECTED. The regex did not match!");
  } else {
    console.log("CHANGES DETECTED. Applying fix...");
    await redis.set(REDIS_KEY, fixedStr);
  }
  process.exit(0);
}
fix();
