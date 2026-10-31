import {readFileSync,writeFileSync,mkdirSync,appendFileSync} from 'node:fs';
import {gallery} from './gallery.js';
import {plan,isDue} from './content.js';
import {readiness} from './preflight.js';
import {GitHubState} from './state.js';
import {run} from './runner.js';
const config=JSON.parse(readFileSync('config.json')),posts=JSON.parse(readFileSync('content/posts.json'));mkdirSync('artifacts',{recursive:true});
const command=process.argv[2]||'plan';
function slots(count){const slots=[];let time=new Date();time.setUTCSeconds(0,0);time.setUTCMinutes(15);if(time<=new Date())time=new Date(time.getTime()+3600000);for(let i=0;slots.length<count&&i<4000;i++,time=new Date(time.getTime()+3600000))if(isDue(time,config))slots.push(time.toISOString());return slots;}
if(command==='plan'){const schedule=slots(posts.length);const drafts=plan(config,posts).map((p,i)=>({...p,scheduledAt:schedule[i%posts.length],timeZone:config.schedule.timeZone}));writeFileSync('artifacts/preview.json',JSON.stringify(drafts,null,2));writeFileSync('artifacts/content-gallery.html',gallery(drafts));console.log(`${drafts.length} drafts prepared. No publishing. Exact destination link; no site access.`);}
else if(command==='preflight'){const r=readiness(config,posts);writeFileSync('artifacts/readiness.json',JSON.stringify(r,null,2));console.log(JSON.stringify(r,null,2));}
else if(command==='publish'){
 const state=new GitHubState({repository:config.repository,branch:config.stateBranch,sourceBranch:config.branch,token:process.env.GITHUB_TOKEN||'not-configured'});
 const result=await run({config,posts,state});writeFileSync('artifacts/run-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Stay Young publisher\nStatus: ${result.status}\nPublished: ${result.published.length}\nErrors: ${result.errors.length}\nExhausted channels: ${result.exhausted?.join(', ')||'none'}\n`);if(result.status==='needs_review')process.exitCode=1;
}else throw Error('Unknown command');
