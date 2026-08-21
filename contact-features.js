(()=>{
  const byId=id=>document.getElementById(id);
  const escapeHtml=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const normalize=s=>(s||'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
  const SUPABASE_URL=window.U||'https://emauqxftmauvsffdjvyh.supabase.co';
  const headers=window.H||{};

  const style=document.createElement('style');
  style.textContent=`
    .person-row{display:flex;gap:12px;align-items:flex-start}
    .person-main{flex:1;min-width:0}
    .person-company{font-size:14px;font-weight:800;color:#555;margin:3px 0 6px}
    .keyman-button{width:48px;min-width:48px;height:48px;margin:0;padding:0;border-radius:50%;font-size:27px;line-height:48px;background:#eee;color:#aaa;border:0}
    .keyman-button.active{background:#fff0ad;color:#d89b00}
    .manual-person-form{margin-top:12px;padding:14px;border:1px solid #ddd;border-radius:14px;background:#fafafa}
    .manual-key-row{display:flex;align-items:center;gap:8px;margin-top:14px;font-weight:700}
    .manual-key-row input{width:20px;height:20px;margin:0}
  `;
  document.head.appendChild(style);

  const card=byId('contactListButton')?.closest('.card');
  if(!card)return;

  if(!byId('manualContactButton')){
    const btn=document.createElement('button');
    btn.type='button';
    btn.id='manualContactButton';
    btn.className='secondary';
    btn.textContent='名刺なしで人物を登録';
    byId('contactListButton').insertAdjacentElement('afterend',btn);

    const form=document.createElement('div');
    form.id='manualContactForm';
    form.className='hidden manual-person-form';
    form.innerHTML=`
      <label>会社名</label><input id="manualCompanyName" list="manualCompanyOptions" placeholder="会社名を入力・選択"><datalist id="manualCompanyOptions"></datalist>
      <label>氏名</label><input id="manualPersonName" placeholder="例：山田 太郎">
      <label>部署</label><input id="manualDepartment" placeholder="例：製造部">
      <label>役職</label><input id="manualPosition" placeholder="例：課長">
      <label>電話</label><input id="manualPhone" inputmode="tel">
      <label>メール</label><input id="manualEmail" inputmode="email">
      <label class="manual-key-row"><input type="checkbox" id="manualIsKeyPerson">★ この人はキーマン</label>
      <button type="button" class="primary" id="saveManualContactButton">人物を登録する</button>`;
    btn.insertAdjacentElement('afterend',form);
  }

  let companies=[];
  async function apiGet(path){
    if(typeof window.get==='function')return window.get(path);
    const r=await fetch(SUPABASE_URL+path,{headers});
    const d=await r.json();
    if(!r.ok)throw Error(d?.message||`データ取得エラー (${r.status})`);
    return d;
  }
  async function apiGetAll(path,pageSize=100){
    if(typeof window.getAll==='function')return window.getAll(path,pageSize);
    let all=[],offset=0;
    while(true){const sep=path.includes('?')?'&':'?';const page=await apiGet(`${path}${sep}limit=${pageSize}&offset=${offset}`);all.push(...page);if(page.length<pageSize)break;offset+=pageSize}
    return all;
  }
  async function apiPatch(path,body){
    if(typeof window.patch==='function')return window.patch(path,body);
    const r=await fetch(SUPABASE_URL+path,{method:'PATCH',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw Error('保存に失敗しました');
    return r;
  }
  async function loadCompanies(){
    companies=await apiGetAll('/rest/v1/companies?select=id,company_name&order=company_name.asc');
    const dl=byId('manualCompanyOptions');
    if(dl)dl.innerHTML=companies.map(c=>`<option value="${escapeHtml(c.company_name||'')}"></option>`).join('');
    return companies;
  }

  async function loadContacts(){
    try{
      const [people,cos]=await Promise.all([
        apiGetAll('/rest/v1/contacts?select=*&order=is_key_person.desc,name.asc'),
        apiGetAll('/rest/v1/companies?select=id,company_name')
      ]);
      const names=new Map(cos.map(c=>[String(c.id),c.company_name||'']));
      const list=byId('contactList');
      list.innerHTML=people.map(c=>`<div class="row person-row"><div class="person-main"><strong>${escapeHtml(c.name||'氏名未登録')}</strong><div class="person-company">${escapeHtml(names.get(String(c.company_id))||'会社名未登録')}</div>${escapeHtml(c.department||'')} ${escapeHtml(c.position||'')}<br>${escapeHtml(c.phone||'')}<br>${escapeHtml(c.email||'')}</div><button type="button" class="keyman-button ${c.is_key_person?'active':''}" data-key-person-id="${c.id}" data-key-person-value="${c.is_key_person?'1':'0'}" title="${c.is_key_person?'この人はキーマンです':'キーマンにする'}" aria-label="${c.is_key_person?'キーマンを解除':'キーマンに設定'}">★</button></div>`).join('')||'<p class="muted">人物登録なし</p>';
      list.classList.remove('hidden');
      list.querySelectorAll('[data-key-person-id]').forEach(btn=>btn.onclick=async()=>{
        const id=btn.dataset.keyPersonId;
        const next=btn.dataset.keyPersonValue!=='1';
        btn.disabled=true;
        try{await apiPatch(`/rest/v1/contacts?id=eq.${id}`,{is_key_person:next});await loadContacts()}catch(e){btn.disabled=false;alert(e.message)}
      });
    }catch(e){alert(e.message)}
  }

  byId('contactListButton').onclick=loadContacts;
  byId('manualContactButton').onclick=async()=>{
    const form=byId('manualContactForm');
    const open=form.classList.contains('hidden');
    form.classList.toggle('hidden');
    if(open&&!companies.length){try{await loadCompanies()}catch(e){alert('会社一覧の取得に失敗しました：'+e.message)}}
  };

  byId('saveManualContactButton').onclick=async function(){
    const companyName=(byId('manualCompanyName').value||'').trim();
    const name=(byId('manualPersonName').value||'').trim();
    if(!companyName)return alert('会社名を入力してください');
    if(!name)return alert('氏名を入力してください');
    this.disabled=true;this.textContent='登録中…';
    try{
      if(!companies.length)await loadCompanies();
      let company=companies.find(c=>normalize(c.company_name)===normalize(companyName));
      if(!company){
        if(!confirm(`「${companyName}」は会社一覧にありません。\n顧客として会社も新規登録しますか？`))return;
        const r=await fetch(`${SUPABASE_URL}/rest/v1/companies`,{method:'POST',headers:{...headers,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({company_name:companyName,relationship_type:'顧客',ai_review_status:'未調査'})});
        const d=await r.json();
        if(!r.ok)throw Error(d?.message||'会社登録に失敗しました');
        company=d[0];companies.push(company);
      }
      const existing=await apiGet(`/rest/v1/contacts?company_id=eq.${company.id}&select=id,name`);
      if(existing.some(p=>normalize(p.name)===normalize(name))&&!confirm('同じ会社に同名の人物がいます。それでも登録しますか？'))return;
      const r=await fetch(`${SUPABASE_URL}/rest/v1/contacts`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({company_id:company.id,name,department:byId('manualDepartment').value||'',position:byId('manualPosition').value||'',phone:byId('manualPhone').value||'',email:byId('manualEmail').value||'',is_key_person:byId('manualIsKeyPerson').checked})});
      if(!r.ok){const t=await r.text();throw Error(`人物登録に失敗しました (${r.status}) ${t.slice(0,160)}`)}
      alert('人物を登録しました');
      ['manualCompanyName','manualPersonName','manualDepartment','manualPosition','manualPhone','manualEmail'].forEach(id=>byId(id).value='');
      byId('manualIsKeyPerson').checked=false;
      byId('manualContactForm').classList.add('hidden');
      await loadContacts();
    }catch(e){alert(e.message)}finally{this.disabled=false;this.textContent='人物を登録する'}
  };
})();
