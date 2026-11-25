// koszyk pokazowy (localStorage), menu, galerie
(function(){
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const KL='waregena-koszyk';
let kosz=[];
try{kosz=JSON.parse(localStorage.getItem(KL)||'[]')}catch(e){kosz=[]}
const zapisz=()=>{try{localStorage.setItem(KL,JSON.stringify(kosz))}catch(e){}};
const zl=v=>v.toLocaleString('pl-PL').replace(/ /g,' ')+' zł';
const panel=$('#koszyk');

function rysuj(){
  const n=kosz.reduce((a,p)=>a+p.il,0);
  $$('[data-licznik]').forEach(e=>e.textContent=n);
  const lista=$('[data-lista]');
  if(!kosz.length){lista.innerHTML='<p class="k-pusty">Koszyk jest pusty.</p>';$('[data-dol]').hidden=true;return}
  $('[data-dol]').hidden=false;
  lista.innerHTML=kosz.map((p,i)=>`<div class="k-poz"><img src="${p.img}" alt="" width="72" height="72"><div><b>${p.nazwa}</b><span class="k-ilosc"><button type="button" data-m="${i}" aria-label="Mniej">−</button>${p.il}<button type="button" data-p="${i}" aria-label="Więcej">+</button></span></div><div>${zl(p.cena*p.il)}<br><button type="button" class="k-usun" data-u="${i}">usuń</button></div></div>`).join('');
  const d=$('input[name=dost]:checked'); const dost=d?parseInt(d.value,10):0;
  $('[data-suma]').textContent=zl(kosz.reduce((a,p)=>a+p.cena*p.il,0)+dost);
}
function otworz(){panel.hidden=false;document.body.style.overflow='hidden';$('.k-x').focus()}
function zamknij(){panel.hidden=true;document.body.style.overflow='';$('[data-info]').hidden=true}

document.addEventListener('click',e=>{
  const t=e.target.closest('button,a'); if(!t) return;
  if(t.dataset.dodaj){
    const p=kosz.find(x=>x.id===t.dataset.dodaj);
    if(p) p.il++; else kosz.push({id:t.dataset.dodaj,nazwa:t.dataset.nazwa,cena:+t.dataset.cena,img:t.dataset.img,il:1});
    zapisz();rysuj();
    t.classList.add('ok'); const s=t.textContent; t.textContent='Dodano'; setTimeout(()=>{t.textContent=s;t.classList.remove('ok')},1400);
    const b=$('.koszyk-btn'); b.classList.add('puls'); setTimeout(()=>b.classList.remove('puls'),900);
    if(t.classList.contains('btn')) otworz();
  }
  if(t.hasAttribute('data-koszyk-otworz')) otworz();
  if(t.hasAttribute('data-koszyk-zamknij')) zamknij();
  if(t.dataset.p){kosz[+t.dataset.p].il++;zapisz();rysuj()}
  if(t.dataset.m){const p=kosz[+t.dataset.m]; if(--p.il<1) kosz.splice(+t.dataset.m,1);zapisz();rysuj()}
  if(t.dataset.u){kosz.splice(+t.dataset.u,1);zapisz();rysuj()}
  if(t.hasAttribute('data-zamow')) $('[data-info]').hidden=false;
});
document.addEventListener('click',e=>{if(e.target.classList.contains('k-tlo'))zamknij()});
document.addEventListener('change',e=>{if(e.target.name==='dost')rysuj()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)zamknij()});
rysuj();

// menu mobilne
const bg=$('.burger'), menu=$('#menu');
bg&&bg.addEventListener('click',()=>{const o=bg.getAttribute('aria-expanded')!=='true';bg.setAttribute('aria-expanded',o);menu.classList.toggle('otw',o);document.body.style.overflow=o?'hidden':''});

// pas wzorów: przeciąganie myszą + strzałki
$$('[data-pas]').forEach(pas=>{
  let x0=0,s0=0,ciag=false,ruch=0;
  pas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;ciag=true;ruch=0;x0=e.clientX;s0=pas.scrollLeft;pas.classList.add('ciag')});
  addEventListener('pointermove',e=>{if(!ciag)return;ruch=Math.abs(e.clientX-x0);pas.scrollLeft=s0-(e.clientX-x0)});
  addEventListener('pointerup',()=>{if(!ciag)return;ciag=false;pas.classList.remove('ciag')});
  const sek=pas.parentElement, krok=()=>pas.querySelector('.pas-el').offsetWidth+28;
  const l=$('[data-pas-l]',sek), p=$('[data-pas-p]',sek);
  l&&l.addEventListener('click',()=>pas.scrollBy({left:-krok(),behavior:'smooth'}));
  p&&p.addEventListener('click',()=>pas.scrollBy({left:krok(),behavior:'smooth'}));
});

