import { collectCcgp } from './ccgp.js';

function json(res,status,body) {
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(JSON.stringify(body));
}

export async function handleApi(req,res) {
  const url=new URL(req.url,'http://localhost');
  if(url.pathname!=='/api/live-opportunities')return false;
  if(req.method!=='GET') {res.setHeader('Allow','GET');json(res,405,{error:'Only GET is supported.'});return true;}
  try {json(res,200,await collectCcgp());}
  catch(error){json(res,502,{error:'The official procurement source is temporarily unavailable.',detail:error.message});}
  return true;
}

export function liveDataPlugin(){return{name:'oceanpower-live-data',configureServer(server){server.middlewares.use(async(req,res,next)=>{if(!await handleApi(req,res))next();});}};}
