const body=document.body;
const backdrop=document.getElementById('backdrop');
const sheetTitle=document.getElementById('sheetTitle');
const sheetText=document.getElementById('sheetText');

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
    openSheet(name, name+' 앨범 화면은 다음 단계에서 Google Drive 폴더와 연결할게요.');
  });
});
document.querySelectorAll('[data-coming]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    openSheet(btn.dataset.coming,'이 기능은 Google Drive 연동 단계에서 활성화할게요.');
  });
});
