const models=[{"model": "GPT-1", "year": "2018", "total_billions": 0.117, "active_billions": null, "evidence": "Disclosed", "architecture": "Dense"}, {"model": "GPT-2", "year": "2019", "total_billions": 1.5, "active_billions": null, "evidence": "Disclosed", "architecture": "Dense"}, {"model": "GPT-3", "year": "2020", "total_billions": 175, "active_billions": null, "evidence": "Disclosed", "architecture": "Dense"}, {"model": "GPT-4", "year": "2023", "total_billions": 1800, "active_billions": 280, "evidence": "Estimate", "architecture": "MoE"}, {"model": "GPT-4o", "year": "2024", "total_billions": 200, "active_billions": 10, "evidence": "Estimate", "architecture": "MoE"}, {"model": "GPT-4.5", "year": "2025", "total_billions": 4500, "active_billions": 225, "evidence": "Estimate", "architecture": "MoE"}, {"model": "GPT-5", "year": "2025", "total_billions": 3000, "active_billions": 150, "evidence": "Estimate", "architecture": "MoE"}, {"model": "GPT-5.6 Sol", "year": "2026", "total_billions": 5000, "active_billions": 150, "evidence": "Estimate", "architecture": "MoE"}, {"model": "GPT-6 Astra", "year": "2026", "total_billions": 10000, "active_billions": 250, "evidence": "Estimate", "architecture": "MoE"}, {"model": "Claude Fable 5.1", "year": "2026", "total_billions": 10000, "active_billions": 150, "evidence": "Estimate", "architecture": "MoE"}, {"model": "Claude Opus 5.5", "year": "2026", "total_billions": 3000, "active_billions": 150, "evidence": "Estimate", "architecture": "MoE"}, {"model": "GPT-6.1 Sol", "year": "2026", "total_billions": 2500, "active_billions": 150, "evidence": "Estimate", "architecture": "MoE"}];

const svgNS='http://www.w3.org/2000/svg';
const svg=document.querySelector('.scaling-svg'), layer=document.querySelector('#chart-content');
let mode='linear', selected=8;
function draw(){
 const mobile=window.matchMedia('(max-width:600px)').matches;
 const w=mobile?380:900,h=mobile?420:500,left=mobile?46:62,right=mobile?22:28,top=26,bottom=56;
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`); layer.replaceChildren();
 const x=year=>left+(year-2018)/8*(w-left-right);
 const y=v=>top+(1-(mode==='linear'?v/10000:(Math.log10(v)+1)/5))*(h-top-bottom);
 const element=(name,attrs,text)=>{const e=document.createElementNS(svgNS,name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;layer.append(e);return e;};
 const ticks=mode==='linear'?[0,2000,4000,6000,8000,10000]:[.1,1,10,100,1000,10000];
 const format=v=>v>=1000?v/1000+'T':v<1?v*1000+'M':v+'B';
 ticks.forEach(v=>{element('line',{x1:left,x2:w-right,y1:y(v),y2:y(v),class:'plot-grid'});element('text',{x:left-12,y:y(v)+4,'text-anchor':'end',class:'plot-tick'},v===0?'0':format(v));});
 for(let year=2018;year<=2026;year+=2){element('text',{x:x(year),y:h-22,'text-anchor':'middle',class:'plot-tick'},year);}
 const years=[2018,2019,2020,2023,2024,2025,2026];
 const peaks=years.map(year=>({year,total:Math.max(...models.filter(m=>+m.year<=year).map(m=>m.total_billions))}));
 const path='M '+peaks.map(p=>x(p.year)+','+y(p.total)).join(' L ');
 element('path',{d:path,class:'plot-envelope'});
 // Draw active points first. Identical year/count points deliberately co-locate.
 models.forEach(m=>{if(m.active_billions){const px=x(+m.year),py=y(m.active_billions),r=3.5;const e=element('path',{d:`M ${px} ${py-r} L ${px+r} ${py} L ${px} ${py+r} L ${px-r} ${py} Z`,class:'plot-active'});const t=document.createElementNS(svgNS,'title');t.textContent=`${m.model}: estimated ${format(m.active_billions)} active`;e.append(t);}});
 models.forEach(m=>{const e=element('circle',{cx:x(+m.year),cy:y(m.total_billions),r:4,class:m.evidence==='Disclosed'?'plot-disclosed':'plot-estimate'});const t=document.createElementNS(svgNS,'title');t.textContent=`${m.model} (${m.year}): ${m.evidence==='Estimate'?'estimated ':''}${format(m.total_billions)} total`;e.append(t);});
 const chosen=models[selected];
 element('circle',{cx:x(+chosen.year),cy:y(chosen.total_billions),r:9,class:'plot-selected','aria-hidden':'true'});
 if(chosen.active_billions) element('circle',{cx:x(+chosen.year),cy:y(chosen.active_billions),r:8,class:'plot-selected active-selection','aria-hidden':'true'});
 document.querySelector('#selected-model').textContent=`Highlighted: ${chosen.model} · ${chosen.year} · ${chosen.evidence==='Estimate'?'Sourced estimate':'Disclosed'} · ${chosen.evidence==='Estimate'?'~':''}${format(chosen.total_billions)} total${chosen.active_billions?' / ~'+format(chosen.active_billions)+' active':' · dense'}`;
 document.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.model===selected?'true':'false'));
 document.querySelector('#axis-description').textContent=`Total and active parameters · ${mode==='linear'?'linear axis':'log₁₀ axis'} · release year`;
 document.querySelector('#chart-reading').textContent=mode==='linear'?'The linear view makes the rise visible. Early models sit close to the baseline; use the logarithmic view to see their differences.':'Equal vertical distances represent tenfold changes. The same evidence now reveals the differences among early models and between total and active counts.';
 document.querySelectorAll('[data-scale]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.scale===mode?'true':'false'));
}
document.querySelectorAll('[data-scale]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.scale;draw();}));
document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>{selected=+b.dataset.model;draw();document.querySelector('#selected-model').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
window.addEventListener('resize',draw);draw();
