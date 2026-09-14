const wellnessIronLegend=[['No','no','#ffffff'],['Yes','yes','#cdb9f3'],['2 tabs','two','#8c6fd1']];
const wellnessFoodLegend=[['No tracked iron-rich food','none','#ffffff'],['Fish','fish','#ead8c2'],['Beef','beef','#b98b62'],['Chicken','chicken','#f0dfca'],['Pork','pork','#d7b994'],['Spinach','spinach','#b9dfba']];

function wellnessEnsureData(){
 db.wellnessIntake=db.wellnessIntake&&typeof db.wellnessIntake==='object'&&!Array.isArray(db.wellnessIntake)?db.wellnessIntake:{};
 db.wellnessHistory=Array.isArray(db.wellnessHistory)?db.wellnessHistory:[];
}
wellnessEnsureData();

function setWellnessView(view){state.wellnessView=view;renderWellness()}
function wellnessDateLabel(date){return new Date(date+'T12:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}
function latestWellness(type){return [...db.wellnessHistory].filter(x=>x.type===type&&x.date).sort((a,b)=>b.date.localeCompare(a.date))[0]||null}
function renderWellness(){
 wellnessEnsureData();
 const view=state.wellnessView||'intake';
 const tabs=`<div class="tabs wellness-tabs"><button class="${view==='intake'?'active':''}" onclick="setWellnessView('intake')">Iron & Meat Intake</button><button class="${view==='history'?'active':''}" onclick="setWellnessView('history')">Health History</button></div>`;
 if(view==='history')return renderWellnessHistory(tabs);
 const ironLegend=wellnessIronLegend.map(x=>`<div class="wellness-legend-item"><i style="background:${x[2]}"></i><span>${x[0]}</span></div>`).join('');
 const foodLegend=wellnessFoodLegend.map(x=>`<div class="wellness-legend-item"><i style="background:${x[2]}"></i><span>${x[0]}</span></div>`).join('');
 main.innerHTML=`<section class="wellness-page"><div class="section-head"><div><h1 class="page-title">Wellness Check</h1><div class="subtle">Iron tablets, iron-rich food and health history</div></div><button class="btn" onclick="openWellnessIntake('${iso(today)}')">Record today</button></div>${tabs}${monthNav()}<div class="wellness-wheel-layout"><div class="card wellness-wheel-card" id="wellnessWheel"></div><div class="wellness-legends"><div class="card wellness-legend-block"><h3>Iron Tablets</h3><div class="wellness-legend-items iron-legend">${ironLegend}</div></div><div class="card wellness-legend-block"><h3>Food Source</h3><div class="wellness-legend-items food-legend">${foodLegend}</div></div></div></div></section>`;
 drawWellnessWheel();
}

function drawWellnessWheel(){
 const el=$('#wellnessWheel');if(!el)return;
 const n=daysIn(state.year,state.month),step=360/n;
 const ironColours={no:'#ffffff',yes:'#cdb9f3',two:'#8c6fd1'};
 const foodColours={none:'#ffffff',fish:'#ead8c2',beef:'#b98b62',chicken:'#f0dfca',pork:'#d7b994',spinach:'#b9dfba'};
 let svg=`<svg viewBox="0 0 360 360" aria-label="Iron tablets and food source monthly wheel"><circle cx="180" cy="180" r="70" fill="#f8fbfc"/>`;
 for(let d=1;d<=n;d++){
  const date=`${mk()}-${pad(d)}`,v=db.wellnessIntake[date]||{},iron=ironColours[v.iron]||'#ffffff',food=foodColours[v.food]||'#ffffff',a0=(d-1)*step+.8,a1=d*step-.8;
  svg+=`<path d="${wedge(180,180,128,166,a0,a1)}" fill="${food}" stroke="#fff" stroke-width="1.4" onclick="openWellnessIntake('${date}')"/>`;
  svg+=`<path d="${wedge(180,180,78,114,a0,a1)}" fill="${iron}" stroke="#fff" stroke-width="1.4" onclick="openWellnessIntake('${date}')"/>`;
  const p=polar(180,180,121,(a0+a1)/2);svg+=`<text x="${p.x}" y="${p.y+3}" text-anchor="middle" class="wellness-wheel-day">${d}</text>`;
 }
 svg+=`<text x="180" y="176" text-anchor="middle" class="wellness-wheel-center">${monthName(state.year,state.month)}</text><text x="180" y="195" text-anchor="middle" class="wellness-wheel-sub">iron + food</text></svg>`;
 el.innerHTML=svg;
}

function openWellnessIntake(date){
 wellnessEnsureData();
 const v=db.wellnessIntake[date]||{};
 modal(`<h2>Iron & Meat Intake · ${fmtDate(date)}</h2><div class="field"><label>Iron tablets</label><div class="choice-grid" id="wellnessIronChoices">${wellnessIronLegend.map(x=>`<button class="choice ${v.iron===x[1]?'active':''}" data-v="${x[1]}" onclick="chooseOne(this,'#wellnessIronChoices')">${x[0]}</button>`).join('')}</div></div><div class="field" style="margin-top:12px"><label>Iron-rich food source</label><div class="choice-grid wellness-food-choices" id="wellnessFoodChoices">${wellnessFoodLegend.map(x=>`<button class="choice ${v.food===x[1]?'active':''}" data-v="${x[1]}" onclick="chooseOne(this,'#wellnessFoodChoices')">${x[0]}</button>`).join('')}</div></div><div class="btn-row"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="saveWellnessIntake('${date}')">Save</button></div>`)
}
function saveWellnessIntake(date){
 db.wellnessIntake[date]={iron:$('#wellnessIronChoices .active')?.dataset.v||'no',food:$('#wellnessFoodChoices .active')?.dataset.v||'none'};
 save();closeModal();state.route='wellness';state.wellnessView='intake';renderWellness();
}

function renderWellnessHistory(tabs){
 wellnessEnsureData();
 const lastBlood=latestWellness('blood'),lastDoctor=latestWellness('doctor');
 const rows=[...db.wellnessHistory].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 main.innerHTML=`<section class="wellness-page"><div class="section-head"><div><h1 class="page-title">Wellness Check</h1><div class="subtle">Doctor visits, tests, referrals and prescriptions</div></div><button class="btn" onclick="openWellnessHistoryEntry()">Add entry</button></div>${tabs}<div class="wellness-history-summary grid2">${card('Last blood test',lastBlood?wellnessDateLabel(lastBlood.date):'—',lastBlood?(lastBlood.doctor||'recorded'):'none recorded')}${card('Last doctor consult',lastDoctor?wellnessDateLabel(lastDoctor.date):'—',lastDoctor?(lastDoctor.doctor||'recorded'):'none recorded')}</div><section class="section"><div class="section-head"><h2>Health-check history</h2></div><div class="wellness-history-list">${rows.length?rows.map(wellnessHistoryRow).join(''):'<div class="card empty">No health-check history recorded yet.</div>'}</div></section></section>`;
}
function wellnessHistoryRow(x){
 const type={doctor:'Doctor consult',blood:'Blood test',health:'Health check'}[x.type]||'Health check';
 const refs=(x.referrals||[]).map(r=>({blood:'Blood',urine:'Urine',other:'Other'}[r]||r)).join(', ');
 return `<button class="card wellness-history-row" onclick="openWellnessHistoryEntry('${x.id}')"><div><strong>${type}</strong><span>${wellnessDateLabel(x.date)}</span></div><div class="wellness-history-copy">${x.reason?`<b>${escapeHTML(x.reason)}</b>`:''}${x.doctor?`<small>${escapeHTML(x.doctor)}</small>`:''}${refs?`<small>Referral: ${escapeHTML(refs)}</small>`:''}${x.prescriptions?`<small>Prescription: ${escapeHTML(x.prescriptions)}</small>`:''}</div><div class="wellness-history-cost">${Number(x.cost)>0?fmtMoney(x.cost):''}</div></button>`;
}

function openWellnessHistoryEntry(id=''){
 wellnessEnsureData();
 const x=db.wellnessHistory.find(r=>r.id===id)||{id:'',date:iso(today),type:'doctor',reason:'',doctor:'',referrals:[],otherReferral:'',prescriptions:'',cost:'',notes:''};
 modal(`<h2>${id?'Edit':'Add'} health history</h2><div class="form-grid"><div class="field"><label>Date</label><input id="whDate" type="date" value="${x.date||iso(today)}"></div><div class="field"><label>Entry type</label><select id="whType"><option value="doctor" ${x.type==='doctor'?'selected':''}>Doctor consult</option><option value="blood" ${x.type==='blood'?'selected':''}>Blood test</option><option value="health" ${x.type==='health'?'selected':''}>Other health check</option></select></div><div class="field full"><label>Reason for visit / check</label><input id="whReason" value="${escapeHTML(x.reason||'')}" placeholder="Reason for visit"></div><div class="field full"><label>Doctor</label><input id="whDoctor" value="${escapeHTML(x.doctor||'')}" placeholder="Doctor or clinic"></div><div class="field full"><label>Diagnostic-test referral</label><div class="check-grid wellness-referrals" id="whReferrals">${[['blood','Blood'],['urine','Urine'],['other','Other']].map(r=>`<button type="button" class="check-choice ${(x.referrals||[]).includes(r[0])?'active':''}" data-v="${r[0]}" onclick="this.classList.toggle('active')">${r[1]}</button>`).join('')}</div></div><div class="field full"><label>Other referral details</label><input id="whOtherReferral" value="${escapeHTML(x.otherReferral||'')}" placeholder="e.g. ultrasound, imaging"></div><div class="field full"><label>Prescriptions (and what for)</label><input id="whPrescriptions" value="${escapeHTML(x.prescriptions||'')}" placeholder="Medication / reason"></div><div class="field"><label>Cost</label><input id="whCost" type="number" min="0" step="0.01" inputmode="decimal" value="${x.cost??''}"></div><div class="field full"><label>Notes</label><textarea id="whNotes">${escapeHTML(x.notes||'')}</textarea></div></div><div class="btn-row">${id?`<button class="btn secondary" onclick="deleteWellnessHistory('${id}')">Delete</button>`:''}<button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn" onclick="saveWellnessHistory('${id}')">Save</button></div>`)
}
function saveWellnessHistory(id=''){
 const rec={id:id||uid(),date:$('#whDate').value,type:$('#whType').value,reason:$('#whReason').value.trim(),doctor:$('#whDoctor').value.trim(),referrals:$$('#whReferrals .active').map(x=>x.dataset.v),otherReferral:$('#whOtherReferral').value.trim(),prescriptions:$('#whPrescriptions').value.trim(),cost:Math.max(0,Number($('#whCost').value||0)),notes:$('#whNotes').value.trim()};
 if(!rec.date){alert('Please choose a date.');return}
 const i=db.wellnessHistory.findIndex(x=>x.id===id);if(i>=0)db.wellnessHistory[i]=rec;else db.wellnessHistory.push(rec);save();closeModal();state.route='wellness';state.wellnessView='history';renderWellness();
}
function deleteWellnessHistory(id){if(!confirm('Delete this health-history entry?'))return;db.wellnessHistory=db.wellnessHistory.filter(x=>x.id!==id);save();closeModal();state.route='wellness';state.wellnessView='history';renderWellness()}

const originalNormalizeImportedData=normalizeImportedData;
normalizeImportedData=function(raw){
 const next=originalNormalizeImportedData(raw),obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 next.wellnessIntake=obj(raw.wellnessIntake);
 next.wellnessHistory=Array.isArray(raw.wellnessHistory)?raw.wellnessHistory:[];
 return next;
};
