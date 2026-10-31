import {readFileSync} from 'node:fs';
// Only official HTTP APIs. Tokens are supplied by environment/secret stores, never logged.
async function request(url,{token,body,method='POST'}={}){const r=await fetch(url,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Provider request failed (${r.status}); inspect provider dashboard; credentials and bodies omitted`);return r.json();}
function required(env,name){if(!env[name])throw Error(`Missing secure binding: ${name}`);return env[name];}
function image(p){if(!p.imageUrl||!p.imageUrl.startsWith('https://'))throw Error('Public HTTPS raster image URL required');const u=new URL(p.imageUrl);if(u.hostname!=='raw.githubusercontent.com'||u.username||u.password||u.port)throw Error('Only approved original GitHub assets may be requested');return p.imageUrl;}
export async function publish(p,env=process.env){
 const version=['facebook','instagram'].includes(p.platform)?required(env,'META_GRAPH_VERSION'):(p.platform==='threads'?required(env,'THREADS_GRAPH_VERSION'):null);
 if(p.platform==='facebook'){const id=required(env,'FACEBOOK_PAGE_ID'),token=required(env,'FACEBOOK_PAGE_TOKEN');return request(`https://graph.facebook.com/${version}/${id}/photos`,{token,body:{url:image(p),caption:p.text}});}
 if(p.platform==='pinterest')return request('https://api.pinterest.com/v5/pins',{token:required(env,'PINTEREST_TOKEN'),body:{board_id:required(env,'PINTEREST_BOARD_ID'),title:p.title,description:p.text,link:p.link,alt_text:p.alt,media_source:{source_type:'image_url',url:image(p)}}});
 if(p.platform==='instagram'||p.platform==='threads'){
 const ig=p.platform==='instagram',root=ig?'https://graph.facebook.com':'https://graph.threads.net';const id=required(env,ig?'INSTAGRAM_ACCOUNT_ID':'THREADS_ACCOUNT_ID'),token=required(env,ig?'INSTAGRAM_TOKEN':'THREADS_TOKEN');const endpoint=`${root}/${version}/${id}`;
 const container=await request(`${endpoint}/${ig?'media':'threads'}`,{token,body:ig?{image_url:image(p),caption:p.text}:{media_type:'IMAGE',image_url:image(p),text:p.text}});
 let status;for(let attempt=0;attempt<10;attempt++){status=await request(`${root}/${version}/${container.id}?fields=${ig?'status_code':'status'}`,{token,method:'GET'});if(['FINISHED','PUBLISHED','ERROR','EXPIRED'].includes(status.status_code||status.status))break;await new Promise(r=>setTimeout(r,2000));}
 if(!['FINISHED','PUBLISHED'].includes(status.status_code||status.status))throw Error('Container not ready; review container before retrying');
 return request(`${endpoint}/${ig?'media_publish':'threads_publish'}`,{token,body:{creation_id:container.id}});
 }
 if(p.platform==='mastodon'){
 const base=mastodonBase(env),token=required(env,'MASTODON_TOKEN');const form=new FormData();form.set('file',new Blob([readFileSync(p.asset)],{type:'image/png'}),'stay-young.png');form.set('description',p.alt);
 const upload=await fetch(`${base}/api/v2/media`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form,signal:AbortSignal.timeout(30000)});if(!upload.ok)throw Error(`Mastodon upload failed (${upload.status})`);let media=await upload.json();
 for(let attempt=0;!media.url&&attempt<10;attempt++){await new Promise(r=>setTimeout(r,2000));media=await request(`${base}/api/v1/media/${media.id}`,{token,method:'GET'});}
 if(!media.url)throw Error('Mastodon media processing incomplete; review before retry');
 return request(`${base}/api/v1/statuses`,{token,body:{status:p.text,media_ids:[media.id],visibility:'public'}});
 }
 if(p.platform==='bluesky'){
 const session=await request('https://bsky.social/xrpc/com.atproto.server.createSession',{body:{identifier:required(env,'BLUESKY_HANDLE'),password:required(env,'BLUESKY_APP_PASSWORD')}});
 const img=await fetch(image(p),{signal:AbortSignal.timeout(15000)});if(!img.ok)throw Error('Image download failed');const bytes=await img.arrayBuffer();if(bytes.byteLength>1000000)throw Error('Bluesky image exceeds 1MB');
 const upload=await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob',{method:'POST',headers:{Authorization:`Bearer ${session.accessJwt}`,'Content-Type':img.headers.get('content-type')},body:bytes,signal:AbortSignal.timeout(30000)});if(!upload.ok)throw Error(`Bluesky image upload failed (${upload.status})`);const blob=await upload.json();
 const start=p.text.indexOf(p.link);const facets=start<0?[]:[{index:{byteStart:Buffer.byteLength(p.text.slice(0,start)),byteEnd:Buffer.byteLength(p.text.slice(0,start+p.link.length))},features:[{$type:'app.bsky.richtext.facet#link',uri:p.link}]}];
 return request('https://bsky.social/xrpc/com.atproto.repo.createRecord',{token:session.accessJwt,body:{repo:session.did,collection:'app.bsky.feed.post',record:{$type:'app.bsky.feed.post',text:p.text,facets,createdAt:new Date().toISOString(),embed:{$type:'app.bsky.embed.images',images:[{alt:p.alt,image:blob.blob}]}}}});
 }
 throw Error('Unsupported platform');
}

function mastodonBase(env){const u=new URL(required(env,'MASTODON_BASE_URL'));if(u.protocol!=='https:'||u.hostname!=='mastodon.social'||u.username||u.password||u.port)throw Error('Only the explicitly supported official Mastodon server is enabled');return u.origin;}
export async function checkAccount(platform,env=process.env){
 if(platform==='facebook'||platform==='instagram'||platform==='threads'){
  const names={facebook:['FACEBOOK_PAGE_ID','FACEBOOK_PAGE_TOKEN'],instagram:['INSTAGRAM_ACCOUNT_ID','INSTAGRAM_TOKEN'],threads:['THREADS_ACCOUNT_ID','THREADS_TOKEN']}[platform];
  const id=required(env,names[0]),token=required(env,names[1]);const root=platform==='threads'?'https://graph.threads.net':'https://graph.facebook.com';const version=required(env,platform==='threads'?'THREADS_GRAPH_VERSION':'META_GRAPH_VERSION');const result=await request(`${root}/${version}/${id}?fields=id`,{token,method:'GET'});if(!result.id)throw Error('Account could not be verified');return String(result.id);
 }
 if(platform==='pinterest'){const id=required(env,'PINTEREST_BOARD_ID');const result=await request(`https://api.pinterest.com/v5/boards/${id}`,{token:required(env,'PINTEREST_TOKEN'),method:'GET'});if(!result.id)throw Error('Board could not be verified');return String(result.id);}
 if(platform==='bluesky'){const result=await request('https://bsky.social/xrpc/com.atproto.server.createSession',{body:{identifier:required(env,'BLUESKY_HANDLE'),password:required(env,'BLUESKY_APP_PASSWORD')}});if(!result.did)throw Error('Bluesky account could not be verified');return result.did;}
 if(platform==='mastodon'){const result=await request(`${mastodonBase(env)}/api/v1/accounts/verify_credentials`,{token:required(env,'MASTODON_TOKEN'),method:'GET'});if(!result.id)throw Error('Mastodon account could not be verified');return String(result.id);}
 throw Error('Unsupported platform');
}
