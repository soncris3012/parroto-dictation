import fs from 'fs';

let content = fs.readFileSync('server/server-pg.js', 'utf8');

// Fix multi-line run() without returning result
content = content.replace(/(\s+)db\.prepare\(`([^`]+)`\)\.run\(([^)]*)\);/g, '$1await pool.query(`$2`, [$3]);');

// Fix multi-line run() with result
content = content.replace(/(\s+)const result = db\.prepare\(`([^`]+)`\)\.run\(([^)]*)\);/g, 
  '$1const result = await pool.query(`$2 RETURNING id`, [$3]);');

fs.writeFileSync('server/server-pg.js', content);
console.log('Fixed server-pg.js');
