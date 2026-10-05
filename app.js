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
const viewerStage=$('viewerStage');
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
const UPDATE_CHECK_MIN_MS=15*1000;
const UPDATE_CHECK_INTERVAL_MS=5*60*1000;
const ALBUM_HISTORY_KEY='memoryAlbum';
const UPDATE_SEEN_KEY='memory_album_update_seen_v1';

const I18N={
  ko:{
    appTitle:'우리의 추억사진첩',appSubtitle:'우리 둘의 소중한 순간을 한곳에',mainApp:'← 본앱',manual:'📖 설명서',manualTitle:'사용설명서',manualGuideTab:'사용법',manualUpdatesTab:'업데이트 내역',replayUpdate:'업데이트 팝업 다시 보기',albums:'앨범',refresh:'↻ 새로고침',
    updateTitle:'사진첩이 업데이트됐어요',updateDetail:'업데이트 내역 상세',updateConfirm:'확인',updateHistoryLoadFailed:'업데이트 내역을 불러오지 못했습니다.',currentVersion:v=>`현재 버전 ${v}`,
    folderEmptyTitle:'Google Drive 연결 대기',folderEmptyText:'사진첩 전용 연결이 완료되면 Drive 폴더가 그대로 여기에 표시됩니다.',
    upload:'사진 올리기',uploadHint:'폴더를 선택한 뒤 여러 장을 올릴 수 있어요',recent:'최근 사진',recentHint:'새로 추가된 사진 보기',
    folderSubtitle:'Google Drive의 현재 폴더',loadingPhotos:'사진 불러오는 중',sortNewest:'최신순',sortOldest:'오래된순',sortName:'이름순',
    uploadShort:'＋ 업로드',photoEmptyTitle:'사진이 없습니다',photoEmptyText:'Drive에서 사진을 추가하거나 이 폴더에 업로드하세요.',
    ok:'확인',close:'닫기',ready:'준비 중',apiPending:'사진첩 전용 Google Drive 연결 설정이 아직 완료되지 않았어요.',
    apiMissing:'사진 API 주소가 아직 설정되지 않았어요. 백엔드 연결 후 자동으로 표시됩니다.',authMissing:'본앱에서 사진첩을 열어주세요. 본앱의 접근 정보가 필요합니다.',
    loadFailed:'사진을 불러오지 못했습니다.',uploading:'업로드 중',uploadingTitle:'사진 업로드 중',uploadDone:'업로드 완료',uploadFailed:'업로드 실패',chooseFolder:'업로드할 폴더 선택',
    uploadCount:(current,total)=>`${current} / ${total}장`,uploadOverall:p=>`전체 진행률 ${p}%`,uploadCurrent:p=>`현재 사진 ${p}%`,uploadSaving:'Google Drive에 저장 중…',
    createFolder:'새 폴더',createFolderHint:'사진을 정리할 새 앨범 폴더 만들기',createSubfolder:'＋ 폴더',folderName:'폴더 이름',folderNamePlaceholder:'새 폴더 이름',
    folderCreated:'폴더를 만들었습니다.',folderCreateFailed:'폴더를 만들지 못했습니다.',folderExists:'같은 이름의 폴더가 이미 있습니다.',
    delete:'삭제',deletePhoto:'사진 삭제',deleteFolder:'폴더 삭제',deleting:'삭제 중',deleteDone:'삭제 완료',deleteFailed:'삭제 실패',
    deletePhotoConfirm:name=>`"${name}" 사진을 삭제할까요? Google Drive 휴지통으로 이동합니다.`,
    deleteFolderConfirm:name=>`"${name}" 폴더를 삭제할까요? 폴더 안의 사진과 하위 폴더도 함께 Google Drive 휴지통으로 이동합니다.`,
    deleteRecoverHint:'실수로 삭제해도 Google Drive 휴지통에서 복구할 수 있습니다.',cancel:'취소',
    recentTitle:'최근 사진',recentSubtitle:'최근 추가된 사진',recentEmpty:'최근 추가된 사진이 없습니다.',
    selectPhotos:'사진 선택',selectedCount:n=>`${n}장 선택`,selectAll:'전체 선택',clearAll:'전체 해제',
    downloadSelected:n=>`${n}장 저장`,downloadPreparing:'선택한 원본 사진 준비 중…',downloadFailed:'선택 사진을 저장하지 못했습니다.',selectAtLeastOne:'저장할 사진을 선택해주세요.',
    savingSelected:(current,total)=>`${current} / ${total}장 원본 준비 중…`,savePrepared:n=>`${n}장 저장 준비 완료`,saveToPhotos:'사진 앱에 저장',saveFiles:'사진 파일로 저장',
    confirm:'확인',deleteSelected:n=>`${n}장 삭제`,deleteSelectedConfirm:n=>`${n}장의 사진을 삭제할까요? 선택한 사진은 Google Drive 휴지통으로 이동합니다.`,
    deletingSelected:(current,total)=>`${current} / ${total}장 삭제 중…`,deleteSelectedDone:n=>`${n}장 삭제 완료`,deleteSelectedFailed:(done,total)=>`${done} / ${total}장 삭제 후 중단되었습니다.`,
    directTitle:'직접 연결 경로 사용',cloudflareTitle:'Cloudflare 우회 경로 사용',sourceHusband:'부부대화 · 남편앱',sourceWife:'부부대화 · 아내앱',sourceGeneral:'일상대화',
    routeManual:'본앱의 연결 방식 설정을 그대로 사용',routeSuccess:'본앱에서 최근 성공한 경로를 사용',routeWife:'아내앱 기본 정책에 따라 Cloudflare 사용',routeTimezone:'본앱의 지역 자동 선택 규칙 사용',routeFallback:'본앱 연결 설정을 사용',
    folderMeta:'Google Drive 폴더',backLabel:'이전 화면',subfolders:'하위 폴더',photosCount:n=>`사진 ${n}장`,foldersCount:n=>`폴더 ${n}개`,
    viewerLoading:'불러오는 중…',share:'공유',download:'다운로드',shareUnsupported:'이 기기에서는 파일 공유를 지원하지 않아 저장으로 대신할게요.',
    recentPending:'최근 사진 모음은 Drive 연결 후 활성화됩니다.',noFolders:'업로드할 폴더가 없습니다.',uploadProgress:(name,p)=>`${name} · ${p}%`,
    folderLoadFailed:'폴더 내용을 불러오지 못했습니다.',footer:'For Husband & Wife · Private Memory Album'
  },
  lo:{
    appTitle:'ອະລະບໍ້າຄວາມຊົງຈຳຂອງເຮົາ',appSubtitle:'ເກັບຮູບແລະຄວາມຊົງຈຳຂອງເຮົາໄວ້ບ່ອນດຽວ',mainApp:'← ແອັບຫຼັກ',manual:'📖 ຄູ່ມື',manualTitle:'ຄູ່ມືການໃຊ້ງານ',manualGuideTab:'ວິທີໃຊ້',manualUpdatesTab:'ປະຫວັດອັບເດດ',replayUpdate:'ເບິ່ງປັອບອັບອັບເດດອີກຄັ້ງ',albums:'ອະລະບໍ້າ',refresh:'↻ ໂຫຼດໃໝ່',
    updateTitle:'ອະລະບໍ້າຮູບຖືກອັບເດດແລ້ວ',updateDetail:'ເບິ່ງລາຍລະອຽດອັບເດດ',updateConfirm:'ຕົກລົງ',updateHistoryLoadFailed:'ບໍ່ສາມາດໂຫຼດປະຫວັດອັບເດດໄດ້.',currentVersion:v=>`ເວີຊັນປັດຈຸບັນ ${v}`,
    folderEmptyTitle:'ລໍຖ້າເຊື່ອມ Google Drive',folderEmptyText:'ເມື່ອເຊື່ອມລະບົບຮູບແລ້ວ ໂຟນເດີໃນ Drive ຈະສະແດງຢູ່ນີ້ຕາມທີ່ມີ.',
    upload:'ອັບໂຫຼດຮູບ',uploadHint:'ເລືອກໂຟນເດີແລ້ວອັບໂຫຼດຫຼາຍຮູບໄດ້',recent:'ຮູບຫຼ້າສຸດ',recentHint:'ເບິ່ງຮູບທີ່ເພີ່ມໃໝ່',
    folderSubtitle:'ໂຟນເດີປັດຈຸບັນໃນ Google Drive',loadingPhotos:'ກຳລັງໂຫຼດຮູບ',sortNewest:'ໃໝ່ສຸດ',sortOldest:'ເກົ່າສຸດ',sortName:'ຕາມຊື່',
    uploadShort:'＋ ອັບໂຫຼດ',photoEmptyTitle:'ຍັງບໍ່ມີຮູບ',photoEmptyText:'ເພີ່ມຮູບໃນ Drive ຫຼື ອັບໂຫຼດເຂົ້າໂຟນເດີນີ້.',
    ok:'ຕົກລົງ',close:'ປິດ',ready:'ກຳລັງກຽມ',apiPending:'ຍັງບໍ່ທັນເຊື່ອມລະບົບ Google Drive ສຳລັບອະລະບໍ້າ.',
    apiMissing:'ຍັງບໍ່ໄດ້ຕັ້ງທີ່ຢູ່ API ຮູບ. ຫຼັງເຊື່ອມ backend ແລ້ວຈະສະແດງອັດຕະໂນມັດ.',authMissing:'ກະລຸນາເປີດອະລະບໍ້າຈາກແອັບຫຼັກ. ຕ້ອງໃຊ້ຂໍ້ມູນເຂົ້າເຖິງຈາກແອັບຫຼັກ.',
    loadFailed:'ບໍ່ສາມາດໂຫຼດຮູບໄດ້.',uploading:'ກຳລັງອັບໂຫຼດ',uploadingTitle:'ກຳລັງອັບໂຫຼດຮູບ',uploadDone:'ອັບໂຫຼດສຳເລັດ',uploadFailed:'ອັບໂຫຼດບໍ່ສຳເລັດ',chooseFolder:'ເລືອກໂຟນເດີທີ່ຈະອັບໂຫຼດ',
    uploadCount:(current,total)=>`${current} / ${total} ຮູບ`,uploadOverall:p=>`ຄວາມຄືບໜ້າລວມ ${p}%`,uploadCurrent:p=>`ຮູບປັດຈຸບັນ ${p}%`,uploadSaving:'ກຳລັງບັນທຶກເຂົ້າ Google Drive…',
    createFolder:'ສ້າງໂຟນເດີ',createFolderHint:'ສ້າງໂຟນເດີອະລະບໍ້າໃໝ່',createSubfolder:'＋ ໂຟນເດີ',folderName:'ຊື່ໂຟນເດີ',folderNamePlaceholder:'ຊື່ໂຟນເດີໃໝ່',
    folderCreated:'ສ້າງໂຟນເດີແລ້ວ.',folderCreateFailed:'ສ້າງໂຟນເດີບໍ່ສຳເລັດ.',folderExists:'ມີໂຟນເດີຊື່ນີ້ແລ້ວ.',
    delete:'ລຶບ',deletePhoto:'ລຶບຮູບ',deleteFolder:'ລຶບໂຟນເດີ',deleting:'ກຳລັງລຶບ',deleteDone:'ລຶບສຳເລັດ',deleteFailed:'ລຶບບໍ່ສຳເລັດ',
    deletePhotoConfirm:name=>`ລຶບຮູບ "${name}" ບໍ? ຮູບຈະຖືກຍ້າຍໄປຖັງຂີ້ເຫຍື້ອ Google Drive.`,
    deleteFolderConfirm:name=>`ລຶບໂຟນເດີ "${name}" ບໍ? ຮູບ ແລະ ໂຟນເດີຍ່ອຍຂ້າງໃນຈະຖືກຍ້າຍໄປຖັງຂີ້ເຫຍື້ອ Google Drive ນຳ.`,
    deleteRecoverHint:'ຖ້າລຶບຜິດ ສາມາດກູ້ຄືນຈາກຖັງຂີ້ເຫຍື້ອ Google Drive.',cancel:'ຍົກເລີກ',
    recentTitle:'ຮູບຫຼ້າສຸດ',recentSubtitle:'ຮູບທີ່ເພີ່ມຫຼ້າສຸດ',recentEmpty:'ຍັງບໍ່ມີຮູບທີ່ເພີ່ມໃໝ່.',
    selectPhotos:'ເລືອກຮູບ',selectedCount:n=>`ເລືອກ ${n} ຮູບ`,selectAll:'ເລືອກທັງໝົດ',clearAll:'ຍົກເລີກທັງໝົດ',
    downloadSelected:n=>`ບັນທຶກ ${n} ຮູບ`,downloadPreparing:'ກຳລັງກຽມຮູບຕົ້ນສະບັບທີ່ເລືອກ…',downloadFailed:'ບັນທຶກຮູບທີ່ເລືອກບໍ່ສຳເລັດ.',selectAtLeastOne:'ກະລຸນາເລືອກຮູບທີ່ຈະບັນທຶກ.',
    savingSelected:(current,total)=>`ກຳລັງກຽມຮູບຕົ້ນສະບັບ ${current} / ${total}…`,savePrepared:n=>`ກຽມ ${n} ຮູບແລ້ວ`,saveToPhotos:'ບັນທຶກເຂົ້າແອັບຮູບ',saveFiles:'ບັນທຶກເປັນໄຟລ໌ຮູບ',
    confirm:'ຢືນຢັນ',deleteSelected:n=>`ລຶບ ${n} ຮູບ`,deleteSelectedConfirm:n=>`ລຶບຮູບທີ່ເລືອກ ${n} ຮູບບໍ? ຮູບຈະຖືກຍ້າຍໄປຖັງຂີ້ເຫຍື້ອ Google Drive.`,
    deletingSelected:(current,total)=>`ກຳລັງລຶບ ${current} / ${total} ຮູບ…`,deleteSelectedDone:n=>`ລຶບສຳເລັດ ${n} ຮູບ`,deleteSelectedFailed:(done,total)=>`ລຶບໄດ້ ${done} / ${total} ຮູບ ແລ້ວຢຸດ.`,
    directTitle:'ໃຊ້ການເຊື່ອມຕໍ່ໂດຍກົງ',cloudflareTitle:'ໃຊ້ເສັ້ທາງ Cloudflare',sourceHusband:'ແອັບສົນທະນາຄູ່ຮັກ · ຝ່າຍຜົວ',sourceWife:'ແອັບສົນທະນາຄູ່ຮັກ · ຝ່າຍເມຍ',sourceGeneral:'ແອັບສົນທະນາທົ່ວໄປ',
    routeManual:'ໃຊ້ຄ່າການເຊື່ອມຕໍ່ຈາກແອັບຫຼັກ',routeSuccess:'ໃຊ້ເສັ້ທາງທີ່ສຳເລັດຫຼ້າສຸດ',routeWife:'ແອັບຝ່າຍເມຍໃຊ້ Cloudflare ເປັນຄ່າເລີ່ມຕົ້ນ',routeTimezone:'ໃຊ້ກົດເລືອກເສັ້ນທາງຕາມພື້ນທີ່ຂອງແອັບຫຼັກ',routeFallback:'ໃຊ້ຄ່າເຊື່ອມຕໍ່ຂອງແອັບຫຼັກ',
    folderMeta:'ໂຟນເດີ Google Drive',backLabel:'ກັບໄປ',subfolders:'ໂຟນເດີຍ່ອຍ',photosCount:n=>`ຮູບ ${n}`,foldersCount:n=>`ໂຟນເດີ ${n}`,
    viewerLoading:'ກຳລັງໂຫຼດ…',share:'ແບ່ງປັນ',download:'ດາວໂຫຼດ',shareUnsupported:'ອຸປະກອນນີ້ບໍ່ຮອງຮັບການແບ່ງປັນໄຟລ໌ ຈຶ່ງຈະບັນທຶກແທນ.',
    recentPending:'ຮູບຫຼ້າສຸດຈະເປີດໃຊ້ຫຼັງເຊື່ອມ Drive.',noFolders:'ບໍ່ມີໂຟນເດີສຳລັບອັບໂຫຼດ.',uploadProgress:(name,p)=>`${name} · ${p}%`,
    folderLoadFailed:'ບໍ່ສາມາດໂຫຼດເນື້ອຫາໂຟນເດີໄດ້.',footer:'For Husband & Wife · Private Memory Album'
  }
};