// filtr wykończenia (patynowana / srebrzona / złocona) w dziale i w całej kolekcji
const siatki=$$('[data-siatka]');
if(siatki.length&&$('[data-filtr]')){
  const ustaw=k=>{$$('[data-filtr]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filtr===k));siatki.forEach(s=>$$('.karta',s).forEach(c=>c.hidden=!!k&&c.dataset.kol!==k));$$('[data-grupa]').forEach(g=>g.hidden=!$$('.karta',g).some(c=>!c.hidden))};
  $$('[data-filtr]').forEach(b=>b.addEventListener('click',()=>{ustaw(b.dataset.filtr);history.replaceState(null,'',b.dataset.filtr?'#'+b.dataset.filtr:location.pathname)}));
  const h=location.hash.slice(1); if(['patynowana','srebrzona','zlocona'].includes(h)) ustaw(h);
}

// galeria produktu
const pg=$('[data-pg]');
if(pg){
  const min=$$('[data-min]');
  const licz=$('[data-licz]');
  const zaznacz=()=>{const i=Math.round(pg.scrollLeft/pg.clientWidth);min.forEach((b,j)=>b.setAttribute('aria-current',i===j));if(licz)licz.textContent=(i+1)+' / '+min.length};
  min.forEach(b=>b.addEventListener('click',()=>pg.scrollTo({left:pg.clientWidth*+b.dataset.min,behavior:'smooth'})));
  pg.addEventListener('scroll',()=>requestAnimationFrame(zaznacz),{passive:true}); zaznacz();
  let x0=0,s0=0,ciag=false;
  pg.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;ciag=true;x0=e.clientX;s0=pg.scrollLeft;pg.style.scrollSnapType='none'});
  addEventListener('pointerup',e=>{if(!ciag)return;ciag=false;const d=e.clientX-x0;if(Math.abs(d)>6)pg.dataset.przes='1';let i=Math.round(s0/pg.clientWidth)+(d<-40?1:d>40?-1:0);pg.style.scrollSnapType='';pg.scrollTo({left:pg.clientWidth*i,behavior:'smooth'})});
  addEventListener('pointermove',e=>{if(ciag)pg.scrollLeft=s0-(e.clientX-x0)});
  $$('img',pg).forEach(i=>i.draggable=false);
  // powiększenie zdjęcia
  const pow=$('#pow'), pi=$('[data-pow-img]',pow), duze=$$('[data-pow]',pg).map(b=>b.dataset.pow);
  let akt=0;
  const pokaz=i=>{akt=(i+duze.length)%duze.length;pi.src=duze[akt];pi.alt=$$('img',pg)[akt].alt};
  $('[data-pow-l]',pow).hidden=$('[data-pow-p]',pow).hidden=duze.length<2;
  $$('[data-pow]',pg).forEach((b,i)=>b.addEventListener('click',()=>{if(pg.dataset.przes){delete pg.dataset.przes;return}pokaz(i);pow.hidden=false;document.body.style.overflow='hidden';$('[data-pow-x]',pow).focus()}));
  const zamk=()=>{pow.hidden=true;document.body.style.overflow='';pg.scrollTo({left:pg.clientWidth*akt})};
  $('[data-pow-x]',pow).addEventListener('click',zamk);
  pow.addEventListener('click',e=>{if(e.target===pow)zamk()});
  $('[data-pow-l]',pow).addEventListener('click',()=>pokaz(akt-1));
  $('[data-pow-p]',pow).addEventListener('click',()=>pokaz(akt+1));
  document.addEventListener('keydown',e=>{if(pow.hidden)return;if(e.key==='Escape')zamk();if(e.key==='ArrowLeft')pokaz(akt-1);if(e.key==='ArrowRight')pokaz(akt+1)});
}

// mapa Google po kliknięciu
$$('[data-mapa]').forEach(m=>m.querySelector('button').addEventListener('click',()=>{m.innerHTML=`<iframe src="${m.dataset.mapa}" title="Mapa dojazdu" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`}));
})();
