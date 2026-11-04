// Run interactively through stdin. Never pass a password or token in shell arguments.
import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../server/auth.mjs';
if(process.stdin.isTTY)process.stdin.setRawMode(true);
let data;for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity,terminal:false})){data=JSON.parse(line);break;}
if(process.stdin.isTTY)process.stdin.setRawMode(false);
process.stdin.pause();
if(!data?.username||typeof data.password!=='string'||data.password.length<12)throw new Error('Account configuration is incomplete.');
if(!data.githubToken){const gh=process.env.GH_EXECUTABLE||(fs.existsSync('.tools/gh-portable/gh.exe')?path.resolve('.tools/gh-portable/gh.exe'):'gh');data.githubToken=execFileSync(gh,['auth','token'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}
const values={CMS_ADMIN_USERNAME:data.username,CMS_PASSWORD_HASH:await hashPassword(data.password),CMS_SESSION_SECRET:randomBytes(48).toString('base64url'),CMS_GITHUB_TOKEN:data.githubToken};
fs.writeFileSync('.env.admin.local',Object.entries(values).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join('\n')+'\n',{mode:0o600});
console.log('Server credentials configured in ignored local environment file. No credentials were printed.');
