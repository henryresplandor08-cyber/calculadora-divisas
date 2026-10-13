const NAMES={USD:"Dólar estadounidense",EUR:"Euro",VES:"Bolívar venezolano",COP:"Peso colombiano",MXN:"Peso mexicano",ARS:"Peso argentino",BRL:"Real brasileño",CLP:"Peso chileno",PEN:"Sol peruano",GBP:"Libra esterlina",CAD:"Dólar canadiense",JPY:"Yen japonés",CNY:"Yuan chino",CHF:"Franco suizo",DOP:"Peso dominicano",UYU:"Peso uruguayo",BOB:"Boliviano",PYG:"Guaraní",PAB:"Balboa",CRC:"Colón costarricense"};
// Tasas de respaldo aproximadas (base USD) por si falla la conexión
let rates={USD:1,EUR:.92,VES:40,COP:4000,MXN:18,ARS:900,BRL:5.4,CLP:950,PEN:3.75,GBP:.78,CAD:1.36,JPY:150,CNY:7.2,CHF:.88,DOP:60,UYU:40,BOB:6.9,PYG:7500,PAB:1,CRC:520};
let updated="tasas de respaldo (sin conexión)";
const DEF=window.DEF||{from:"USD",to:"VES"};
const $=id=>document.getElementById(id);
const amt=$("amt"),from=$("from"),to=$("to");
const TTL=10*60*1000;

function fill(){
  const codes=Object.keys(rates).sort((a,b)=>(NAMES[a]?0:1)-(NAMES[b]?0:1)||a.localeCompare(b));
  const kf=from.value||DEF.from,kt=to.value||DEF.to;
  [from,to].forEach(s=>s.innerHTML=codes.map(c=>`<option value="${c}">${c}${NAMES[c]?" – "+NAMES[c]:""}</option>`).join(""));
  from.value=codes.includes(kf)?kf:"USD";
  to.value=codes.includes(kt)?kt:"EUR";
}
const conv=(v,f,t)=>v/rates[f]*rates[t];
const fmt=(n,d=2)=>n.toLocaleString("es-VE",{maximumFractionDigits:n<1?6:d});

function calc(){
  const v=parseFloat(amt.value)||0,f=from.value,t=to.value;
  if(!rates[f]||!rates[t])return;
  const r=conv(v,f,t);
  $("out").value=fmt(r,4);
  $("big").textContent=`${fmt(v)} ${f} = ${fmt(r,4)} ${t}`;
  $("meta").textContent=`1 ${f} = ${fmt(conv(1,f,t),6)} ${t} · ${updated}`;
  $("quick").innerHTML="<tr><th>"+f+"</th><th>"+t+"</th></tr>"+[1,5,10,50,100,500,1000].map(n=>`<tr><td>${n} ${f}</td><td>${fmt(conv(n,f,t),4)} ${t}</td></tr>`).join("");
  const h=$("hoy");
  if(h)h.textContent=`Hoy, 1 ${DEF.from} equivale a ${fmt(conv(1,DEF.from,DEF.to),4)} ${DEF.to} (${updated}).`;
}
[amt,from,to].forEach(el=>{el.addEventListener("input",calc);el.addEventListener("change",calc)});
$("swap").onclick=()=>{const a=from.value;from.value=to.value;to.value=a;calc()};

function apply(d){rates=d.rates;updated="actualizado: "+new Date(d.time_last_update_unix*1000).toLocaleString("es-VE")}
async function load(){
  try{
    const c=JSON.parse(localStorage.getItem("rates_cache")||"null");
    if(c&&Date.now()-c.t<TTL){apply(c.d);fill();from.value=DEF.from;to.value=DEF.to;calc();return}
  }catch(e){}
  try{
    const r=await fetch("https://open.er-api.com/v6/latest/USD");
    const d=await r.json();
    if(d.result==="success"){
      apply(d);
      try{localStorage.setItem("rates_cache",JSON.stringify({t:Date.now(),d:d}))}catch(e){}
    }
  }catch(e){}
  const kf=from.value,kt=to.value;fill();from.value=kf;to.value=kt;calc();
}
fill();from.value=DEF.from;to.value=DEF.to;calc();load();
setInterval(load,TTL);
