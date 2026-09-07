function renderSleepMood(){
 main.innerHTML=`<section><div class="section-head"><div><h1 class="page-title">Sleep + Mood</h1><div class="subtle">Monthly together · annual separate</div></div><button class="btn" onclick="openSleepMood('${iso(today)}')">Log today</button></div>
 <div class="tabs tracker-switch"><button class="${state.smView==='monthly'?'active':''}" onclick="state.smView='monthly';renderSleepMood()">Monthly</button><button class="${state.smView==='annual-sleep'?'active':''}" onclick="state.smView='annual-sleep';renderSleepMood()">Annual Sleep</button><button class="${state.smView==='annual-mood'?'active':''}" onclick="state.smView='annual-mood';renderSleepMood()">Annual Mood</button></div>${monthNav()}
 ${state.smView==='monthly'?sleepMoodMonthly():annualView(state.smView==='annual-sleep'?'sleep':'mood')}</section>`;
}
function sleepMoodMonthly(){const n=daysIn(state.year,state.month);let g='<div class="vertical-grid"><div></div><div class="hdr">Sleep</div><div class="hdr">Mood</div>';for(let d=1;d<=n;d++){const date=`${mk()}-${pad(d)}`,v=db.sleepMood[date]||{};const si=['2–3','4–5','6–7','>8'].indexOf(v.sleep)+1;g+=`<div class="daynum">${d}</div><div class="sq ${si?'sleep-'+si:''}" onclick="openSleepMood('${date}')"></div><div class="sq" onclick="openSleepMood('${date}')">${v.mood?`<img class="mood-thumb" src="${moodImg(v.mood)}">`:''}</div>`}g+='</div>';return `<div class="sm-layout"><div class="card">${g}</div><div class="card"><h3>Sleep (hours)</h3><div class="legend-list">${[['2–3','sleep-1'],['4–5','sleep-2'],['6–7','sleep-3'],['>8','sleep-4']].map(x=>`<div class="legend-row"><i class="legend-swatch ${x[1]}"></i><span>${x[0]}</span></div>`).join('')}</div><hr style="border:0;border-top:1px solid #e6edf1;margin:14px 0"><h3>Mood</h3><div class="legend-list">${moodList.map(m=>`<div class="legend-row"><img class="legend-face" src="${moodImg(m[1])}"><span><strong>${m[0]}</strong><br><span class="subtle">${m[2]}</span></span></div>`).join('')}</div></div></div>`}
function annualView(kind){
  let h='<div class="annual-wrap card"><div class="annual-grid"><div></div>';
  for(let m=0;m<12;m++) h+=`<div class="mth">${'JFMAMJJASOND'[m]}</div>`;
  for(let d=1;d<=31;d++){
    h+=`<div class="dnum">${d}</div>`;
    for(let m=0;m<12;m++){
      if(d>daysIn(state.year,m)){
        h+='<div class="cell"></div>';
        continue;
      }
      const v=db.sleepMood[`${state.year}-${pad(m+1)}-${pad(d)}`]||{};
      if(kind==='sleep'){
        const si=['2–3','4–5','6–7','>8'].indexOf(v.sleep)+1;
        h+=`<div class="cell ${si?'sleep-'+si:''}"></div>`;
      } else {
        h+=`<div class="cell">${v.mood?`<img src="${moodImg(v.mood)}">`:''}</div>`;
      }
    }
  }
  return h+'</div></div>';
}
