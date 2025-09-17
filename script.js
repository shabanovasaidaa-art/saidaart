/* ==== Riyazi köməkçilər ==== */
const clampArc = (n) => {
  n = Math.round(Number(n) || 0);
  while (n > 22) n -= 22;
  if (n <= 0) n = Math.abs(n) || 22;
  return n;
};

function arkanOfDay(day){
  day = Number(day) || 1;
  if (day <= 22) return day;
  const map = {23:1,24:2,25:3,26:4,27:5,28:6,29:7,30:8,31:9};
  return map[day] || 1;
}

const arkanOfMonth = (m)=> clampArc(Number(m) || 7);
const arkanOfYear  = (y)=> clampArc(String(y||1991).split('').reduce((a,d)=>a+ +d,0));
const selfRealization = (A,B,V)=> clampArc(A+B+V);

/* ==== Hesablamalar ==== */
function calcAchievements(A,B,V){
  const D = clampArc(A+B);
  const E = clampArc(A+V);
  const J = clampArc(D+E);
  const Z = clampArc(E + Math.abs(A-B));
  return {D,E,J,Z};
}

/* ==== SİZİN XÜSUSI METODUNUZla karmik düyünlər ==== */
function calcKnots(A, B, V){
  // KÜ1 = |A - B| - əgər 0 çıxsa avtomatik 22 olur
  let KU1 = Math.abs(A - B);
  if(KU1 === 0) KU1 = 22;
  
  // KÜ2 = |A - V| - əgər 0 çıxsa avtomatik 22 olur  
  let KU2 = Math.abs(A - V);
  if(KU2 === 0) KU2 = 22;
  
  // KÜ3 = |KÜ1 - KÜ2| - əgər 0 çıxsa avtomatik 22 olur
  let KU3 = Math.abs(KU1 - KU2);
  if(KU3 === 0) KU3 = 22;
  
  // KÜ4 = |B - V| - əgər 0 çıxsa avtomatik 22 olur
  let KU4 = Math.abs(B - V);
  if(KU4 === 0) KU4 = 22;
  
  // KÜ5 = (KÜ1 + KÜ2 + KÜ3 + KÜ4) - 22-ni çıx ta ki 22-dən aşağı olsun
  let KU5 = KU1 + KU2 + KU3 + KU4;
  while(KU5 > 22) KU5 -= 22;
  if(KU5 === 0) KU5 = 22;

  return {I: KU1, K: KU2, L: KU3, M: KU4, N: KU5};
}

/* ==== Layout (ulduz / simmetrik) ==== */
const layout = {
  B:[500,60],   // üst nöqtə (7)
  J:[500,200],  // J - çd3 (yuxarı ortada)
  D:[200,200],  // sol yuxarı
  I:[350,270],  // sol orta yuxarı
  A:[200,500],  // sol aşağı
  M:[340,430],  // sol orta aşağı
  E:[500,700],  // bottom (9)
  N:[500,500],  // N (KÜ5) biraz yuxarı bottom
  G:[500,350],  // mərkəz (özünüreallaşdırma)
  K:[660,430],  // sağ orta yuxarı
  V:[800,500],  // sağ aşağı
  L:[660,270],  // sağ orta aşağı
  Z:[800,200]   // sağ yuxarı
};

/* ==== DOM referansları ==== */
const gLines = document.getElementById('lines');
const gNodes = document.getElementById('nodes');
const rows   = document.getElementById('rows');

/* ==== Skeleti çək (ulduzvari xətt qrupları) ==== */
function drawSkeleton(){
  if(!gLines) return;
  gLines.innerHTML = '';
  const p = layout;
  const mkPath = (pts)=> `M ${pts.map(([x,y])=>`${x},${y}`).join(' L ')}`;

  const lineSets = [
    [p.B,p.L,p.V,p.A,p.I,p.B,p.J,p.G,p.N,p.E],    // ulduzun dairəvi bağlantıları                // alt-orta xəttlər
    [p.D,p.J,p.Z,p.E,p.D],                        // sol yuxarı üçbucaq
    [p.A,p.M,p.G,p.L,p.Z],                        // orta üçbucaq
    [p.D,p.I,p.G,p.K,p.V]                         // alt üçbucaq
  ];

  lineSets.forEach(pts=>{
    const el = document.createElementNS('http://www.w3.org/2000/svg','path');
    el.setAttribute('d', mkPath(pts));
    el.setAttribute('class','skel-path');
    gLines.appendChild(el);
  });
}

