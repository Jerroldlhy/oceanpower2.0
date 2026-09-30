import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './api.js';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const port=Number(process.env.PORT)||4173;

createServer(async(req,res)=>{
  if(await handleApi(req,res))return;
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const candidate=normalize(join(root,pathname==='/'?'index.html':pathname));
  const file=candidate.startsWith(root)&&existsSync(candidate)&&statSync(candidate).isFile()?candidate:join(root,'index.html');
  if(!existsSync(file)){res.statusCode=503;res.end('Build output not found. Run npm run build first.');return;}
  res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(port,()=>console.log(`Oceanpower live-data server: http://localhost:${port}`));
