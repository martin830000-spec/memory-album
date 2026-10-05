const body=document.body;
const backdrop=document.getElementById('backdrop');
const sheetTitle=document.getElementById('sheetTitle');
const sheetText=document.getElementById('sheetText');
const connectionDot=document.getElementById('connectionDot');
const connectionTitle=document.getElementById('connectionTitle');
const connectionDetail=document.getElementById('connectionDetail');
const routeBadge=document.getElementById('routeBadge');
const homeView=document.getElementById('homeView');
const albumView=document.getElementById('albumView');
const albumTitle=document.getElementById('albumTitle');
const albumSubtitle=document.getElementById('albumSubtitle');
const albumCount=document.getElementById('albumCount');

const ROUTE_TTL_MS=30*60*1000;
const routeCandidates=[
  {id:'husband',label:'부부대화 · 남편앱',modeKey:'translator_network_route_mode_husband_v1',statsKey:'translator_network_route_stats_husband_v1'},
  {id:'wife',label:'부부대화 · 아내앱',modeKey:'translator_network_route_mode_wife_v1',statsKey:'translator_network_route_stats_wife_v1'},
  {id:'general',label:'일상대화',modeKey:'korean_lao_general_test_multilang_network_mode_v1',statsKey:'korean_lao_general_test_multilang_network_stats_v1'}
];
const albums={
  wedding:{title:'결혼사진',subtitle:'우리의 결혼식과 웨딩 촬영',tabs:{original:'원본',retouched:'보정본'}},
  graduation:{title:'아내 졸업사진',subtitle:'졸업식과 기념 촬영',tabs:{original:'원본',retouched:'보정본'}}
};
let currentAlbum='';
let currentTab='original';

