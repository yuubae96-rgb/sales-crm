(()=>{
  const U='https://emauqxftmauvsffdjvyh.supabase.co';
  const K='sb_publishable_9rgwKLiJU9dGVkqttq0-fQ_hrhNqnfa';
  const A='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYXVxeGZ0bWF1dnNmZmRqdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Njg0NzksImV4cCI6MjEwMjQ0NDQ3OX0.iN2xz71VCeP7o6nz89v0wJMrUYkGyPKATtWaCl-MIO4';
  const H={apikey:K,Authorization:`Bearer ${A}`};
  const list=document.getElementById('contactList');
  if(!list)return;

  const style=document.createElement('style');
  style.textContent=`
    .person-met-date{margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .person-met-date label{font-size:13px;font-weight:700;color:#555;margin:0}
    .person-met-date input{width:auto;min-width:150px;padding:9px 10px;font-size:15px}
    .person-met-date button{width:auto;min-width:64px;margin:0;padding:9px 12px;font-size:14px}
    .person-short-note{margin-top:10px;padding-top:10px;border-top:1px dashed #ddd}
    .person-short-note label{font-size:13px;margin:0 0 5px;color:#555}
    .person-short-note-row{display:flex;gap:8px;align-items:center}
    .person-short-note-row input{flex:1;min-width:0;padding:10px;font-size:15px}
    .person-short-note-row button{width:auto;min-width:64px;margin:0;padding:10px 12px;font-size:14px}
  `;
  document.head.appendChild(style);

  let busy=false;
  async function getDetails(ids){
    if(!ids.length)return new Map();
    const q=ids.map(id=>encodeURIComponent(id)).join(',');
    const r=await fetch(`${U}/rest/v1/contacts?select=id,short_note,met_date&id=in.(${q})`,{headers:H});
    const d=await r.json();
    if(!r.ok)throw Error(d?.message||'人物情報の取得に失敗しました');
    return new Map(d.map(x=>[String(x.id),{short_note:x.short_note||'',met_date:x.met_date||''}]));
  }
  async function patchContact(id,body,button){
    const old=button.textContent;button.disabled=true;button.textContent='保存中…';
    try{
      const r=await fetch(`${U}/rest/v1/contacts?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!r.ok){const t=await r.text();throw Error(`保存に失敗しました (${r.status}) ${t.slice(0,120)}`)}
      button.textContent='保存済み';
      setTimeout(()=>{if(document.body.contains(button)){button.disabled=false;button.textContent=old}},800);
    }catch(e){button.disabled=false;button.textContent=old;alert(e.message)}
  }
  async function enhance(){
    if(busy)return;
    const buttons=[...list.querySelectorAll('[data-key-person-id]')];
    const rows=buttons.filter(b=>!b.closest('.person-row')?.querySelector('.person-short-note'));
    if(!rows.length)return;
    busy=true;
    try{
      const details=await getDetails(rows.map(b=>b.dataset.keyPersonId));
      for(const b of rows){
        const id=b.dataset.keyPersonId,row=b.closest('.person-row'),main=row?.querySelector('.person-main');
        if(!main||main.querySelector('.person-short-note'))continue;
        const info=details.get(String(id))||{short_note:'',met_date:''};

        const dateBox=document.createElement('div');dateBox.className='person-met-date';
        dateBox.innerHTML=`<label>会った日</label><input type="date" aria-label="会った日"><button type="button" class="secondary">保存</button>`;
        const dateInput=dateBox.querySelector('input'),dateSave=dateBox.querySelector('button');
        dateInput.value=info.met_date;
        dateSave.onclick=()=>patchContact(id,{met_date:dateInput.value||null},dateSave);
        main.appendChild(dateBox);

        const box=document.createElement('div');box.className='person-short-note';
        box.innerHTML=`<label>一言メモ</label><div class="person-short-note-row"><input type="text" maxlength="120" placeholder="例：価格より納期を重視" value=""><button type="button" class="secondary">保存</button></div>`;
        const input=box.querySelector('input'),save=box.querySelector('button');
        input.value=info.short_note;
        save.onclick=()=>patchContact(id,{short_note:input.value.trim()||null},save);
        input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save.click()}});
        main.appendChild(box);
      }
    }catch(e){console.warn(e)}finally{busy=false}
  }
  const observer=new MutationObserver(()=>enhance());
  observer.observe(list,{childList:true,subtree:true});
  enhance();
})();
