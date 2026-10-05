'use strict';

const $=id=>document.getElementById(id);
const body=document.body;
const cfg=window.MEMORY_ALBUM_CONFIG||{};
const backdrop=$('backdrop');
const sheetTitle=$('sheetTitle');
const sheetText=$('sheetText');
const sheetActions=$('sheetActions');
const connectionDot=$('connectionDot');
const connectionTitle=$('connectionTitle');
const connectionDetail=$('connectionDetail');
const routeBadge=$('routeBadge');
const homeView=$('homeView');
const folderView=$('folderView');
const albumList=$('albumList');
const subfolderList=$('subfolderList');
const folderTitle=$('folderTitle');
const folderSubtitle=$('folderSubtitle');
const folderCount=$('folderCount');
const photoGrid=$('photoGrid');
const photoInput=$('photoInput');
const viewer=$('viewer');
const viewerImage=$('viewerImage');
const viewerName=$('viewerName');
const viewerCounter=$('viewerCounter');
const viewerLoading=$('viewerLoading');

const MODE_STORAGE='memory_album_user_mode_v1';
const MAIN_BRIDGE_STORAGE='memory_album_bridge_v1';
const ACCESS_KEY_STORAGE='translator_primary_password';
const ACCESS_KEY_FALLBACK_STORAGE='memory_album_access_key_v1';
const ROUTE_TTL_MS=30*60*1000;
const AUTO_REFRESH_MS=30*1000;

