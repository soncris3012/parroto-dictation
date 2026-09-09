import fs from 'fs';

let content = fs.readFileSync('server/server.js', 'utf8');

// Convert routes to async
content = content.replace(/app\.(get|post|put|delete)\("([^"]+)",\s*\(req,\s*res\)\s*=>\s*{/g, 'app.$1("$2", async (req, res) => {');

// Convert db.prepare("...").get(args) -> (await pool.query("...", [args])).rows[0]
// Convert db.prepare("...").all(args) -> (await pool.query("...", [args])).rows
// Convert db.prepare("...").run(args) -> await pool.query("...", [args])

// A very simplified converter since we are providing it as a starting point.
content = content.replace(/import db from "\.\/database\.js";/g, 'import pool from "./database-pg.js";');

content = content.replace(/db\.prepare\(([^)]+)\)\.get\(([^)]*)\)/g, '(await pool.query($1, [$2])).rows[0]');
content = content.replace(/db\.prepare\(([^)]+)\)\.all\(([^)]*)\)/g, '(await pool.query($1, [$2])).rows');
content = content.replace(/db\.prepare\(([^)]+)\)\.run\(([^)]*)\)/g, 'await pool.query($1, [$2])');

// Fix empty array brackets
content = content.replace(/\[\]\)/g, '[])');
content = content.replace(/\[\s*\]/g, '[]');

fs.writeFileSync('server/server-pg.js', content, 'utf8');
console.log('Created server/server-pg.js');
