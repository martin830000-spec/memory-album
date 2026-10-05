'use strict';

const $=id=>document.getElementById(id);
const body=document.body;
const backdrop=$('backdrop');
const sheetTitle=$('sheetTitle');
const sheetText=$('sheetText');
const connectionDot=$('connectionDot');
const connectionTitle=$('connectionTitle');
const connectionDetail=$('connectionDetail');
const routeBadge=$('routeBadge');
const homeView=$('homeView');
const folderView=$('folderView');
const albumList=$('albumList');
const folderTitle=$('folderTitle');
const folderSubtitle=$('folderSubtitle');
const folderCount=$('folderCount');
const photoGrid=$('photoGrid');

const MODE_STORAGE='memory_album_user_mode_v1';
const ROUTE_TTL_MS=30*60*1000;

const I18N={
  ko:{
    appTitle:'우리의 추억사진첩',
    appSubtitle:'우리 둘의 소중한 순간을 한곳에',
    albums:'앨범',
    refresh:'↻ 새로고침',
    folderEmptyTitle:'Google Drive 연결 준비 중',
    folderEmptyText:'연결 후에는 추억사진첩 안의 폴더가 그대로 여기에 표시됩니다.',
    upload:'사진 올리기',
    uploadHint:'폴더를 선택한 뒤 업로드할 수 있어요',
    recent:'최근 사진',
    recentHint:'새로 추가된 사진 보기',
    folderSubtitle:'Google Drive의 현재 폴더 내용',
    loadingPhotos:'사진 불러오는 중',
    sort:'정렬',
    uploadShort:'＋ 업로드',
    photoEmptyTitle:'Google Drive 연결 준비 중',
    photoEmptyText:'연결 후에는 이 폴더의 사진 썸네일이 여기에 표시됩니다.',
    ok:'확인',
    ready:'준비 중',
    apiPending:'Google Drive 연결을 붙이는 다음 단계에서 활성화할게요.',
    directTitle:'직접 연결 경로 사용',
    cloudflareTitle:'Cloudflare 우회 경로 사용',
    sourceHusband:'부부대화 · 남편앱',
    sourceWife:'부부대화 · 아내앱',
    sourceGeneral:'일상대화',
    routeManual:'본앱의 연결 방식 설정을 그대로 사용',
    routeSuccess:'본앱에서 최근 실제 성공한 경로를 그대로 사용',
    routeWife:'아내앱 기본 정책에 따라 Cloudflare 우회 사용',
    routeTimezone:'최근 경로가 없어 본앱의 지역 자동 선택 규칙 사용',
    routeFallback:'본앱 연결 설정을 사용',
    folderMeta:'Google Drive 폴더',
    backLabel:'앨범 목록으로 돌아가기',
    footer:'For Husband & Wife · Private Memory Album'
  },
  lo:{
    appTitle:'ອະລະບໍ້າຄວາມຊົງຈຳຂອງເຮົາ',
    appSubtitle:'ເກັບຮູບແລະຄວາມຊົງຈຳຂອງເຮົາໄວ້ບ່ອນດຽວ',
    albums:'ອະລະບໍ້າ',
    refresh:'↻ ໂຫຼດໃໝ່',
    folderEmptyTitle:'ກຳລັງກຽມເຊື່ອມຕໍ່ Google Drive',
    folderEmptyText:'ເມື່ອເຊື່ອມຕໍ່ແລ້ວ ໂຟນເດີໃນອະລະບໍ້າຄວາມຊົງຈຳຈະສະແດງຢູ່ບ່ອນນີ້ຕາມທີ່ມີໃນ Drive.',
    upload:'ອັບໂຫຼດຮູບ',
    uploadHint:'ເລືອກໂຟນເດີກ່ອນແລ້ວຈຶ່ງອັບໂຫຼດໄດ້',
    recent:'ຮູບຫຼ້າສຸດ',
    recentHint:'ເບິ່ງຮູບທີ່ເພີ່ມໃໝ່',
    folderSubtitle:'ເນື້ອຫາປັດຈຸບັນໃນໂຟນເດີ Google Drive',
    loadingPhotos:'ກຳລັງໂຫຼດຮູບ',
    sort:'ຈັດລຽງ',
    uploadShort:'＋ ອັບໂຫຼດ',
    photoEmptyTitle:'ກຳລັງກຽມເຊື່ອມຕໍ່ Google Drive',
    photoEmptyText:'ເມື່ອເຊື່ອມຕໍ່ແລ້ວ ຮູບຕົວຢ່າງໃນໂຟນເດີນີ້ຈະສະແດງຢູ່ບ່ອນນີ້.',
    ok:'ຕົກລົງ',
    ready:'ກຳລັງກຽມ',
    apiPending:'ຟັງຊັນນີ້ຈະເປີດໃຊ້ໃນຂັ້ນຕອນຕໍ່ໄປເມື່ອເຊື່ອມ Google Drive.',
    directTitle:'ໃຊ້ການເຊື່ອມຕໍ່ໂດຍກົງ',
    cloudflareTitle:'ໃຊ້ເສັ້ນທາງ Cloudflare',
    sourceHusband:'ແອັບສົນທະນາຄູ່ຮັກ · ຝ່າຍຜົວ',
    sourceWife:'ແອັບສົນທະນາຄູ່ຮັກ · ຝ່າຍເມຍ',
    sourceGeneral:'ແອັບສົນທະນາທົ່ວໄປ',
    routeManual:'ໃຊ້ຄ່າການເຊື່ອມຕໍ່ຈາກແອັບຫຼັກ',
    routeSuccess:'ໃຊ້ເສັ້ນທາງທີ່ແອັບຫຼັກເຊື່ອມຕໍ່ສຳເລັດຫຼ້າສຸດ',
    routeWife:'ແອັບຝ່າຍເມຍໃຊ້ Cloudflare ເປັນຄ່າເລີ່ມຕົ້ນ',
    routeTimezone:'ຍັງບໍ່ມີເສັ້ນທາງຫຼ້າສຸດ ຈຶ່ງໃຊ້ກົດເລືອກອັດຕະໂນມັດຂອງແອັບຫຼັກ',
    routeFallback:'ໃຊ້ຄ່າເຊື່ອມຕໍ່ຂອງແອັບຫຼັກ',
    folderMeta:'ໂຟນເດີ Google Drive',
    backLabel:'ກັບໄປລາຍການອະລະບໍ້າ',
    footer:'For Husband & Wife · Private Memory Album'
  }
};

