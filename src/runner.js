import {plan,identity,fingerprint,isDue} from './content.js';
import {assertLiveReady,checkImage} from './preflight.js';
import {publish,checkAccount} from './adapters.js';
export async function run({config,posts,env=process.env,state,now=new Date(),publishImpl=publish,accountImpl=checkAccount,imageImpl=checkImage}){
 assertLiveReady(config,posts,env);
 if(!isDue(now,config))return {status:'outside_schedule',published:[],errors:[]};
 const drafts=plan(config,posts),out={status:'complete',published:[],errors:[],exhausted:[]};
 await state.initialize();
 for(const platform of config.platforms){let reservedId=null;try{
  const account=platform+':'+await accountImpl(platform,env);
  const saved=await state.load();if(saved.accounts[account]?.blocked)throw Error('Account has an unresolved reservation; review provider before retrying');
  const previous=saved.accounts[account];if(previous&&now.getTime()-previous.time<config.minimumHoursBetweenPosts*3600000)continue;
  const candidate=drafts.filter(p=>p.platform===platform).find(p=>!saved.posts[identity(p,account)]);
  if(!candidate){out.exhausted.push(platform);continue;}
  await imageImpl(candidate);
  const id=identity(candidate,account);
  if(!await state.reserve({id,fingerprint:fingerprint(candidate),account,cooldownHours:config.minimumHoursBetweenPosts,now:now.getTime()}))continue;
  reservedId=id;
  const result=await publishImpl(candidate,env);
  const remoteId=result.id||result.uri;
  if(!remoteId)throw Error('Provider returned no publication identifier');
  await state.finish(id,String(remoteId));reservedId=null;out.published.push({platform,id:String(remoteId)});
 }catch(e){if(reservedId){try{await state.uncertain(reservedId);}catch{/* A persisted reservation still blocks the next run. */}}out.errors.push({platform,error:'Operation failed safely; review connection, image or reserved state. No automatic retry.'});}}
 if(out.errors.length||out.exhausted.length)out.status='needs_review';return out;
}
