(()=>{
  const U='https://emauqxftmauvsffdjvyh.supabase.co';
  const K='sb_publishable_9rgwKLiJU9dGVkqttq0-fQ_hrhNqnfa';
  const A='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYXVxeGZ0bWF1dnNmZmRqdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Njg0NzksImV4cCI6MjEwMjQ0NDQ3OX0.iN2xz71VCeP7o6nz89v0wJMrUYkGyPKATtWaCl-MIO4';
  const H={apikey:K,Authorization:`Bearer ${A}`};
  const list=document.getElementById('contactList');
  if(!list)return;

  const companyCard=document.getElementById('companyListButton')?.closest('.card');
  if(companyCard&&!document.getElementById('dmPostcardButton')){
    const dmButton=document.createElement('button');
    dmButton.type='button';dmButton.id='dmPostcardButton';dmButton.className='secondary';dmButton.textContent='DM・はがき印刷';
    dmButton.onclick=()=>{location.href='./dm-postcard.html'};
    document.getElementById('companyListButton').insertAdjacentElement('afterend',dmButton);
  }

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
        const dateInput=dateBox.querySelector('input'),dateSave=dateBox.querySelector('button');dateInput.value=info.met_date;dateSave.onclick=()=>patchContact(id,{met_date:dateInput.value||null},dateSave);main.appendChild(dateBox);
        const box=document.createElement('div');box.className='person-short-note';
        box.innerHTML=`<label>一言メモ</label><div class="person-short-note-row"><input type="text" maxlength="120" placeholder="例：価格より納期を重視" value=""><button type="button" class="secondary">保存</button></div>`;
        const input=box.querySelector('input'),save=box.querySelector('button');input.value=info.short_note;save.onclick=()=>patchContact(id,{short_note:input.value.trim()||null},save);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save.click()}});main.appendChild(box);
      }
    }catch(e){console.warn(e)}finally{busy=false}
  }
  const observer=new MutationObserver(()=>enhance());observer.observe(list,{childList:true,subtree:true});enhance();
})();