function lsGet(key){try{return localStorage.getItem(key)||''}catch(_){return''}}
function parseStats(raw){try{const value=JSON.parse(raw||'{}');return value&&typeof value==='object'?value:{}}catch(_){return{}}}
function platformHint(){const ua=navigator.userAgent||'';if(/iPhone|iPad|iPod/i.test(ua))return'wife';if(/Android/i.test(ua))return'husband';return'husband'}
function timezoneHint(){let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(_){}if(/Asia\/(Vientiane|Bangkok)/i.test(tz))return'cloudflare';if(/Asia\/Seoul/i.test(tz))return'direct';return platformHint()==='wife'?'cloudflare':'direct'}
function readCandidate(c){
  const mode=String(lsGet(c.modeKey)||'auto').toLowerCase();
  const stats=parseStats(lsGet(c.statsKey));
  const relay=stats&&typeof stats.relay==='object'?stats.relay:{};
  const lastSuccess=['direct','cloudflare'].includes(relay.lastSuccess)?relay.lastSuccess:'';
  const lastSuccessAt=Number(relay.lastSuccessAt)||0;
  return {...c,mode:['auto','direct','cloudflare'].includes(mode)?mode:'auto',lastSuccess,lastSuccessAt,fresh:!!lastSuccessAt&&Date.now()-lastSuccessAt<ROUTE_TTL_MS};
}
function resolveSharedRoute(){
  const rows=routeCandidates.map(readCandidate);
  const preferredPlatform=platformHint();
  const platformRow=rows.find(r=>r.id===preferredPlatform);
  if(platformRow&&['direct','cloudflare'].includes(platformRow.mode))return{route:platformRow.mode,source:platformRow.label,reason:'manual'};
  const fresh=rows.filter(r=>r.fresh&&r.lastSuccess).sort((a,b)=>b.lastSuccessAt-a.lastSuccessAt)[0];
  if(fresh){
    if(['direct','cloudflare'].includes(fresh.mode))return{route:fresh.mode,source:fresh.label,reason:'manual'};
    return{route:fresh.lastSuccess,source:fresh.label,reason:'recent-success'};
  }
  if(platformRow&&platformRow.id==='wife')return{route:'cloudflare',source:platformRow.label,reason:'wife-default'};
  const manualAny=rows.find(r=>['direct','cloudflare'].includes(r.mode));
  if(manualAny)return{route:manualAny.mode,source:manualAny.label,reason:'manual'};
  return{route:timezoneHint(),source:'본앱 자동 연결 규칙',reason:'timezone'};
}
function renderSharedRoute(){
  const state=resolveSharedRoute();
  const cloudflare=state.route==='cloudflare';
  connectionDot.classList.remove('direct','cloudflare');
  routeBadge.classList.remove('direct','cloudflare');
  connectionDot.classList.add(state.route);
  routeBadge.classList.add(state.route);
  routeBadge.textContent=cloudflare?'CLOUDFLARE':'DIRECT';
  connectionTitle.textContent=cloudflare?'Cloudflare 우회 경로 사용':'직접 연결 경로 사용';
  const reasonText={
    manual:'본앱의 연결 방식 설정을 그대로 사용',
    'recent-success':'본앱에서 최근 실제 성공한 경로를 그대로 사용',
    'wife-default':'아내앱 기본 정책에 따라 Cloudflare 우회 사용',
    timezone:'최근 경로가 없어 본앱의 지역 자동 선택 규칙 사용'
  }[state.reason]||'본앱 연결 설정을 사용';
  connectionDetail.textContent=state.source+' · '+reasonText;
  window.MemoryAlbumRoute=Object.freeze({...state,checkedAt:Date.now()});
}
function openSheet(title,text){sheetTitle.textContent=title;sheetText.textContent=text;backdrop.hidden=false}
function closeSheet(){backdrop.hidden=true}
function renderAlbumView(){
  const cfg=albums[currentAlbum];
  if(!cfg)return;
  albumTitle.textContent=cfg.title;
  albumSubtitle.textContent=cfg.subtitle+' · '+cfg.tabs[currentTab];
  albumCount.textContent='Drive 연결 대기';
  document.querySelectorAll('[data-album-tab]').forEach(btn=>{
    const active=btn.dataset.albumTab===currentTab;
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-selected',active?'true':'false');
  });
  homeView.hidden=true;
  albumView.hidden=false;
  window.scrollTo({top:0,behavior:'smooth'});
}
function openAlbum(key){
  if(!albums[key])return;
  currentAlbum=key;
  currentTab='original';
  location.hash=key+'/original';
  renderAlbumView();
}
function closeAlbum(){
  currentAlbum='';
  albumView.hidden=true;
  homeView.hidden=false;
  history.replaceState(null,'',location.pathname+location.search);
  window.scrollTo({top:0,behavior:'smooth'});
}
function syncFromHash(){
  const m=/^#(wedding|graduation)\/(original|retouched)$/.exec(location.hash||'');
  if(!m)return;
  currentAlbum=m[1];currentTab=m[2];renderAlbumView();
}

document.getElementById('themeBtn').addEventListener('click',e=>{body.classList.toggle('light');e.currentTarget.textContent=body.classList.contains('light')?'☀':'☾'});
document.getElementById('closeSheet').addEventListener('click',closeSheet);
document.getElementById('albumBackBtn').addEventListener('click',closeAlbum);
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeSheet()});

document.querySelectorAll('[data-album-key]').forEach(btn=>btn.addEventListener('click',()=>openAlbum(btn.dataset.albumKey)));
document.querySelectorAll('[data-album-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  if(!currentAlbum)return;
  currentTab=btn.dataset.albumTab;
  location.hash=currentAlbum+'/'+currentTab;
  renderAlbumView();
}));
document.querySelectorAll('[data-coming]').forEach(btn=>btn.addEventListener('click',()=>openSheet(btn.dataset.coming,'이 기능은 Google Drive 연동 단계에서 활성화할게요.')));
window.addEventListener('hashchange',syncFromHash);
window.addEventListener('storage',e=>{if(routeCandidates.some(c=>e.key===c.modeKey||e.key===c.statsKey))renderSharedRoute()});

renderSharedRoute();
syncFromHash();
