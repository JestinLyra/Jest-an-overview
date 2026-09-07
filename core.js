const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const main=$('#main');
const today=new Date();
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const monthKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const fmtMoney=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(Number(n||0));
const fmtDate=s=>new Date(`${s}T12:00:00`).toLocaleDateString('en-AU',{day:'numeric',month:'short'});
const monthName=(y,m)=>new Date(y,m,1).toLocaleDateString('en-AU',{month:'long',year:'numeric'});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const state={route:'home',track:'sleep',year:today.getFullYear(),month:today.getMonth(),smView:'monthly'};
const defaults={
 purchases:[], cardLimits:{Mx:300,Up:250,Co:250}, budgets:{inStore:350,online:250},
 sleepMood:{}, period:{}, waterSugar:{}
};
let db=JSON.parse(localStorage.getItem('jest-db')||'null')||defaults;
db={...defaults,...db,cardLimits:{...defaults.cardLimits,...(db.cardLimits||{})},budgets:{...defaults.budgets,...(db.budgets||{})}};
const save=()=>localStorage.setItem('jest-db',JSON.stringify(db));

const moodList=[
 ['Cheerful','cheerful','Happy, positive and upbeat'],['Content','content','Calmly satisfied and at ease'],['Emotional','emotional','Feeling things more deeply today'],['Energetic','energetic','Motivated, switched on and ready to go'],['Meh','meh','Neutral, flat or in between'],['Fatigued','fatigued','Physically or mentally tired'],['Unmotivated','unmotivated','Not feeling like doing much'],['Stressed','stressed','Feeling pressured or mentally overwhelmed'],['Bored','bored','Understimulated and restless'],['Easily annoyed','easily-annoyed','Irritable or short patience today']
];
const symptoms=[
 ['Cramps','cramps'],['Bloating','bloating'],['Headache','headache'],['Mood changes','mood-changes'],['Back pain','back-pain'],['Breast tenderness','breast-tenderness'],['Food cravings','food-cravings'],['Sleep issues','sleep-issues'],['Easily annoyed','easily-annoyed']
];
const moodImg=k=>`assets/mood-${k}.webp`;
const symptomImg=k=>`assets/symptom-${k}.webp`;
const daysIn=(y,m)=>new Date(y,m+1,0).getDate();
const mk=()=>`${state.year}-${pad(state.month+1)}`;

function setRoute(route){state.route=route; $$('.nav-btn[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===route)); render();}

function card(title,value,sub='',cls=''){return `<div class="card stat-card ${cls}"><h3>${title}</h3><div class="stat-main">${value}</div>${sub?`<div class="subtle">${sub}</div>`:''}</div>`}
function navMonth(delta){state.month+=delta;if(state.month<0){state.month=11;state.year--}if(state.month>11){state.month=0;state.year++}if(state.route==='home'&&state.track==='sleep'&&document.querySelector('.page-title')?.textContent==='Sleep + Mood')return renderSleepMood();if(state.route==='home'&&state.track==='period'&&document.querySelector('.page-title')?.textContent==='Period + Symptoms')return renderPeriod();if(state.route==='home'&&state.track==='water'&&document.querySelector('.page-title')?.textContent==='Water + Sugar')return renderWaterSugar();render();}
function monthNav(){return `<div class="month-nav"><button onclick="navMonth(-1)">‹</button><strong>${monthName(state.year,state.month)}</strong><button onclick="navMonth(1)">›</button></div>`}

function render(){
 if(state.route==='home') return renderHome();
 if(state.route==='spending') return renderSpending();
 if(state.route==='insights') return renderInsights();
 if(state.route==='more') return renderMore();
}
function currentMonthPurchases(){const k=mk();return db.purchases.filter(p=>p.date.startsWith(k));}
function currentWeekTotal(){const now=new Date(); const day=(now.getDay()+6)%7; const mon=new Date(now);mon.setHours(0,0,0,0);mon.setDate(now.getDate()-day);const sun=new Date(mon);sun.setDate(mon.getDate()+6);return db.purchases.filter(p=>{const d=new Date(p.date+'T12:00:00');return d>=mon&&d<=sun}).reduce((s,p)=>s+Number(p.amount),0)}
function renderHome(){
 const ps=currentMonthPurchases(), spent=ps.reduce((s,p)=>s+Number(p.amount),0), totalBudget=db.budgets.inStore+db.budgets.online;
 const t=iso(today), sm=db.sleepMood[t]||{}, per=db.period[t]||{}, ws=db.waterSugar[t]||{};
 main.innerHTML=`<section class="card hero"><div><div class="script">Hello!</div><div class="subtle">Here’s your overview for ${monthName(state.year,state.month)}</div></div><div class="leaf">🌿</div></section>
 <section class="section grid2">
  ${card('Spending',fmtMoney(spent),`of ${fmtMoney(totalBudget)} budget`)}
  ${card('Sleep',sm.sleep||'—',sm.sleep?'last recorded today':'tap to record')}
  <div class="card stat-card" onclick="openSleepMood('${t}')"><h3>Mood</h3>${sm.mood?`<img class="legend-face" src="${moodImg(sm.mood)}"><div class="stat-main" style="font-size:18px">${moodList.find(x=>x[1]===sm.mood)?.[0]||''}</div>`:'<div class="stat-main">—</div><div class="subtle">tap to record</div>'}</div>
  ${card('Water',ws.water?`${ws.water} L`:'—','today')}
  ${card('Sugar',ws.sugar!=null?`${ws.sugar} serving${ws.sugar===1?'':'s'}`:'—','today')}
  ${card('Period',per.bleeding?per.bleeding:'No entry',per.bleeding?'bleeding logged':'tap to record')}
 </section>
 <section class="section card"><div class="script" style="text-align:center">A healthier, happier you is always a good idea ♡</div></section>
 <section class="section"><div class="segmented tracker-switch"><button onclick="openTracker('sleep')">Sleep + Mood</button><button onclick="openTracker('period')">Period</button><button onclick="openTracker('water')">Water + Sugar</button></div></section>`;
}
function openTracker(which){state.route='home';state.track=which; if(which==='sleep') renderSleepMood(); if(which==='period') renderPeriod(); if(which==='water') renderWaterSugar();}