const MANUAL_CONTENT={
  ko:[
    {title:'앨범과 폴더',items:['메인 화면에는 Google Drive의 사진첩 폴더가 표시됩니다.','새 폴더는 메인 화면이나 폴더 안의 ＋ 폴더 버튼으로 만들 수 있습니다.','최근 사진에서는 폴더와 관계없이 최근 추가한 사진을 모아 볼 수 있습니다.','폴더 삭제는 확인을 누른 뒤에만 실행되며 Google Drive 휴지통으로 이동합니다.']},
    {title:'사진 보기와 이동',items:['썸네일을 한 번 누르면 원본 사진 화면이 열립니다.','확대하지 않은 상태에서는 좌우로 스와이프해 이전·다음 사진으로 이동합니다.','두 손가락으로 확대·축소하고, 확대된 상태에서는 한 손가락으로 좌우·상하 이동합니다.','휴대폰 뒤로가기는 원본 사진 → 현재 폴더 → 사진첩 홈 순서로 돌아갑니다.']},
    {title:'여러 장 선택',items:['썸네일 한 장을 약 0.4초 길게 누르면 갤러리처럼 선택 모드가 시작됩니다.','선택 모드에서는 다른 사진을 눌러 여러 장을 추가하거나 해제할 수 있습니다.','전체 선택·전체 해제도 사용할 수 있습니다.','선택 사진은 여러 장 저장하거나 한 번에 삭제할 수 있습니다.']},
    {title:'사진 저장과 공유',items:['한 장은 원본 화면의 다운로드 또는 공유 버튼을 사용합니다.','여러 장 저장은 원본을 준비한 뒤 휴대폰의 시스템 저장/공유 화면을 엽니다.','iPhone에서는 공유 화면의 이미지 저장, Android에서는 기기의 저장/공유 항목을 사용하면 됩니다.','대량 사진은 휴대폰 메모리를 위해 여러 번에 나눠 저장하는 것을 권장합니다.']},
    {title:'업로드',items:['＋ 업로드에서 여러 사진을 한 번에 선택할 수 있습니다.','현재 사진 진행률과 전체 진행률을 따로 표시합니다.','전송이 끝난 뒤 Google Drive에 저장 중 단계가 표시되고 완료 후 목록을 갱신합니다.']},
    {title:'삭제와 복구',items:['사진·여러 사진·폴더 삭제는 모두 확인 화면을 거친 뒤 실행됩니다.','삭제 항목은 즉시 영구 삭제하지 않고 Google Drive 휴지통으로 이동합니다.','실수로 삭제했다면 Google Drive 휴지통에서 복구할 수 있습니다.']},
    {title:'업데이트',items:['사진첩은 새 버전을 자동 확인합니다.','업로드나 여러 장 저장·삭제 중에는 강제 갱신하지 않고 작업이 끝난 뒤 갱신합니다.','업데이트 후에는 한 번 팝업으로 주요 변경점을 안내하며, 업데이트 내역 탭에서 상세 기록을 다시 볼 수 있습니다.']}
  ],
  lo:[
    {title:'ອະລະບໍ້າ ແລະ ໂຟນເດີ',items:['ໜ້າຫຼັກຈະສະແດງໂຟນເດີຮູບຈາກ Google Drive.','ສາມາດສ້າງໂຟນເດີໃໝ່ຈາກໜ້າຫຼັກ ຫຼື ປຸ່ມ ＋ ໂຟນເດີ ຂ້າງໃນໂຟນເດີ.','ຮູບຫຼ້າສຸດຈະຮວບຮວມຮູບທີ່ເພີ່ມໃໝ່ໂດຍບໍ່ຈຳກັດໂຟນເດີ.','ການລຶບໂຟນເດີຈະເຮັດຫຼັງຈາກກົດຢືນຢັນ ແລະ ຈະຍ້າຍໄປຖັງຂີ້ເຫຍື້ອ Google Drive.']},
    {title:'ເບິ່ງຮູບ ແລະ ເລື່ອນຮູບ',items:['ແຕະຮູບຕົວຢ່າງໜຶ່ງຄັ້ງເພື່ອເປີດຮູບຕົ້ນສະບັບ.','ເມື່ອບໍ່ໄດ້ຊູມ ປັດຊ້າຍ/ຂວາເພື່ອໄປຮູບກ່ອນໜ້າ ຫຼື ຮູບຖັດໄປ.','ໃຊ້ສອງນິ້ວເພື່ອຊູມ ແລະ ເມື່ອຊູມແລ້ວໃຊ້ນິ້ວດຽວເລື່ອນຮູບໄດ້ທຸກທິດ.','ປຸ່ມກັບຂອງໂທລະສັບຈະກັບຈາກຮູບ → ໂຟນເດີ → ໜ້າຫຼັກອະລະບໍ້າ.']},
    {title:'ເລືອກຫຼາຍຮູບ',items:['ກົດຄ້າງຮູບຕົວຢ່າງປະມານ 0.4 ວິນາທີເພື່ອເຂົ້າໂໝດເລືອກແບບແອັບ Gallery.','ໃນໂໝດເລືອກ ແຕະຮູບອື່ນເພື່ອເພີ່ມ ຫຼື ຍົກເລີກ.','ສາມາດເລືອກທັງໝົດ ຫຼື ຍົກເລີກທັງໝົດໄດ້.','ຮູບທີ່ເລືອກສາມາດບັນທຶກຫຼາຍຮູບ ຫຼື ລຶບພ້ອມກັນໄດ້.']},
    {title:'ບັນທຶກ ແລະ ແບ່ງປັນ',items:['ຮູບດຽວໃຊ້ປຸ່ມດາວໂຫຼດ ຫຼື ແບ່ງປັນໃນໜ້າຮູບຕົ້ນສະບັບ.','ການບັນທຶກຫຼາຍຮູບຈະກຽມໄຟລ໌ຕົ້ນສະບັບແລ້ວເປີດໜ້າບັນທຶກ/ແບ່ງປັນຂອງໂທລະສັບ.','ໃນ iPhone ໃຫ້ເລືອກບັນທຶກຮູບຈາກໜ້າ Share; ໃນ Android ໃຫ້ໃຊ້ລາຍການບັນທຶກ/ແບ່ງປັນຂອງເຄື່ອງ.','ຖ້າມີຮູບຈຳນວນຫຼາຍ ແນະນຳໃຫ້ແບ່ງບັນທຶກເປັນຫຼາຍຄັ້ງ.']},
    {title:'ອັບໂຫຼດ',items:['ປຸ່ມ ＋ ອັບໂຫຼດ ສາມາດເລືອກຫຼາຍຮູບໄດ້.','ຈະສະແດງຄວາມຄືບໜ້າຂອງຮູບປັດຈຸບັນ ແລະ ຄວາມຄືບໜ້າລວມແຍກກັນ.','ຫຼັງສົ່ງໄຟລ໌ແລ້ວຈະສະແດງຂັ້ນຕອນກຳລັງບັນທຶກເຂົ້າ Google Drive ແລະ ຈະໂຫຼດລາຍການໃໝ່ຫຼັງສຳເລັດ.']},
    {title:'ລຶບ ແລະ ກູ້ຄືນ',items:['ການລຶບຮູບ, ຫຼາຍຮູບ ແລະ ໂຟນເດີຈະຕ້ອງຜ່ານໜ້າຢືນຢັນກ່ອນ.','ລາຍການທີ່ລຶບຈະບໍ່ຖືກລຶບຖາວອນທັນທີ ແຕ່ຈະຍ້າຍໄປຖັງຂີ້ເຫຍື້ອ Google Drive.','ຖ້າລຶບຜິດ ສາມາດກູ້ຄືນໄດ້ຈາກຖັງຂີ້ເຫຍື້ອ Google Drive.']},
    {title:'ອັບເດດ',items:['ອະລະບໍ້າຮູບຈະກວດຫາເວີຊັນໃໝ່ອັດຕະໂນມັດ.','ລະຫວ່າງອັບໂຫຼດ, ບັນທຶກຫຼາຍຮູບ ຫຼື ລຶບ ຈະບໍ່ບັງຄັບໂຫຼດໃໝ່; ຈະອັບເດດຫຼັງວຽກສຳເລັດ.','ຫຼັງອັບເດດຈະມີປັອບອັບແຈ້ງການໜຶ່ງຄັ້ງ ແລະ ສາມາດເບິ່ງລາຍລະອຽດຈາກແຖບປະຫວັດອັບເດດ.']}
  ]
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
const thumbUrls=new Set();
const thumbUrlCache=new Map();
let thumbActive=0;
let viewerLoadSeq=0;
let uploadBusy=false;
let downloadBusy=false;
let deleteBusy=false;
let preparedSaveActive=false;
let pendingAppUpdate=false;
let lastUpdateCheck=0;
let versionInfoCache=null;
let manualTab='guide';
let selectionMode=false;
const selectedMediaIds=new Set();
let viewerScale=1;
let viewerPanX=0;
let viewerPanY=0;
const viewerPointers=new Map();
let gestureStartDistance=0;
let gestureStartScale=1;
let gestureStartMidX=0;
let gestureStartMidY=0;
let gestureStartPanX=0;
let gestureStartPanY=0;
let gestureStartPointerX=0;
let gestureStartPointerY=0;
let viewerSwipeActive=false;
let viewerSwipeStartX=0;
let viewerSwipeStartY=0;
let viewerSwipeLastX=0;
let viewerSwipeLastY=0;
let viewerSwipeStartedAt=0;
const VIEWER_MAX_SCALE=5;
const THUMB_CONCURRENCY=(navigator.connection&&navigator.connection.saveData)?4:8;
const THUMB_EAGER_COUNT=window.innerWidth<=600?10:16;

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
function albumHistoryState(view,id=''){return{[ALBUM_HISTORY_KEY]:true,view,id}}
function albumUrl(view,id=''){
  const base=location.pathname+location.search;
  if(view==='recent')return base+'#recent';
  if(view==='folder'&&id)return base+'#folder='+encodeURIComponent(id);
  return base;
}
function initAlbumHistory(){
  let view='home',id='';
  if(location.hash==='#recent')view='recent';
  else if(location.hash.startsWith('#folder=')){view='folder';id=decodeURIComponent(location.hash.slice(8))}
  history.replaceState(albumHistoryState(view,id),'',location.href);
}
function pushAlbumHistory(view,id=''){history.pushState(albumHistoryState(view,id),'',albumUrl(view,id))}
function showAlbumHome(){
  resetSelection();
  state.currentFolder=null;state.folderStack=[];state.childFolders=[];state.media=[];
  folderView.hidden=true;homeView.hidden=false;window.scrollTo({top:0,behavior:'smooth'});
}
function manualPickerOpen(){return $('manualLanguagePicker').classList.contains('show')}
function manualOpen(){return $('unifiedManual').classList.contains('show')}
function updateHistoryOpen(){return !$('manualUpdateHistoryOverlay').hidden}
function releaseNoticeOpen(){return !$('releaseNoticeOverlay').hidden}
function appBusyForUpdate(){
  return uploadBusy||downloadBusy||deleteBusy||preparedSaveActive||selectionMode||!viewer.hidden||!backdrop.hidden||manualPickerOpen()||manualOpen()||updateHistoryOpen()||releaseNoticeOpen();
}
function reloadForVersion(version){
  const u=new URL(location.href);
  u.searchParams.set('__album_v',String(version||Date.now()));
  location.replace(u.toString());
}
function applyPendingAppUpdate(){
  if(!pendingAppUpdate||appBusyForUpdate())return false;
  pendingAppUpdate=false;checkForAppUpdate(true);return true;
}
async function loadVersionInfo(force=false){
  if(versionInfoCache&&!force)return versionInfoCache;
  const res=await fetch('./version.json?ts='+Date.now(),{cache:'no-store'});
  if(!res.ok)throw new Error('version_load_failed');
  versionInfoCache=await res.json();return versionInfoCache;
}
function localizedValue(value,lang=uiLang()){
  if(value&&typeof value==='object'&&!Array.isArray(value))return String(value[lang]??value.ko??Object.values(value)[0]??'');
  return String(value??'');
}
function localizedList(value,lang=uiLang()){
  if(value&&typeof value==='object'&&!Array.isArray(value))value=value[lang]??value.ko??[];
  return Array.isArray(value)?value.map(x=>String(x)):value?[String(value)]:[];
}
function manualCopy(lang){
  return lang==='lo'?{
    heroBanner:'🇱🇦 ຄູ່ມືພາສາລາວ',title:'💑 ອະລະບໍ້າຄວາມຊົງຈຳ',lead:'ເບິ່ງໂຟນເດີ → ເລືອກຮູບ → ເບິ່ງ/ຊູມ → ບັນທຶກ ຫຼື ແບ່ງປັນ. ຈື່ພຽງຂັ້ນຕອນນີ້ກໍໃຊ້ໄດ້.',
    update:'🆕 ປະຫວັດອັບເດດ',flow:['📁 ໂຟນເດີ','🖼️ ເລືອກຮູບ','🔎 ເບິ່ງ/ຊູມ','💾 ບັນທຶກ'],
    shotKicker:'ເບິ່ງໜ້າຈໍແລ້ວເຮັດຕາມ',shotTitle:'🚀 1. ໜ້າຈໍຫຼັກ ແລະ ໂຟນເດີ',homeCap:'ໜ້າຫຼັກ · ເລືອກອະລະບໍ້າ, ຮູບຫຼ້າສຸດ, ອັບໂຫຼດ ແລະ ສ້າງໂຟນເດີ',folderCap:'ໜ້າໂຟນເດີ · ເບິ່ງຮູບ, ຈັດລຽງ, ເລືອກຫຼາຍຮູບ',
    folderTitle:'📁 2. ໂຟນເດີ · ຮູບຫຼ້າສຸດ',folderItems:['ໜ້າຫຼັກສະແດງໂຟນເດີ Google Drive ຂອງອະລະບໍ້າ.','ປຸ່ມ “ຮູບຫຼ້າສຸດ” ຮວບຮວມຮູບທີ່ເພີ່ມໃໝ່ໂດຍບໍ່ຈຳກັດໂຟນເດີ.','ສາມາດສ້າງໂຟນເດີຈາກໜ້າຫຼັກ ຫຼື ພາຍໃນໂຟນເດີ.'],
    selectTitle:'☑️ 3. ເລືອກຫຼາຍຮູບ',selectItems:['ກົດຄ້າງຮູບຕົວຢ່າງປະມານ 0.4 ວິນາທີ ເພື່ອເຂົ້າໂໝດເລືອກແບບ Gallery.','ແຕະຮູບອື່ນເພື່ອເພີ່ມ/ຍົກເລີກ ແລະ ໃຊ້ “ເລືອກທັງໝົດ” ໄດ້.','ຫຼັງເລືອກ ສາມາດບັນທຶກຫຼາຍຮູບ ຫຼື ລຶບພ້ອມກັນ.'],
    viewerKicker:'ຮູບຕົ້ນສະບັບ',viewerTitle:'🔎 4. ເບິ່ງ · ຊູມ · ປັດປ່ຽນຮູບ',viewerCap:'ໜ້າຮູບຕົ້ນສະບັບ · ແບ່ງປັນ, ດາວໂຫຼດ, ລຶບ ແລະ ປັດປ່ຽນຮູບ',
    viewerItems:['ເມື່ອບໍ່ຊູມ ປັດຊ້າຍ/ຂວາເພື່ອໄປຮູບກ່ອນ ຫຼື ຮູບຖັດໄປ.','ໃຊ້ສອງນິ້ວເພື່ອຊູມ; ເມື່ອຊູມແລ້ວໃຊ້ນິ້ວດຽວເລື່ອນຊ້າຍ·ຂວາ·ເທິງ·ລຸ່ມ.','ປຸ່ມດ້ານເທິງມີ ແບ່ງປັນ, ດາວໂຫຼດ ແລະ ລຶບ.'],
    uploadTitle:'⬆️ 5. ອັບໂຫຼດຮູບ',uploadItems:['ປຸ່ມ ＋ ອັບໂຫຼດ ສາມາດເລືອກຫຼາຍຮູບພ້ອມກັນ.','ຈະສະແດງຄວາມຄືບໜ້າຮູບປັດຈຸບັນ ແລະ ຄວາມຄືບໜ້າລວມ.','ຫຼັງສົ່ງໄຟລ໌ ຈະສະແດງຂັ້ນ “ກຳລັງບັນທຶກເຂົ້າ Google Drive”.'],
    saveTitle:'💾 6. ບັນທຶກ · ແບ່ງປັນ',saveItems:['ຮູບດຽວໃຊ້ປຸ່ມດາວໂຫຼດ ຫຼື ແບ່ງປັນໃນໜ້າຮູບ.','ຫຼາຍຮູບຈະກຽມໄຟລ໌ຕົ້ນສະບັບ ແລ້ວເປີດໜ້າບັນທຶກ/Share ຂອງໂທລະສັບ.','iPhone Safari ໃຫ້ເລືອກ “Save Images”; Android ໃຫ້ໃຊ້ລາຍການບັນທຶກ/ແບ່ງປັນຂອງເຄື່ອງ.'],
    deleteTitle:'🗑️ 7. ລຶບ · ກູ້ຄືນ',deleteItems:['ການລຶບຮູບ, ຫຼາຍຮູບ ແລະ ໂຟນເດີຈະສະແດງ ຍົກເລີກ / ຢືນຢັນ ກ່ອນ.','ລາຍການທີ່ລຶບຈະຍ້າຍໄປ Google Drive Trash ແລະ ສາມາດກູ້ຄືນໄດ້.'],
    updateTitle:'🔄 8. ອັບເດດອັດຕະໂນມັດ',updateItems:['ອະລະບໍ້າຈະກວດຫາເວີຊັນໃໝ່ອັດຕະໂນມັດ.','ຖ້າກຳລັງເບິ່ງຮູບ, ເລືອກຮູບ, ອັບໂຫຼດ ຫຼື ບັນທຶກ ຈະລໍຖ້າໃຫ້ວຽກຈົບກ່ອນອັບເດດ.','ຫຼັງອັບເດດຈະມີປັອບອັບແຈ້ງການໜຶ່ງຄັ້ງ.'],
    tip:'TIP · ຖ້າຮູບມີຈຳນວນຫຼາຍ ໃຫ້ແບ່ງບັນທຶກ/ອັບໂຫຼດເປັນຫຼາຍຄັ້ງ ເພື່ອໃຫ້ Safari/Chrome ເຮັດວຽກສະຖຽນ.',
    footer:'ຄູ່ມືຢູ່ໃນແອັບ ແລະ ບໍ່ຕ້ອງເປີດເວັບພາຍນອກ.'
  }:{
    heroBanner:'🇰🇷 한국어 사용 가이드',title:'💑 우리의 추억사진첩',lead:'폴더 보기 → 사진 선택 → 원본 보기/확대 → 저장·공유. 이 흐름만 알면 바로 사용할 수 있습니다.',
    update:'🆕 업데이트 내역',flow:['📁 폴더','🖼️ 사진 선택','🔎 보기/확대','💾 저장'],
    shotKicker:'화면을 보면서 따라 하기',shotTitle:'🚀 1. 메인 화면과 폴더',homeCap:'메인 화면 · 앨범 선택, 최근 사진, 업로드와 새 폴더',folderCap:'폴더 화면 · 사진 보기, 정렬, 여러 장 선택',
    folderTitle:'📁 2. 폴더 · 최근 사진',folderItems:['메인 화면에는 Google Drive의 사진첩 폴더가 그대로 표시됩니다.','‘최근 사진’에서는 폴더와 관계없이 최근 추가한 사진을 모아서 볼 수 있습니다.','새 폴더는 메인 화면 또는 폴더 안의 ＋ 폴더 버튼으로 만들 수 있습니다.'],
    selectTitle:'☑️ 3. 여러 장 선택',selectItems:['썸네일 한 장을 약 0.4초 길게 누르면 삼성 갤러리처럼 선택 모드가 시작됩니다.','선택 모드에서 다른 사진을 눌러 추가·해제할 수 있고 ‘전체 선택’도 사용할 수 있습니다.','선택한 사진은 여러 장 저장하거나 한 번에 삭제할 수 있습니다.'],
    viewerKicker:'원본 사진 보기',viewerTitle:'🔎 4. 보기 · 확대 · 좌우 스와이프',viewerCap:'원본 사진 화면 · 공유, 다운로드, 삭제와 좌우 스와이프',
    viewerItems:['확대하지 않은 상태에서는 좌우로 스와이프해 이전·다음 사진으로 이동합니다.','두 손가락으로 확대·축소하고, 확대된 상태에서는 한 손가락으로 좌우·상하 이동합니다.','상단의 공유·다운로드·삭제 버튼으로 현재 사진을 바로 처리할 수 있습니다.'],
    uploadTitle:'⬆️ 5. 사진 업로드',uploadItems:['＋ 업로드에서 여러 사진을 한 번에 선택할 수 있습니다.','현재 사진 진행률과 전체 진행률을 따로 표시합니다.','전송이 끝난 뒤 ‘Google Drive에 저장 중’ 단계가 표시되고 완료 후 목록을 갱신합니다.'],
    saveTitle:'💾 6. 저장 · 공유',saveItems:['한 장은 원본 화면의 다운로드 또는 공유 버튼을 사용합니다.','여러 장은 원본을 준비한 뒤 휴대폰의 시스템 저장/공유 화면을 엽니다.','iPhone Safari에서는 공유 화면의 ‘이미지 저장’, Android에서는 기기의 저장/공유 항목을 사용하면 됩니다.'],
    deleteTitle:'🗑️ 7. 삭제 · 복구',deleteItems:['사진·여러 사진·폴더 삭제는 모두 취소 / 확인 화면을 거친 뒤 실행됩니다.','삭제된 항목은 Google Drive 휴지통으로 이동하므로 실수로 삭제했으면 휴지통에서 복구할 수 있습니다.'],
    updateTitle:'🔄 8. 자동 업데이트',updateItems:['사진첩은 새 버전을 자동으로 확인합니다.','사진 보기·선택·업로드·저장 중에는 강제로 새로고침하지 않고 작업이 끝난 뒤 업데이트합니다.','업데이트 후에는 본앱처럼 주요 변경점을 한 번 팝업으로 알려줍니다.'],
    tip:'TIP · 사진이 아주 많을 때는 Safari/Chrome 안정성을 위해 저장·업로드를 여러 번에 나누면 더 좋습니다.',
    footer:'상세 설명서는 사진첩 안에 포함되어 있으며 별도 인터넷 페이지를 열지 않습니다.'
  };
}
function manualShotSvg(kind,lang){
  const lo=lang==='lo';
  const label=kind==='home'?(lo?'ອະລະບໍ້າ':'앨범'):kind==='folder'?(lo?'ໂຟນເດີຮູບ':'졸업사진'):lo?'ຮູບ 12 / 105':'12 / 105';
  const sub=kind==='home'?(lo?'ຮູບຫຼ້າສຸດ · ອັບໂຫຼດ · ໂຟນເດີ':'최근 사진 · 업로드 · 새 폴더'):kind==='folder'?(lo?'ເລືອກຮູບ · ຈັດລຽງ':'사진 선택 · 최신순'):lo?'ແບ່ງປັນ   ດາວໂຫຼດ   ລຶບ':'공유   다운로드   삭제';
  const tiles=kind==='home'
    ?'<rect x="26" y="150" width="308" height="82" rx="17" fill="#1d212a" stroke="#343946"/><rect x="40" y="163" width="58" height="56" rx="13" fill="#9d5872"/><text x="116" y="184" fill="#fff" font-size="15" font-weight="700">🎓 Graduation</text><text x="116" y="205" fill="#9aa2ad" font-size="10">Google Drive</text><rect x="26" y="246" width="148" height="70" rx="15" fill="#1d212a" stroke="#343946"/><rect x="186" y="246" width="148" height="70" rx="15" fill="#1d212a" stroke="#343946"/><rect x="26" y="328" width="308" height="70" rx="15" fill="#1d212a" stroke="#343946"/>'
    :kind==='folder'
    ?Array.from({length:9},(_,i)=>{const x=26+(i%3)*104,y=155+Math.floor(i/3)*104;return '<rect x="'+x+'" y="'+y+'" width="96" height="96" rx="8" fill="'+(i%2?'#b8788e':'#795d67')+'"/><circle cx="'+(x+78)+'" cy="'+(y+18)+'" r="10" fill="#ffffff33"/>';}).join('')
    :'<rect x="18" y="118" width="324" height="445" rx="10" fill="#342c31"/><circle cx="180" cy="340" r="105" fill="#7e5965"/><circle cx="180" cy="340" r="72" fill="#b07688"/><path d="M32 340h28M300 340h28" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M48 330l-10 10 10 10M312 330l10 10-10 10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"><rect width="360" height="640" rx="28" fill="#101217"/><rect x="14" y="14" width="332" height="52" rx="14" fill="#171a21" stroke="#343946"/><text x="28" y="35" fill="#ff9ab2" font-size="9" font-family="Arial,sans-serif" font-weight="700">OUR MEMORY</text><text x="28" y="55" fill="#fff" font-size="16" font-family="Arial,sans-serif" font-weight="700">'+label+'</text><text x="330" y="46" text-anchor="end" fill="#fff" font-size="11" font-family="Arial,sans-serif">☾</text><text x="26" y="104" fill="#f7f8fa" font-size="18" font-family="Arial,sans-serif" font-weight="700">'+label+'</text><text x="26" y="126" fill="#9aa2ad" font-size="10" font-family="Arial,sans-serif">'+sub+'</text>'+tiles+'<rect x="22" y="592" width="316" height="28" rx="12" fill="#171a21"/><text x="180" y="610" text-anchor="middle" fill="#9aa2ad" font-size="9" font-family="Arial,sans-serif">For Husband &amp; Wife · Private Memory Album</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function syncManualScreenshots(lang){
  document.querySelectorAll('[data-manual-shot]').forEach(img=>{img.src=manualShotSvg(img.dataset.manualShot,lang)});
}
function manualCard(title,items){
  return '<section class="manual-card manual-renew-card"><h2>'+escapeHtml(title)+'</h2><div class="manual-do-grid">'+items.map(x=>'<div class="manual-do">'+escapeHtml(x)+'</div>').join('')+'</div></section>';
}
function renderUnifiedManual(lang=manualLanguage){
  manualLanguage=lang==='lo'?'lo':'ko';
  const c=manualCopy(manualLanguage),pane=$('manualContent');
  $('manualKoBtn').classList.toggle('active',manualLanguage==='ko');$('manualLoBtn').classList.toggle('active',manualLanguage==='lo');
  $('manualCloseBtn').textContent=manualLanguage==='lo'?'← ກັບອະລະບໍ້າ':'← 사진첩으로';
  pane.innerHTML='<section class="manual-hero manual-renew"><div class="manual-language-banner">'+c.heroBanner+'</div><h1>'+c.title+'</h1><div class="manual-sub">'+escapeHtml(cfg.version)+' · Android / iPhone / PC</div><p class="manual-lead">'+c.lead+'</p><button class="manual-update-history-btn" type="button" id="manualUpdateHistoryBtn">'+c.update+'</button><div class="manual-fastflow">'+c.flow.map(x=>'<div><b>'+x.split(' ')[0]+'</b>'+escapeHtml(x.split(' ').slice(1).join(' '))+'</div>').join('')+'</div></section>'+
    '<section class="manual-card manual-renew-card"><div class="manual-kicker2">'+c.shotKicker+'</div><h2>'+c.shotTitle+'</h2><div class="manual-shot-two"><figure class="manual-shot-clean"><img data-manual-shot="home" alt=""><figcaption>'+c.homeCap+'</figcaption></figure><figure class="manual-shot-clean"><img data-manual-shot="folder" alt=""><figcaption>'+c.folderCap+'</figcaption></figure></div></section>'+
    manualCard(c.folderTitle,c.folderItems)+manualCard(c.selectTitle,c.selectItems)+
    '<section class="manual-card manual-renew-card"><div class="manual-kicker2">'+c.viewerKicker+'</div><h2>'+c.viewerTitle+'</h2><div class="manual-shot-one"><figure class="manual-shot-clean"><img data-manual-shot="viewer" alt=""><figcaption>'+c.viewerCap+'</figcaption></figure></div><div class="manual-do-grid">'+c.viewerItems.map(x=>'<div class="manual-do">'+escapeHtml(x)+'</div>').join('')+'</div></section>'+
    manualCard(c.uploadTitle,c.uploadItems)+manualCard(c.saveTitle,c.saveItems)+manualCard(c.deleteTitle,c.deleteItems)+manualCard(c.updateTitle,c.updateItems)+
    '<div class="manual-mini-tip"><b>TIP</b> '+escapeHtml(c.tip.replace(/^TIP\s*·?\s*/i,''))+'</div><div class="manual-footer">'+escapeHtml(cfg.version)+' · '+escapeHtml(c.footer)+'</div>';
  syncManualScreenshots(manualLanguage);
  $('manualUpdateHistoryBtn')?.addEventListener('click',()=>openManualUpdateHistory(manualLanguage,true));
}
function openManualLanguagePicker(pushHistory=true){
  $('manualLanguagePicker').hidden=false;requestAnimationFrame(()=>$('manualLanguagePicker').classList.add('show'));body.classList.add('modal-open');
  if(pushHistory&&history.state?.overlay!=='manual-picker')history.pushState({...history.state,[ALBUM_HISTORY_KEY]:true,overlay:'manual-picker'},'',location.href);
}
function closeManualLanguagePicker(fromHistory=false){
  if(!fromHistory&&history.state?.overlay==='manual-picker'){history.back();return}
  $('manualLanguagePicker').classList.remove('show');
  setTimeout(()=>{$('manualLanguagePicker').hidden=true;if(!manualOpen()&&!updateHistoryOpen()&&!releaseNoticeOpen())body.classList.remove('modal-open')},160);
  if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),180);
}
function chooseManualLanguage(lang){
  manualLanguage=lang==='lo'?'lo':'ko';$('manualLanguagePicker').classList.remove('show');$('manualLanguagePicker').hidden=true;
  if(history.state?.overlay==='manual-picker')history.replaceState({...history.state,overlay:'manual'},'',location.href);
  openUnifiedManual(manualLanguage,false);
}
function setManualLanguage(lang){renderUnifiedManual(lang)}
function openUnifiedManual(lang=uiLang(),pushHistory=true){
  manualLanguage=lang==='lo'?'lo':'ko';$('unifiedManual').classList.add('show');body.classList.add('modal-open');renderUnifiedManual(manualLanguage);$('unifiedManual').scrollTop=0;
  if(pushHistory&&history.state?.overlay!=='manual')history.pushState({...history.state,[ALBUM_HISTORY_KEY]:true,overlay:'manual'},'',location.href);
}
function closeUnifiedManual(fromHistory=false){
  if(!fromHistory&&history.state?.overlay==='manual'){history.back();return}
  $('unifiedManual').classList.remove('show');if(!manualPickerOpen()&&!updateHistoryOpen()&&!releaseNoticeOpen())body.classList.remove('modal-open');
  if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
}
async function renderUpdateHistory(lang=manualLanguage){
  try{
    const info=await loadVersionInfo(true),rows=Array.isArray(info.history)?info.history:[];
    document.querySelectorAll('[data-release-version]').forEach(el=>el.textContent=String(info.version||cfg.version));
    const target=lang==='lo'?$('manualUpdateHistoryDetailsLo'):$('manualUpdateHistoryDetailsKo');
    target.innerHTML=rows.map((row,i)=>{const title=localizedValue(row.title||row.summary||'',lang),changes=localizedList(row.changes,lang);return '<section class="release-history-section"><h3>'+escapeHtml((i===0?'✨ ':'')+(row.version||'')+(title?' · '+title:''))+'</h3><div class="release-history-date">'+escapeHtml(row.date||'')+'</div><ul>'+changes.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul></section>';}).join('');
  }catch(_){const target=lang==='lo'?$('manualUpdateHistoryDetailsLo'):$('manualUpdateHistoryDetailsKo');target.innerHTML='<div class="manual-empty">'+escapeHtml(t('updateHistoryLoadFailed'))+'</div>'}
}
async function openManualUpdateHistory(lang=manualLanguage,pushHistory=true){
  manualLanguage=lang==='lo'?'lo':'ko';$('manualUpdateHistoryKo').hidden=manualLanguage!=='ko';$('manualUpdateHistoryLo').hidden=manualLanguage!=='lo';
  $('manualUpdateHistoryClose').textContent=manualLanguage==='lo'?'ປິດ':'닫기';$('manualUpdateHistoryPreview').title=manualLanguage==='lo'?'ເບິ່ງປັອບອັບອັບເດດ':'업데이트 팝업 보기';$('manualUpdateHistoryPreview').setAttribute('aria-label',$('manualUpdateHistoryPreview').title);
  await renderUpdateHistory(manualLanguage);$('manualUpdateHistoryOverlay').hidden=false;body.classList.add('modal-open');
  if(pushHistory&&history.state?.overlay!=='history')history.pushState({...history.state,[ALBUM_HISTORY_KEY]:true,overlay:'history'},'',location.href);
}
function closeManualUpdateHistory(fromHistory=false){
  if(!fromHistory&&history.state?.overlay==='history'){history.back();return}
  $('manualUpdateHistoryOverlay').hidden=true;if(!manualOpen()&&!manualPickerOpen()&&!releaseNoticeOpen())body.classList.remove('modal-open');
  if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
}
function renderReleaseNotice(info,lang=uiLang()){
  const version=String(info?.version||cfg.version),current=Array.isArray(info?.history)?info.history.find(x=>String(x.version)===version):null;
  const summary=localizedValue(info?.summary||current?.title||'',lang),changes=localizedList(current?.changes||info?.changes||[],lang).slice(0,5);
  $('releaseNoticeKo').hidden=lang!=='ko';$('releaseNoticeLo').hidden=lang!=='lo';
  $('releaseNoticeSubKo').textContent=lang==='ko'?version+(summary?' · '+summary:''):'';
  $('releaseNoticeSubLo').textContent=lang==='lo'?version+(summary?' · '+summary:''):'';
  $('releaseNoticeListKo').innerHTML=lang==='ko'?changes.map(x=>'<li>'+escapeHtml(x)+'</li>').join(''):'';
  $('releaseNoticeListLo').innerHTML=lang==='lo'?changes.map(x=>'<li>'+escapeHtml(x)+'</li>').join(''):'';
  $('releaseNoticeOk').textContent=lang==='lo'?'ຕົກລົງ':'확인';
}
function showReleaseNotice(info,force=false,pushHistory=true,lang=uiLang(),preview=false){
  const version=String(info?.version||cfg.version||'');if(!force&&lsGet(UPDATE_SEEN_KEY)===version)return false;if(!preview)lsSet(UPDATE_SEEN_KEY,version);
  renderReleaseNotice(info,lang);$('releaseNoticeOverlay').hidden=false;body.classList.add('modal-open');
  const overlayName=preview?'update-preview':'update';if(pushHistory&&history.state?.overlay!==overlayName)history.pushState({...history.state,[ALBUM_HISTORY_KEY]:true,overlay:overlayName},'',location.href);return true;
}
function closeReleaseNotice(fromHistory=false){
  const ov=history.state?.overlay;if(!fromHistory&&(ov==='update'||ov==='update-preview')){history.back();return}
  $('releaseNoticeOverlay').hidden=true;if(!manualOpen()&&!manualPickerOpen()&&!updateHistoryOpen())body.classList.remove('modal-open');
  if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
}
async function showUpdatePopupIfNeeded(force=false){
  try{const info=await loadVersionInfo(true);if(String(info?.version||'')!==String(cfg.version||''))return false;return showReleaseNotice(info,force,true,uiLang(),false)}catch(_){return false}
}
async function previewUpdatePopup(){try{showReleaseNotice(await loadVersionInfo(true),true,true,manualLanguage,true)}catch(_){}}
async function checkForAppUpdate(force=false){
  if(document.visibilityState!=='visible')return false;
  const now=Date.now();if(!force&&now-lastUpdateCheck<UPDATE_CHECK_MIN_MS)return false;lastUpdateCheck=now;
  try{
    const remote=await loadVersionInfo(true),remoteVersion=String(remote?.version||'').trim(),currentVersion=String(cfg.version||'').trim();
    if(!remoteVersion||!currentVersion||remoteVersion===currentVersion)return false;
    if(appBusyForUpdate()){pendingAppUpdate=true;return true}
    reloadForVersion(remoteVersion);return true;
  }catch(_){return false}
}
function normalizeModeInUrl(){
  try{
    const u=new URL(location.href);
    const incoming=String(u.searchParams.get('mode')||'').toLowerCase();
    let changed=false;
    if(incoming==='husband'||incoming==='wife'){
      u.searchParams.delete('mode');u.searchParams.delete('from');u.searchParams.delete('bridge');changed=true;
    }
    if(u.searchParams.has('__album_v')){u.searchParams.delete('__album_v');changed=true}
    if(changed)history.replaceState(history.state,'',u.pathname+(u.search?u.search:'')+u.hash);
  }catch(_){}
}
function applyLanguage(){
  const lo=uiLang()==='lo';
  document.documentElement.lang=lo?'lo':'ko';document.title=t('appTitle');
  $('appTitle').textContent=t('appTitle');$('appSubtitle').textContent=t('appSubtitle');$('manualBtn').textContent=t('manual');$('manualBtn').setAttribute('aria-label',t('manual'));$('mainAppBtn').textContent=t('mainApp');$('mainAppBtn').setAttribute('aria-label',t('mainApp'));$('albumSectionTitle').textContent=t('albums');
  $('refreshFoldersBtn').textContent=t('refresh');$('folderEmptyTitle').textContent=t('folderEmptyTitle');$('folderEmptyText').textContent=t('folderEmptyText');
  $('uploadHomeTitle').textContent=t('upload');$('uploadHomeText').textContent=t('uploadHint');$('recentTitle').textContent=t('recent');$('recentText').textContent=t('recentHint');
  $('createFolderTitle').textContent=t('createFolder');$('createFolderText').textContent=t('createFolderHint');
  $('folderSubtitle').textContent=t('folderSubtitle');$('folderCount').textContent=t('loadingPhotos');$('uploadFolderBtn').textContent=t('uploadShort');$('createSubfolderBtn').textContent=t('createSubfolder');$('deleteFolderBtn').textContent=t('deleteFolder');$('selectPhotosBtn').textContent=t('selectPhotos');
  $('selectAllBtn').textContent=t('selectAll');$('cancelSelectionBtn').textContent=t('cancel');updateSelectionBar();
  $('closeSheet').textContent=t('ok');$('folderBackBtn').setAttribute('aria-label',t('backLabel'));$('footerText').textContent=t('footer');
  $('viewerLoading').textContent=t('viewerLoading');
  $('viewerShareBtn').setAttribute('aria-label',t('share'));$('viewerShareBtn').setAttribute('title',t('share'));$('viewerShareLabel').textContent=t('share');
  $('viewerDownloadBtn').setAttribute('aria-label',t('download'));$('viewerDownloadBtn').setAttribute('title',t('download'));$('viewerDownloadLabel').textContent=t('download');
  $('viewerDeleteBtn').setAttribute('aria-label',t('delete'));$('viewerDeleteBtn').setAttribute('title',t('delete'));$('viewerDeleteLabel').textContent=t('delete');
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
function accessKey(){
  const primary=String(lsGet(ACCESS_KEY_STORAGE)||'').trim();
  if(primary){
    if(lsGet(ACCESS_KEY_FALLBACK_STORAGE)!==primary)lsSet(ACCESS_KEY_FALLBACK_STORAGE,primary);
    return primary;
  }
  return String(lsGet(ACCESS_KEY_FALLBACK_STORAGE)||'').trim();
}
function apiReady(){return apiBases().length>0}
async function apiFetch(path,options={}){
  const bases=apiBases();if(!bases.length)throw Object.assign(new Error('API_NOT_CONFIGURED'),{code:'API_NOT_CONFIGURED'});
  const key=accessKey();if(!key)throw Object.assign(new Error('ACCESS_KEY_MISSING'),{code:'ACCESS_KEY_MISSING'});
  let lastError=null;
  for(let i=0;i<bases.length;i++){
    const headers=new Headers(options.headers||{});headers.set('X-Album-Key',key);
    try{
      const res=await fetch(bases[i]+path,{...options,headers,cache:options.cache||'no-store'});
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
async function apiPostJson(path,value){return apiJson(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value),cache:'no-store'})}
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
function dateOf(item){
  if(state.currentFolder?.isRecent)return Date.parse(item.createdTime||item.modifiedTime||item.imageTime||0)||0;
  return Date.parse(item.imageTime||item.createdTime||item.modifiedTime||0)||0;
}
function renderMedia(){
  const rows=sortedMedia();state.media=rows;
  folderCount.textContent=state.currentFolder?.isRecent?t('photosCount',rows.length):[t('foldersCount',state.childFolders.length),t('photosCount',rows.length)].join(' · ');
  if(!rows.length){
    photoGrid.innerHTML=`<div class="empty-state"><div class="empty-icon">📷</div><strong>${escapeHtml(t('photoEmptyTitle'))}</strong><p>${escapeHtml(t('photoEmptyText'))}</p></div>`;return;
  }
  photoGrid.classList.toggle('selection-mode',selectionMode);
  photoGrid.innerHTML=rows.map((m,i)=>`
    <button class="photo-tile${selectedMediaIds.has(String(m.id))?' selected':''}" type="button" data-media-index="${i}" aria-pressed="${selectedMediaIds.has(String(m.id))?'true':'false'}">
      <span class="photo-placeholder">▧</span>
      <img class="photo-thumb" data-file-id="${escapeAttr(m.id)}" data-thumb-version="${escapeAttr(m.thumbVersion||m.modifiedTime||'')}" alt="${escapeAttr(m.name||'')}" decoding="async" />
      <span class="photo-select-mark" aria-hidden="true">✓</span>
      <span class="photo-name">${escapeHtml(m.name||'')}</span>
    </button>`).join('');
  photoGrid.querySelectorAll('[data-media-index]').forEach(btn=>bindPhotoTile(btn,Number(btn.dataset.mediaIndex)));
  updateSelectionBar();
  setupThumbObserver();
}
function bindPhotoTile(btn,index){
  let timer=0,startX=0,startY=0,longPressed=false;
  const clear=()=>{if(timer){clearTimeout(timer);timer=0}};
  btn.addEventListener('pointerdown',e=>{
    if(selectionMode)return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    startX=e.clientX;startY=e.clientY;longPressed=false;
    timer=setTimeout(()=>{
      timer=0;longPressed=true;
      const item=state.media[index];if(!item)return;
      selectionMode=true;selectedMediaIds.clear();selectedMediaIds.add(String(item.id));
      if(navigator.vibrate)try{navigator.vibrate(18)}catch(_){}
      renderMedia();
    },430);
  });
  btn.addEventListener('pointermove',e=>{if(timer&&Math.hypot(e.clientX-startX,e.clientY-startY)>12)clear()});
  btn.addEventListener('pointerup',clear);
  btn.addEventListener('pointercancel',clear);
  btn.addEventListener('contextmenu',e=>{if(selectionMode||longPressed)e.preventDefault()});
  btn.addEventListener('click',e=>{
    if(longPressed){longPressed=false;e.preventDefault();return}
    if(selectionMode){togglePhotoSelection(index);return}
    openViewer(index,true);
  });
}
function updateSelectionBar(){
  const count=selectedMediaIds.size,total=state.media.length;
  $('selectionBar').hidden=!selectionMode;
  $('selectionCount').textContent=t('selectedCount',count);
  $('downloadSelectedBtn').textContent=t('downloadSelected',count);
  $('deleteSelectedBtn').textContent=t('deleteSelected',count);
  $('downloadSelectedBtn').disabled=count===0;
  $('deleteSelectedBtn').disabled=count===0;
  $('selectAllBtn').textContent=count>0&&count===total?t('clearAll'):t('selectAll');
}
function setSelectionMode(enabled){
  selectionMode=!!enabled;
  if(!selectionMode)selectedMediaIds.clear();
  photoGrid.classList.toggle('selection-mode',selectionMode);
  $('selectPhotosBtn').classList.toggle('active',selectionMode);
  renderMedia();
  if(!selectionMode&&pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
}
function togglePhotoSelection(index){
  const item=state.media[index];if(!item)return;
  const id=String(item.id);
  if(selectedMediaIds.has(id))selectedMediaIds.delete(id);else selectedMediaIds.add(id);
  const tile=photoGrid.querySelector(`[data-media-index="${index}"]`);
  if(tile){const selected=selectedMediaIds.has(id);tile.classList.toggle('selected',selected);tile.setAttribute('aria-pressed',selected?'true':'false')}
  updateSelectionBar();
}
function toggleSelectAll(){
  if(selectedMediaIds.size===state.media.length&&state.media.length){selectedMediaIds.clear()}
  else state.media.forEach(x=>selectedMediaIds.add(String(x.id)));
  renderMedia();
}
async function downloadSelectedPhotos(){
  const items=state.media.filter(x=>selectedMediaIds.has(String(x.id)));
  if(!items.length)return openSheet(t('download'),t('selectAtLeastOne'));
  downloadBusy=true;
  openSheet(t('download'),t('downloadPreparing'));$('closeSheet').disabled=true;
  try{
    const files=[];
    for(let i=0;i<items.length;i++){
      const item=items[i];sheetText.textContent=t('savingSelected',i+1,items.length);
      const version=String(item.modifiedTime||'');
      const data=await apiBlob('/api/media?id='+encodeURIComponent(item.id)+(version?'&v='+encodeURIComponent(version):''),{cache:'force-cache'});
      files.push(new File([data.blob],item.name||('photo-'+(i+1)),{type:data.blob.type||item.mimeType||'image/jpeg'}));
    }
    downloadBusy=false;$('closeSheet').disabled=false;closeSheet();
    openPreparedSaveSheet(files);
  }catch(e){
    downloadBusy=false;$('closeSheet').disabled=false;handleApiError(e,t('downloadFailed'));applyPendingAppUpdate();
  }
}
function canShareFiles(files){
  if(typeof navigator.share!=='function')return false;
  if(typeof navigator.canShare!=='function')return true;
  try{return !!navigator.canShare({files})}catch(_){return false}
}
function openPreparedSaveSheet(files){
  preparedSaveActive=true;
  const shareSupported=canShareFiles(files);
  openSheet(t('savePrepared',files.length),'',[],t('cancel'));
  const b=document.createElement('button');b.type='button';b.className='sheet-choice save-files-choice';
  b.innerHTML='<strong>'+escapeHtml(shareSupported?t('saveToPhotos'):t('saveFiles'))+'</strong>';
  b.addEventListener('click',async()=>{
    if(shareSupported){
      try{
        await navigator.share({files,title:t('savePrepared',files.length)});
        closeSheet();setSelectionMode(false);applyPendingAppUpdate();return;
      }catch(e){if(e?.name==='AbortError')return}
    }
    closeSheet();saveFilesByDownload(files);setSelectionMode(false);
    setTimeout(()=>applyPendingAppUpdate(),Math.max(1200,files.length*220+500));
  });
  sheetActions.appendChild(b);
}
function saveFilesByDownload(files){
  files.forEach((file,i)=>setTimeout(()=>{
    const url=URL.createObjectURL(file),a=document.createElement('a');
    a.href=url;a.download=file.name||('photo-'+(i+1));document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  },i*180));
}
function confirmDeleteSelectedPhotos(){
  const count=selectedMediaIds.size;if(!count)return;
  openConfirmSheet(t('deletePhoto'),t('deleteSelectedConfirm',count),()=>deleteSelectedPhotos(),t('confirm'));
}
async function deleteSelectedPhotos(){
  const ids=state.media.map(x=>String(x.id)).filter(id=>selectedMediaIds.has(id));
  if(!ids.length)return;
  deleteBusy=true;let done=0;
  sheetTitle.textContent=t('deleting');sheetActions.innerHTML='';sheetText.textContent=t('deletingSelected',1,ids.length);
  $('closeSheet').hidden=false;$('closeSheet').disabled=true;backdrop.hidden=false;
  try{
    for(const id of ids){
      sheetText.textContent=t('deletingSelected',done+1,ids.length);
      await apiPostJson('/api/media/delete',{id});
      done++;state.media=state.media.filter(x=>String(x.id)!==id);selectedMediaIds.delete(id);
    }
    deleteBusy=false;$('closeSheet').disabled=false;setSelectionMode(false);renderMedia();
    openSheet(t('deleteDone'),t('deleteSelectedDone',done));applyPendingAppUpdate();
  }catch(e){
    deleteBusy=false;$('closeSheet').disabled=false;renderMedia();updateSelectionBar();
    const detail=apiErrorDetail(e);
    openSheet(t('deleteFailed'),t('deleteSelectedFailed',done,ids.length)+(detail?'\n\n'+detail:''));applyPendingAppUpdate();
  }
}
function resetSelection(){selectionMode=false;selectedMediaIds.clear();photoGrid.classList.remove('selection-mode');$('selectionBar').hidden=true;$('selectPhotosBtn').classList.remove('active')}
function setupThumbObserver(){
  if(thumbObserver)thumbObserver.disconnect();
  thumbQueue.length=0;
  thumbObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){thumbObserver.unobserve(entry.target);enqueueThumb(entry.target)}
  }),{rootMargin:'1000px 0px'});
  const imgs=[...photoGrid.querySelectorAll('.photo-thumb')];
  imgs.slice(0,THUMB_EAGER_COUNT).forEach(enqueueThumb);
  imgs.slice(THUMB_EAGER_COUNT).forEach(img=>thumbObserver.observe(img));
}
function enqueueThumb(img){
  if(!img||img.dataset.loaded||img.dataset.queued)return;
  img.dataset.queued='1';thumbQueue.push(img);pumpThumbQueue();
}
function pumpThumbQueue(){
  while(thumbActive<THUMB_CONCURRENCY&&thumbQueue.length){
    const img=thumbQueue.shift();
    if(!img||img.dataset.loaded||!img.isConnected)continue;
    delete img.dataset.queued;
    thumbActive++;
    loadThumb(img).finally(()=>{thumbActive--;pumpThumbQueue()});
  }
}
async function loadThumb(img){
  const id=img.dataset.fileId;if(!id)return;
  const version=String(img.dataset.thumbVersion||''),cacheKey=id+'|'+version;
  const cached=thumbUrlCache.get(cacheKey);
  const applyUrl=url=>{
    if(!img.isConnected)return;
    img.addEventListener('load',()=>{
      const placeholder=img.closest('.photo-tile')?.querySelector('.photo-placeholder');
      if(placeholder)placeholder.remove();
    },{once:true});
    img.src=url;img.classList.add('loaded');img.dataset.loaded='1';
  };
  if(cached){applyUrl(cached);return}
  const path='/api/thumb?id='+encodeURIComponent(id)+(version?'&v='+encodeURIComponent(version):'');
  try{
    const {blob}=await apiBlob(path,{cache:'force-cache'});
    if(!img.isConnected)return;
    const url=URL.createObjectURL(blob);
    thumbUrls.add(url);thumbUrlCache.set(cacheKey,url);applyUrl(url);
  }catch(_){img.alt=''}
}
async function openRecent(pushHistory=true){
  resetSelection();
  state.folderStack=[];
  state.currentFolder={id:'__recent__',name:t('recentTitle'),displayName:t('recentTitle'),isRecent:true};
  state.childFolders=[];state.media=[];homeView.hidden=true;folderView.hidden=false;
  folderTitle.textContent=t('recentTitle');folderSubtitle.textContent=t('recentSubtitle');folderCount.textContent=t('loadingPhotos');
  $('uploadFolderBtn').hidden=true;$('createSubfolderBtn').hidden=true;$('deleteFolderBtn').hidden=true;
  subfolderList.innerHTML='';photoGrid.innerHTML='<div class="loading-line"></div>';
  if(pushHistory)pushAlbumHistory('recent');window.scrollTo({top:0,behavior:'smooth'});
  try{
    const data=await apiJson('/api/recent?limit=120');
    state.media=Array.isArray(data.media)?data.media:[];
    if(!state.media.length){
      photoGrid.innerHTML=`<div class="empty-state"><div class="empty-icon">◷</div><strong>${escapeHtml(t('recentEmpty'))}</strong></div>`;
      folderCount.textContent=t('photosCount',0);
    }else renderMedia();
    state.lastRefresh=Date.now();
  }catch(e){
    state.media=[];photoGrid.innerHTML=`<div class="empty-state"><div class="empty-icon">⚠️</div><strong>${escapeHtml(t('loadFailed'))}</strong></div>`;handleApiError(e,t('loadFailed'));
  }
}
async function openFolderById(id,push=true){
  resetSelection();
  const rootItem=state.folders.find(x=>String(x.id)===String(id));
  if(rootItem&&push)state.folderStack=[];
  const folder=rootItem||state.childFolders.find(x=>String(x.id)===String(id))||{id,name:''};
  if(push&&state.currentFolder)state.folderStack.push(state.currentFolder);
  state.currentFolder=folder;homeView.hidden=true;folderView.hidden=false;
  $('uploadFolderBtn').hidden=false;$('createSubfolderBtn').hidden=false;$('deleteFolderBtn').hidden=false;
  folderTitle.textContent=displayName(folder)||t('loadingPhotos');folderSubtitle.textContent=t('folderSubtitle');folderCount.textContent=t('loadingPhotos');
  subfolderList.innerHTML='';photoGrid.innerHTML='<div class="loading-line"></div>';if(push)pushAlbumHistory('folder',id);window.scrollTo({top:0,behavior:'smooth'});
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
  if(history.state?.[ALBUM_HISTORY_KEY]&&history.state.view!=='home'){history.back();return}
  showAlbumHome();
}
async function refreshCurrent(){
  if(state.currentFolder?.isRecent)return openRecent(false);
  if(state.currentFolder)return openFolderById(state.currentFolder.id,false);
  return loadFolders(false);
}
function updateSortLabel(){$('sortBtn').textContent=state.sort==='oldest'?t('sortOldest'):state.sort==='name'?t('sortName'):t('sortNewest')}
function cycleSort(){state.sort=state.sort==='newest'?'oldest':state.sort==='oldest'?'name':'newest';updateSortLabel();renderMedia()}
function openSheet(title,text,choices=[],closeLabel=t('ok')){
  sheetTitle.textContent=title;sheetText.textContent=text||'';sheetActions.innerHTML='';$('closeSheet').hidden=false;$('closeSheet').textContent=closeLabel;$('closeSheet').disabled=false;
  for(const c of choices){
    const b=document.createElement('button');b.type='button';b.className='sheet-choice'+(c.danger?' danger':'');b.innerHTML=`<strong>${escapeHtml(c.label)}</strong>${c.note?`<small>${escapeHtml(c.note)}</small>`:''}`;b.addEventListener('click',()=>{closeSheet();c.onClick?.()});sheetActions.appendChild(b);
  }
  backdrop.hidden=false;
}
function openConfirmSheet(title,text,onConfirm,confirmLabel=t('confirm')){
  sheetTitle.textContent=title;sheetText.textContent=text||'';sheetActions.innerHTML='';$('closeSheet').hidden=true;$('closeSheet').disabled=false;
  const row=document.createElement('div');row.className='sheet-confirm-actions';
  const cancel=document.createElement('button');cancel.type='button';cancel.className='sheet-confirm-cancel';cancel.textContent=t('cancel');
  const ok=document.createElement('button');ok.type='button';ok.className='sheet-confirm-ok';ok.textContent=confirmLabel;
  cancel.addEventListener('click',closeSheet);ok.addEventListener('click',()=>{closeSheet();onConfirm?.()});
  row.append(cancel,ok);sheetActions.appendChild(row);backdrop.hidden=false;
}
function closeSheet(){
  if(uploadBusy||downloadBusy||deleteBusy)return;
  const wasPrepared=preparedSaveActive;
  preparedSaveActive=false;backdrop.hidden=true;sheetActions.innerHTML='';$('closeSheet').hidden=false;$('closeSheet').disabled=false;$('closeSheet').textContent=t('ok');
  if(!wasPrepared&&pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
}
function apiErrorDetail(e){
  const parts=[];
  if(e?.status)parts.push('HTTP '+e.status);
  const raw=String(e?.body||'').trim();
  if(raw){
    try{
      const data=JSON.parse(raw);
      if(data?.error)parts.push(String(data.error));
    }catch(_){
      parts.push(raw.slice(0,160));
    }
  }else if(e?.message&&!/^HTTP_\d+$/.test(String(e.message))){
    parts.push(String(e.message).slice(0,160));
  }
  return parts.join(' · ');
}
function handleApiError(e,fallback){
  if(e?.code==='API_NOT_CONFIGURED')return openSheet(t('ready'),t('apiMissing'));
  if(e?.code==='ACCESS_KEY_MISSING'||e?.status===401||e?.status===403)return openSheet(t('ready'),t('authMissing'));
  const detail=apiErrorDetail(e);
  openSheet(t('ready'),(fallback||t('loadFailed'))+(detail?'\n\n'+detail:''));
}
function handleUploadError(e,fileName=''){
  if(e?.code==='API_NOT_CONFIGURED')return openSheet(t('ready'),t('apiMissing'));
  if(e?.code==='ACCESS_KEY_MISSING'||e?.status===401)return openSheet(t('ready'),t('authMissing'));
  const detail=apiErrorDetail(e);
  const label=t('uploadFailed')+(fileName?' · '+fileName:'');
  openSheet(t('ready'),label+(detail?'\n\n'+detail:''));
}
function showUploadProgress(file,index,total,filePercent,overallPercent,saving=false){
  sheetTitle.textContent=saving?t('uploadSaving'):t('uploadingTitle');
  sheetText.textContent=`${t('uploadCount',index,total)} · ${file.name}`;
  sheetActions.innerHTML=`<div class="upload-progress-wrap">
    <div class="upload-progress-row"><strong>${escapeHtml(saving?t('uploadSaving'):t('uploadCurrent',filePercent))}</strong><span>${filePercent}%</span></div>
    <div class="upload-progress-track"><span style="width:${filePercent}%"></span></div>
    <div class="upload-progress-row overall"><strong>${escapeHtml(t('uploadOverall',overallPercent))}</strong><span>${overallPercent}%</span></div>
    <div class="upload-progress-track overall"><span style="width:${overallPercent}%"></span></div>
  </div>`;
  $('closeSheet').textContent=t('uploading');$('closeSheet').disabled=true;backdrop.hidden=false;
}
function openCreateFolderSheet(parentId){
  openSheet(t('createFolder'),'',[],t('cancel'));
  sheetActions.innerHTML=`<label class="sheet-input-label">${escapeHtml(t('folderName'))}<input id="folderNameInput" class="sheet-input" type="text" maxlength="100" placeholder="${escapeAttr(t('folderNamePlaceholder'))}" autocomplete="off"></label><button id="createFolderConfirmBtn" class="primary" type="button">${escapeHtml(t('createFolder'))}</button>`;
  const input=$('folderNameInput'),button=$('createFolderConfirmBtn');
  const submit=async()=>{
    const name=String(input.value||'').trim();if(!name){input.focus();return}
    button.disabled=true;
    try{
      await apiPostJson('/api/folders',{parentId:parentId||'',name});
      closeSheet();
      if(state.currentFolder&&!state.currentFolder.isRecent)await openFolderById(state.currentFolder.id,false);else await loadFolders(false);
    }catch(e){
      button.disabled=false;
      const detail=apiErrorDetail(e);
      const msg=e?.status===409?t('folderExists'):t('folderCreateFailed');
      sheetText.textContent=msg+(detail?' · '+detail:'');
    }
  };
  button.addEventListener('click',submit);
  input.addEventListener('keydown',e=>{if(e.key==='Enter')submit()});
  setTimeout(()=>input.focus(),0);
}
function confirmDeleteCurrentFolder(){
  const folder=state.currentFolder;if(!folder||folder.isRecent)return;
  openConfirmSheet(t('deleteFolder'),t('deleteFolderConfirm',displayName(folder)),()=>deleteCurrentFolder(),t('confirm'));
}
async function deleteCurrentFolder(){
  const folder=state.currentFolder;if(!folder||folder.isRecent)return;
  try{
    await apiPostJson('/api/folder/delete',{id:folder.id});
    if(history.state?.[ALBUM_HISTORY_KEY]&&history.state.view==='folder'){
      history.back();
      setTimeout(()=>refreshCurrent(),180);
    }else{
      showAlbumHome();await loadFolders(false);
    }
  }catch(e){handleApiError(e,t('deleteFailed'))}
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
  if(!bases.length)return handleUploadError({code:'API_NOT_CONFIGURED'});
  if(!key)return handleUploadError({code:'ACCESS_KEY_MISSING'});
  uploadBusy=true;let done=0;
  for(let i=0;i<files.length;i++){
    const file=files[i];
    try{
      showUploadProgress(file,i+1,files.length,0,Math.round(done/files.length*100),false);
      await uploadOne(file,folderId,p=>{
        const overall=Math.min(99,Math.round(((done+p/100)/files.length)*100));
        showUploadProgress(file,i+1,files.length,p,overall,false);
      },()=>{
        const overall=Math.min(99,Math.round(((done+0.98)/files.length)*100));
        showUploadProgress(file,i+1,files.length,100,overall,true);
      });
      done++;
    }catch(e){
      uploadBusy=false;$('closeSheet').disabled=false;
      handleUploadError(e,file.name);applyPendingAppUpdate();return;
    }
  }
  uploadBusy=false;
  if(applyPendingAppUpdate())return;
  openSheet(t('uploadDone'),`${done} / ${files.length}`);
  setTimeout(()=>{closeSheet();refreshCurrent()},900);
}
function uploadOne(file,folderId,onProgress,onSaving){
  const bases=apiBases(),key=accessKey();
  return new Promise((resolve,reject)=>{
    const tryAt=i=>{
      if(i>=bases.length)return reject(new Error('UPLOAD_FAILED'));
      const xhr=new XMLHttpRequest();
      xhr.open('POST',bases[i]+'/api/upload?folder='+encodeURIComponent(folderId));
      xhr.setRequestHeader('X-Album-Key',key);
      xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress?.(Math.max(0,Math.min(100,Math.round(e.loaded/e.total*100))))};
      xhr.upload.onload=()=>onSaving?.();
      xhr.onload=()=>{
        if(xhr.status>=200&&xhr.status<300){onProgress?.(100);return resolve(xhr.responseText)}
        if((xhr.status>=500||xhr.status===404)&&i+1<bases.length)return tryAt(i+1);
        const err=new Error('HTTP_'+xhr.status);err.status=xhr.status;err.body=xhr.responseText||'';reject(err);
      };
      xhr.onerror=()=>i+1<bases.length?tryAt(i+1):reject(new Error('NETWORK'));
      const fd=new FormData();fd.append('file',file,file.name);xhr.send(fd);
    };
    tryAt(0);
  });
}
function clamp(value,min,max){return Math.min(max,Math.max(min,value))}
function viewerDistance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function viewerMidpoint(a,b){return{x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
function clampViewerPan(){
  if(viewerScale<=1){
    viewerPanX=0;viewerPanY=0;return;
  }
  const stageW=viewerStage.clientWidth||window.innerWidth;
  const stageH=viewerStage.clientHeight||window.innerHeight;
  const imageW=viewerImage.clientWidth||stageW;
  const imageH=viewerImage.clientHeight||stageH;
  const maxX=Math.max(0,(imageW*viewerScale-stageW)/2);
  const maxY=Math.max(0,(imageH*viewerScale-stageH)/2);
  viewerPanX=clamp(viewerPanX,-maxX,maxX);
  viewerPanY=clamp(viewerPanY,-maxY,maxY);
}
function applyViewerTransform(){
  clampViewerPan();
  viewerImage.style.transform=`translate3d(${viewerPanX}px,${viewerPanY}px,0) scale(${viewerScale})`;
  viewerImage.classList.toggle('is-zoomed',viewerScale>1.01);
}
function resetViewerZoom(){
  viewerScale=1;viewerPanX=0;viewerPanY=0;viewerPointers.clear();
  gestureStartDistance=0;gestureStartScale=1;
  viewerImage.style.transform='translate3d(0,0,0) scale(1)';
  viewerImage.classList.remove('is-zoomed');
}
function startSinglePointerGesture(point){
  gestureStartPointerX=point.x;
  gestureStartPointerY=point.y;
  gestureStartPanX=viewerPanX;
  gestureStartPanY=viewerPanY;
}
function startPinchGesture(){
  const pts=[...viewerPointers.values()].slice(0,2);
  if(pts.length<2)return;
  const mid=viewerMidpoint(pts[0],pts[1]);
  gestureStartDistance=Math.max(1,viewerDistance(pts[0],pts[1]));
  gestureStartScale=viewerScale;
  gestureStartMidX=mid.x;
  gestureStartMidY=mid.y;
  gestureStartPanX=viewerPanX;
  gestureStartPanY=viewerPanY;
}
function touchInputAvailable(){return ('ontouchstart' in window)||(navigator.maxTouchPoints||0)>0}
function onViewerPointerDown(e){
  if(viewer.hidden)return;
  if(e.pointerType==='touch'&&touchInputAvailable())return;
  viewerPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{viewerStage.setPointerCapture(e.pointerId)}catch(_){}
  if(viewerPointers.size===1)startSinglePointerGesture({x:e.clientX,y:e.clientY});
  else if(viewerPointers.size===2)startPinchGesture();
}
function onViewerPointerMove(e){
  if(e.pointerType==='touch'&&touchInputAvailable())return;
  if(!viewerPointers.has(e.pointerId))return;
  viewerPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(viewerPointers.size>=2){
    const pts=[...viewerPointers.values()].slice(0,2);
    const mid=viewerMidpoint(pts[0],pts[1]);
    const distance=Math.max(1,viewerDistance(pts[0],pts[1]));
    viewerScale=clamp(gestureStartScale*(distance/gestureStartDistance),1,VIEWER_MAX_SCALE);
    viewerPanX=gestureStartPanX+(mid.x-gestureStartMidX);
    viewerPanY=gestureStartPanY+(mid.y-gestureStartMidY);
    applyViewerTransform();
    e.preventDefault();
    return;
  }
  if(viewerScale>1.01){
    const point=[...viewerPointers.values()][0];
    viewerPanX=gestureStartPanX+(point.x-gestureStartPointerX);
    viewerPanY=gestureStartPanY+(point.y-gestureStartPointerY);
    applyViewerTransform();
    e.preventDefault();
  }
}
function onViewerPointerEnd(e){
  if(e.pointerType==='touch'&&touchInputAvailable())return;
  viewerPointers.delete(e.pointerId);
  try{viewerStage.releasePointerCapture(e.pointerId)}catch(_){}
  if(viewerPointers.size===1){
    const point=[...viewerPointers.values()][0];
    startSinglePointerGesture(point);
  }else if(viewerPointers.size===0&&viewerScale<=1.01){
    resetViewerZoom();
  }
}
function touchPoint(touch){return{x:touch.clientX,y:touch.clientY}}
function onViewerTouchStart(e){
  if(viewer.hidden)return;
  if(e.touches.length===1){
    const p=touchPoint(e.touches[0]);startSinglePointerGesture(p);
    viewerSwipeActive=viewerScale<=1.01;viewerSwipeStartX=p.x;viewerSwipeStartY=p.y;viewerSwipeLastX=p.x;viewerSwipeLastY=p.y;viewerSwipeStartedAt=Date.now();
  }else if(e.touches.length>=2){
    viewerSwipeActive=false;
    const a=touchPoint(e.touches[0]),b=touchPoint(e.touches[1]),mid=viewerMidpoint(a,b);
    gestureStartDistance=Math.max(1,viewerDistance(a,b));
    gestureStartScale=viewerScale;
    gestureStartMidX=mid.x;gestureStartMidY=mid.y;
    gestureStartPanX=viewerPanX;gestureStartPanY=viewerPanY;
  }
  e.preventDefault();
}
function onViewerTouchMove(e){
  if(viewer.hidden)return;
  if(e.touches.length>=2){
    const a=touchPoint(e.touches[0]),b=touchPoint(e.touches[1]),mid=viewerMidpoint(a,b);
    const distance=Math.max(1,viewerDistance(a,b));
    viewerScale=clamp(gestureStartScale*(distance/Math.max(1,gestureStartDistance)),1,VIEWER_MAX_SCALE);
    viewerPanX=gestureStartPanX+(mid.x-gestureStartMidX);
    viewerPanY=gestureStartPanY+(mid.y-gestureStartMidY);
    applyViewerTransform();
    e.preventDefault();
    return;
  }
  if(e.touches.length===1&&viewerScale>1.01){
    viewerSwipeActive=false;
    const p=touchPoint(e.touches[0]);
    viewerPanX=gestureStartPanX+(p.x-gestureStartPointerX);
    viewerPanY=gestureStartPanY+(p.y-gestureStartPointerY);
    applyViewerTransform();e.preventDefault();return;
  }
  if(e.touches.length===1&&viewerSwipeActive&&viewerScale<=1.01){
    const p=touchPoint(e.touches[0]);viewerSwipeLastX=p.x;viewerSwipeLastY=p.y;e.preventDefault();
  }
}
function onViewerTouchEnd(e){
  if(e.touches.length===1){
    viewerSwipeActive=false;startSinglePointerGesture(touchPoint(e.touches[0]));
  }else if(e.touches.length===0){
    if(viewerSwipeActive&&viewerScale<=1.01){
      const dx=viewerSwipeLastX-viewerSwipeStartX,dy=viewerSwipeLastY-viewerSwipeStartY,elapsed=Date.now()-viewerSwipeStartedAt;
      if(elapsed<900&&Math.abs(dx)>=52&&Math.abs(dx)>Math.abs(dy)*1.15)moveViewer(dx<0?1:-1);
    }
    viewerSwipeActive=false;if(viewerScale<=1.01)resetViewerZoom();
  }
  e.preventDefault();
}
async function openViewer(index,pushHistory=true){
  const rows=state.media;if(!rows[index])return;
  resetViewerZoom();
  state.viewerIndex=index;viewer.hidden=false;body.classList.add('viewer-open');
  if(pushHistory)history.pushState(albumHistoryState('viewer',String(rows[index].id||'')),'',location.href);
  await renderViewer();
}
function loadedThumbUrl(fileId){
  const id=String(fileId||'');
  const img=[...photoGrid.querySelectorAll('.photo-thumb')].find(x=>x.dataset.fileId===id&&x.dataset.loaded==='1'&&x.src);
  return img?.src||'';
}
async function renderViewer(){
  const item=state.media[state.viewerIndex];if(!item)return closeViewer();
  resetViewerZoom();
  const loadSeq=++viewerLoadSeq;
  releaseViewerBlob();
  viewerName.textContent=item.name||'';
  viewerCounter.textContent=`${state.viewerIndex+1} / ${state.media.length}`;
  viewerImage.alt=item.name||'';

  const previewUrl=loadedThumbUrl(item.id);
  if(previewUrl){
    viewerImage.src=previewUrl;
    viewerLoading.hidden=true;
  }else{
    viewerImage.removeAttribute('src');
    viewerLoading.textContent=t('viewerLoading');
    viewerLoading.hidden=false;
  }

  try{
    const version=String(item.modifiedTime||'');
    const data=await apiBlob('/api/media?id='+encodeURIComponent(item.id)+(version?'&v='+encodeURIComponent(version):''),{cache:'force-cache'});
    if(loadSeq!==viewerLoadSeq||viewer.hidden||state.media[state.viewerIndex]?.id!==item.id)return;
    const fullUrl=URL.createObjectURL(data.blob);
    state.viewerBlob=data.blob;
    state.viewerUrl=fullUrl;
    viewerImage.src=fullUrl;
    viewerLoading.hidden=true;
  }catch(e){
    if(loadSeq!==viewerLoadSeq)return;
    if(!previewUrl){
      viewerLoading.textContent=t('loadFailed');
      viewerLoading.hidden=false;
    }
  }
}
function releaseViewerBlob(){if(state.viewerUrl)URL.revokeObjectURL(state.viewerUrl);state.viewerUrl='';state.viewerBlob=null}
function closeViewer(fromHistory=false){
  if(!fromHistory&&history.state?.[ALBUM_HISTORY_KEY]&&history.state.view==='viewer'){history.back();return}
  viewerLoadSeq++;resetViewerZoom();releaseViewerBlob();viewer.hidden=true;body.classList.remove('viewer-open');state.viewerIndex=-1;viewerImage.removeAttribute('src');viewerLoading.textContent=t('viewerLoading');
  if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
}
async function moveViewer(delta){if(!state.media.length)return;state.viewerIndex=(state.viewerIndex+delta+state.media.length)%state.media.length;await renderViewer()}
async function ensureViewerBlob(){if(state.viewerBlob)return state.viewerBlob;const item=state.media[state.viewerIndex];if(!item)return null;const version=String(item.modifiedTime||'');const data=await apiBlob('/api/media?id='+encodeURIComponent(item.id)+(version?'&v='+encodeURIComponent(version):''),{cache:'force-cache'});state.viewerBlob=data.blob;return data.blob}
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
function confirmDeleteCurrentPhoto(){
  const item=state.media[state.viewerIndex];if(!item)return;
  openConfirmSheet(t('deletePhoto'),t('deletePhotoConfirm',item.name||''),()=>deleteCurrentPhoto(item.id),t('confirm'));
}
async function deleteCurrentPhoto(id){
  try{
    await apiPostJson('/api/media/delete',{id});
    const idx=state.media.findIndex(x=>String(x.id)===String(id));
    if(idx>=0)state.media.splice(idx,1);
    if(history.state?.[ALBUM_HISTORY_KEY]&&history.state.view==='viewer')history.back();else closeViewer(true);
    renderMedia();
  }catch(e){handleApiError(e,t('deleteFailed'))}
}
function syncFromHash(){
  if(location.hash==='#recent'){openRecent(false);return}
  if(!location.hash.startsWith('#folder='))return;
  const id=decodeURIComponent(location.hash.slice(8));if(!id||state.currentFolder?.id===id)return;
  openFolderById(id,false);
}
function handleAlbumPopState(e){
  const h=e.state,overlay=String(h?.overlay||'');
  if(overlay==='update'||overlay==='update-preview'){
    if(releaseNoticeOpen())return;
    if(versionInfoCache)showReleaseNotice(versionInfoCache,true,false,overlay==='update-preview'?manualLanguage:uiLang(),overlay==='update-preview');
    return;
  }
  if(releaseNoticeOpen())$('releaseNoticeOverlay').hidden=true;
  if(overlay==='history'){
    $('manualLanguagePicker').classList.remove('show');$('manualLanguagePicker').hidden=true;
    if(!manualOpen())$('unifiedManual').classList.add('show');
    body.classList.add('modal-open');openManualUpdateHistory(manualLanguage,false);return;
  }
  if(updateHistoryOpen())$('manualUpdateHistoryOverlay').hidden=true;
  if(overlay==='manual'){
    $('manualLanguagePicker').classList.remove('show');$('manualLanguagePicker').hidden=true;
    if(!manualOpen())openUnifiedManual(manualLanguage,false);return;
  }
  if(manualOpen())$('unifiedManual').classList.remove('show');
  if(overlay==='manual-picker'){openManualLanguagePicker(false);return}
  if(manualPickerOpen()){$('manualLanguagePicker').classList.remove('show');$('manualLanguagePicker').hidden=true}
  body.classList.remove('modal-open');if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
  if(!h?.[ALBUM_HISTORY_KEY])return;
  const wasViewer=!viewer.hidden;if(wasViewer)closeViewer(true);
  if(h.view==='recent'){if(state.currentFolder?.isRecent){window.scrollTo({top:0,behavior:'smooth'});return}openRecent(false);return}
  if(h.view==='folder'&&h.id){if(String(state.currentFolder?.id||'')===String(h.id)&&!state.currentFolder?.isRecent){window.scrollTo({top:0,behavior:'smooth'});return}openFolderById(h.id,false);return}
  showAlbumHome();
}

$('manualBtn').addEventListener('click',()=>openManualLanguagePicker(true));
$('mainAppBtn').addEventListener('click',returnToMainApp);
$('manualPickerKo').addEventListener('click',()=>chooseManualLanguage('ko'));
$('manualPickerLo').addEventListener('click',()=>chooseManualLanguage('lo'));
$('manualLanguageCancel').addEventListener('click',()=>closeManualLanguagePicker(false));
$('manualCloseBtn').addEventListener('click',()=>closeUnifiedManual(false));
$('manualKoBtn').addEventListener('click',()=>setManualLanguage('ko'));
$('manualLoBtn').addEventListener('click',()=>setManualLanguage('lo'));
$('manualUpdateHistoryClose').addEventListener('click',()=>closeManualUpdateHistory(false));
$('manualUpdateHistoryPreview').addEventListener('click',previewUpdatePopup);
$('releaseNoticeOk').addEventListener('click',()=>closeReleaseNotice(false));
$('themeBtn').addEventListener('click',e=>{body.classList.toggle('light');e.currentTarget.textContent=body.classList.contains('light')?'☀':'☾'});
$('closeSheet').addEventListener('click',closeSheet);$('folderBackBtn').addEventListener('click',closeFolder);$('refreshFoldersBtn').addEventListener('click',()=>loadFolders(true));
$('refreshFolderBtn').addEventListener('click',refreshCurrent);$('uploadHomeBtn').addEventListener('click',chooseUploadFolder);$('recentBtn').addEventListener('click',openRecent);$('createFolderBtn').addEventListener('click',()=>openCreateFolderSheet(''));
$('sortBtn').addEventListener('click',cycleSort);$('uploadFolderBtn').addEventListener('click',()=>state.currentFolder&&!state.currentFolder.isRecent?beginUploadTo(state.currentFolder.id):chooseUploadFolder());$('createSubfolderBtn').addEventListener('click',()=>state.currentFolder&&!state.currentFolder.isRecent&&openCreateFolderSheet(state.currentFolder.id));$('deleteFolderBtn').addEventListener('click',confirmDeleteCurrentFolder);$('selectPhotosBtn').addEventListener('click',()=>setSelectionMode(!selectionMode));$('selectAllBtn').addEventListener('click',toggleSelectAll);$('cancelSelectionBtn').addEventListener('click',()=>setSelectionMode(false));$('downloadSelectedBtn').addEventListener('click',downloadSelectedPhotos);$('deleteSelectedBtn').addEventListener('click',confirmDeleteSelectedPhotos);photoInput.addEventListener('change',uploadSelectedFiles);
$('viewerCloseBtn').addEventListener('click',closeViewer);$('viewerPrevBtn').addEventListener('click',()=>moveViewer(-1));$('viewerNextBtn').addEventListener('click',()=>moveViewer(1));$('viewerDownloadBtn').addEventListener('click',downloadCurrent);$('viewerShareBtn').addEventListener('click',shareCurrent);$('viewerDeleteBtn').addEventListener('click',confirmDeleteCurrentPhoto);
viewerStage.addEventListener('pointerdown',onViewerPointerDown,{passive:false});
viewerStage.addEventListener('pointermove',onViewerPointerMove,{passive:false});
viewerStage.addEventListener('pointerup',onViewerPointerEnd,{passive:false});
viewerStage.addEventListener('pointercancel',onViewerPointerEnd,{passive:false});
viewerStage.addEventListener('touchstart',onViewerTouchStart,{passive:false});
viewerStage.addEventListener('touchmove',onViewerTouchMove,{passive:false});
viewerStage.addEventListener('touchend',onViewerTouchEnd,{passive:false});
viewerStage.addEventListener('touchcancel',onViewerTouchEnd,{passive:false});
// iOS Safari can still emit its native gesture events even when Pointer Events are used.
// Prevent only inside the photo stage so pinch/pan stays owned by the album viewer.
for(const type of ['gesturestart','gesturechange','gestureend']){
  viewerStage.addEventListener(type,e=>e.preventDefault(),{passive:false});
}
window.addEventListener('resize',()=>{if(!viewer.hidden)applyViewerTransform()});
window.addEventListener('popstate',handleAlbumPopState);
backdrop.addEventListener('click',e=>{if(e.target===backdrop&&!uploadBusy&&!downloadBusy&&!deleteBusy)closeSheet()});
$('manualLanguagePicker').addEventListener('click',e=>{if(e.target===$('manualLanguagePicker'))closeManualLanguagePicker(false)});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(releaseNoticeOpen()){closeReleaseNotice(false);return}
    if(updateHistoryOpen()){closeManualUpdateHistory(false);return}
    if(manualOpen()){closeUnifiedManual(false);return}
    if(manualPickerOpen()){closeManualLanguagePicker(false);return}
    if(!viewer.hidden){closeViewer();return}
  }
  if(viewer.hidden)return;
  if(e.key==='ArrowLeft')moveViewer(-1);if(e.key==='ArrowRight')moveViewer(1);
});
window.addEventListener('storage',e=>{if(routeCandidates.some(c=>e.key===c.modeKey||e.key===c.statsKey)){renderSharedRoute();refreshCurrent()}});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')return;
  checkForAppUpdate(true).then(updated=>{if(!updated&&Date.now()-state.lastRefresh>AUTO_REFRESH_MS)refreshCurrent()});
});
window.addEventListener('focus',()=>checkForAppUpdate(false));
setInterval(()=>{if(document.visibilityState==='visible')checkForAppUpdate(false)},UPDATE_CHECK_INTERVAL_MS);
window.addEventListener('beforeunload',()=>{for(const url of thumbUrls)URL.revokeObjectURL(url);thumbUrls.clear();thumbUrlCache.clear()});

applyLanguage();renderSharedRoute();normalizeModeInUrl();initAlbumHistory();loadFolders(false);
setTimeout(async()=>{const updating=await checkForAppUpdate(true);if(!updating)showUpdatePopupIfNeeded(false)},1200);