const I18N={
  ko:{
    appTitle:'우리의 추억사진첩',appSubtitle:'우리 둘의 소중한 순간을 한곳에',mainApp:'← 본앱',albums:'앨범',refresh:'↻ 새로고침',
    folderEmptyTitle:'Google Drive 연결 대기',folderEmptyText:'사진첩 전용 연결이 완료되면 Drive 폴더가 그대로 여기에 표시됩니다.',
    upload:'사진 올리기',uploadHint:'폴더를 선택한 뒤 여러 장을 올릴 수 있어요',recent:'최근 사진',recentHint:'새로 추가된 사진 보기',
    folderSubtitle:'Google Drive의 현재 폴더',loadingPhotos:'사진 불러오는 중',sortNewest:'최신순',sortOldest:'오래된순',sortName:'이름순',
    uploadShort:'＋ 업로드',photoEmptyTitle:'사진이 없습니다',photoEmptyText:'Drive에서 사진을 추가하거나 이 폴더에 업로드하세요.',
    ok:'확인',close:'닫기',ready:'준비 중',apiPending:'사진첩 전용 Google Drive 연결 설정이 아직 완료되지 않았어요.',
    apiMissing:'사진 API 주소가 아직 설정되지 않았어요. 백엔드 연결 후 자동으로 표시됩니다.',authMissing:'본앱에서 사진첩을 열어주세요. 본앱의 접근 정보가 필요합니다.',
    loadFailed:'사진을 불러오지 못했습니다.',uploading:'업로드 중',uploadDone:'업로드 완료',uploadFailed:'업로드 실패',chooseFolder:'업로드할 폴더 선택',
    directTitle:'직접 연결 경로 사용',cloudflareTitle:'Cloudflare 우회 경로 사용',sourceHusband:'부부대화 · 남편앱',sourceWife:'부부대화 · 아내앱',sourceGeneral:'일상대화',
    routeManual:'본앱의 연결 방식 설정을 그대로 사용',routeSuccess:'본앱에서 최근 성공한 경로를 사용',routeWife:'아내앱 기본 정책에 따라 Cloudflare 사용',routeTimezone:'본앱의 지역 자동 선택 규칙 사용',routeFallback:'본앱 연결 설정을 사용',
    folderMeta:'Google Drive 폴더',backLabel:'이전 화면',subfolders:'하위 폴더',photosCount:n=>`사진 ${n}장`,foldersCount:n=>`폴더 ${n}개`,
    viewerLoading:'불러오는 중…',share:'공유',download:'저장',shareUnsupported:'이 기기에서는 파일 공유를 지원하지 않아 저장으로 대신할게요.',
    recentPending:'최근 사진 모음은 Drive 연결 후 활성화됩니다.',noFolders:'업로드할 폴더가 없습니다.',uploadProgress:(name,p)=>`${name} · ${p}%`,
    folderLoadFailed:'폴더 내용을 불러오지 못했습니다.',footer:'For Husband & Wife · Private Memory Album'
  },
  lo:{
    appTitle:'ອະລະບໍ້າຄວາມຊົງຈຳຂອງເຮົາ',appSubtitle:'ເກັບຮູບແລະຄວາມຊົງຈຳຂອງເຮົາໄວ້ບ່ອນດຽວ',mainApp:'← ແອັບຫຼັກ',albums:'ອະລະບໍ້າ',refresh:'↻ ໂຫຼດໃໝ່',
    folderEmptyTitle:'ລໍຖ້າເຊື່ອມ Google Drive',folderEmptyText:'ເມື່ອເຊື່ອມລະບົບຮູບແລ້ວ ໂຟນເດີໃນ Drive ຈະສະແດງຢູ່ນີ້ຕາມທີ່ມີ.',
    upload:'ອັບໂຫຼດຮູບ',uploadHint:'ເລືອກໂຟນເດີແລ້ວອັບໂຫຼດຫຼາຍຮູບໄດ້',recent:'ຮູບຫຼ້າສຸດ',recentHint:'ເບິ່ງຮູບທີ່ເພີ່ມໃໝ່',
    folderSubtitle:'ໂຟນເດີປັດຈຸບັນໃນ Google Drive',loadingPhotos:'ກຳລັງໂຫຼດຮູບ',sortNewest:'ໃໝ່ສຸດ',sortOldest:'ເກົ່າສຸດ',sortName:'ຕາມຊື່',
    uploadShort:'＋ ອັບໂຫຼດ',photoEmptyTitle:'ຍັງບໍ່ມີຮູບ',photoEmptyText:'ເພີ່ມຮູບໃນ Drive ຫຼື ອັບໂຫຼດເຂົ້າໂຟນເດີນີ້.',
    ok:'ຕົກລົງ',close:'ປິດ',ready:'ກຳລັງກຽມ',apiPending:'ຍັງບໍ່ທັນເຊື່ອມລະບົບ Google Drive ສຳລັບອະລະບໍ້າ.',
    apiMissing:'ຍັງບໍ່ໄດ້ຕັ້ງທີ່ຢູ່ API ຮູບ. ຫຼັງເຊື່ອມ backend ແລ້ວຈະສະແດງອັດຕະໂນມັດ.',authMissing:'ກະລຸນາເປີດອະລະບໍ້າຈາກແອັບຫຼັກ. ຕ້ອງໃຊ້ຂໍ້ມູນເຂົ້າເຖິງຈາກແອັບຫຼັກ.',
    loadFailed:'ບໍ່ສາມາດໂຫຼດຮູບໄດ້.',uploading:'ກຳລັງອັບໂຫຼດ',uploadDone:'ອັບໂຫຼດສຳເລັດ',uploadFailed:'ອັບໂຫຼດບໍ່ສຳເລັດ',chooseFolder:'ເລືອກໂຟນເດີທີ່ຈະອັບໂຫຼດ',
    directTitle:'ໃຊ້ການເຊື່ອມຕໍ່ໂດຍກົງ',cloudflareTitle:'ໃຊ້ເສັ້ທາງ Cloudflare',sourceHusband:'ແອັບສົນທະນາຄູ່ຮັກ · ຝ່າຍຜົວ',sourceWife:'ແອັບສົນທະນາຄູ່ຮັກ · ຝ່າຍເມຍ',sourceGeneral:'ແອັບສົນທະນາທົ່ວໄປ',
    routeManual:'ໃຊ້ຄ່າການເຊື່ອມຕໍ່ຈາກແອັບຫຼັກ',routeSuccess:'ໃຊ້ເສັ້ທາງທີ່ສຳເລັດຫຼ້າສຸດ',routeWife:'ແອັບຝ່າຍເມຍໃຊ້ Cloudflare ເປັນຄ່າເລີ່ມຕົ້ນ',routeTimezone:'ໃຊ້ກົດເລືອກເສັ້ນທາງຕາມພື້ນທີ່ຂອງແອັບຫຼັກ',routeFallback:'ໃຊ້ຄ່າເຊື່ອມຕໍ່ຂອງແອັບຫຼັກ',
    folderMeta:'ໂຟນເດີ Google Drive',backLabel:'ກັບໄປ',subfolders:'ໂຟນເດີຍ່ອຍ',photosCount:n=>`ຮູບ ${n}`,foldersCount:n=>`ໂຟນເດີ ${n}`,
    viewerLoading:'ກຳລັງໂຫຼດ…',share:'ແບ່ງປັນ',download:'ບັນທຶກ',shareUnsupported:'ອຸປະກອນນີ້ບໍ່ຮອງຮັບການແບ່ງປັນໄຟລ໌ ຈຶ່ງຈະບັນທຶກແທນ.',
    recentPending:'ຮູບຫຼ້າສຸດຈະເປີດໃຊ້ຫຼັງເຊື່ອມ Drive.',noFolders:'ບໍ່ມີໂຟນເດີສຳລັບອັບໂຫຼດ.',uploadProgress:(name,p)=>`${name} · ${p}%`,
    folderLoadFailed:'ບໍ່ສາມາດໂຫຼດເນື້ອຫາໂຟນເດີໄດ້.',footer:'For Husband & Wife · Private Memory Album'
  }
};

