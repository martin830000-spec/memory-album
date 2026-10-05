const body=document.body;
const backdrop=document.getElementById('backdrop');
const sheetTitle=document.getElementById('sheetTitle');
const sheetText=document.getElementById('sheetText');
const connectionDot=document.getElementById('connectionDot');
const connectionTitle=document.getElementById('connectionTitle');
const connectionDetail=document.getElementById('connectionDetail');
const routeBadge=document.getElementById('routeBadge');

const ROUTE_TTL_MS=30*60*1000;
const routeCandidates=[
  {
    id:'husband',
    label:'부부대화 · 남편앱',
    modeKey:'translator_network_route_mode_husband_v1',
    statsKey:'translator_network_route_stats_husband_v1'
  },
  {
    id:'wife',
    label:'부부대화 · 아내앱',
    modeKey:'translator_network_route_mode_wife_v1',
    statsKey:'translator_network_route_stats_wife_v1'
  },
  {
    id:'general',
    label:'일상대화',
    modeKey:'korean_lao_general_test_multilang_network_mode_v1',
    statsKey:'korean_lao_general_test_multilang_network_stats_v1'
  }
];

function lsGet(key){
  try{return localStorage.getItem(key)||''}catch(_){return''}
}
function parseStats(raw){
  try{
    const value=JSON.parse(raw||'{}');
    return value&&typeof value==='object'?value:{};
  }catch(_){return{}}
}
function platformHint(){
  const ua=navigator.userAgent||'';
  if(/iPhone|iPad|iPod/i.test(ua))return'wife';
  if(/Android/i.test(ua))return'husband';
  return'husband';
}
function timezoneHint(){
  let tz='';
  try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(_){}
  if(/Asia\/(Vientiane|Bangkok)/i.test(tz))return'cloudflare';
  if(/Asia\/Seoul/i.test(tz))return'direct';
  return platformHint()==='wife'?'cloudflare':'direct';
}
function readCandidate(c){
  const mode=String(lsGet(c.modeKey)||'auto').toLowerCase();
  const stats=parseStats(lsGet(c.statsKey));
  const relay=stats&&typeof stats.relay==='object'?stats.relay:{};
  const lastSuccess=['direct','cloudflare'].includes(relay.lastSuccess)?relay.lastSuccess:'';
  const lastSuccessAt=Number(relay.lastSuccessAt)||0;
  return {
    ...c,
    mode:['auto','direct','cloudflare'].includes(mode)?mode:'auto',
    lastSuccess,
    lastSuccessAt,
    fresh:!!lastSuccessAt&&Date.now()-lastSuccessAt<ROUTE_TTL_MS
  };
}
function resolveSharedRoute(){
  const rows=routeCandidates.map(readCandidate);
  const preferredPlatform=platformHint();

  const platformRow=rows.find(r=>r.id===preferredPlatform);
  if(platformRow&&['direct','cloudflare'].includes(platformRow.mode)){
    return {route:platformRow.mode,source:platformRow.label,reason:'manual'};
  }

  const fresh=rows
    .filter(r=>r.fresh&&r.lastSuccess)
    .sort((a,b)=>b.lastSuccessAt-a.lastSuccessAt)[0];
  if(fresh){
    if(['direct','cloudflare'].includes(fresh.mode)){
      return {route:fresh.mode,source:fresh.label,reason:'manual'};
    }
    return {route:fresh.lastSuccess,source:fresh.label,reason:'recent-success'};
  }

  if(platformRow&&platformRow.id==='wife'){
    return {route:'cloudflare',source:platformRow.label,reason:'wife-default'};
  }

  const manualAny=rows.find(r=>['direct','cloudflare'].includes(r.mode));
  if(manualAny){
    return {route:manualAny.mode,source:manualAny.label,reason:'manual'};
  }

  return {route:timezoneHint(),source:'본앱 자동 연결 규칙',reason:'timezone'};
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
    'manual':'본앱의 연결 방식 설정을 그대로 사용',
    'recent-success':'본앱에서 최근 실제 성공한 경로를 그대로 사용',
    'wife-default':'아내앱 기본 정책에 따라 Cloudflare 우회 사용',
    'timezone':'최근 경로가 없어 본앱의 지역 자동 선택 규칙 사용'
  }[state.reason]||'본앱 연결 설정을 사용';

  connectionDetail.textContent=state.source+' · '+reasonText;
  window.MemoryAlbumRoute=Object.freeze({...state,checkedAt:Date.now()});
}
function openSheet(title,text){
  sheetTitle.textContent=title;
  sheetText.textContent=text;
  backdrop.hidden=false;
}
function closeSheet(){backdrop.hidden=true}

document.getElementById('themeBtn').addEventListener('click',e=>{
  body.classList.toggle('light');
  e.currentTarget.textContent=body.classList.contains('light')?'☀':'☾';
});
document.getElementById('closeSheet').addEventListener('click',closeSheet);
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeSheet()});

document.querySelectorAll('[data-album]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const name=btn.dataset.album;
    openSheet(name,name+' 앨범 화면은 다음 단계에서 Google Drive 폴더와 연결할게요.');
  });
});
document.querySelectorAll('[data-coming]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    openSheet(btn.dataset.coming,'이 기능은 Google Drive 연동 단계에서 활성화할게요.');
  });
});

window.addEventListener('storage',e=>{
  if(routeCandidates.some(c=>e.key===c.modeKey||e.key===c.statsKey))renderSharedRoute();
});

renderSharedRoute();
