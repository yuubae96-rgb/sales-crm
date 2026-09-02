(()=>{
  const byId=id=>document.getElementById(id);
  const escapeHtml=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const normalize=s=>(s||'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
  const companyNormalize=s=>normalize(s).replace(/株式会社|有限会社|合同会社|合資会社|合名会社|\(株\)|（株）|\(有\)|（有）/g,'');
  const SUPABASE_URL='https://emauqxftmauvsffdjvyh.supabase.co';
  const SUPABASE_KEY='sb_publishable_9rgwKLiJU9dGVkqttq0-fQ_hrhNqnfa';
  const SUPABASE_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYXVxeGZ0bWF1dnNmZmRqdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Njg0NzksImV4cCI6MjEwMjQ0NDQ3OX0.iN2xz71VCeP7o6nz89v0wJMrUYkGyPKATtWaCl-MIO4';
  const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_ANON}`};

  const style=document.createElement('style');
  style.textContent=`
    .person-row{display:flex;gap:12px;align-items:flex-start}
    .person-main{flex:1;min-width:0}
    .person-company{font-size:14px;font-weight:800;color:#555;margin:3px 0 6px}
    .keyman-button{width:48px;min-width:48px;height:48px;margin:0;padding:0;border-radius:50%;font-size:27px;line-height:48px;background:#eee;color:#aaa;border:0}
    .keyman-button.active{background:#fff0ad;color:#d89b00}
    .manual-person-form,.manual-company-form{margin-top:12px;padding:14px;border:1px solid #ddd;border-radius:14px;background:#fafafa}
    .manual-key-row{display:flex;align-items:center;gap:8px;margin-top:14px;font-weight:700}
    .manual-key-row input{width:20px;height:20px;margin:0}
    .person-search-box{margin-top:12px;padding:12px;border:1px solid #ddd;border-radius:14px;background:#fafafa}
    .person-filter-row{display:flex;gap:10px;align-items:center;margin-top:10px}
    .person-filter-row label{display:flex;align-items:center;gap:7px;margin:0;font-weight:700}
    .person-filter-row input{width:20px;height:20px;margin:0}
    .person-result-count{font-size:13px;color:#666;margin-top:8px}
    .person-status-badge{display:inline-block;margin:0 0 7px;padding:4px 9px;border-radius:999px;font-size:13px;font-weight:800;background:#d93025;color:#fff}
    .person-status-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
    .person-status-actions button{width:auto;margin:0;padding:8px 11px;border-radius:9px;font-size:14px;background:#eee;color:#222}
    .person-status-actions button.active-status{background:#d93025;color:#fff}
    .person-status-actions button.delete-person{background:#fff0f0;color:#b3261e;border:1px solid #efb7b3}
    .person-inactive{background:#fff6f5}
  `;
  document.head.appendChild(style);

  const card=byId('contactListButton')?.closest('.card');
  if(!card)return;

  const companyCard=byId('companyListButton')?.closest('.card');
  if(companyCard&&!byId('manualCompanyButton')){
    const btn=document.createElement('button');
    btn.type='button';btn.id='manualCompanyButton';btn.className='secondary';btn.textContent='会社を手入力で登録';
    byId('companyListButton').insertAdjacentElement('afterend',btn);
    const form=document.createElement('div');
    form.id='manualCompanyForm';form.className='hidden manual-company-form';
    form.innerHTML=`
      <label>会社名</label><input id="manualNewCompanyName" placeholder="例：株式会社〇〇">
      <label>取引先区分</label><select id="manualNewRelationship"><option>顧客</option><option>材料メーカー</option><option>外注先</option><option>設備会社</option><option>その他</option></select>
      <label>住所</label><input id="manualNewCompanyAddress" placeholder="例：福岡県北九州市…">
      <label>電話</label><input id="manualNewCompanyPhone" inputmode="tel">
      <label>公式サイト</label><input id="manualNewCompanyWebsite" inputmode="url" placeholder="https://…">
      <button type="button" class="primary" id="saveManualCompanyButton">会社を登録する</button>`;
    btn.insertAdjacentElement('afterend',form);
  }

  if(!byId('contactSearchBox')){
    const search=document.createElement('div');search.id='contactSearchBox';search.className='person-search-box';
    search.innerHTML=`<label for="contactSearchInput">人物を検索</label><input id="contactSearchInput" type="search" placeholder="氏名・会社名・部署・役職・電話・メールで検索" autocomplete="off"><div class="person-filter-row"><label><input type="checkbox" id="keyPersonOnly">★ キーマンだけ表示</label></div><div id="personResultCount" class="person-result-count"></div>`;
    byId('contactListButton').insertAdjacentElement('afterend',search);
  }

  if(!byId('manualContactButton')){
    const btn=document.createElement('button');btn.type='button';btn.id='manualContactButton';btn.className='secondary';btn.textContent='名刺なしで人物を登録';byId('contactListButton').insertAdjacentElement('afterend',btn);
    const form=document.createElement('div');form.id='manualContactForm';form.className='hidden manual-person-form';
    form.innerHTML=`<label>会社名</label><input id="manualCompanyName" list="manualCompanyOptions" placeholder="会社名を入力・選択"><datalist id="manualCompanyOptions"></datalist><label>氏名</label><input id="manualPersonName" placeholder="例：山田 太郎"><label>部署</label><input id="manualDepartment" placeholder="例：製造部"><label>役職</label><input id="manualPosition" placeholder="例：課長"><label>電話</label><input id="manualPhone" inputmode="tel"><label>メール</label><input id="manualEmail" inputmode="email"><label class="manual-key-row"><input type="checkbox" id="manualIsKeyPerson">★ この人はキーマン</label><button type="button" class="primary" id="saveManualContactButton">人物を登録する</button>`;
    btn.insertAdjacentElement('afterend',form);
  }

  let companies=[];
  async function apiGet(path){const r=await fetch(SUPABASE_URL+path,{headers});const d=await r.json();if(!r.ok)throw Error(d?.message||`データ取得エラー (${r.status})`);return d}
  async function apiGetAll(path,pageSize=100){let all=[],offset=0;while(true){const sep=path.includes('?')?'&':'?';const page=await apiGet(`${path}${sep}limit=${pageSize}&offset=${offset}`);all.push(...page);if(page.length<pageSize)break;offset+=pageSize}return all}
  async function apiPatch(path,body){const r=await fetch(SUPABASE_URL+path,{method:'PATCH',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error('保存に失敗しました');return r}
  async function apiDelete(path){const r=await fetch(SUPABASE_URL+path,{method:'DELETE',headers});if(!r.ok){const t=await r.text();throw Error(`削除に失敗しました (${r.status}) ${t.slice(0,120)}`)}return r}
  async function loadCompanies(){companies=await apiGetAll('/rest/v1/companies?select=id,company_name&order=company_name.asc');const dl=byId('manualCompanyOptions');if(dl)dl.innerHTML=companies.map(c=>`<option value="${escapeHtml(c.company_name||'')}"></option>`).join('');return companies}
  function findExistingCompany(name){const exact=companies.find(c=>normalize(c.company_name)===normalize(name));if(exact)return exact;const target=companyNormalize(name);return companies.find(c=>companyNormalize(c.company_name)===target)||null}

  if(byId('manualCompanyButton'))byId('manualCompanyButton').onclick=()=>byId('manualCompanyForm').classList.toggle('hidden');
  if(byId('saveManualCompanyButton'))byId('saveManualCompanyButton').onclick=async function(){
    const companyName=(byId('manualNewCompanyName').value||'').trim();if(!companyName)return alert('会社名を入力してください');
    this.disabled=true;this.textContent='登録中…';
    try{
      await loadCompanies();const existing=findExistingCompany(companyName);if(existing)return alert(`「${existing.company_name}」はすでに登録されています。`);
      const body={company_name:companyName,relationship_type:byId('manualNewRelationship').value||'顧客',address:(byId('manualNewCompanyAddress').value||'').trim(),phone:(byId('manualNewCompanyPhone').value||'').trim(),website:(byId('manualNewCompanyWebsite').value||'').trim()||null,ai_review_status:'未調査'};
      const r=await fetch(`${SUPABASE_URL}/rest/v1/companies`,{method:'POST',headers:{...headers,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d?.message||'会社登録に失敗しました');
      alert('会社を登録しました');['manualNewCompanyName','manualNewCompanyAddress','manualNewCompanyPhone','manualNewCompanyWebsite'].forEach(id=>byId(id).value='');byId('manualNewRelationship').value='顧客';byId('manualCompanyForm').classList.add('hidden');await loadCompanies();if(typeof loadRegionCustomerCounts==='function')loadRegionCustomerCounts();
    }catch(e){alert(e.message)}finally{this.disabled=false;this.textContent='会社を登録する'}
  };

  let allPeople=[],companyNames=new Map();
  function renderContacts(){
    const q=normalize(byId('contactSearchInput')?.value||'');const keyOnly=!!byId('keyPersonOnly')?.checked;
    const people=allPeople.filter(c=>{if(keyOnly&&!c.is_key_person)return false;if(!q)return true;const company=companyNames.get(String(c.company_id))||'';return normalize([c.name,company,c.department,c.position,c.phone,c.email,c.employment_status].join(' ')).includes(q)});
    const list=byId('contactList');
    list.innerHTML=people.map(c=>{const status=c.employment_status||'在籍';const inactive=status==='退職'||status==='異動';return `<div class="row person-row ${inactive?'person-inactive':''}"><div class="person-main">${inactive?`<span class="person-status-badge">${escapeHtml(status)}</span><br>`:''}<strong>${escapeHtml(c.name||'氏名未登録')}</strong><div class="person-company">${escapeHtml(companyNames.get(String(c.company_id))||'会社名未登録')}</div>${escapeHtml(c.department||'')} ${escapeHtml(c.position||'')}<br>${escapeHtml(c.phone||'')}<br>${escapeHtml(c.email||'')}<div class="person-status-actions"><button type="button" data-person-status-id="${c.id}" data-person-status="退職" class="${status==='退職'?'active-status':''}">退職</button><button type="button" data-person-status-id="${c.id}" data-person-status="異動" class="${status==='異動'?'active-status':''}">異動</button>${inactive?`<button type="button" data-person-status-id="${c.id}" data-person-status="在籍">在籍に戻す</button>`:''}<button type="button" class="delete-person" data-delete-person-id="${c.id}" data-delete-person-name="${escapeHtml(c.name||'この人物')}">削除</button></div></div><button type="button" class="keyman-button ${c.is_key_person?'active':''}" data-key-person-id="${c.id}" data-key-person-value="${c.is_key_person?'1':'0'}">★</button></div>`}).join('')||'<p class="muted">該当する人物はいません。</p>';
    list.classList.remove('hidden');if(byId('personResultCount'))byId('personResultCount').textContent=`${people.length}人表示 / 全${allPeople.length}人`;
    list.querySelectorAll('[data-key-person-id]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.keyPersonId,next=btn.dataset.keyPersonValue!=='1';btn.disabled=true;try{await apiPatch(`/rest/v1/contacts?id=eq.${id}`,{is_key_person:next});await loadContacts()}catch(e){btn.disabled=false;alert(e.message)}});
    list.querySelectorAll('[data-person-status-id]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.personStatusId,status=btn.dataset.personStatus;btn.disabled=true;try{const body={employment_status:status};if(status!=='在籍')body.is_key_person=false;await apiPatch(`/rest/v1/contacts?id=eq.${id}`,body);await loadContacts()}catch(e){btn.disabled=false;alert(e.message)}});
    list.querySelectorAll('[data-delete-person-id]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.deletePersonId,name=btn.dataset.deletePersonName||'この人物';if(!confirm(`「${name}」を削除しますか？\nこの人物に紐づく営業活動も削除されます。`))return;btn.disabled=true;try{await apiDelete(`/rest/v1/contacts?id=eq.${id}`);await loadContacts()}catch(e){btn.disabled=false;alert(e.message)}})
  }
  async function loadContacts(){try{const [people,cos]=await Promise.all([apiGetAll('/rest/v1/contacts?select=*&order=is_key_person.desc,name.asc'),apiGetAll('/rest/v1/companies?select=id,company_name')]);allPeople=people;companyNames=new Map(cos.map(c=>[String(c.id),c.company_name||'']));renderContacts()}catch(e){alert(e.message)}}

  byId('contactListButton').onclick=loadContacts;byId('contactSearchInput').oninput=()=>{if(allPeople.length)renderContacts()};byId('keyPersonOnly').onchange=()=>{if(allPeople.length)renderContacts()};
  byId('manualContactButton').onclick=async()=>{const form=byId('manualContactForm');const open=form.classList.contains('hidden');form.classList.toggle('hidden');if(open&&!companies.length){try{await loadCompanies()}catch(e){alert('会社一覧の取得に失敗しました：'+e.message)}}};
  byId('saveManualContactButton').onclick=async function(){
    const companyName=(byId('manualCompanyName').value||'').trim(),name=(byId('manualPersonName').value||'').trim();if(!companyName)return alert('会社名を入力してください');if(!name)return alert('氏名を入力してください');this.disabled=true;this.textContent='登録中…';
    try{if(!companies.length)await loadCompanies();let company=findExistingCompany(companyName);if(!company){await loadCompanies();company=findExistingCompany(companyName)}if(!company){if(!confirm(`「${companyName}」は会社一覧にありません。\n顧客として会社も新規登録しますか？`))return;const r=await fetch(`${SUPABASE_URL}/rest/v1/companies`,{method:'POST',headers:{...headers,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({company_name:companyName,relationship_type:'顧客',ai_review_status:'未調査'})});const d=await r.json();if(!r.ok){if(r.status===409||String(d?.message||'').includes('companies_company_name_normalized_uidx')){await loadCompanies();company=findExistingCompany(companyName);if(!company)throw Error(d?.message||'会社登録に失敗しました')}else throw Error(d?.message||'会社登録に失敗しました')}else{company=d[0];companies.push(company)}}
      const existing=await apiGet(`/rest/v1/contacts?company_id=eq.${company.id}&select=id,name`);if(existing.some(p=>normalize(p.name)===normalize(name))&&!confirm('同じ会社に同名の人物がいます。それでも登録しますか？'))return;
      const r=await fetch(`${SUPABASE_URL}/rest/v1/contacts`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({company_id:company.id,name,department:byId('manualDepartment').value||'',position:byId('manualPosition').value||'',phone:byId('manualPhone').value||'',email:byId('manualEmail').value||'',is_key_person:byId('manualIsKeyPerson').checked,employment_status:'在籍'})});if(!r.ok){const t=await r.text();throw Error(`人物登録に失敗しました (${r.status}) ${t.slice(0,160)}`)}
      alert('人物を登録しました');['manualCompanyName','manualPersonName','manualDepartment','manualPosition','manualPhone','manualEmail'].forEach(id=>byId(id).value='');byId('manualIsKeyPerson').checked=false;byId('manualContactForm').classList.add('hidden');await loadContacts()
    }catch(e){alert(e.message)}finally{this.disabled=false;this.textContent='人物を登録する'}
  };
})();