const routeCandidates=[
  {id:'husband',modeKey:'translator_network_route_mode_husband_v1',statsKey:'translator_network_route_stats_husband_v1'},
  {id:'wife',modeKey:'translator_network_route_mode_wife_v1',statsKey:'translator_network_route_stats_wife_v1'},
  {id:'general',modeKey:'korean_lao_general_test_multilang_network_mode_v1',statsKey:'korean_lao_general_test_multilang_network_stats_v1'}
];

let state={
  userMode:readIncomingMode(),
  route:null,
  folders:[],
  currentFolder:null,
  folderStack:[],
  childFolders:[],
  media:[],
  sort:'newest',
  viewerIndex:-1,
  viewerBlob:null,
  viewerUrl:'',
  lastRefresh:0
};
let thumbObserver=null;
const thumbQueue=[];
let thumbActive=0;

function lsGet(key){try{return localStorage.getItem(key)||''}catch(_){return''}}
function lsSet(key,value){try{localStorage.setItem(key,String(value));return true}catch(_){return false}}
function uiLang(){return state.userMode==='wife'?'lo':'ko'}
function t(key,...args){const v=I18N[uiLang()][key]??I18N.ko[key]??key;return typeof v==='function'?v(...args):v}
function readIncomingMode(){
  try{
    const u=new URL(location.href);
    const incoming=String(u.searchParams.get('mode')||'').toLowerCase();
    if(incoming==='husband'||incoming==='wife'){lsSet(MODE_STORAGE,incoming);return incoming}
  }catch(_){}
  const saved=String(lsGet(MODE_STORAGE)||'').toLowerCase();
  return saved==='wife'?'wife':'husband';
}
function readMainBridge(){
  try{
    const value=JSON.parse(lsGet(MAIN_BRIDGE_STORAGE)||'{}');
    return value&&typeof value==='object'?value:{};
  }catch(_){return{}}
}
function returnToMainApp(){
  const bridge=readMainBridge();
  let target=String(bridge.returnPath||cfg.mainAppBase||'/wife/');
  try{
    const u=new URL(target,location.origin);
    if(u.origin!==location.origin)throw new Error('cross_origin');
    if(u.pathname.startsWith('/memory-album'))u.pathname='/wife/';
    location.href=u.pathname+u.search+u.hash;
  }catch(_){
    location.href=String(cfg.mainAppBase||'/wife/');
  }
}
function normalizeModeInUrl(){
  try{
    const u=new URL(location.href);
    const incoming=String(u.searchParams.get('mode')||'').toLowerCase();
    if(incoming!=='husband'&&incoming!=='wife')return;
    u.searchParams.delete('mode');u.searchParams.delete('from');u.searchParams.delete('bridge');
    history.replaceState(history.state,'',u.pathname+(u.search?u.search:'')+u.hash);
  }catch(_){}
}
function applyLanguage(){
  const lo=uiLang()==='lo';
  document.documentElement.lang=lo?'lo':'ko';document.title=t('appTitle');
  $('appTitle').textContent=t('appTitle');$('appSubtitle').textContent=t('appSubtitle');$('mainAppBtn').textContent=t('mainApp');$('mainAppBtn').setAttribute('aria-label',t('mainApp'));$('albumSectionTitle').textContent=t('albums');
  $('refreshFoldersBtn').textContent=t('refresh');$('folderEmptyTitle').textContent=t('folderEmptyTitle');$('folderEmptyText').textContent=t('folderEmptyText');
  $('uploadHomeTitle').textContent=t('upload');$('uploadHomeText').textContent=t('uploadHint');$('recentTitle').textContent=t('recent');$('recentText').textContent=t('recentHint');
  $('folderSubtitle').textContent=t('folderSubtitle');$('folderCount').textContent=t('loadingPhotos');$('uploadFolderBtn').textContent=t('uploadShort');
  $('closeSheet').textContent=t('ok');$('folderBackBtn').setAttribute('aria-label',t('backLabel'));$('footerText').textContent=t('footer');
  $('viewerLoading').textContent=t('viewerLoading');$('viewerShareBtn').setAttribute('aria-label',t('share'));$('viewerDownloadBtn').setAttribute('aria-label',t('download'));
  updateSortLabel();
}
function parseStats(raw){try{const value=JSON.parse(raw||'{}');return value&&typeof value==='object'?value:{}}catch(_){return{}}}
function routeSourceLabel(id){if(id==='wife')return t('sourceWife');if(id==='general')return t('sourceGeneral');return t('sourceHusband')}
function timezoneHint(){let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(_){}if(/Asia\/(Vientiane|Bangkok)/i.test(tz))return'cloudflare';if(/Asia\/Seoul/i.test(tz))return'direct';return state.userMode==='wife'?'cloudflare':'direct'}
function readCandidate(c){
  const mode=String(lsGet(c.modeKey)||'auto').toLowerCase(),stats=parseStats(lsGet(c.statsKey)),relay=stats&&typeof stats.relay==='object'?stats.relay:{};
  const lastSuccess=['direct','cloudflare'].includes(relay.lastSuccess)?relay.lastSuccess:'',lastSuccessAt=Number(relay.lastSuccessAt)||0;
  return {...c,mode:['auto','direct','cloudflare'].includes(mode)?mode:'auto',lastSuccess,lastSuccessAt,fresh:!!lastSuccessAt&&Date.now()-lastSuccessAt<ROUTE_TTL_MS};
}
function resolveSharedRoute(){
  const rows=routeCandidates.map(readCandidate),modeRow=rows.find(r=>r.id===state.userMode);
  if(modeRow&&['direct','cloudflare'].includes(modeRow.mode))return{route:modeRow.mode,source:modeRow.id,reason:'manual'};
  if(modeRow&&modeRow.fresh&&modeRow.lastSuccess)return{route:modeRow.lastSuccess,source:modeRow.id,reason:'recent-success'};
  if(state.userMode==='wife')return{route:'cloudflare',source:'wife',reason:'wife-default'};
  const general=rows.find(r=>r.id==='general');
  if(general&&general.fresh&&general.lastSuccess)return{route:general.lastSuccess,source:'general',reason:'recent-success'};
  return{route:timezoneHint(),source:state.userMode,reason:'timezone'};
}
function renderSharedRoute(){
  const r=state.route=resolveSharedRoute(),cloudflare=r.route==='cloudflare';
  connectionDot.classList.remove('direct','cloudflare');routeBadge.classList.remove('direct','cloudflare');connectionDot.classList.add(r.route);routeBadge.classList.add(r.route);
  routeBadge.textContent=cloudflare?'CLOUDFLARE':'DIRECT';connectionTitle.textContent=cloudflare?t('cloudflareTitle'):t('directTitle');
  const reasonKey={manual:'routeManual','recent-success':'routeSuccess','wife-default':'routeWife',timezone:'routeTimezone'}[r.reason]||'routeFallback';
  connectionDetail.textContent=routeSourceLabel(r.source)+' · '+t(reasonKey);
  window.MemoryAlbumRoute=Object.freeze({...r,mode:state.userMode,checkedAt:Date.now()});
}
function cleanBase(v){return String(v||'').trim().replace(/\/+$/,'')}
function apiBases(){
  const direct=cleanBase(cfg.directApiBase),cloudflare=cleanBase(cfg.cloudflareApiBase),preferred=state.route?.route==='cloudflare'?[cloudflare,direct]:[direct,cloudflare];
  return [...new Set(preferred.filter(Boolean))];
}
function accessKey(){return String(lsGet(ACCESS_KEY_STORAGE)||lsGet(ACCESS_KEY_FALLBACK_STORAGE)||'').trim()}
function apiReady(){return apiBases().length>0}
async function apiFetch(path,options={}){
  const bases=apiBases();if(!bases.length)throw Object.assign(new Error('API_NOT_CONFIGURED'),{code:'API_NOT_CONFIGURED'});
  const key=accessKey();if(!key)throw Object.assign(new Error('ACCESS_KEY_MISSING'),{code:'ACCESS_KEY_MISSING'});
  let lastError=null;
  for(let i=0;i<bases.length;i++){
    const headers=new Headers(options.headers||{});headers.set('X-Album-Key',key);
    try{
      const res=await fetch(bases[i]+path,{...options,headers,cache:'no-store'});
      if(res.ok)return res;
      const err=new Error('HTTP_'+res.status);err.status=res.status;err.body=await res.text().catch(()=> '');
      if(res.status===401||res.status===403)throw err;
      lastError=err;
    }catch(e){
      lastError=e;if(e?.status===401||e?.status===403)throw e;
    }
  }
  throw lastError||new Error('API_FAILED');
}
async function apiJson(path,options={}){const res=await apiFetch(path,options);return res.json()}
async function apiBlob(path,options={}){const res=await apiFetch(path,options);return {blob:await res.blob(),name:decodeURIComponent(res.headers.get('X-File-Name')||''),type:res.headers.get('Content-Type')||''}}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(v){return escapeHtml(v)}
function displayName(item){return String(item?.displayName||item?.name||'')}
function folderIcon(name){const n=String(name||'').toLowerCase();if(/결혼|wedding|ແຕ່ງ/.test(n))return'💍';if(/졸업|graduation|ຈົບ/.test(n))return'🎓';if(/여행|travel|ທ່ຽວ/.test(n))return'✈️';return'📁'}
function renderFolders(){
  if(!state.folders.length){
    albumList.innerHTML=`<div class="empty-state album-empty"><div class="empty-icon">📁</div><strong>${escapeHtml(t('folderEmptyTitle'))}</strong><p>${escapeHtml(apiReady()?t('folderEmptyText'):t('apiMissing'))}</p></div>`;return;
  }
  albumList.innerHTML=state.folders.map(folder=>`
    <button class="album-card" type="button" data-folder-id="${escapeAttr(folder.id)}">
      <div class="folder-cover"><span>${folderIcon(folder.name)}</span></div>
      <div class="album-copy"><h3>${escapeHtml(displayName(folder))}</h3><p>${escapeHtml(t('folderMeta'))}</p></div><span class="chev">›</span>
    </button>`).join('');
  albumList.querySelectorAll('[data-folder-id]').forEach(btn=>btn.addEventListener('click',()=>openFolderById(btn.dataset.folderId,true)));
}
async function loadFolders(showError=true){
  state.lastRefresh=Date.now();
  if(!apiReady()){state.folders=[];renderFolders();return}
  albumList.innerHTML='<div class="loading-line"></div>';
  try{
    const data=await apiJson('/api/folders?lang='+encodeURIComponent(uiLang()));
    state.folders=Array.isArray(data.folders)?data.folders:[];renderFolders();syncFromHash();
  }catch(e){
    state.folders=[];renderFolders();
    if(showError)handleApiError(e,t('loadFailed'));
  }
}
function renderSubfolders(){
  if(!state.childFolders.length){subfolderList.innerHTML='';return}
  subfolderList.innerHTML=state.childFolders.map(folder=>`
    <button class="subfolder-card" type="button" data-child-id="${escapeAttr(folder.id)}">
      <div class="folder-cover"><span>${folderIcon(folder.name)}</span></div>
      <div class="album-copy"><h3>${escapeHtml(displayName(folder))}</h3></div><span class="chev">›</span>
    </button>`).join('');
  subfolderList.querySelectorAll('[data-child-id]').forEach(btn=>btn.addEventListener('click',()=>openChildFolder(btn.dataset.childId)));
}
function sortedMedia(){
  const rows=[...state.media];
  if(state.sort==='oldest')rows.sort((a,b)=>dateOf(a)-dateOf(b));
  else if(state.sort==='name')rows.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
  else rows.sort((a,b)=>dateOf(b)-dateOf(a));
  return rows;
}
function dateOf(item){return Date.parse(item.imageTime||item.createdTime||item.modifiedTime||0)||0}
function renderMedia(){
  const rows=sortedMedia();state.media=rows;
  folderCount.textContent=[t('foldersCount',state.childFolders.length),t('photosCount',rows.length)].join(' · ');
  if(!rows.length){
    photoGrid.innerHTML=`<div class="empty-state"><div class="empty-icon">📷</div><strong>${escapeHtml(t('photoEmptyTitle'))}</strong><p>${escapeHtml(t('photoEmptyText'))}</p></div>`;return;
  }
  photoGrid.innerHTML=rows.map((m,i)=>`
    <button class="photo-tile" type="button" data-media-index="${i}">
      <span class="photo-placeholder">▧</span>
      <img class="photo-thumb" data-file-id="${escapeAttr(m.id)}" alt="${escapeAttr(m.name||'')}" loading="lazy" />
      <span class="photo-name">${escapeHtml(m.name||'')}</span>
    </button>`).join('');
  photoGrid.querySelectorAll('[data-media-index]').forEach(btn=>btn.addEventListener('click',()=>openViewer(Number(btn.dataset.mediaIndex))));
  setupThumbObserver();
}
function setupThumbObserver(){
  if(thumbObserver)thumbObserver.disconnect();
  thumbObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){thumbObserver.unobserve(entry.target);enqueueThumb(entry.target)}
  }),{rootMargin:'320px'});
  photoGrid.querySelectorAll('.photo-thumb').forEach(img=>thumbObserver.observe(img));
}
function enqueueThumb(img){thumbQueue.push(img);pumpThumbQueue()}
function pumpThumbQueue(){
  while(thumbActive<4&&thumbQueue.length){
    const img=thumbQueue.shift();if(!img||img.dataset.loaded)return;
    thumbActive++;
    loadThumb(img).finally(()=>{thumbActive--;pumpThumbQueue()});
  }
}
async function loadThumb(img){
  const id=img.dataset.fileId;if(!id)return;
  try{
    const {blob}=await apiBlob('/api/thumb?id='+encodeURIComponent(id));
    const url=URL.createObjectURL(blob);img.src=url;img.classList.add('loaded');img.dataset.loaded='1';img.addEventListener('load',()=>setTimeout(()=>URL.revokeObjectURL(url),30000),{once:true});
  }catch(_){img.alt=''}
}
async function openFolderById(id,push){
  const rootItem=state.folders.find(x=>String(x.id)===String(id));
  if(rootItem&&push)state.folderStack=[];
  const folder=rootItem||state.childFolders.find(x=>String(x.id)===String(id))||{id,name:''};
  if(push&&state.currentFolder)state.folderStack.push(state.currentFolder);
  state.currentFolder=folder;homeView.hidden=true;folderView.hidden=false;
  folderTitle.textContent=displayName(folder)||t('loadingPhotos');folderSubtitle.textContent=t('folderSubtitle');folderCount.textContent=t('loadingPhotos');
  subfolderList.innerHTML='';photoGrid.innerHTML='<div class="loading-line"></div>';history.replaceState(null,'','#folder='+encodeURIComponent(id));window.scrollTo({top:0,behavior:'smooth'});
  try{
    const data=await apiJson('/api/folder?id='+encodeURIComponent(id)+'&lang='+encodeURIComponent(uiLang()));
    state.currentFolder={...(data.folder||folder)};
    state.childFolders=Array.isArray(data.folders)?data.folders:[];
    state.media=Array.isArray(data.media)?data.media:[];
    folderTitle.textContent=displayName(state.currentFolder)||displayName(folder);renderSubfolders();renderMedia();state.lastRefresh=Date.now();
  }catch(e){state.childFolders=[];state.media=[];renderSubfolders();photoGrid.innerHTML=`<div class="empty-state"><div class="empty-icon">⚠️</div><strong>${escapeHtml(t('folderLoadFailed'))}</strong></div>`;handleApiError(e,t('folderLoadFailed'))}
}
function openChildFolder(id){openFolderById(id,true)}
function closeFolder(){
  if(state.folderStack.length){
    const prev=state.folderStack.pop();state.currentFolder=null;openFolderById(prev.id,false);return;
  }
  state.currentFolder=null;state.childFolders=[];state.media=[];folderView.hidden=true;homeView.hidden=false;history.replaceState(null,'',location.pathname+location.search);window.scrollTo({top:0,behavior:'smooth'});
}
async function refreshCurrent(){
  if(state.currentFolder)return openFolderById(state.currentFolder.id,false);
  return loadFolders(false);
}
function updateSortLabel(){$('sortBtn').textContent=state.sort==='oldest'?t('sortOldest'):state.sort==='name'?t('sortName'):t('sortNewest')}
function cycleSort(){state.sort=state.sort==='newest'?'oldest':state.sort==='oldest'?'name':'newest';updateSortLabel();renderMedia()}
function openSheet(title,text,choices=[]){
  sheetTitle.textContent=title;sheetText.textContent=text||'';sheetActions.innerHTML='';
  for(const c of choices){
    const b=document.createElement('button');b.type='button';b.className='sheet-choice';b.innerHTML=`<strong>${escapeHtml(c.label)}</strong>${c.note?`<small>${escapeHtml(c.note)}</small>`:''}`;b.addEventListener('click',()=>{closeSheet();c.onClick?.()});sheetActions.appendChild(b);
  }
  backdrop.hidden=false;
}
function closeSheet(){backdrop.hidden=true;sheetActions.innerHTML=''}
function handleApiError(e,fallback){
  if(e?.code==='API_NOT_CONFIGURED')return openSheet(t('ready'),t('apiMissing'));
  if(e?.code==='ACCESS_KEY_MISSING'||e?.status===401||e?.status===403)return openSheet(t('ready'),t('authMissing'));
  openSheet(t('ready'),fallback||t('loadFailed'));
}
function chooseUploadFolder(){
  if(!state.folders.length)return openSheet(t('chooseFolder'),t('noFolders'));
  const choices=state.folders.map(f=>({label:displayName(f),note:t('folderMeta'),onClick:()=>beginUploadTo(f.id)}));
  openSheet(t('chooseFolder'),' ',choices);
}
function beginUploadTo(folderId){photoInput.dataset.targetFolder=folderId;photoInput.value='';photoInput.click()}
async function uploadSelectedFiles(){
  const folderId=photoInput.dataset.targetFolder||state.currentFolder?.id;if(!folderId||!photoInput.files?.length)return;
  const files=[...photoInput.files],bases=apiBases(),key=accessKey();
  if(!bases.length)return handleApiError({code:'API_NOT_CONFIGURED'});
  if(!key)return handleApiError({code:'ACCESS_KEY_MISSING'});
  let done=0;
  for(const file of files){
    try{
      await uploadOne(file,folderId,(p)=>openSheet(t('uploading'),t('uploadProgress',file.name,p)));
      done++;
    }catch(e){handleApiError(e,t('uploadFailed')+' · '+file.name);return}
  }
  openSheet(t('uploadDone'),`${done}/${files.length}`);
  setTimeout(()=>{closeSheet();refreshCurrent()},700);
}
function uploadOne(file,folderId,onProgress){
  const bases=apiBases(),key=accessKey();
  return new Promise((resolve,reject)=>{
    const tryAt=i=>{
      if(i>=bases.length)return reject(new Error('UPLOAD_FAILED'));
      const xhr=new XMLHttpRequest();xhr.open('POST',bases[i]+'/api/upload?folder='+encodeURIComponent(folderId));xhr.setRequestHeader('X-Album-Key',key);
      xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress?.(Math.round(e.loaded/e.total*100))};
      xhr.onload=()=>{if(xhr.status>=200&&xhr.status<300)resolve(xhr.responseText);else if((xhr.status>=500||xhr.status===404)&&i+1<bases.length)tryAt(i+1);else{const err=new Error('HTTP_'+xhr.status);err.status=xhr.status;reject(err)}};
      xhr.onerror=()=>i+1<bases.length?tryAt(i+1):reject(new Error('NETWORK'));
      const fd=new FormData();fd.append('file',file,file.name);xhr.send(fd);
    };tryAt(0);
  });
}
async function openViewer(index){
  const rows=state.media;if(!rows[index])return;state.viewerIndex=index;viewer.hidden=false;body.classList.add('viewer-open');await renderViewer();
}
async function renderViewer(){
  const item=state.media[state.viewerIndex];if(!item)return closeViewer();
  releaseViewerBlob();viewerName.textContent=item.name||'';viewerCounter.textContent=`${state.viewerIndex+1} / ${state.media.length}`;viewerLoading.hidden=false;viewerImage.removeAttribute('src');
  try{
    const data=await apiBlob('/api/media?id='+encodeURIComponent(item.id));state.viewerBlob=data.blob;state.viewerUrl=URL.createObjectURL(data.blob);viewerImage.src=state.viewerUrl;viewerImage.alt=item.name||'';viewerLoading.hidden=true;
  }catch(e){viewerLoading.textContent=t('loadFailed');viewerLoading.hidden=false}
}
function releaseViewerBlob(){if(state.viewerUrl)URL.revokeObjectURL(state.viewerUrl);state.viewerUrl='';state.viewerBlob=null}
function closeViewer(){releaseViewerBlob();viewer.hidden=true;body.classList.remove('viewer-open');state.viewerIndex=-1;viewerLoading.textContent=t('viewerLoading')}
async function moveViewer(delta){if(!state.media.length)return;state.viewerIndex=(state.viewerIndex+delta+state.media.length)%state.media.length;await renderViewer()}
async function ensureViewerBlob(){if(state.viewerBlob)return state.viewerBlob;const item=state.media[state.viewerIndex];if(!item)return null;const data=await apiBlob('/api/media?id='+encodeURIComponent(item.id));state.viewerBlob=data.blob;return data.blob}
async function downloadCurrent(){
  const item=state.media[state.viewerIndex],blob=await ensureViewerBlob();if(!item||!blob)return;
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=item.name||'photo';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
async function shareCurrent(){
  const item=state.media[state.viewerIndex],blob=await ensureViewerBlob();if(!item||!blob)return;
  const file=new File([blob],item.name||'photo',{type:blob.type||item.mimeType||'application/octet-stream'});
  if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
    try{await navigator.share({files:[file],title:item.name||''});return}catch(e){if(e?.name==='AbortError')return}
  }
  openSheet(t('share'),t('shareUnsupported'));downloadCurrent();
}
function syncFromHash(){
  if(!location.hash.startsWith('#folder='))return;
  const id=decodeURIComponent(location.hash.slice(8));if(!id||state.currentFolder?.id===id)return;
  const f=state.folders.find(x=>String(x.id)===id);if(f)openFolderById(id,true);
}

