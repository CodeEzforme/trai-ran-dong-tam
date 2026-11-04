// Optional local safeguard: compare private server values against generated public files.
// It reports variable names and file paths only, never the private values.
import fs from 'node:fs';
import path from 'node:path';
const values=[];
if(fs.existsSync('.env.admin.local'))for(const line of fs.readFileSync('.env.admin.local','utf8').trim().split('\n')){
 const at=line.indexOf('=');const name=line.slice(0,at);if(name==='CMS_ADMIN_USERNAME')continue;
 const value=JSON.parse(line.slice(at+1));if(value)values.push([name,value]);
}
let checked=0;
function scan(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())scan(file);else if(/\.(js|html|json|txt|css|mjs)$/.test(item.name)){
 const text=fs.readFileSync(file,'utf8');checked++;for(const [name,value]of values)if(text.includes(value))throw new Error(`Private ${name} found in public output: ${file}`);
}}}
scan('out');console.log(`Checked ${checked} generated public files; no configured server credentials found.`);
