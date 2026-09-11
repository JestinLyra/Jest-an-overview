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
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={route:'home',track:'sleep',year:today.getFullYear(),month:today.getMonth(),smView:'monthly',mealsView:'monthly',mealDate:iso(today)};
const defaults={
 purchases:[], cardLimits:{Mx:300,Up:250,Co:250}, budgets:{inStore:350,online:250},
 sleepMood:{}, period:{}, waterSugar:{}, meals:{}
};
let db=JSON.parse(localStorage.getItem('jest-db')||'null')||defaults;
db={...defaults,...db,cardLimits:{...defaults.cardLimits,...(db.cardLimits||{})},budgets:{...defaults.budgets,...(db.budgets||{})},sleepMood:{...(db.sleepMood||{})},period:{...(db.period||{})},waterSugar:{...(db.waterSugar||{})},meals:{...(db.meals||{})},purchases:Array.isArray(db.purchases)?db.purchases:[]};
const save=()=>localStorage.setItem('jest-db',JSON.stringify(db));

const moodList=[
 ['Cheerful','cheerful','Happy, positive and upbeat'],['Content','content','Calmly satisfied and at ease'],['Emotional','emotional','Feeling things more deeply today'],['Energetic','energetic','Motivated, switched on and ready to go'],['Meh','meh','Neutral, flat or in between'],['Fatigued','fatigued','Physically or mentally tired'],['Unmotivated','unmotivated','Not feeling like doing much'],['Stressed','stressed','Feeling pressured or mentally overwhelmed'],['Bored','bored','Understimulated and restless'],['Easily annoyed','easily-annoyed','Irritable or short patience today']
];
const symptoms=[
 ['Cramps','cramps'],['Bloating','bloating'],['Headache','headache'],['Mood changes','mood-changes'],['Back pain','back-pain'],['Breast tenderness','breast-tenderness'],['Food cravings','food-cravings'],['Sleep issues','sleep-issues'],['Easily annoyed','easily-annoyed']
];
const moodArt=(k,cls='')=>`<span class="mood-art mood-${k} ${cls}" aria-hidden="true"></span>`;
const symptomImg=k=>`assets/symptom-${k}.webp`;
const daysIn=(y,m)=>new Date(y,m+1,0).getDate();
const mk=()=>`${state.year}-${pad(state.month+1)}`;
const displaySleep=value=>value==='>8'?'8 or more':value;

