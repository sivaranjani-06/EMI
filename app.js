const $=s=>document.querySelector(s);
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
$('#burger').onclick=()=>$('#menu').classList.toggle('open');

if($('#amt')){
  let mode='Y',sched=[];
  const f={amt:[10000,50000000,'Loan amount'],rate:[1,30,'Interest rate'],ten:[1,null,'Tenure']};
  const sync=(a,b)=>{$(a).oninput=()=>{$(b).value=$(a).value;calc()}};
  sync('#amtR','#amt');sync('#amt','#amtR');sync('#rateR','#rate');sync('#rate','#rateR');sync('#tenR','#ten');sync('#ten','#tenR');
  $('#unit').onchange=()=>{const y=$('#unit').value==='12';$('#tenR').max=y?30:360;$('#tenR').step=y?1:6;$('#ten').max=y?30:360;calc()};
  function check(id){
    const el=$('#'+id),v=el.value.trim(),n=Number(v);let m='';
    const max=id==='ten'?($('#unit').value==='12'?30:360):f[id][1];
    if(v==='')m='Enter a value.';
    else if(isNaN(n))m='Enter a valid number.';
    else if(n<f[id][0]||n>max)m=`${f[id][2]} must be between ${f[id][0].toLocaleString('en-IN')} and ${max.toLocaleString('en-IN')}.`;
    else if(id==='ten'&&!Number.isInteger(n))m='Tenure must be a whole number.';
    el.classList.toggle('bad',!!m);$('#'+id+'E').textContent=m;return !m;
  }
  function calc(){
    const ok=['amt','rate','ten'].map(check).every(Boolean);
    if(!ok){['emi','pri','int','tot'].forEach(i=>$('#'+i).textContent='-');$('#rows').innerHTML='<tr><td colspan=4>Fix the highlighted fields to see the schedule.</td></tr>';return}
    const P=+$('#amt').value,r=+$('#rate').value/1200,n=+$('#ten').value*$('#unit').value;
    const emi=r?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n,total=emi*n,int=total-P;
    $('#emi').textContent=inr(emi);$('#pri').textContent=inr(P);$('#int').textContent=inr(int);$('#tot').textContent=inr(total);
    $('#donut').style.background=`conic-gradient(var(--indigo) 0 ${(int/total*100).toFixed(2)}%,var(--indigo-t) 0)`;
    sched=[];let bal=P;
    for(let i=1;i<=n;i++){const it=bal*r,pr=emi-it;bal=Math.max(bal-pr,0);sched.push({i,pr,it,bal})}
    draw();
  }
  function draw(){
    let rows=sched;$('#pl').textContent=mode==='Y'?'Year':'Month';
    if(mode==='Y'){const y={};sched.forEach(s=>{const k=Math.ceil(s.i/12);y[k]=y[k]||{i:k,pr:0,it:0};y[k].pr+=s.pr;y[k].it+=s.it;y[k].bal=s.bal});rows=Object.values(y)}
    $('#rows').innerHTML=rows.map(s=>`<tr><td>${s.i}</td><td>${inr(s.pr)}</td><td>${inr(s.it)}</td><td>${inr(s.bal)}</td></tr>`).join('');
  }
  [['#tY','Y'],['#tM','M']].forEach(([id,m])=>$(id).onclick=()=>{mode=m;$('#tY').classList.toggle('on',m==='Y');$('#tM').classList.toggle('on',m==='M');draw()});
  calc();
}

if($('#cf')){
  $('#cf').onsubmit=e=>{
    e.preventDefault();let ok=true;
    const rule=(id,bad,msg)=>{const v=$('#'+id).value.trim();const m=bad(v)?msg:'';$('#'+id+'E').textContent=m;$('#'+id).classList.toggle('bad',!!m);if(m)ok=false};
    rule('n',v=>v.length<2,'Enter your name.');
    rule('e',v=>!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),'Enter a valid email address.');
    rule('m',v=>v.length<10,'Message must be at least 10 characters.');
    $('#ok').style.display=ok?'block':'none';if(ok)e.target.reset();
  };
}
