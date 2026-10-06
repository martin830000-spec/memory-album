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
    trash:'Google 휴지통',trashHint:'삭제한 사진·폴더 복구',trashTitle:'Google 휴지통',trashSubtitle:'사진첩에서 삭제한 사진과 폴더를 복구할 수 있습니다.',trashEmpty:'복구할 항목이 없습니다.',trashLoading:'휴지통 불러오는 중…',restore:'복구',restoring:'복구 중…',restoreDone:'복구했습니다.',restoreFailed:'복구하지 못했습니다.',trashPhoto:'사진',trashFolder:'폴더',trashRefresh:'↻ 새로고침',
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
    trash:'ຖັງຂີ້ເຫຍື້ອ Google',trashHint:'ກູ້ຮູບ ແລະ ໂຟນເດີທີ່ລຶບ',trashTitle:'ຖັງຂີ້ເຫຍື້ອ Google',trashSubtitle:'ສາມາດກູ້ຮູບ ແລະ ໂຟນເດີທີ່ລຶບຈາກອະລະບໍ້າໄດ້.',trashEmpty:'ບໍ່ມີລາຍການໃຫ້ກູ້ຄືນ.',trashLoading:'ກຳລັງໂຫຼດຖັງຂີ້ເຫຍື້ອ…',restore:'ກູ້ຄືນ',restoring:'ກຳລັງກູ້ຄືນ…',restoreDone:'ກູ້ຄືນແລ້ວ.',restoreFailed:'ກູ້ຄືນບໍ່ສຳເລັດ.',trashPhoto:'ຮູບ',trashFolder:'ໂຟນເດີ',trashRefresh:'↻ ໂຫຼດໃໝ່',
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
  trash:[],
  sort:'newest',
  viewerIndex:-1,
  viewerBlob:null,
  viewerBlobKey:'',
  viewerUrl:'',
  lastRefresh:0
};
let thumbObserver=null;
let trashThumbObserver=null;
const thumbQueue=[];
const trashThumbQueue=[];
const thumbUrls=new Set();
const thumbUrlCache=new Map();
const previewUrlCache=new Map();
const previewInflight=new Map();
const PREVIEW_CACHE_LIMIT=8;
const THUMB_CACHE_LIMIT=220;
let thumbActive=0;
let trashThumbActive=0;
let rootLoadSeq=0;
let contentLoadSeq=0;
let trashLoadSeq=0;
let viewerLoadSeq=0;
let viewerOriginalController=null;
let viewerOriginalKey='';
let viewerOriginalPromise=null;
let neighborPrefetchTimer=0;
let uploadBusy=false;
let downloadBusy=false;
let deleteBusy=false;
let trashBusy=false;
let preparedSaveActive=false;
let pendingAppUpdate=false;
let lastUpdateCheck=0;
let versionInfoCache=null;
let manualTab='guide';
let manualLanguage=uiLang();
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
  contentLoadSeq++;
  resetSelection();
  state.currentFolder=null;state.folderStack=[];state.childFolders=[];state.media=[];
  folderView.hidden=true;homeView.hidden=false;window.scrollTo({top:0,behavior:'smooth'});
}
function manualPickerOpen(){return $('manualLanguagePicker').classList.contains('show')}
function manualOpen(){return $('unifiedManual').classList.contains('show')}
function updateHistoryOpen(){return !$('manualUpdateHistoryOverlay').hidden}
function releaseNoticeOpen(){return !$('releaseNoticeOverlay').hidden}
function trashOpen(){return !$('trashOverlay').hidden}
function appBusyForUpdate(){
  return uploadBusy||downloadBusy||deleteBusy||trashBusy||preparedSaveActive||selectionMode||!viewer.hidden||!backdrop.hidden||manualPickerOpen()||manualOpen()||updateHistoryOpen()||releaseNoticeOpen()||trashOpen();
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
  const ko={
    heroBanner:'🇰🇷 한국어 사용 가이드',
    title:'💑 우리의 추억사진첩',
    lead:'처음 쓰는 사람도 화면만 보고 바로 사용할 수 있도록 실제 사진첩 화면과 같은 구성으로 단계별로 설명합니다.',
    update:'🆕 업데이트 내역',
    quickTitle:'가장 많이 쓰는 5가지',
    quick:[
      ['📁','앨범 열기','메인 화면에서 원하는 폴더를 누릅니다.'],
      ['🔎','사진 보기','사진을 한 번 누르면 원본 보기 화면이 열립니다.'],
      ['☑️','여러 장 선택','사진 한 장을 길게 누른 뒤 다른 사진을 계속 선택합니다.'],
      ['💾','저장·공유','원본 화면 또는 선택모드에서 저장·공유합니다.'],
      ['🗑️','삭제 복구','메인 화면의 Google 휴지통에서 삭제한 사진·폴더를 복구합니다.']
    ],
    sections:[
      {
        kind:'home',num:'01',kicker:'처음 화면',title:'메인 화면에서 원하는 작업 시작하기',
        desc:'사진첩을 열면 업로드, 최근 사진, 새 폴더와 앨범 목록이 한 화면에 보입니다.',
        steps:[
          ['업로드','사진을 새로 올릴 때 사용합니다. 메인 화면에서 올리면 저장할 폴더를 고르게 됩니다.'],
          ['최근 사진','폴더가 달라도 최근 추가된 사진만 모아서 빠르게 확인합니다.'],
          ['새 폴더','새 앨범이나 하위 폴더를 만들 때 사용합니다.'],
          ['Google 휴지통','사진첩에서 삭제한 사진이나 폴더를 확인하고 바로 복구합니다.'],
          ['앨범 열기','아래 앨범 목록에서 원하는 폴더를 누르면 사진 목록으로 들어갑니다.']
        ],
        note:'상단의 “본앱”은 번역앱으로 돌아가는 버튼입니다. “설명서”는 지금 보고 있는 이 가이드를 엽니다.'
      },
      {
        kind:'folder',num:'02',kicker:'폴더 화면',title:'사진 목록 보기 · 정렬 · 폴더 관리',
        desc:'폴더 안에서는 사진을 보거나, 업로드하거나, 새 하위 폴더를 만들고 여러 장 선택을 시작할 수 있습니다.',
        steps:[
          ['사진 열기','썸네일을 한 번 누르면 원본 사진 화면이 열립니다.'],
          ['최신순/오래된순','정렬 버튼으로 사진 순서를 바꿉니다.'],
          ['사진 선택','버튼을 누르거나 사진 한 장을 길게 눌러 여러 장 선택모드로 들어갑니다.'],
          ['폴더 삭제','삭제를 누른 뒤 반드시 확인을 한 번 더 눌러야 실제 삭제됩니다.']
        ],
        note:'폴더 삭제는 영구 삭제가 아닙니다. 메인 화면의 “Google 휴지통”에서 삭제한 폴더나 사진을 바로 복구할 수 있습니다.'
      },
      {
        kind:'select',num:'03',kicker:'삼성 갤러리처럼',title:'길게 눌러 여러 장 선택하기',
        desc:'사진 한 장을 약 0.4초 길게 누르면 선택모드가 시작됩니다. 그 다음부터는 원하는 사진을 짧게 눌러 추가·해제하면 됩니다.',
        steps:[
          ['길게 누르기','첫 사진을 길게 눌러 선택모드를 시작합니다. 선택된 사진에는 체크 표시가 생깁니다.'],
          ['추가 선택','다른 사진을 짧게 눌러 여러 장을 선택하거나 다시 눌러 해제합니다.'],
          ['전체 선택','현재 폴더에 보이는 사진을 한 번에 선택하거나 모두 해제합니다.'],
          ['저장 또는 삭제','선택한 사진을 여러 장 저장하거나, 확인창을 거쳐 한 번에 삭제합니다.']
        ],
        note:'사진이 아주 많을 때는 한 번에 너무 많이 저장하기보다 여러 번 나눠 저장하면 iPhone Safari와 Android Chrome에서 더 안정적입니다.'
      },
      {
        kind:'viewer',num:'04',kicker:'원본 사진 보기',title:'좌우 스와이프 · 확대 · 이동 · 공유',
        desc:'원본 보기 화면에서는 사진 감상과 확대, 다음/이전 사진 이동, 공유·다운로드·삭제를 모두 할 수 있습니다.',
        steps:[
          ['좌우 스와이프','확대하지 않은 상태에서 왼쪽으로 밀면 다음 사진, 오른쪽으로 밀면 이전 사진으로 이동합니다.'],
          ['두 손가락 확대','두 손가락을 벌리거나 모아서 확대·축소합니다.'],
          ['확대한 사진 이동','확대한 뒤에는 손가락 한 개로 좌우·상하 원하는 위치를 볼 수 있습니다.'],
          ['공유·다운로드','상단 아이콘을 이용해 현재 원본 사진을 공유하거나 기기에 저장합니다.']
        ],
        note:'처음 열 때 작은 썸네일이 먼저 보였다가 2048px 고화질 프리뷰, 원본 순으로 바뀝니다. 다음·이전 사진은 미리 불러와 더 빨리 선명해집니다.'
      },
      {
        kind:'upload',num:'05',kicker:'사진 추가',title:'여러 사진 한 번에 업로드하기',
        desc:'한 장씩 올릴 필요 없이 휴대폰 사진 선택 화면에서 여러 사진을 한 번에 선택할 수 있습니다.',
        steps:[
          ['사진 선택','＋ 업로드를 누르고 휴대폰에서 올릴 사진들을 선택합니다.'],
          ['현재 사진 진행률','지금 전송 중인 사진이 몇 %인지 표시합니다.'],
          ['전체 진행률','선택한 사진 전체 중 몇 장이 끝났는지 따로 표시합니다.'],
          ['Drive 저장 완료','전송 뒤 “Google Drive에 저장 중” 단계가 끝나면 폴더 목록이 자동 갱신됩니다.']
        ],
        note:'업로드 중에는 자동 업데이트가 끼어들지 않습니다. 모든 업로드가 끝난 뒤 새 버전이 있으면 안전하게 적용됩니다.'
      },
      {
        kind:'delete',num:'06',kicker:'실수 방지',title:'사진·폴더 삭제하기',
        desc:'단일 사진, 여러 장의 사진, 폴더 모두 바로 지워지지 않고 확인 단계를 한 번 더 거칩니다.',
        steps:[
          ['삭제 누르기','원본 사진의 삭제 버튼, 선택모드의 N장 삭제, 폴더 화면의 폴더 삭제 중 필요한 기능을 누릅니다.'],
          ['내용 확인','삭제 대상과 Google Drive 휴지통으로 이동한다는 안내를 확인합니다.'],
          ['확인 누르기','“확인”을 눌러야 실제 삭제됩니다. “취소”를 누르면 아무 변화가 없습니다.'],
          ['목록 반영','삭제가 끝나면 현재 사진 목록에서 해당 항목이 사라집니다.']
        ],
        note:'삭제된 항목은 영구삭제되지 않고 Google Drive 휴지통으로 이동합니다.'
      },
      {
        kind:'trash',num:'07',kicker:'새 기능 · Google Drive',title:'Google 휴지통에서 사진·폴더 복구하기',
        desc:'메인 화면의 “Google 휴지통”을 누르면 사진첩에서 삭제한 사진과 폴더만 모아서 확인하고 바로 복구할 수 있습니다.',
        steps:[
          ['Google 휴지통 열기','메인 화면의 작업 버튼 중 “Google 휴지통”을 누릅니다.'],
          ['복구할 항목 찾기','사진은 썸네일과 파일명, 폴더는 폴더 아이콘과 이름으로 구분합니다. 삭제 시각도 함께 표시됩니다.'],
          ['복구 누르기','원하는 항목 오른쪽의 “복구”를 누르면 원래 있던 Google Drive 위치로 되돌아갑니다.'],
          ['목록 다시 확인','복구가 끝나면 휴지통 목록에서 사라지고 앨범 목록과 사진 목록을 다시 불러옵니다.']
        ],
        note:'사진첩과 관련된 삭제 항목만 보여주도록 제한되어 있어 Google Drive의 다른 개인 파일은 섞이지 않습니다.'
      }
    ],
    extraTitle:'알아두면 편한 기능',
    extras:[
      ['📥 한 장 저장','원본 사진 화면의 다운로드 버튼을 누르면 현재 사진 한 장이 원본 파일로 저장됩니다.'],
      ['📦 여러 장 저장','선택모드에서 “N장 저장”을 누르면 원본을 준비한 뒤 휴대폰의 저장/공유 화면을 엽니다.'],
      ['↩️ 휴대폰 뒤로가기','원본 사진 → 현재 폴더 → 사진첩 홈 순서로 자연스럽게 돌아갑니다.'],
      ['🔄 자동 업데이트','새 버전이 있으면 사용 중인 작업을 방해하지 않고 안전한 시점에 자동 적용합니다.'],
      ['🔔 업데이트 팝업','새 버전의 주요 변경점을 한 번 알려주며, 업데이트 내역의 🔔 버튼으로 바로 위에 팝업을 다시 띄울 수 있습니다. 팝업을 닫으면 업데이트 내역으로 돌아옵니다.'],
      ['🌐 설명서 언어','남편앱에서 들어오면 한국어 설명서, 아내앱에서 들어오면 라오어 설명서가 바로 열립니다. 설명서 상단에서 언제든 언어를 바꿀 수 있습니다.'],
      ['🌓 화면 테마','오른쪽 위 달/해 버튼으로 어두운 화면과 밝은 화면을 바꿀 수 있습니다.']
    ],
    faqTitle:'문제가 생겼을 때',
    faq:[
      ['사진이 처음에 조금 흐려요','640px 썸네일 → 2048px 고화질 프리뷰 → 원본 순으로 빠르게 교체합니다. 현재 사진을 누르는 순간 프리뷰를 요청하고 이전·다음 사진도 미리 준비합니다.'],
      ['삭제한 사진을 되돌리고 싶어요','사진첩 메인 화면의 “Google 휴지통”을 열고 해당 사진이나 폴더 옆의 “복구” 버튼을 누르면 됩니다.'],
      ['공유한 사진이 조금 흐려졌어요','사진첩은 원본 파일을 공유하지만 카카오톡·Messenger 등이 전송하면서 자체 압축할 수 있습니다.'],
      ['업데이트 중 화면이 갑자기 바뀔까 걱정돼요','사진 보기·선택·업로드·저장·삭제·설명서 사용 중에는 자동 새로고침을 미룹니다.']
    ],
    tip:'설명서를 보다가 언제든 상단의 “← 사진첩으로”를 누르면 원래 보던 사진첩 화면으로 돌아갑니다.',
    footer:'이 설명서는 사진첩 기능과 함께 관리되며 기능이 바뀌면 업데이트 내역과 함께 갱신됩니다.'
  };
  const lo={
    heroBanner:'🇱🇦 ຄູ່ມືພາສາລາວ',
    title:'💑 ອະລະບໍ້າຄວາມຊົງຈຳຂອງເຮົາ',
    lead:'ຄູ່ມືນີ້ອະທິບາຍແບບຂັ້ນຕອນ ພ້ອມຮູບໜ້າຈໍທີ່ຄ້າຍແອັບຈິງ ເພື່ອໃຫ້ຜູ້ໃຊ້ໃໝ່ເຮັດຕາມໄດ້ງ່າຍ.',
    update:'🆕 ປະຫວັດອັບເດດ',
    quickTitle:'5 ຢ່າງທີ່ໃຊ້ບ່ອຍ',
    quick:[
      ['📁','ເປີດອະລະບໍ້າ','ແຕະໂຟນເດີທີ່ຕ້ອງການຈາກໜ້າຫຼັກ.'],
      ['🔎','ເບິ່ງຮູບ','ແຕະຮູບໜຶ່ງຄັ້ງເພື່ອເປີດຮູບຕົ້ນສະບັບ.'],
      ['☑️','ເລືອກຫຼາຍຮູບ','ກົດຄ້າງຮູບໜຶ່ງ ແລ້ວແຕະຮູບອື່ນຕໍ່.'],
      ['💾','ບັນທຶກ·ແບ່ງປັນ','ບັນທຶກ ຫຼື ແບ່ງປັນຈາກໜ້າຮູບ ຫຼື ໂໝດເລືອກ.'],
      ['🗑️','ກູ້ຄືນລາຍການທີ່ລຶບ','ເຂົ້າ Google Trash ຈາກໜ້າຫຼັກເພື່ອກູ້ຮູບ/ໂຟນເດີ.']
    ],
    sections:[
      {kind:'home',num:'01',kicker:'ໜ້າແລກ',title:'ເລີ່ມວຽກຈາກໜ້າຫຼັກ',desc:'ໜ້າຫຼັກສະແດງ ອັບໂຫຼດ, ຮູບຫຼ້າສຸດ, ສ້າງໂຟນເດີ ແລະ ລາຍການອະລະບໍ້າ.',steps:[['ອັບໂຫຼດ','ໃຊ້ເມື່ອຈະເພີ່ມຮູບໃໝ່. ຖ້າອັບຈາກໜ້າຫຼັກ ຈະໃຫ້ເລືອກໂຟນເດີກ່ອນ.'],['ຮູບຫຼ້າສຸດ','ເບິ່ງຮູບທີ່ເພີ່ມໃໝ່ຈາກທຸກໂຟນເດີ.'],['ໂຟນເດີໃໝ່','ສ້າງອະລະບໍ້າ ຫຼື ໂຟນເດີຍ່ອຍໃໝ່.'],['ຖັງຂີ້ເຫຍື້ອ Google','ເບິ່ງ ແລະ ກູ້ຮູບ/ໂຟນເດີທີ່ລຶບຈາກອະລະບໍ້າ.'],['ເປີດອະລະບໍ້າ','ແຕະໂຟນເດີໃນລາຍການດ້ານລຸ່ມເພື່ອເຂົ້າເບິ່ງຮູບ.']],note:'ປຸ່ມ “ແອັບຫຼັກ” ໃຊ້ກັບໄປແອັບແປພາສາ. “ຄູ່ມື” ເປີດໜ້າອະທິບາຍນີ້.'},
      {kind:'folder',num:'02',kicker:'ໜ້າໂຟນເດີ',title:'ເບິ່ງຮູບ · ຈັດລຽງ · ຈັດການໂຟນເດີ',desc:'ພາຍໃນໂຟນເດີສາມາດເບິ່ງຮູບ, ອັບໂຫຼດ, ສ້າງໂຟນເດີຍ່ອຍ ແລະ ເລືອກຫຼາຍຮູບ.',steps:[['ເປີດຮູບ','ແຕະຮູບຕົວຢ່າງໜຶ່ງຄັ້ງ.'],['ຈັດລຽງ','ປ່ຽນລຳດັບຈາກໃໝ່ສຸດ/ເກົ່າສຸດ.'],['ເລືອກຮູບ','ກົດປຸ່ມ ຫຼື ກົດຄ້າງຮູບໜຶ່ງເພື່ອເຂົ້າໂໝດເລືອກ.'],['ລຶບໂຟນເດີ','ຕ້ອງກົດຢືນຢັນອີກໜຶ່ງຄັ້ງກ່ອນລຶບ.']],note:'ໂຟນເດີທີ່ລຶບສາມາດກູ້ຄືນໄດ້ຈາກ “ຖັງຂີ້ເຫຍື້ອ Google” ໃນໜ້າຫຼັກ.'},
      {kind:'select',num:'03',kicker:'ແບບ Gallery',title:'ກົດຄ້າງເພື່ອເລືອກຫຼາຍຮູບ',desc:'ກົດຄ້າງຮູບປະມານ 0.4 ວິນາທີ ແລ້ວແຕະຮູບອື່ນເພື່ອເພີ່ມ/ຍົກເລີກ.',steps:[['ກົດຄ້າງ','ກົດຄ້າງຮູບທຳອິດ ແລະ ຈະເຫັນເຄື່ອງໝາຍເລືອກ.'],['ເລືອກເພີ່ມ','ແຕະຮູບອື່ນເພື່ອເພີ່ມ ຫຼື ແຕະຊ້ຳເພື່ອຍົກເລີກ.'],['ເລືອກທັງໝົດ','ເລືອກ ຫຼື ຍົກເລີກຮູບທັງໝົດທີ່ກຳລັງເບິ່ງ.'],['ບັນທຶກ/ລຶບ','ບັນທຶກຫຼາຍຮູບ ຫຼື ລຶບພ້ອມກັນຫຼັງຢືນຢັນ.']],note:'ຖ້າມີຮູບຫຼາຍຫຼາຍ ແນະນຳໃຫ້ແບ່ງບັນທຶກເປັນຫຼາຍຄັ້ງ.'},
      {kind:'viewer',num:'04',kicker:'ຮູບຕົ້ນສະບັບ',title:'ປັດຊ້າຍ/ຂວາ · ຊູມ · ເລື່ອນ · ແບ່ງປັນ',desc:'ໜ້າຮູບຕົ້ນສະບັບໃຊ້ເບິ່ງຮູບ, ຊູມ, ປ່ຽນຮູບ, ແບ່ງປັນ, ດາວໂຫຼດ ແລະ ລຶບ.',steps:[['ປັດຊ້າຍ/ຂວາ','ເມື່ອບໍ່ຊູມ ປັດຊ້າຍໄປຮູບຖັດໄປ, ປັດຂວາໄປຮູບກ່ອນ.'],['ຊູມສອງນິ້ວ','ໃຊ້ສອງນິ້ວເພື່ອຂະຫຍາຍ/ຫຍໍ້.'],['ເລື່ອນຫຼັງຊູມ','ຫຼັງຊູມໃຊ້ນິ້ວດຽວເລື່ອນໄດ້ທຸກທິດ.'],['ແບ່ງປັນ/ດາວໂຫຼດ','ໃຊ້ໄອຄອນດ້ານເທິງເພື່ອແບ່ງປັນ ຫຼື ບັນທຶກຮູບປັດຈຸບັນ.']],note:'ຕອນເປີດຮູບຈະສະແດງ thumbnail ກ່ອນ ແລ້ວປ່ຽນເປັນ preview 2048px ແລະ ຮູບຕົ້ນສະບັບ.'},
      {kind:'upload',num:'05',kicker:'ເພີ່ມຮູບ',title:'ອັບໂຫຼດຫຼາຍຮູບພ້ອມກັນ',desc:'ສາມາດເລືອກຮູບຫຼາຍຮູບຈາກໜ້າເລືອກຮູບຂອງໂທລະສັບ.',steps:[['ເລືອກຮູບ','ກົດ ＋ ອັບໂຫຼດ ແລະ ເລືອກຮູບ.'],['ຄວາມຄືບໜ້າຮູບ','ເບິ່ງ % ຂອງຮູບທີ່ກຳລັງສົ່ງ.'],['ຄວາມຄືບໜ້າລວມ','ເບິ່ງຈຳນວນຮູບທີ່ສຳເລັດຈາກທັງໝົດ.'],['ບັນທຶກລົງ Drive','ຫຼັງ “ກຳລັງບັນທຶກເຂົ້າ Google Drive” ສຳເລັດ ລາຍການຈະໂຫຼດໃໝ່.']],note:'ອັບເດດອັດຕະໂນມັດຈະບໍ່ຂັດຈັງຫວະຂະນະອັບໂຫຼດ.'},
      {kind:'delete',num:'06',kicker:'ປ້ອງກັນກົດຜິດ',title:'ລຶບຮູບ ແລະ ໂຟນເດີ',desc:'ຮູບດຽວ, ຫຼາຍຮູບ ແລະ ໂຟນເດີ ຈະມີຂັ້ນຕອນຢືນຢັນກ່ອນລຶບ.',steps:[['ກົດລຶບ','ໃຊ້ປຸ່ມລຶບໃນໜ້າຮູບ, ໂໝດເລືອກຫຼາຍຮູບ ຫຼື ໜ້າໂຟນເດີ.'],['ກວດຂໍ້ຄວາມ','ກວດສິ່ງທີ່ຈະລຶບ ແລະ ຂໍ້ຄວາມວ່າຈະຍ້າຍໄປ Google Drive Trash.'],['ກົດຢືນຢັນ','ຈະລຶບຈິງເມື່ອກົດ “ຢືນຢັນ”; ກົດ “ຍົກເລີກ” ແລ້ວບໍ່ມີການປ່ຽນແປງ.'],['ອັບເດດລາຍການ','ຫຼັງລຶບ ລາຍການຈະຫາຍອອກຈາກໜ້າປັດຈຸບັນ.']],note:'ລາຍການທີ່ລຶບຈະຖືກຍ້າຍໄປ Google Drive Trash ແລະ ບໍ່ໄດ້ຖືກລຶບຖາວອນທັນທີ.'},
      {kind:'trash',num:'07',kicker:'ຟັງຊັນໃໝ່ · Google Drive',title:'ກູ້ຮູບ ແລະ ໂຟນເດີຈາກ Google Trash',desc:'ກົດ “ຖັງຂີ້ເຫຍື້ອ Google” ໃນໜ້າຫຼັກເພື່ອເບິ່ງສະເພາະຮູບ/ໂຟນເດີທີ່ລຶບຈາກອະລະບໍ້າ ແລະ ກູ້ຄືນໄດ້ທັນທີ.',steps:[['ເປີດ Google Trash','ກົດປຸ່ມ “ຖັງຂີ້ເຫຍື້ອ Google” ໃນໜ້າຫຼັກ.'],['ຫາລາຍການ','ຮູບຈະມີ thumbnail ແລະ ຊື່; ໂຟນເດີຈະມີໄອຄອນໂຟນເດີ. ຈະສະແດງເວລາລຶບດ້ວຍ.'],['ກົດກູ້ຄືນ','ກົດ “ກູ້ຄືນ” ທາງຂວາຂອງລາຍການ ເພື່ອກັບໄປຕຳແໜ່ງເດີມໃນ Google Drive.'],['ກວດອີກຄັ້ງ','ຫຼັງກູ້ຄືນ ລາຍການຈະຫາຍຈາກ Trash ແລະ ອະລະບໍ້າຈະໂຫຼດລາຍການໃໝ່.']],note:'ສະແດງສະເພາະລາຍການຂອງອະລະບໍ້າ ເພື່ອບໍ່ໃຫ້ໄຟລ໌ສ່ວນຕົວອື່ນໃນ Drive ປະປົນ.'}
    ],
    extraTitle:'ຟັງຊັນທີ່ຮູ້ໄວ້ຈະສະດວກ',
    extras:[
      ['📥 ບັນທຶກຮູບດຽວ','ໃນໜ້າຮູບຕົ້ນສະບັບ ກົດດາວໂຫຼດເພື່ອບັນທຶກຮູບປັດຈຸບັນ.'],
      ['📦 ບັນທຶກຫຼາຍຮູບ','ໃນໂໝດເລືອກ ກົດ “ບັນທຶກ N ຮູບ” ແລ້ວໃຊ້ໜ້າ Share/Save ຂອງໂທລະສັບ.'],
      ['↩️ ປຸ່ມກັບ','ກັບຈາກຮູບ → ໂຟນເດີ → ໜ້າຫຼັກອະລະບໍ້າ.'],
      ['🔄 ອັບເດດອັດຕະໂນມັດ','ຖ້າມີເວີຊັນໃໝ່ ຈະລໍຖ້າເວລາທີ່ປອດໄພກ່ອນອັບເດດ.'],
      ['🔔 ປັອບອັບອັບເດດ','ສະແດງການປ່ຽນແປງສຳຄັນໜຶ່ງຄັ້ງ; ກົດ 🔔 ໃນປະຫວັດອັບເດດເພື່ອເປີດປັອບອັບຢູ່ເທິງ ແລະ ປິດແລ້ວກັບຄືນປະຫວັດ.'],
      ['🌐 ພາສາຄູ່ມື','ເຂົ້າຈາກແອັບຜົວຈະເປີດຄູ່ມືເກົາຫຼີ; ເຂົ້າຈາກແອັບເມຍຈະເປີດຄູ່ມືລາວ. ປ່ຽນພາສາໄດ້ຈາກດ້ານເທິງ.'],
      ['🌓 ທີມສີ','ກົດໄອຄອນດວງຈັນ/ດວງອາທິດ ເພື່ອປ່ຽນສີໜ້າຈໍ.']
    ],
    faqTitle:'ເມື່ອມີບັນຫາ',
    faq:[
      ['ຮູບຕອນແຮກເບິ່ງບໍ່ຄົມ','ລະບົບຈະປ່ຽນ 640px thumbnail → 2048px preview → ຮູບຕົ້ນສະບັບ ແລະ preload ຮູບກ່ອນ/ຖັດໄປ.'],
      ['ຢາກກູ້ຮູບທີ່ລຶບ','ເປີດ “ຖັງຂີ້ເຫຍື້ອ Google” ຈາກໜ້າຫຼັກ ແລະ ກົດ “ກູ້ຄືນ”.'],
      ['ຮູບທີ່ແບ່ງປັນຫຍຸ້ງນິດໜ່ອຍ','ອະລະບໍ້າສົ່ງໄຟລ໌ຕົ້ນສະບັບ ແຕ່ KakaoTalk/Messenger ອາດບີບອັດຕອນສົ່ງ.'],
      ['ກົວວ່າອັບເດດຈະຂັດຈັງຫວະ','ລະຫວ່າງເບິ່ງ, ເລືອກ, ອັບໂຫຼດ, ບັນທຶກ, ລຶບ ຫຼື ເບິ່ງຄູ່ມື ຈະບໍ່ໂຫຼດໃໝ່.']
    ],
    tip:'ໃນຄູ່ມື ກົດ “← ກັບອະລະບໍ້າ” ເພື່ອກັບໄປໜ້າທີ່ເຄີຍເບິ່ງ.',
    footer:'ຄູ່ມືນີ້ຈະຖືກອັບເດດພ້ອມກັບຟັງຊັນຂອງອະລະບໍ້າ.'
  };
  return lang==='lo'?lo:ko;
}
function manualShotSvg(kind,lang){
  const lo=lang==='lo',ko=!lo;
  const T=(koText,loText)=>lo?loText:koText;
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const text=(x,y,value,size=11,fill='#f5f7fa',weight=700,anchor='start')=>'<text x="'+x+'" y="'+y+'" fill="'+fill+'" font-size="'+size+'" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-weight="'+weight+'" text-anchor="'+anchor+'">'+esc(value)+'</text>';
  const badge=(x,y,n)=>'<circle cx="'+x+'" cy="'+y+'" r="12" fill="#ff7798" stroke="#fff" stroke-width="2"/>'+text(x,y+4,String(n),11,'#171219',900,'middle');
  const button=(x,y,w,label,active=false,danger=false)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="34" rx="10" fill="'+(danger?'#3a1d26':active?'#5e3346':'#222630')+'" stroke="'+(danger?'#8c465b':active?'#ff7798':'#393e49')+'"/>'+text(x+w/2,y+22,label,9,danger?'#ff9ab2':'#eef1f5',800,'middle');
  const phoneTop='<rect x="0" y="0" width="390" height="760" rx="30" fill="#090b0f"/><rect x="12" y="12" width="366" height="52" rx="15" fill="#171a21" stroke="#303641"/>'+text(26,32,'OUR MEMORY',8,'#ff9ab2',900)+text(26,53,T('우리의 추억사진첩','ອະລະບໍ້າຄວາມຊົງຈຳ'),13,'#fff',900)+button(232,21,64,T('설명서','ຄູ່ມື'))+button(301,21,48,T('본앱','ຫຼັກ'))+'<circle cx="363" cy="38" r="13" fill="#222630"/>'+text(363,42,'☾',12,'#fff',700,'middle');
  let body='';
  if(kind==='home'){
    body+=text(22,102,T('앨범','ອະລະບໍ້າ'),22,'#fff',900)+text(22,123,T('우리 둘의 소중한 순간을 한곳에','ເກັບຄວາມຊົງຈຳໄວ້ບ່ອນດຽວ'),10,'#9ba3af',600);
    const cards=[[22,145,168,'＋',T('사진 올리기','ອັບໂຫຼດຮູບ')],[200,145,168,'◷',T('최근 사진','ຮູບຫຼ້າສຸດ')],[22,237,168,'📁',T('새 폴더','ໂຟນເດີໃໝ່')],[200,237,168,'🗑',T('Google 휴지통','ຖັງຂີ້ເຫຍື້ອ')]];
    for(const [x,y,w,ico,label] of cards){body+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="82" rx="16" fill="#171a21" stroke="#303641"/>'+text(x+14,y+27,ico,18,'#ff9ab2',900)+text(x+14,y+51,label,11,'#fff',850)+text(x+14,y+67,T('바로 실행','ເລີ່ມໄດ້'),8,'#8f98a6',600)}
    body+=text(22,356,T('앨범','ອະລະບໍ້າ'),16,'#fff',900)+button(280,336,88,T('↻ 새로고침','↻ ໂຫຼດໃໝ່'));
    body+='<rect x="22" y="379" width="346" height="108" rx="18" fill="#171a21" stroke="#303641"/><rect x="34" y="391" width="86" height="84" rx="14" fill="url(#g1)"/>'+text(137,414,T('졸업사진','ຮູບຮັບປະລິນຍາ'),15,'#fff',900)+text(137,436,'105 '+T('장','ຮູບ'),10,'#9aa2ad',700)+text(137,457,T('사진을 눌러 앨범 열기','ແຕະເພື່ອເປີດ'),9,'#c8ced8',650)+text(347,436,'›',28,'#fff',600,'middle');
    body+=badge(105,176,1)+badge(284,176,2)+badge(105,268,3)+badge(284,268,4)+badge(347,432,5);
  }else if(kind==='folder'){
    body+=text(22,102,'←',20,'#fff',700)+text(52,102,T('졸업사진','ຮູບຮັບປະລິນຍາ'),20,'#fff',900)+text(52,123,'105 '+T('장','ຮູບ'),10,'#9ba3af',600);
    body+=button(22,142,75,T('＋ 업로드','＋ ອັບ'))+button(103,142,70,T('＋ 폴더','＋ ໂຟນ'))+button(179,142,74,T('폴더 삭제','ລຶບໂຟນ'),false,true)+button(259,142,76,T('사진 선택','ເລືອກຮູບ'),true)+button(301,183,67,T('최신순','ໃໝ່ສຸດ'));
    for(let i=0;i<12;i++){const x=22+(i%3)*116,y=232+Math.floor(i/3)*111;body+='<rect x="'+x+'" y="'+y+'" width="108" height="103" rx="10" fill="'+(i%3===0?'#765867':i%3===1?'#8f6978':'#5f6572')+'"/><rect x="'+(x+8)+'" y="'+(y+8)+'" width="92" height="70" rx="8" fill="rgba(255,255,255,.08)"/>'+text(x+9,y+94,'IMG_'+String(i+1).padStart(3,'0')+'.jpg',7,'#d6dbe2',600)}
    body+=badge(331,159,1)+badge(217,159,2)+badge(294,159,3)+badge(76,279,4);
  }else if(kind==='select'){
    body+=text(22,102,T('졸업사진 · 선택모드','ຮູບຮັບປະລິນຍາ · ໂໝດເລືອກ'),18,'#fff',900)+text(22,124,T('선택한 사진 4장','ເລືອກແລ້ວ 4 ຮູບ'),10,'#ff9ab2',800);
    for(let i=0;i<12;i++){const x=22+(i%3)*116,y=150+Math.floor(i/3)*111,selected=[0,1,4,7].includes(i);body+='<rect x="'+x+'" y="'+y+'" width="108" height="103" rx="10" fill="'+(i%2?'#8a6775':'#67616b')+'" stroke="'+(selected?'#ff7798':'#303641')+'" stroke-width="'+(selected?3:1)+'"/>';if(selected)body+='<circle cx="'+(x+89)+'" cy="'+(y+18)+'" r="13" fill="#ff7798"/>'+text(x+89,y+22,'✓',12,'#171219',900,'middle')}
    body+='<rect x="16" y="653" width="358" height="78" rx="18" fill="#171a21" stroke="#393e49"/>'+button(28,674,72,T('전체 선택','ທັງໝົດ'))+button(106,674,83,T('4장 저장','ບັນທຶກ 4'),true)+button(195,674,83,T('4장 삭제','ລຶບ 4'),false,true)+button(284,674,78,T('취소','ຍົກເລີກ'));
    body+=badge(108,168,1)+badge(224,279,2)+badge(64,691,3)+badge(236,691,4);
  }else if(kind==='viewer'){
    body+='<rect x="12" y="75" width="366" height="54" rx="14" fill="#111318"/>'+button(20,84,38,'×')+text(74,98,T('졸업사진_012.jpg','ຮູບ_012.jpg'),10,'#fff',800)+text(74,115,'12 / 105',8,'#9299a5',700)+button(227,84,48,T('공유','ແບ່ງ'))+button(281,84,58,T('저장','ບັນທຶກ'))+button(345,84,25,'🗑',false,true);
    body+='<rect x="16" y="140" width="358" height="560" rx="12" fill="#050608"/><rect x="42" y="190" width="306" height="420" rx="12" fill="url(#photo)"/><circle cx="195" cy="400" r="92" fill="rgba(255,255,255,.12)"/><circle cx="195" cy="400" r="55" fill="rgba(255,255,255,.10)"/>'+text(32,423,'‹',42,'#fff',500)+text(358,423,'›',42,'#fff',500,'middle');
    body+='<path d="M108 634 C145 615 245 615 282 634" stroke="#ff7798" stroke-width="3" fill="none" stroke-linecap="round"/>'+text(195,657,T('좌우로 밀어 사진 이동','ປັດຊ້າຍ/ຂວາເພື່ອປ່ຽນຮູບ'),9,'#ffb0c3',800,'middle')+badge(251,101,1)+badge(310,101,2)+badge(195,383,3)+badge(195,635,4);
  }else if(kind==='trash'){
    body+=text(22,101,T('Google 휴지통','ຖັງຂີ້ເຫຍື້ອ Google'),21,'#fff',900)+text(22,125,T('사진첩에서 삭제한 항목만 표시','ສະແດງສະເພາະລາຍການອະລະບໍ້າ'),10,'#9ba3af',650)+button(294,82,74,T('새로고침','ໂຫຼດໃໝ່'));
    const rows=[
      [T('졸업사진_021.jpg','ຮູບ_021.jpg'),T('사진 · 오늘 22:41','ຮູບ · 22:41'),false],
      [T('여행사진','ຮູບທ່ຽວ'),T('폴더 · 오늘 21:18','ໂຟນເດີ · 21:18'),true],
      [T('졸업사진_018.jpg','ຮູບ_018.jpg'),T('사진 · 어제 19:03','ຮູບ · ມື້ວານ 19:03'),false]
    ];
    rows.forEach((r,i)=>{const y=166+i*118;body+='<rect x="20" y="'+y+'" width="350" height="100" rx="16" fill="#171a21" stroke="#303641"/><rect x="32" y="'+(y+12)+'" width="76" height="76" rx="12" fill="'+(r[2]?'#342d38':'url(#g1)')+'"/>'+text(70,y+58,r[2]?'📁':'🖼️',24,'#fff',800,'middle')+text(124,y+35,r[0],12,'#fff',850)+text(124,y+57,r[1],9,'#9aa2ad',650)+button(292,y+31,62,T('복구','ກູ້ຄືນ'),true);});
    body+=badge(331,99,1)+badge(178,201,2)+badge(323,215,3)+badge(323,333,4);
  }else if(kind==='upload'){
    body+=text(22,103,T('사진 업로드','ອັບໂຫຼດຮູບ'),21,'#fff',900)+text(22,126,T('여러 사진을 한 번에 선택할 수 있습니다.','ເລືອກຫຼາຍຮູບໄດ້ໃນຄັ້ງດຽວ.'),10,'#9ba3af',600);
    body+='<rect x="18" y="166" width="354" height="430" rx="24" fill="#1b1f27" stroke="#3b414d"/><rect x="170" y="179" width="50" height="5" rx="3" fill="#555d69"/>'+text(36,226,T('사진 업로드 중','ກຳລັງອັບໂຫຼດ'),19,'#fff',900)+text(36,257,'IMG_012.jpg',11,'#d9dde4',750)+text(340,257,'72%',11,'#ff9ab2',900,'end')+'<rect x="36" y="270" width="304" height="11" rx="6" fill="#303641"/><rect x="36" y="270" width="219" height="11" rx="6" fill="#ff7798"/>'+text(36,317,T('전체 진행률','ຄວາມຄືບໜ້າລວມ'),11,'#aeb5c0',700)+text(340,317,'7 / 10',11,'#fff',850,'end')+'<rect x="36" y="330" width="304" height="11" rx="6" fill="#303641"/><rect x="36" y="330" width="213" height="11" rx="6" fill="#ff9ab2"/><rect x="36" y="382" width="304" height="78" rx="14" fill="#222630" stroke="#383e49"/>'+text(56,412,'☁',20,'#ff9ab2',900)+text(88,408,T('Google Drive에 저장 중…','ກຳລັງບັນທຶກເຂົ້າ Google Drive…'),10,'#fff',800)+text(88,429,T('전송이 끝난 뒤 마지막 저장 단계입니다.','ເປັນຂັ້ນຕອນສຸດທ້າຍຫຼັງສົ່ງໄຟລ໌.'),8,'#9aa2ad',600)+button(36,500,304,T('업로드 중에는 닫지 마세요','ຢ່າປິດໃນຂະນະອັບໂຫຼດ'),true);
    body+=badge(322,255,1)+badge(322,315,2)+badge(60,412,3)+badge(190,517,4);
  }else{
    body+=text(22,102,T('삭제 확인','ຢືນຢັນການລຶບ'),21,'#fff',900)+text(22,127,T('사진·폴더는 확인 후에만 삭제됩니다.','ຮູບ/ໂຟນເດີຈະຖືກລຶບຫຼັງຢືນຢັນ.'),10,'#9ba3af',600);
    body+='<rect x="20" y="182" width="350" height="350" rx="24" fill="#1b1f27" stroke="#3b414d"/><rect x="169" y="196" width="52" height="5" rx="3" fill="#555d69"/>'+text(40,246,T('사진 삭제','ລຶບຮູບ'),20,'#fff',900)+text(40,285,T('선택한 사진을 삭제할까요?','ລຶບຮູບທີ່ເລືອກບໍ?'),12,'#dfe3e8',750)+text(40,311,T('Google Drive 휴지통으로 이동합니다.','ຈະຍ້າຍໄປ Google Drive Trash.'),10,'#a3aab5',650)+'<rect x="40" y="352" width="310" height="70" rx="14" fill="#252a34"/>'+text(58,379,T('복구 가능','ກູ້ຄືນໄດ້'),11,'#ffb0c3',900)+text(58,400,T('휴지통을 비우기 전까지 되살릴 수 있습니다.','ກູ້ໄດ້ຈົນກວ່າຈະລ້າງ Trash.'),9,'#abb2bc',650)+button(40,458,145,T('취소','ຍົກເລີກ'))+button(205,458,145,T('확인','ຢືນຢັນ'),false,true);
    body+=badge(87,475,1)+badge(275,475,2)+badge(58,378,3);
  }
  const defs='<defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d18da3"/><stop offset="1" stop-color="#6c5965"/></linearGradient><linearGradient id="photo" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#92717e"/><stop offset=".45" stop-color="#4c515c"/><stop offset="1" stop-color="#b47c91"/></linearGradient></defs>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="390" height="760" viewBox="0 0 390 760">'+defs+phoneTop+body+'</svg>');
}
function syncManualScreenshots(lang){
  document.querySelectorAll('[data-manual-shot]').forEach(img=>{img.src=manualShotSvg(img.dataset.manualShot,lang)});
}
function manualQuick(c){
  return '<section class="manual-card manual-quick-card"><div class="manual-section-eyebrow">QUICK START</div><h2>'+escapeHtml(c.quickTitle)+'</h2><div class="manual-quick-grid">'+c.quick.map((x,i)=>'<div class="manual-quick-item"><div class="manual-quick-icon">'+x[0]+'</div><div><strong>'+escapeHtml((i+1)+'. '+x[1])+'</strong><p>'+escapeHtml(x[2])+'</p></div></div>').join('')+'</div></section>';
}
function manualSection(section){
  return '<section class="manual-card manual-guide-section"><div class="manual-section-head"><div class="manual-section-number">'+escapeHtml(section.num)+'</div><div><div class="manual-kicker2">'+escapeHtml(section.kicker)+'</div><h2>'+escapeHtml(section.title)+'</h2><p>'+escapeHtml(section.desc)+'</p></div></div><div class="manual-screen-layout"><figure class="manual-shot-clean manual-shot-rich"><img data-manual-shot="'+escapeHtml(section.kind)+'" alt=""><figcaption>'+escapeHtml(section.title)+'</figcaption></figure><div class="manual-step-list">'+section.steps.map((step,i)=>'<div class="manual-step-row"><span class="manual-step-no">'+(i+1)+'</span><div class="manual-step-copy"><strong>'+escapeHtml(step[0])+'</strong><p>'+escapeHtml(step[1])+'</p></div></div>').join('')+(section.note?'<div class="manual-section-note">💡 '+escapeHtml(section.note)+'</div>':'')+'</div></div></section>';
}
function manualInfoGrid(title,rows,cls=''){
  return '<section class="manual-card '+cls+'"><h2>'+escapeHtml(title)+'</h2><div class="manual-info-grid">'+rows.map(x=>'<div class="manual-info-item"><strong>'+escapeHtml(x[0])+'</strong><p>'+escapeHtml(x[1])+'</p></div>').join('')+'</div></section>';
}
function renderUnifiedManual(lang=manualLanguage){
  manualLanguage=lang==='lo'?'lo':'ko';
  const c=manualCopy(manualLanguage),pane=$('manualContent');
  $('manualKoBtn').classList.toggle('active',manualLanguage==='ko');$('manualLoBtn').classList.toggle('active',manualLanguage==='lo');
  $('manualCloseBtn').textContent=manualLanguage==='lo'?'← ກັບອະລະບໍ້າ':'← 사진첩으로';
  pane.innerHTML=
    '<section class="manual-hero manual-renew"><div class="manual-language-banner">'+c.heroBanner+'</div><div class="manual-current-badge">'+(manualLanguage==='lo'?'✓ ຄູ່ມືລ່າສຸດ':'✓ 최신 설명서')+'</div><h1>'+c.title+'</h1><div class="manual-sub">'+escapeHtml(cfg.version)+' · Android / iPhone / PC</div><p class="manual-lead">'+escapeHtml(c.lead)+'</p><button class="manual-update-history-btn" type="button" id="manualUpdateHistoryBtn">'+c.update+'</button></section>'+
    manualQuick(c)+
    c.sections.map(manualSection).join('')+
    manualInfoGrid(c.extraTitle,c.extras,'manual-extra-card')+
    manualInfoGrid(c.faqTitle,c.faq,'manual-faq-card')+
    '<div class="manual-mini-tip"><b>TIP</b> '+escapeHtml(c.tip)+'</div>'+
    '<div class="manual-footer">'+escapeHtml(cfg.version)+' · '+escapeHtml(c.footer)+'</div>';
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
  $('createFolderTitle').textContent=t('createFolder');$('createFolderText').textContent=t('createFolderHint');$('trashHomeTitle').textContent=t('trash');$('trashHomeText').textContent=t('trashHint');
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
  const loadSeq=++rootLoadSeq;
  state.lastRefresh=Date.now();
  if(!apiReady()){if(loadSeq===rootLoadSeq){state.folders=[];renderFolders()}return}
  albumList.innerHTML='<div class="loading-line"></div>';
  try{
    const data=await apiJson('/api/folders?lang='+encodeURIComponent(uiLang()));
    if(loadSeq!==rootLoadSeq)return;
    state.folders=Array.isArray(data.folders)?data.folders:[];renderFolders();syncFromHash();
  }catch(e){
    if(loadSeq!==rootLoadSeq)return;
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
  let timer=0,previewTimer=0,startX=0,startY=0,longPressed=false;
  const clear=()=>{if(timer){clearTimeout(timer);timer=0}};
  const clearPreview=()=>{if(previewTimer){clearTimeout(previewTimer);previewTimer=0}};
  btn.addEventListener('pointerdown',e=>{
    if(selectionMode)return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const item=state.media[index];
    if(item)previewTimer=setTimeout(()=>{previewTimer=0;ensurePreviewUrl(item)},90);
    startX=e.clientX;startY=e.clientY;longPressed=false;
    timer=setTimeout(()=>{
      timer=0;longPressed=true;
      const item=state.media[index];if(!item)return;
      selectionMode=true;selectedMediaIds.clear();selectedMediaIds.add(String(item.id));
      if(navigator.vibrate)try{navigator.vibrate(18)}catch(_){}
      renderMedia();
    },430);
  });
  btn.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-startX,e.clientY-startY)>12){clear();clearPreview()}});
  btn.addEventListener('pointerup',()=>{clear();clearPreview()});
  btn.addEventListener('pointercancel',()=>{clear();clearPreview()});
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
  if(typeof IntersectionObserver!=='function'){
    photoGrid.querySelectorAll('.photo-thumb').forEach(enqueueThumb);return;
  }
  thumbObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){thumbObserver.unobserve(entry.target);enqueueThumb(entry.target)}
  }),{rootMargin:'1000px 0px'});
  const imgs=[...photoGrid.querySelectorAll('.photo-thumb')];
  imgs.slice(0,THUMB_EAGER_COUNT).forEach(enqueueThumb);
  imgs.slice(THUMB_EAGER_COUNT).forEach(img=>thumbObserver.observe(img));
}
function setupTrashThumbObserver(){
  if(trashThumbObserver)trashThumbObserver.disconnect();
  trashThumbQueue.length=0;
  const imgs=[...$('trashList').querySelectorAll('.trash-thumb')];
  if(!imgs.length)return;
  if(typeof IntersectionObserver!=='function'){imgs.forEach(enqueueTrashThumb);return}
  trashThumbObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){trashThumbObserver.unobserve(entry.target);enqueueTrashThumb(entry.target)}
  }),{root:$('trashList'),rootMargin:'500px 0px'});
  imgs.slice(0,8).forEach(enqueueTrashThumb);
  imgs.slice(8).forEach(img=>trashThumbObserver.observe(img));
}
function enqueueTrashThumb(img){
  if(!img||img.dataset.loaded||img.dataset.trashQueued)return;
  img.dataset.trashQueued='1';trashThumbQueue.push(img);pumpTrashThumbQueue();
}
function pumpTrashThumbQueue(){
  const max=Math.min(4,THUMB_CONCURRENCY);
  while(trashThumbActive<max&&trashThumbQueue.length){
    const img=trashThumbQueue.shift();
    if(!img||img.dataset.loaded||!img.isConnected)continue;
    delete img.dataset.trashQueued;trashThumbActive++;
    loadThumb(img).finally(()=>{trashThumbActive--;pumpTrashThumbQueue()});
  }
}
function thumbUrlInUse(url){
  if(!url)return false;
  if(viewerImage?.src===url)return true;
  return [...document.querySelectorAll('.photo-thumb,.trash-thumb')].some(img=>img.isConnected&&img.src===url);
}
function rememberThumbUrl(cacheKey,url){
  if(thumbUrlCache.has(cacheKey)){
    const old=thumbUrlCache.get(cacheKey);thumbUrlCache.delete(cacheKey);
    if(old&&old!==url&&!thumbUrlInUse(old)){thumbUrls.delete(old);URL.revokeObjectURL(old)}
  }
  thumbUrlCache.set(cacheKey,url);thumbUrls.add(url);
  let attempts=0,maxAttempts=thumbUrlCache.size+2;
  while(thumbUrlCache.size>THUMB_CACHE_LIMIT&&attempts++<maxAttempts){
    const oldest=thumbUrlCache.keys().next().value,oldUrl=thumbUrlCache.get(oldest);
    thumbUrlCache.delete(oldest);
    if(thumbUrlInUse(oldUrl)){thumbUrlCache.set(oldest,oldUrl);continue}
    thumbUrls.delete(oldUrl);if(oldUrl)URL.revokeObjectURL(oldUrl);
  }
  return url;
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
  if(cached){thumbUrlCache.delete(cacheKey);thumbUrlCache.set(cacheKey,cached);applyUrl(cached);return}
  const path='/api/thumb?id='+encodeURIComponent(id)+(version?'&v='+encodeURIComponent(version):'');
  try{
    const {blob}=await apiBlob(path,{cache:'force-cache'});
    if(!img.isConnected)return;
    const url=rememberThumbUrl(cacheKey,URL.createObjectURL(blob));applyUrl(url);
  }catch(_){img.alt=''}
}