function setRoute(route){
 state.route=route;
 if(route==='home'){state.year=today.getFullYear();state.month=today.getMonth();state.smView='monthly'}
 $$('.nav-btn[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
 render();
}

function card(title,value,sub='',cls=''){return `<div class="card stat-card ${cls}"><h3>${title}</h3><div class="stat-main">${value}</div>${sub?`<div class="subtle">${sub}</div>`:''}</div>`}
function homeCard(title,value,sub,onclick){return `<div class="card stat-card home-stat-action" role="button" tabindex="0" onclick="${onclick}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${onclick}}"><h3>${title}</h3><div class="stat-main">${value}</div>${sub?`<div class="subtle">${sub}</div>`:''}</div>`}
function navMonth(delta){state.month+=delta;if(state.month<0){state.month=11;state.year--}if(state.month>11){state.month=0;state.year++}if(state.route==='meals')return renderMeals();if(state.route==='home'&&state.track==='sleep'&&document.querySelector('.page-title')?.textContent==='Sleep + Mood')return renderSleepMood();if(state.route==='home'&&state.track==='period'&&document.querySelector('.page-title')?.textContent==='Period + Symptoms')return renderPeriod();if(state.route==='home'&&state.track==='water'&&document.querySelector('.page-title')?.textContent==='Water + Sugar')return renderWaterSugar();render();}
function monthNav(){return `<div class="month-nav"><button onclick="navMonth(-1)">‹</button><strong>${monthName(state.year,state.month)}</strong><button onclick="navMonth(1)">›</button></div>`}

function render(){
 if(state.route==='home') return renderHome();
 if(state.route==='spending') return renderSpending();
 if(state.route==='insights') return renderInsights();
 if(state.route==='more') return renderMore();
 if(state.route==='meals') return renderMeals();
}
function purchasesForMonth(y,m){const k=`${y}-${pad(m+1)}`;return db.purchases.filter(p=>typeof p?.date==='string'&&p.date.startsWith(k));}
function currentMonthPurchases(){return purchasesForMonth(state.year,state.month)}
function currentWeekTotal(){const now=new Date(); const day=(now.getDay()+6)%7; const mon=new Date(now);mon.setHours(0,0,0,0);mon.setDate(now.getDate()-day);const sun=new Date(mon);sun.setDate(mon.getDate()+6);return db.purchases.filter(p=>{if(typeof p?.date!=='string')return false;const d=new Date(p.date+'T12:00:00');return d>=mon&&d<=sun}).reduce((s,p)=>s+Number(p.amount||0),0)}
function renderHome(){
 const ps=purchasesForMonth(today.getFullYear(),today.getMonth()), spent=ps.reduce((s,p)=>s+Number(p.amount||0),0), totalBudget=db.budgets.inStore+db.budgets.online;
 const t=iso(today), sm=db.sleepMood[t]||{}, per=db.period[t]||{}, ws=db.waterSugar[t]||{};
 const homeSleep=displaySleep(sm.sleep);
 main.innerHTML=`<div class="home-page"><section class="section grid2">
  ${homeCard('Shopping',fmtMoney(spent),`of ${fmtMoney(totalBudget)} budget`,`setRoute('spending')`)}
  ${homeCard('Sleep',homeSleep||'—',sm.sleep?'last recorded today':'tap to record',`openSleepMood('${t}')`)}
  <div class="card stat-card home-stat-action" role="button" tabindex="0" onclick="openSleepMood('${t}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSleepMood('${t}')}" ><h3>Mood</h3>${sm.mood?`${moodArt(sm.mood,'legend-face')}<div class="stat-main" style="font-size:18px">${moodList.find(x=>x[1]===sm.mood)?.[0]||''}</div>`:'<div class="stat-main">—</div><div class="subtle">tap to record</div>'}</div>
  ${homeCard('Water',ws.water?`${ws.water} L`:'—','today',`openWaterSugar('${t}')`)}
  ${homeCard('Sugar',ws.sugar!=null?`${ws.sugar} serving${ws.sugar===1?'':'s'}`:'—','today',`openWaterSugar('${t}')`)}
  ${homeCard('Period',per.bleeding?per.bleeding:'No entry',per.bleeding?'bleeding logged':'tap to record',`openPeriod('${t}')`)}
 </section>
 <div class="home-control-stack">
  <section class="home-quote-shell"><div class="home-quote-art" aria-label="Live healthier. Feel happier. Spend smarter."></div></section>
  <section class="home-secondary-tracker-shell" data-art-ready="true" style="--secondary-tracker-count:1" aria-label="Additional trackers"><div class="home-secondary-tracker-art" aria-hidden="true"></div><div class="home-secondary-tracker-zones"><button class="home-secondary-tracker-zone" aria-label="Meals" onclick="openMeals()">Meals<small>Meal prep · takeaway · spending</small></button></div></section>
  <section class="home-tracker-shell" data-art-ready="true"><div class="home-tracker-art" aria-hidden="true"></div><div class="segmented tracker-switch home-tracker-fallback"><button class="home-tracker-zone" aria-label="Sleep + Mood" onclick="openTracker('sleep')">Sleep + Mood</button><button class="home-tracker-zone" aria-label="Period" onclick="openTracker('period')">Period</button><button class="home-tracker-zone" aria-label="Water + Sweets" onclick="openTracker('water')">Water + Sugar</button></div></section>
 </div></div>`;
}
function openMeals(){state.route='meals';state.mealsView='monthly';state.year=today.getFullYear();state.month=today.getMonth();state.mealDate=iso(today);renderMeals();}
function openTracker(which){state.route='home';state.track=which;state.year=today.getFullYear();state.month=today.getMonth();if(which==='sleep'){state.smView='monthly';renderSleepMood()}if(which==='period')renderPeriod();if(which==='water')renderWaterSugar();}