(()=>{
  const U='https://emauqxftmauvsffdjvyh.supabase.co';
  const K='sb_publishable_9rgwKLiJU9dGVkqttq0-fQ_hrhNqnfa';
  const A='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYXVxeGZ0bWF1dnNmZmRqdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Njg0NzksImV4cCI6MjEwMjQ0NDQ3OX0.iN2xz71VCeP7o6nz89v0wJMrUYkGyPKATtWaCl-MIO4';
  const H={apikey:K,Authorization:`Bearer ${A}`};
  const profile=document.getElementById('companyProfile');if(!profile)return;
  const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const FIELDS=[['company_name','会社名'],['office_name','事業所名'],['postal_code','郵便番号'],['address','住所'],['phone','電話'],['fax','FAX'],['website','公式サイト']];
  const style=document.createElement('style');
  style.textContent=`.company-edit-box{margin-top:14px;padding:14px;border:1px solid #ddd;border-radius:14px;background:#fafafa}.company-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}.company-edit-grid .full{grid-column:1/-1}.company-history{margin-top:14px;padding-top:14px;border-top:1px solid #ddd}.company-history-item{padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;line-height:1.55}.company-history-item:last-child{border-bottom:0}.company-history-date{font-weight:800}.company-history-change{margin-top:3px}@media(max-width:560px){.company-edit-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(style);
  async function getJson(path){const r=await fetch(U+path,{headers:H});const d=await r.json();if(!r.ok)throw Error(d?.message||`取得に失敗しました (${r.status})`);return d}
  async function patchCompany(id,body){const r=await fetch(`${U}/rest/v1/companies?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok){const t=await r.text();throw Error(`会社情報の保存に失敗しました (${r.status}) ${t.slice(0,160)}`)}}
  async function addHistory(companyId,changeType,oldData,newData,sourceNote){const r=await fetch(`${U}/rest/v1/company_change_history`,{method:'POST',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify({company_id:companyId,change_type:changeType,old_data:oldData,new_data:newData,source_note:sourceNote||null})});if(!r.ok){const t=await r.text();throw Error(`変更履歴の保存に失敗しました (${r.status}) ${t.slice(0,160)}`)}}
  function historyHtml(rows){if(!rows.length)return '<div class="muted">まだ変更履歴はありません。</div>';return rows.map(h=>{const oldData=h.old_data||{},newData=h.new_data||{};const changes=FIELDS.filter(([k])=>String(oldData[k]??'')!==String(newData[k]??'')).map(([k,label])=>`<div class="company-history-change"><strong>${esc(label)}</strong><br><span class="muted">旧：</span>${esc(oldData[k]||'—')}<br><span class="muted">新：</span>${esc(newData[k]||'—')}</div>`).join('');const dt=h.changed_at?new Date(h.changed_at).toLocaleString('ja-JP'):'日時不明';return `<div class="company-history-item"><div class="company-history-date">${esc(dt)}　${esc(h.change_type||'会社情報更新')}</div>${h.source_note?`<div class="muted">情報源：${esc(h.source_note)}</div>`:''}${changes||'<div class="muted">詳細変更なし</div>'}</div>`}).join('')}
  let enhancing=false,lastCompanyId='';
  async function enhanceCompany(){if(enhancing)return;if(profile.classList.contains('hidden'))return;const match=location.hash.match(/^#company-(.+)$/);if(!match)return;const companyId=decodeURIComponent(match[1]);if(document.getElementById('companyInfoEditButton')&&lastCompanyId===companyId)return;enhancing=true;lastCompanyId=companyId;try{document.getElementById('companyInfoEditButton')?.remove();document.getElementById('companyInfoEditBox')?.remove();const rows=await getJson(`/rest/v1/companies?id=eq.${encodeURIComponent(companyId)}&select=id,company_name,office_name,postal_code,address,phone,fax,website`);if(!rows.length)return;const c=rows[0];const history=await getJson(`/rest/v1/company_change_history?company_id=eq.${encodeURIComponent(companyId)}&select=id,changed_at,change_type,old_data,new_data,source_note&order=changed_at.desc&limit=20`);const addressBlock=[...profile.children].find(el=>el.tagName==='DIV'&&el.querySelector(':scope > strong')?.textContent.trim()==='住所');if(!addressBlock)return;const btn=document.createElement('button');btn.type='button';btn.id='companyInfoEditButton';btn.className='secondary';btn.textContent='会社情報を編集';const box=document.createElement('div');box.id='companyInfoEditBox';box.className='hidden company-edit-box';box.innerHTML=`<h3>会社情報を更新</h3><div class="company-edit-grid"><div class="full"><label>会社名</label><input id="editCompanyName" value="${esc(c.company_name||'')}"></div><div><label>事業所名</label><input id="editOfficeName" value="${esc(c.office_name||'')}" placeholder="例：福岡工場"></div><div><label>郵便番号</label><input id="editPostalCode" value="${esc(c.postal_code||'')}" placeholder="例：838-0211"></div><div class="full"><label>住所</label><input id="editCompanyAddress" value="${esc(c.address||'')}"></div><div><label>電話</label><input id="editCompanyPhone" value="${esc(c.phone||'')}" inputmode="tel"></div><div><label>FAX</label><input id="editCompanyFax" value="${esc(c.fax||'')}" inputmode="tel"></div><div class="full"><label>公式サイト</label><input id="editCompanyWebsite" value="${esc(c.website||'')}" inputmode="url"></div><div><label>変更内容</label><select id="editChangeType"><option>会社情報更新</option><option>移転・住所変更</option><option>電話・FAX変更</option><option>社名変更</option><option>その他</option></select></div><div><label>情報源</label><input id="editSourceNote" placeholder="例：新しい名刺、移転案内、担当者連絡"></div></div><button type="button" class="primary" id="saveCompanyInfoButton">更新して履歴を残す</button><div class="company-history"><h3>会社情報の変更履歴</h3>${historyHtml(history)}</div>`;addressBlock.insertAdjacentElement('afterend',box);addressBlock.insertAdjacentElement('afterend',btn);btn.onclick=()=>box.classList.toggle('hidden');const addressInput=document.getElementById('editCompanyAddress');addressInput.addEventListener('input',()=>{if(addressInput.value.trim()!==String(c.address||'').trim())document.getElementById('editChangeType').value='移転・住所変更'});document.getElementById('saveCompanyInfoButton').onclick=async function(){const next={company_name:document.getElementById('editCompanyName').value.trim(),office_name:document.getElementById('editOfficeName').value.trim()||null,postal_code:document.getElementById('editPostalCode').value.trim()||null,address:document.getElementById('editCompanyAddress').value.trim(),phone:document.getElementById('editCompanyPhone').value.trim(),fax:document.getElementById('editCompanyFax').value.trim()||null,website:document.getElementById('editCompanyWebsite').value.trim()||null};if(!next.company_name)return alert('会社名を入力してください');const old={company_name:c.company_name||'',office_name:c.office_name||null,postal_code:c.postal_code||null,address:c.address||'',phone:c.phone||'',fax:c.fax||null,website:c.website||null};const changed=FIELDS.some(([k])=>String(old[k]??'')!==String(next[k]??''));if(!changed)return alert('変更された項目はありません。');const changeType=document.getElementById('editChangeType').value||'会社情報更新';const sourceNote=document.getElementById('editSourceNote').value.trim();if(!confirm('会社情報を更新します。古い情報は変更履歴に残します。よろしいですか？'))return;const original=this.textContent;this.disabled=true;this.textContent='更新中…';try{await patchCompany(companyId,next);await addHistory(companyId,changeType,old,next,sourceNote);if(typeof loadRegionCustomerCounts==='function')await loadRegionCustomerCounts();alert('会社情報を更新し、変更履歴を保存しました。');if(typeof showCompany==='function')await showCompany(companyId,false)}catch(e){alert(e.message)}finally{if(document.body.contains(this)){this.disabled=false;this.textContent=original}}};}catch(e){console.warn('会社情報編集UIの追加に失敗',e)}finally{enhancing=false}}
  new MutationObserver(()=>queueMicrotask(enhanceCompany)).observe(profile,{childList:true,subtree:false});enhanceCompany();
})();