const routeCandidates=[
  {id:'husband',modeKey:'translator_network_route_mode_husband_v1',statsKey:'translator_network_route_stats_husband_v1'},
  {id:'wife',modeKey:'translator_network_route_mode_wife_v1',statsKey:'translator_network_route_stats_wife_v1'},
  {id:'general',modeKey:'korean_lao_general_test_multilang_network_mode_v1',statsKey:'korean_lao_general_test_multilang_network_stats_v1'}
];

let state={
  userMode:readIncomingMode(),
  currentFolder:null,
  folders:[],
  apiReady:false
};

function lsGet(key){try{return localStorage.getItem(key)||''}catch(_){return''}}
function lsSet(key,value){try{localStorage.setItem(key,String(value));return true}catch(_){return false}}
function uiLang(){return state.userMode==='wife'?'lo':'ko'}
function t(key){return I18N[uiLang()][key]||I18N.ko[key]||key}
function readIncomingMode(){
  try{
    const u=new URL(location.href);
    const incoming=String(u.searchParams.get('mode')||'').toLowerCase();
    if(incoming==='husband'||incoming==='wife'){lsSet(MODE_STORAGE,incoming);return incoming}
  }catch(_){}
  const saved=String(lsGet(MODE_STORAGE)||'').toLowerCase();
  return saved==='wife'?'wife':'husband';
}
function normalizeModeInUrl(){
  try{
    const u=new URL(location.href);
    const incoming=String(u.searchParams.get('mode')||'').toLowerCase();
    if(incoming!=='husband'&&incoming!=='wife')return;
    u.searchParams.delete('mode');
    u.searchParams.delete('from');
    u.searchParams.delete('bridge');
    history.replaceState(history.state,'',u.pathname+(u.search?u.search:'')+u.hash);
  }catch(_){}
}
function applyLanguage(){
  const lo=uiLang()==='lo';
  document.documentElement.lang=lo?'lo':'ko';
  document.title=t('appTitle');
  $('appTitle').textContent=t('appTitle');
  $('appSubtitle').textContent=t('appSubtitle');
  $('albumSectionTitle').textContent=t('albums');
  $('refreshFoldersBtn').textContent=t('refresh');
  $('folderEmptyTitle').textContent=t('folderEmptyTitle');
  $('folderEmptyText').textContent=t('folderEmptyText');
  $('uploadHomeTitle').textContent=t('upload');
  $('uploadHomeText').textContent=t('uploadHint');
  $('recentTitle').textContent=t('recent');
  $('recentText').textContent=t('recentHint');
  $('folderSubtitle').textContent=t('folderSubtitle');
  $('folderCount').textContent=t('loadingPhotos');
  $('sortBtn').textContent=t('sort');
  $('uploadFolderBtn').textContent=t('uploadShort');
  $('photoEmptyTitle').textContent=t('photoEmptyTitle');
  $('photoEmptyText').textContent=t('photoEmptyText');
  $('closeSheet').textContent=t('ok');
  $('folderBackBtn').setAttribute('aria-label',t('backLabel'));
  $('footerText').textContent=t('footer');
}
function parseStats(raw){try{const value=JSON.parse(raw||'{}');return value&&typeof value==='object'?value:{}}catch(_){return{}}}
function routeSourceLabel(id){
  if(id==='wife')return t('sourceWife');
  if(id==='general')return t('sourceGeneral');
  return t('sourceHusband');
}
function timezoneHint(){
  let tz='';
  try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(_){}
  if(/Asia\/(Vientiane|Bangkok)/i.test(tz))return'cloudflare';
  if(/Asia\/Seoul/i.test(tz))return'direct';
  return state.userMode==='wife'?'cloudflare':'direct';
}
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
  const modeRow=rows.find(r=>r.id===state.userMode);
  if(modeRow&&['direct','cloudflare'].includes(modeRow.mode))return{route:modeRow.mode,source:modeRow.id,reason:'manual'};
  if(modeRow&&modeRow.fresh&&modeRow.lastSuccess)return{route:modeRow.lastSuccess,source:modeRow.id,reason:'recent-success'};
  if(state.userMode==='wife')return{route:'cloudflare',source:'wife',reason:'wife-default'};
  const general=rows.find(r=>r.id==='general');
  if(general&&general.fresh&&general.lastSuccess)return{route:general.lastSuccess,source:'general',reason:'recent-success'};
  return{route:timezoneHint(),source:state.userMode,reason:'timezone'};
}
function renderSharedRoute(){
  const routeState=resolveSharedRoute();
  const cloudflare=routeState.route==='cloudflare';
  connectionDot.classList.remove('direct','cloudflare');
  routeBadge.classList.remove('direct','cloudflare');
  connectionDot.classList.add(routeState.route);
  routeBadge.classList.add(routeState.route);
  routeBadge.textContent=cloudflare?'CLOUDFLARE':'DIRECT';
  connectionTitle.textContent=cloudflare?t('cloudflareTitle'):t('directTitle');
  const reasonKey={
    manual:'routeManual',
    'recent-success':'routeSuccess',
    'wife-default':'routeWife',
    timezone:'routeTimezone'
  }[routeState.reason]||'routeFallback';
  connectionDetail.textContent=routeSourceLabel(routeState.source)+' · '+t(reasonKey);
  window.MemoryAlbumRoute=Object.freeze({...routeState,mode:state.userMode,checkedAt:Date.now()});
}
function folderIcon(name){
  const n=String(name||'').toLowerCase();
  if(/결혼|wedding|ແຕ່ງ/.test(n))return'💍';
  if(/졸업|graduation|ຈົບ/.test(n))return'🎓';
  if(/여행|travel|ທ່ຽວ/.test(n))return'✈️';
  return'📁';
}
function renderFolders(){
  if(!state.folders.length){
    albumList.innerHTML=`<div class="empty-state album-empty"><div class="empty-icon">📁</div><strong>${escapeHtml(t('folderEmptyTitle'))}</strong><p>${escapeHtml(t('folderEmptyText'))}</p></div>`;
    return;
  }
  albumList.innerHTML=state.folders.map(folder=>`
    <button class="album-card" type="button" data-folder-id="${escapeAttr(folder.id)}">
      <div class="folder-cover"><span>${folderIcon(folder.name)}</span></div>
      <div class="album-copy">
        <h3>${escapeHtml(folder.name)}</h3>
        <p>${escapeHtml(folder.meta||t('folderMeta'))}</p>
      </div>
      <span class="chev">›</span>
    </button>
  `).join('');
  albumList.querySelectorAll('[data-folder-id]').forEach(btn=>btn.addEventListener('click',()=>openFolder(btn.dataset.folderId)));
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(v){return escapeHtml(v)}
function openFolder(folderId){
  const folder=state.folders.find(x=>String(x.id)===String(folderId));
  if(!folder)return;
  state.currentFolder=folder;
  folderTitle.textContent=folder.name;
  folderSubtitle.textContent=t('folderSubtitle');
  folderCount.textContent=t('loadingPhotos');
  homeView.hidden=true;
  folderView.hidden=false;
  location.hash='folder='+encodeURIComponent(folder.id);
  window.scrollTo({top:0,behavior:'smooth'});
}
function closeFolder(){
  state.currentFolder=null;
  folderView.hidden=true;
  homeView.hidden=false;
  history.replaceState(null,'',location.pathname+location.search);
  window.scrollTo({top:0,behavior:'smooth'});
}
function openSheet(title,text){sheetTitle.textContent=title;sheetText.textContent=text;backdrop.hidden=false}
function closeSheet(){backdrop.hidden=true}
function pending(title){openSheet(title,t('apiPending'))}
async function loadFolders(){
  /*
    Google Drive is the source of truth.
    The next backend step only needs to replace this provider with the real Drive folder response.
    No folder names or folder IDs are hard-coded in the UI.
  */
  state.folders=[];
  state.apiReady=false;
  renderFolders();
}
function syncFromHash(){
  if(!location.hash.startsWith('#folder='))return;
  const id=decodeURIComponent(location.hash.slice(8));
  if(state.folders.some(x=>String(x.id)===id))openFolder(id);
}

$('themeBtn').addEventListener('click',e=>{body.classList.toggle('light');e.currentTarget.textContent=body.classList.contains('light')?'☀':'☾'});
$('closeSheet').addEventListener('click',closeSheet);
$('folderBackBtn').addEventListener('click',closeFolder);
$('refreshFoldersBtn').addEventListener('click',loadFolders);
$('refreshFolderBtn').addEventListener('click',()=>pending(t('refresh')));
$('uploadHomeBtn').addEventListener('click',()=>pending(t('upload')));
$('recentBtn').addEventListener('click',()=>pending(t('recent')));
$('sortBtn').addEventListener('click',()=>pending(t('sort')));
$('uploadFolderBtn').addEventListener('click',()=>pending(t('upload')));
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeSheet()});
window.addEventListener('storage',e=>{if(routeCandidates.some(c=>e.key===c.modeKey||e.key===c.statsKey))renderSharedRoute()});

applyLanguage();
renderSharedRoute();
normalizeModeInUrl();
loadFolders().then(syncFromHash);