function previewCacheKey(item){
  return String(item?.id||'')+'|'+String(item?.modifiedTime||item?.thumbVersion||'');
}
function rememberPreviewUrl(key,url){
  if(previewUrlCache.has(key)){
    const old=previewUrlCache.get(key);
    if(old&&old!==url)URL.revokeObjectURL(old);
    previewUrlCache.delete(key);
  }
  previewUrlCache.set(key,url);
  while(previewUrlCache.size>PREVIEW_CACHE_LIMIT){
    const oldest=previewUrlCache.keys().next().value;
    const oldUrl=previewUrlCache.get(oldest);
    previewUrlCache.delete(oldest);
    if(oldUrl)URL.revokeObjectURL(oldUrl);
  }
  return url;
}
async function ensurePreviewUrl(item){
  if(!item?.id)return'';
  const key=previewCacheKey(item);
  const cached=previewUrlCache.get(key);
  if(cached){
    previewUrlCache.delete(key);previewUrlCache.set(key,cached);
    return cached;
  }
  if(previewInflight.has(key))return previewInflight.get(key);
  const version=String(item.modifiedTime||'');
  const promise=apiBlob('/api/preview?id='+encodeURIComponent(item.id)+(version?'&v='+encodeURIComponent(version):''),{cache:'force-cache'})
    .then(data=>rememberPreviewUrl(key,URL.createObjectURL(data.blob)))
    .catch(()=> '')
    .finally(()=>previewInflight.delete(key));
  previewInflight.set(key,promise);
  return promise;
}
function prefetchViewerNeighbors(){
  const rows=state.media,n=rows.length;if(n<2||state.viewerIndex<0)return;
  const prev=rows[(state.viewerIndex-1+n)%n],next=rows[(state.viewerIndex+1)%n];
  ensurePreviewUrl(prev);if(next?.id!==prev?.id)ensurePreviewUrl(next);
}
function scheduleViewerNeighborPrefetch(loadSeq){
  if(neighborPrefetchTimer)clearTimeout(neighborPrefetchTimer);
  neighborPrefetchTimer=setTimeout(()=>{
    neighborPrefetchTimer=0;
    const run=()=>{if(loadSeq===viewerLoadSeq&&!viewer.hidden)prefetchViewerNeighbors()};
    if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:700});else setTimeout(run,0);
  },280);
}
function viewerItemKey(item){return String(item?.id||'')+'|'+String(item?.modifiedTime||item?.thumbVersion||'')}
function abortViewerOriginal(){
  if(viewerOriginalController){try{viewerOriginalController.abort()}catch(_){}}
  viewerOriginalController=null;viewerOriginalKey='';viewerOriginalPromise=null;
}
function startViewerOriginal(item){
  if(!item?.id)return Promise.reject(new Error('viewer_item_missing'));
  const key=viewerItemKey(item);
  if(state.viewerBlob&&state.viewerBlobKey===key)return Promise.resolve({blob:state.viewerBlob,name:item.name||'',type:item.mimeType||''});
  if(viewerOriginalPromise&&viewerOriginalKey===key)return viewerOriginalPromise;
  abortViewerOriginal();
  const version=String(item.modifiedTime||''),controller=new AbortController();
  viewerOriginalController=controller;viewerOriginalKey=key;
  const promise=apiBlob('/api/media?id='+encodeURIComponent(item.id)+(version?'&v='+encodeURIComponent(version):''),{cache:'force-cache',signal:controller.signal})
    .then(data=>{if(viewerOriginalKey===key){state.viewerBlob=data.blob;state.viewerBlobKey=key}return data})
    .finally(()=>{if(viewerOriginalKey===key){viewerOriginalController=null;viewerOriginalKey='';viewerOriginalPromise=null}});
  viewerOriginalPromise=promise;return promise;
}
async function openRecent(pushHistory=true){
  const loadSeq=++contentLoadSeq;
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
    if(loadSeq!==contentLoadSeq)return;
    state.media=Array.isArray(data.media)?data.media:[];
    if(!state.media.length){
      photoGrid.innerHTML=`<div class="empty-state"><div class="empty-icon">◷</div><strong>${escapeHtml(t('recentEmpty'))}</strong></div>`;
      folderCount.textContent=t('photosCount',0);
    }else renderMedia();
    state.lastRefresh=Date.now();
  }catch(e){
    if(loadSeq!==contentLoadSeq)return;
    state.media=[];photoGrid.innerHTML=`<div class="empty-state"><div class="empty-icon">⚠️</div><strong>${escapeHtml(t('loadFailed'))}</strong></div>`;handleApiError(e,t('loadFailed'));
  }
}
async function openFolderById(id,push=true){
  const loadSeq=++contentLoadSeq;
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
    if(loadSeq!==contentLoadSeq)return;
    state.currentFolder={...(data.folder||folder)};
    state.childFolders=Array.isArray(data.folders)?data.folders:[];
    state.media=Array.isArray(data.media)?data.media:[];
    folderTitle.textContent=displayName(state.currentFolder)||displayName(folder);renderSubfolders();renderMedia();state.lastRefresh=Date.now();
  }catch(e){if(loadSeq!==contentLoadSeq)return;state.childFolders=[];state.media=[];renderSubfolders();photoGrid.innerHTML=`<div class="empty-state"><div class="empty-icon">⚠️</div><strong>${escapeHtml(t('folderLoadFailed'))}</strong></div>`;handleApiError(e,t('folderLoadFailed'))}
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
  backdrop.classList.toggle('above-trash',trashOpen());
  sheetTitle.textContent=title;sheetText.textContent=text||'';sheetActions.innerHTML='';$('closeSheet').hidden=false;$('closeSheet').textContent=closeLabel;$('closeSheet').disabled=false;
  for(const c of choices){
    const b=document.createElement('button');b.type='button';b.className='sheet-choice'+(c.danger?' danger':'');b.innerHTML=`<strong>${escapeHtml(c.label)}</strong>${c.note?`<small>${escapeHtml(c.note)}</small>`:''}`;b.addEventListener('click',()=>{closeSheet();c.onClick?.()});sheetActions.appendChild(b);
  }
  backdrop.hidden=false;
}
function openConfirmSheet(title,text,onConfirm,confirmLabel=t('confirm')){
  backdrop.classList.toggle('above-trash',trashOpen());
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
  preparedSaveActive=false;backdrop.hidden=true;backdrop.classList.remove('above-trash');sheetActions.innerHTML='';$('closeSheet').hidden=false;$('closeSheet').disabled=false;$('closeSheet').textContent=t('ok');
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

function trashDateLabel(item){
  const raw=item?.trashedTime||item?.modifiedTime||'';
  if(!raw)return'';
  try{return new Intl.DateTimeFormat(uiLang()==='lo'?'lo-LA':'ko-KR',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(raw))}catch(_){return String(raw)}
}
function renderTrash(){
  const rows=Array.isArray(state.trash)?state.trash:[];
  $('trashCount').textContent=rows.length?String(rows.length):'0';
  if(!rows.length){
    $('trashList').innerHTML='<div class="trash-empty"><div>🗑️</div><strong>'+escapeHtml(t('trashEmpty'))+'</strong></div>';
    return;
  }
  $('trashList').innerHTML=rows.map(item=>{
    const folder=item.mimeType==='application/vnd.google-apps.folder';
    return '<article class="trash-item" data-trash-id="'+escapeAttr(item.id)+'">'+
      '<div class="trash-preview">'+(folder
        ?'<span class="trash-folder-icon">📁</span>'
        :'<span class="trash-image-fallback">🖼️</span><img class="trash-thumb" data-file-id="'+escapeAttr(item.id)+'" data-thumb-version="'+escapeAttr(item.modifiedTime||'')+'" alt="">')+
      '</div><div class="trash-copy"><strong>'+escapeHtml(item.name||'')+'</strong><small>'+escapeHtml(folder?t('trashFolder'):t('trashPhoto'))+(trashDateLabel(item)?' · '+escapeHtml(trashDateLabel(item)):'')+'</small></div>'+
      '<button class="trash-restore-btn" type="button" data-restore-id="'+escapeAttr(item.id)+'">'+escapeHtml(t('restore'))+'</button></article>';
  }).join('');
  setupTrashThumbObserver();
  $('trashList').querySelectorAll('[data-restore-id]').forEach(btn=>btn.addEventListener('click',()=>restoreTrashItem(btn.dataset.restoreId,btn)));
}
async function loadTrash(){
  const loadSeq=++trashLoadSeq;
  $('trashList').innerHTML='<div class="trash-loading"><div class="loading-line"></div><span>'+escapeHtml(t('trashLoading'))+'</span></div>';
  try{
    const data=await apiJson('/api/trash?limit=300&lang='+encodeURIComponent(uiLang()));
    if(loadSeq!==trashLoadSeq||!trashOpen())return;
    state.trash=Array.isArray(data.items)?data.items:[];
    renderTrash();
  }catch(e){
    if(loadSeq!==trashLoadSeq||!trashOpen())return;
    state.trash=[];
    $('trashList').innerHTML='<div class="trash-empty"><strong>'+escapeHtml(t('restoreFailed'))+'</strong><small>'+escapeHtml(apiErrorDetail(e)||t('loadFailed'))+'</small></div>';
  }
}
function openTrash(pushHistory=true){
  $('trashTitle').textContent=t('trashTitle');$('trashSubtitle').textContent=t('trashSubtitle');$('trashRefreshBtn').textContent=t('trashRefresh');$('trashCloseBtn').textContent=t('close');
  $('trashOverlay').hidden=false;body.classList.add('modal-open');loadTrash();
  if(pushHistory&&history.state?.overlay!=='trash')history.pushState({...history.state,[ALBUM_HISTORY_KEY]:true,overlay:'trash'},'',location.href);
}
function closeTrash(fromHistory=false){
  if(!fromHistory&&history.state?.overlay==='trash'){history.back();return}
  trashLoadSeq++;
  if(trashThumbObserver)trashThumbObserver.disconnect();trashThumbQueue.length=0;
  $('trashOverlay').hidden=true;
  if(!manualOpen()&&!manualPickerOpen()&&!updateHistoryOpen()&&!releaseNoticeOpen())body.classList.remove('modal-open');
  if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
}
async function restoreTrashItem(id,button){
  if(!id||trashBusy)return;
  trashBusy=true;
  const old=button?.textContent||t('restore');
  if(button){button.disabled=true;button.textContent=t('restoring')}
  try{
    await apiPostJson('/api/trash/restore',{id});
    state.trash=state.trash.filter(x=>String(x.id)!==String(id));
    renderTrash();
    loadFolders(false);
  }catch(e){
    if(button){button.disabled=false;button.textContent=old}
    openSheet(t('restoreFailed'),t('restoreFailed')+(apiErrorDetail(e)?'\n\n'+apiErrorDetail(e):''));
  }finally{
    trashBusy=false;
    if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
  }
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

  const thumbUrl=loadedThumbUrl(item.id);
  if(thumbUrl){
    viewerImage.src=thumbUrl;
    viewerLoading.hidden=true;
  }else{
    viewerImage.removeAttribute('src');
    viewerLoading.textContent=t('viewerLoading');
    viewerLoading.hidden=false;
  }

  let fullApplied=false;
  const previewPromise=ensurePreviewUrl(item).then(url=>{
    if(!url||fullApplied||loadSeq!==viewerLoadSeq||viewer.hidden||state.media[state.viewerIndex]?.id!==item.id)return;
    viewerImage.src=url;viewerLoading.hidden=true;
  });
  scheduleViewerNeighborPrefetch(loadSeq);

  try{
    await Promise.race([previewPromise,new Promise(resolve=>setTimeout(resolve,120))]);
    if(loadSeq!==viewerLoadSeq||viewer.hidden||state.media[state.viewerIndex]?.id!==item.id)return;
    const data=await startViewerOriginal(item);
    if(loadSeq!==viewerLoadSeq||viewer.hidden||state.media[state.viewerIndex]?.id!==item.id)return;
    fullApplied=true;
    const fullUrl=URL.createObjectURL(data.blob);
    state.viewerBlob=data.blob;state.viewerBlobKey=viewerItemKey(item);
    state.viewerUrl=fullUrl;
    viewerImage.src=fullUrl;
    viewerLoading.hidden=true;
  }catch(e){
    if(loadSeq!==viewerLoadSeq||e?.name==='AbortError')return;
    await previewPromise;
    if(!thumbUrl&&!viewerImage.src){
      viewerLoading.textContent=t('loadFailed');
      viewerLoading.hidden=false;
    }
  }
}
function releaseViewerBlob(){
  abortViewerOriginal();
  if(neighborPrefetchTimer){clearTimeout(neighborPrefetchTimer);neighborPrefetchTimer=0}
  if(state.viewerUrl)URL.revokeObjectURL(state.viewerUrl);
  state.viewerUrl='';state.viewerBlob=null;state.viewerBlobKey='';
}
function closeViewer(fromHistory=false){
  if(!fromHistory&&history.state?.[ALBUM_HISTORY_KEY]&&history.state.view==='viewer'){history.back();return}
  viewerLoadSeq++;resetViewerZoom();releaseViewerBlob();viewer.hidden=true;body.classList.remove('viewer-open');state.viewerIndex=-1;viewerImage.removeAttribute('src');viewerLoading.textContent=t('viewerLoading');
  if(pendingAppUpdate)setTimeout(()=>applyPendingAppUpdate(),0);
}
async function moveViewer(delta){if(!state.media.length)return;state.viewerIndex=(state.viewerIndex+delta+state.media.length)%state.media.length;await renderViewer()}
async function ensureViewerBlob(){
  const item=state.media[state.viewerIndex];if(!item)return null;
  const key=viewerItemKey(item);
  if(state.viewerBlob&&state.viewerBlobKey===key)return state.viewerBlob;
  try{
    const data=await startViewerOriginal(item);
    if(state.media[state.viewerIndex]?.id!==item.id)return null;
    state.viewerBlob=data.blob;state.viewerBlobKey=key;return data.blob;
  }catch(e){if(e?.name==='AbortError')return null;throw e}
}
async function downloadCurrent(){
  const item=state.media[state.viewerIndex];if(!item)return;
  const itemId=String(item.id),blob=await ensureViewerBlob();if(!blob||String(item.id)!==itemId)return;
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=item.name||'photo';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
async function shareCurrent(){
  const item=state.media[state.viewerIndex];if(!item)return;
  const itemId=String(item.id),blob=await ensureViewerBlob();if(!blob||String(item.id)!==itemId)return;
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
  if(overlay==='trash'){
    if(!trashOpen())openTrash(false);
    return;
  }
  if(trashOpen())$('trashOverlay').hidden=true;
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

$('manualBtn').addEventListener('click',()=>openUnifiedManual(uiLang(),true));
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
$('refreshFolderBtn').addEventListener('click',refreshCurrent);$('uploadHomeBtn').addEventListener('click',chooseUploadFolder);$('recentBtn').addEventListener('click',openRecent);$('createFolderBtn').addEventListener('click',()=>openCreateFolderSheet(''));$('trashBtn').addEventListener('click',()=>openTrash(true));$('trashCloseBtn').addEventListener('click',()=>closeTrash(false));$('trashRefreshBtn').addEventListener('click',loadTrash);
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
    if(trashOpen()){closeTrash(false);return}
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
window.addEventListener('beforeunload',()=>{
  for(const url of thumbUrls)URL.revokeObjectURL(url);
  for(const url of previewUrlCache.values())URL.revokeObjectURL(url);
  thumbUrls.clear();thumbUrlCache.clear();previewUrlCache.clear();previewInflight.clear();
});

applyLanguage();renderSharedRoute();normalizeModeInUrl();initAlbumHistory();loadFolders(false);
setTimeout(async()=>{const updating=await checkForAppUpdate(true);if(!updating)showUpdatePopupIfNeeded(false)},1200);