$('mainAppBtn').addEventListener('click',returnToMainApp);
$('themeBtn').addEventListener('click',e=>{body.classList.toggle('light');e.currentTarget.textContent=body.classList.contains('light')?'☀':'☾'});
$('closeSheet').addEventListener('click',closeSheet);$('folderBackBtn').addEventListener('click',closeFolder);$('refreshFoldersBtn').addEventListener('click',()=>loadFolders(true));
$('refreshFolderBtn').addEventListener('click',refreshCurrent);$('uploadHomeBtn').addEventListener('click',chooseUploadFolder);$('recentBtn').addEventListener('click',()=>openSheet(t('recent'),t('recentPending')));
$('sortBtn').addEventListener('click',cycleSort);$('uploadFolderBtn').addEventListener('click',()=>state.currentFolder?beginUploadTo(state.currentFolder.id):chooseUploadFolder());photoInput.addEventListener('change',uploadSelectedFiles);
$('viewerCloseBtn').addEventListener('click',closeViewer);$('viewerPrevBtn').addEventListener('click',()=>moveViewer(-1));$('viewerNextBtn').addEventListener('click',()=>moveViewer(1));$('viewerDownloadBtn').addEventListener('click',downloadCurrent);$('viewerShareBtn').addEventListener('click',shareCurrent);
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeSheet()});
window.addEventListener('keydown',e=>{if(viewer.hidden)return;if(e.key==='Escape')closeViewer();if(e.key==='ArrowLeft')moveViewer(-1);if(e.key==='ArrowRight')moveViewer(1)});
window.addEventListener('storage',e=>{if(routeCandidates.some(c=>e.key===c.modeKey||e.key===c.statsKey)){renderSharedRoute();refreshCurrent()}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-state.lastRefresh>AUTO_REFRESH_MS)refreshCurrent()});

applyLanguage();renderSharedRoute();normalizeModeInUrl();loadFolders(false);