(()=>{
  const U='https://emauqxftmauvsffdjvyh.supabase.co';
  const K='sb_publishable_9rgwKLiJU9dGVkqttq0-fQ_hrhNqnfa';
  const A='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYXVxeGZ0bWF1dnNmZmRqdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Njg0NzksImV4cCI6MjEwMjQ0NDQ3OX0.iN2xz71VCeP7o6nz89v0wJMrUYkGyPKATtWaCl-MIO4';
  const H={apikey:K,Authorization:`Bearer ${A}`};
  const profile=document.getElementById('companyProfile');if(!profile)return;
  const style=document.createElement('style');style.textContent=`.company-keyman-star{width:48px!important;min-width:48px;height:48px;margin:0 0 8px 10px!important;padding:0!important;border-radius:50%!important;font-size:27px!important;line-height:48px;background:#eee;color:#aaa;border:0;float:right}.company-keyman-star.active{background:#fff0ad;color:#d89b00}.company-keyman-label{font-size:13px;color:#777;margin-left:5px}`;document.head.appendChild(style);
  let busy=false;
  async function enhanceKeymen(){
    if(busy||profile.classList.contains('hidden'))return;
    const m=location.hash.match(/^#company-(.+)$/);if(!m)return;
    const companyId=decodeURIComponent(m[1]);
    const cards=[...profile.querySelectorAll('.contact-person-card')];if(!cards.length)return;
    busy=true;
    try{
      const r=await fetch(`${U}/rest/v1/contacts?company_id=eq.${encodeURIComponent(companyId)}&select=id,name,is_key_person`,{headers:H});const people=await r.json();if(!r.ok)throw Error('キーマン情報を取得できませんでした');
      const unused=[...people];
      for(const card of cards){
        if(card.querySelector('.company-keyman-star'))continue;
        const name=card.querySelector('strong')?.textContent?.trim()||'';
        const idx=unused.findIndex(p=>(p.name||'').trim()===name);if(idx<0)continue;
        const p=unused.splice(idx,1)[0];
        const btn=document.createElement('button');btn.type='button';btn.className=`company-keyman-star ${p.is_key_person?'active':''}`;btn.textContent='★';btn.title=p.is_key_person?'キーマン登録済み':'キーマンに登録';btn.setAttribute('aria-label',btn.title);
        btn.onclick=async()=>{const next=!btn.classList.contains('active');btn.disabled=true;try{const pr=await fetch(`${U}/rest/v1/contacts?id=eq.${encodeURIComponent(p.id)}`,{method:'PATCH',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify({is_key_person:next})});if(!pr.ok)throw Error('キーマンの保存に失敗しました');btn.classList.toggle('active',next);btn.title=next?'キーマン登録済み':'キーマンに登録';btn.setAttribute('aria-label',btn.title)}catch(e){alert(e.message)}finally{btn.disabled=false}};
        card.prepend(btn);
      }
    }catch(e){console.warn(e)}finally{busy=false}
  }
  new MutationObserver(()=>queueMicrotask(enhanceKeymen)).observe(profile,{childList:true,subtree:true});enhanceKeymen();
})();