/* ==== Gözəl node-lar (dairələr) ==== */
function node(colorVar, code, label, value){
  if(!gNodes) return;
  const pos = layout[code];
  if(!pos) return;
  const [x,y] = pos;
  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class','node');
  g.setAttribute('transform',`translate(${x},${y})`);

  // Kölgə effekti üçün əlavə dairə
  const shadow = document.createElementNS('http://www.w3.org/2000/svg','circle');
  shadow.setAttribute('r','30');
  shadow.setAttribute('fill','rgba(0,0,0,0.1)');
  shadow.setAttribute('transform','translate(2,2)');

  // Əsas dairə
  const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
  c.setAttribute('r','28');
  
  // Rəng təyini
  let fillColor = '#f0f0f0';
  if(colorVar === '--mid') fillColor = '#4a90e2';      // əsas arklar - mavi
  if(colorVar === '--good') fillColor = '#27ae60';     // çatdırılmalar - yaşıl
  if(colorVar === '--warn') fillColor = '#e74c3c';     // karmik düyünlər - qırmızı
  
  c.setAttribute('fill', fillColor);
  c.setAttribute('stroke','rgba(255,255,255,0.8)');
  c.setAttribute('stroke-width','2');

  // Rəqəm mətni
  const t = document.createElementNS('http://www.w3.org/2000/svg','text');
  t.setAttribute('text-anchor','middle');
  t.setAttribute('dy','6');
  t.setAttribute('fill', 'white');
  t.setAttribute('font-weight', 'bold');
  t.setAttribute('font-size', '16');
  t.textContent = value;

  // Etiket mətni
  const tag = document.createElementNS('http://www.w3.org/2000/svg','text');
  tag.setAttribute('class','tag');
  tag.setAttribute('text-anchor','middle');
  tag.setAttribute('dy','-45');
  tag.setAttribute('fill', '#333');
  tag.setAttribute('font-weight', '500');
  tag.setAttribute('font-size', '12');
  tag.textContent = label;

  g.appendChild(shadow);
  g.appendChild(c); 
  g.appendChild(t); 
  g.appendChild(tag);
  gNodes.appendChild(g);
}

/* ==== Render ==== */
function render(A,B,V,G,ach,kn){
  if(gNodes) gNodes.innerHTML = '';
  drawSkeleton();

  // əsas arklar / rəqəmlər
  node('--mid','B','B.',B);
  node('--mid','A','A.',A);
  node('--mid','V','V.',V);
  node('--mid','G','G.',G);

  // ÇD (achievements) — yaxşı nöqtələr
  node('--good','D','D. ÇD1',ach.D);
  node('--good','E','E. ÇD2',ach.E);
  node('--good','J','J. ÇD3',ach.J);
  node('--good','Z','Z. ÇD4',ach.Z);

  // KÜ (karmik düyünlər) — xəbərdarlıq nöqtələri
  node('--warn','I','İ. KÜ1',kn.I);
  node('--warn','K','K. KÜ2',kn.K);
  node('--warn','L','L. KÜ3',kn.L);
  node('--warn','M','M. KÜ4',kn.M);
  node('--warn','N','N. KÜ5',kn.N);

  // cədvəl yenilə
  if(rows) rows.innerHTML = `
    <tr><td>A. Gün Arkani <span class="pill">${A}</span></td>
        <td>D. ÇD1 <span class="pill">${ach.D}</span></td>
        <td>İ. KÜ1 <span class="pill">${kn.I}</span></td></tr>
    <tr><td>B. Ay Arkani <span class="pill">${B}</span></td>
        <td>E. ÇD2 <span class="pill">${ach.E}</span></td>
        <td>K. KÜ2 <span class="pill">${kn.K}</span></td></tr>
    <tr><td>V. İl Arkani <span class="pill">${V}</span></td>
        <td>J. ÇD3 <span class="pill">${ach.J}</span></td>
        <td>L. KÜ3 <span class="pill">${kn.L}</span></td></tr>
    <tr><td>G. Özünüreallaşdırma <span class="pill">${G}</span></td>
        <td>Z. ÇD4 <span class="pill">${ach.Z}</span></td>
        <td>M. KÜ4 <span class="pill">${kn.M}</span></td></tr>
    <tr><td colspan="2"></td>
        <td>N. KÜ5 <span class="pill">${kn.N}</span></td></tr>
  `;
}

/* ==== Hesabla ==== */
function calculate(){
  const day   = document.getElementById('day')?.value || 1;
  const month = document.getElementById('month')?.value || 7;
  const year  = document.getElementById('year')?.value || 1991;

  const A = arkanOfDay(day);
  const B = arkanOfMonth(month);
  const V = arkanOfYear(year);
  const G = selfRealization(A,B,V);

  const ach = calcAchievements(A,B,V);
  const kn  = calcKnots(A,B,V);

  render(A,B,V,G,ach,kn);
}

/* ==== Eventlər ==== */
const calcBtn = document.getElementById('calc');
if(calcBtn) calcBtn.addEventListener('click', calculate);
['day','month','year'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('keydown', e=>{
    if(e.key==='Enter') calculate();
  });
});

// Default olaraq 1/7/1991 ilə başla
document.addEventListener('DOMContentLoaded', () => {
  const dayEl = document.getElementById('day');
  const monthEl = document.getElementById('month'); 
  const yearEl = document.getElementById('year');
  
  if(dayEl && !dayEl.value) dayEl.value = 1;
  if(monthEl && !monthEl.value) monthEl.value = 7;
  if(yearEl && !yearEl.value) yearEl.value = 1991;
  
  calculate();
});