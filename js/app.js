const STORE="edl_suisse_v18_pdf_sans_blanc";
let db={apartments:[],selectedId:null};
const defaultRooms=["Entrée / hall","Salon","Cuisine","Chambre","Salle de bains","WC","Balcon / terrasse","Cave"];
const defaultElements=["Murs","Plafond","Sol","Plinthes","Porte","Serrure / poignée","Fenêtres","Stores / volets","Prises / interrupteurs","Éclairage","Radiateur","Nettoyage","Équipement / meuble"];
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function $(s,r=document){return r.querySelector(s)}
function $$(s,r=document){return Array.from(r.querySelectorAll(s))}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function apt(){return db.apartments.find(a=>a.id===db.selectedId)}
function save(){try{localStorage.setItem(STORE,JSON.stringify(db));renderList()}catch(e){alert("Stockage plein. Les photos ont été compressées, mais il y en a peut-être trop sur cet appareil. Exporte tes données puis supprime quelques photos.")}}
function load(){try{db=JSON.parse(localStorage.getItem(STORE))||db}catch(e){};migrate()}
function migrate(){db.apartments=(db.apartments||[]).map(a=>{a.tenants=a.tenants||[];a.keys=a.keys||[];a.rooms=(a.rooms||[]).map(r=>{r.elements=r.elements||[];r.photos=r.photos||[];return r});a.photos=a.photos||[];a.signatures=a.signatures||{tenantSignature:"",ownerSignature:""};return a})}
function newElement(name=""){return{id:uid(),name,state:"Bon",observation:"",charge:"À déterminer",photoNo:""}}
function newRoom(name="Nouvelle pièce"){return{id:uid(),name,notes:"",elements:defaultElements.map(newElement),photos:[]}}
function newApartment(){let a={id:uid(),type:"Entrée",date:new Date().toISOString().slice(0,10),time:"",reference:"",address:"",housingType:"",surface:"",floor:"",annex:"",notes:"",agencyName:"",agencyContact:"",ownerName:"",ownerContact:"",tenants:[{id:uid(),name:"",role:"Locataire",contact:"",notes:""}],keys:[{id:uid(),type:"Clé appartement",qty:"",notes:""},{id:uid(),type:"Clé boîte aux lettres",qty:"",notes:""},{id:uid(),type:"Badge / puce",qty:"",notes:""}],rooms:defaultRooms.map(newRoom),photos:[],signatures:{tenantSignature:"",ownerSignature:""}};db.apartments.unshift(a);db.selectedId=a.id;save();renderAll()}
function selectApartment(id){db.selectedId=id;save();renderAll()}
function renderList(){let q=($("#searchInput")?.value||"").toLowerCase();let count=$("#apartmentCount"),list=$("#apartmentList");if(!count||!list)return;count.textContent=db.apartments.length;list.innerHTML="";db.apartments.filter(a=>JSON.stringify(a).toLowerCase().includes(q)).forEach(a=>{let d=document.createElement("div");d.className="apt"+(a.id===db.selectedId?" active":"");d.innerHTML=`<b>${a.address||"Sans adresse"}</b><br><small>${a.reference||"Sans référence"} — ${a.type||""} — ${a.date||""}</small>`;d.onclick=()=>selectApartment(a.id);list.appendChild(d)})}
function renderAll(){renderList();let a=apt();$("#emptyState").classList.toggle("hidden",!!a);$("#editor").classList.toggle("hidden",!a);if(!a)return;bindFields();renderTenants();renderKeys();renderRooms();renderPhotos();setTimeout(initSignatures,50)}
function bindFields(){let a=apt();$$('[data-field]').forEach(el=>{el.value=a[el.dataset.field]||"";el.oninput=()=>{a[el.dataset.field]=el.value;save()};el.onchange=el.oninput})}
function showTab(name){$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$$('.tab').forEach(t=>t.classList.remove('active'));let tab=$("#tab-"+name);if(tab)tab.classList.add('active');if(name==='signatures')setTimeout(initSignatures,50)}
function renderTenants(){let a=apt(),box=$("#tenantList");box.innerHTML="";a.tenants.forEach(t=>{let div=document.createElement('div');div.className='item';div.innerHTML=`<div class=grid4><label>Nom<input data-k=name value="${esc(t.name)}"></label><label>Rôle<input data-k=role value="${esc(t.role)}"></label><label>Contact<input data-k=contact value="${esc(t.contact)}"></label><label>Action<br><button class=danger>Supprimer</button></label></div><label>Remarque<textarea data-k=notes>${esc(t.notes)}</textarea></label>`;$$('[data-k]',div).forEach(i=>i.oninput=()=>{t[i.dataset.k]=i.value;save()});$('button',div).onclick=()=>{a.tenants=a.tenants.filter(x=>x.id!==t.id);save();renderTenants()};box.appendChild(div)})}
function addTenant(){let a=apt();if(!a)return alert('Crée ou sélectionne un appartement.');a.tenants.push({id:uid(),name:'',role:'Locataire / colocataire',contact:'',notes:''});save();renderTenants();showTab('people')}
function renderKeys(){let a=apt(),box=$("#keyList");box.innerHTML="";a.keys.forEach(k=>{let div=document.createElement('div');div.className='item';div.innerHTML=`<div class=grid4><label>Type<input data-k=type value="${esc(k.type)}"></label><label>Quantité<input data-k=qty value="${esc(k.qty)}"></label><label>Remarque<input data-k=notes value="${esc(k.notes)}"></label><label>Action<br><button class=danger>Supprimer</button></label></div>`;$$('[data-k]',div).forEach(i=>i.oninput=()=>{k[i.dataset.k]=i.value;save()});$('button',div).onclick=()=>{a.keys=a.keys.filter(x=>x.id!==k.id);save();renderKeys()};box.appendChild(div)})}
function addKey(){let a=apt();if(!a)return alert('Crée ou sélectionne un appartement.');a.keys.push({id:uid(),type:'',qty:'',notes:''});save();renderKeys();showTab('keys')}
function renderRooms(){let a=apt(),box=$("#roomList");box.innerHTML="";a.rooms.forEach(r=>{r.photos=r.photos||[];let div=document.createElement('div');div.className='room';div.innerHTML=`<div class=row><input class=room-title value="${esc(r.name)}"><button type=button class="light" data-act=move-up data-room="${r.id}">↑</button><button type=button class="light" data-act=move-down data-room="${r.id}">↓</button><button type=button class=danger data-act=remove-room data-room="${r.id}">Supprimer pièce</button></div><table><thead><tr><th>Élément</th><th>État</th><th>Observation</th><th>À charge</th><th>Photo</th><th></th></tr></thead><tbody></tbody></table><button type=button class=addel data-act=add-element data-room="${r.id}">+ Élément</button><h3>Photos de la pièce</h3><div class=small-help>Photos enregistrées dans cette pièce : <b>${r.photos.length}</b></div><input type=file accept="image/*" multiple class=room-file-input><div class="photo-grid pgrid"></div><label>Remarques pièce<textarea class=rnotes>${esc(r.notes)}</textarea></label>`;
$('.room-title',div).oninput=e=>{r.name=e.target.value;save()};$('.rnotes',div).oninput=e=>{r.notes=e.target.value;save()};let tb=$('tbody',div);r.elements.forEach(el=>{let tr=document.createElement('tr');tr.innerHTML=`<td><input data-el=name value="${esc(el.name)}"></td><td><select data-el=state><option>Bon</option><option>Usure normale</option><option>Moyen</option><option>Mauvais</option><option>Défectueux</option><option>À réparer</option><option>Non contrôlé</option></select></td><td><textarea data-el=observation>${esc(el.observation)}</textarea></td><td><select data-el=charge><option>À déterminer</option><option>Locataire / colocataire</option><option>Bailleur / régie</option><option>Usure normale</option><option>Non applicable</option></select></td><td><input data-el=photoNo value="${esc(el.photoNo)}"></td><td><button type=button class=danger data-act=remove-element data-room="${r.id}" data-elid="${el.id}">Supprimer</button></td>`;$('[data-el=state]',tr).value=el.state;$('[data-el=charge]',tr).value=el.charge;$$('[data-el]',tr).forEach(inp=>{inp.oninput=()=>{el[inp.dataset.el]=inp.value;save()};inp.onchange=inp.oninput});tb.appendChild(tr)});
$('.room-file-input',div).onchange=e=>{let files=e.target.files;if(!files||!files.length)return;readPhotosCompressed(files,r.photos,()=>{save();renderRooms();showTab('rooms')});e.target.value=''};photoGrid($('.pgrid',div),r.photos,()=>{save();renderRooms();showTab('rooms')});box.appendChild(div)})}
function handleRoomClick(e){let act=e.target.dataset.act;if(!act)return;let a=apt();let roomId=e.target.dataset.room;let r=a.rooms.find(x=>x.id===roomId);

if(act==='move-up'){let i=a.rooms.findIndex(x=>x.id===roomId);if(i>0){[a.rooms[i-1],a.rooms[i]]=[a.rooms[i],a.rooms[i-1]];save();renderRooms();showTab('rooms')}return;}

if(act==='move-down'){let i=a.rooms.findIndex(x=>x.id===roomId);if(i<a.rooms.length-1&&i>=0){[a.rooms[i+1],a.rooms[i]]=[a.rooms[i],a.rooms[i+1]];save();renderRooms();showTab('rooms')}return;}

if(act==='add-element'&&r){r.elements.push(newElement(''));save();renderRooms();showTab('rooms')}
if(act==='remove-room'){a.rooms=a.rooms.filter(x=>x.id!==roomId);save();renderRooms();showTab('rooms')}
if(act==='remove-element'&&r){r.elements=r.elements.filter(x=>x.id!==e.target.dataset.elid);save();renderRooms();showTab('rooms')}}
function addRoom(){let a=apt();if(!a)return alert('Crée ou sélectionne un appartement.');a.rooms.push(newRoom());save();renderRooms();showTab('rooms')}
function compressImage(file,maxSide=1200,quality=.72){return new Promise(resolve=>{let reader=new FileReader();reader.onload=ev=>{let img=new Image();img.onload=()=>{let w=img.width,h=img.height;let ratio=Math.min(1,maxSide/Math.max(w,h));let canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));let ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);let data=canvas.toDataURL('image/jpeg',quality);resolve({id:uid(),src:data,caption:file.name||''})};img.onerror=()=>resolve(null);img.src=ev.target.result};reader.onerror=()=>resolve(null);reader.readAsDataURL(file)})}
async function readPhotosCompressed(files,target,cb){let arr=Array.from(files||[]);for(let f of arr){let p=await compressImage(f);if(p)target.push(p)}cb()}
function renderPhotos(){let a=apt();$('#globalPhotoInput').onchange=e=>{readPhotosCompressed(e.target.files,a.photos,()=>{save();renderPhotos()});e.target.value=''};photoGrid($('#globalPhotoGrid'),a.photos,()=>{save();renderPhotos()})}
function photoGrid(c,arr,cb){c.innerHTML='';arr.forEach(p=>{let d=document.createElement('div');d.className='photo-card';d.innerHTML=`<img src="${p.src}"><input placeholder="Légende" value="${esc(p.caption)}"><button class=danger>Supprimer</button>`;$('input',d).oninput=e=>{p.caption=e.target.value;save()};$('button',d).onclick=()=>{arr.splice(arr.findIndex(x=>x.id===p.id),1);cb()};c.appendChild(d)})}
function initSignatures(){let a=apt();if(!a)return;['tenantSignature','ownerSignature'].forEach(s=>{let c=$('#'+s);if(!c)return;let ctx=c.getContext('2d');ctx.lineWidth=3;ctx.lineCap='round';ctx.clearRect(0,0,c.width,c.height);if(a.signatures[s]){let im=new Image();im.onload=()=>ctx.drawImage(im,0,0,c.width,c.height);im.src=a.signatures[s]}let drawing=false;function pos(ev){let r=c.getBoundingClientRect(),t=ev.touches?ev.touches[0]:ev;return{x:(t.clientX-r.left)*(c.width/r.width),y:(t.clientY-r.top)*(c.height/r.height)}}function start(ev){drawing=true;let p=pos(ev);ctx.beginPath();ctx.moveTo(p.x,p.y);ev.preventDefault()}function move(ev){if(!drawing)return;let p=pos(ev);ctx.lineTo(p.x,p.y);ctx.stroke();a.signatures[s]=c.toDataURL('image/png');save();ev.preventDefault()}c.onmousedown=start;c.onmousemove=move;c.onmouseup=()=>drawing=false;c.onmouseleave=()=>drawing=false;c.ontouchstart=start;c.ontouchmove=move;c.ontouchend=()=>drawing=false})}
function clearSig(s){apt().signatures[s]='';save();initSignatures()}
function photoPages(title,photos){
  if(!photos||!photos.length)return"";
  let h="";
  for(let i=0;i<photos.length;i+=18){
    let batch=photos.slice(i,i+18);
    h+=`<div class="photo-page"><div class="photo-title">${esc(title)} — photos ${i+1} à ${i+batch.length}</div><div class="photo-grid-print">${batch.map((p,j)=>`<div class="photo-box"><img src="${p.src}"><div class="photo-caption">Photo ${i+j+1}${p.caption?" — "+esc(p.caption):""}</div></div>`).join("")}</div></div>`;
  }
  return h;
}

function printDoc(){
  let a=apt();
  if(!a)return alert('Aucun appartement sélectionné.');

  // Générer le HTML complet du document (sans découpage en pages)
  let body="";

  // === COVER ===
  body+=`<div class="cover"><div class="header"><div><div class="brand">Procès-verbal d'état des lieux — Suisse</div><div class="title">État des lieux</div><div class="subtitle">Document d'entrée / sortie avec réserves et signatures des parties</div></div><div class="typebox">${esc(a.type)}</div></div><div class="info-grid"><div class="info-box"><div class="label">Adresse</div><div class="value">${esc(a.address).replace(/\n/g,'<br>')||'&nbsp;'}</div></div><div class="info-box"><div class="label">Date / heure / référence</div><div class="value">${esc(a.date)} ${esc(a.time)}<br>${esc(a.reference)}</div></div><div class="info-box"><div class="label">Logement</div><div class="value">${esc(a.housingType)}<br>${esc(a.surface)} ${esc(a.floor)}<br>${esc(a.annex)}</div></div><div class="info-box"><div class="label">Régie / propriétaire</div><div class="value">${esc(a.agencyName)} ${esc(a.agencyContact)}<br>${esc(a.ownerName)} ${esc(a.ownerContact)}</div></div></div><div class="section"><div class="section-title">Parties présentes</div><table class="simple-table"><tr><th style="width:28%">Nom</th><th style="width:20%">Rôle</th><th style="width:22%">Contact</th><th>Remarque</th></tr>${a.tenants.map(t=>`<tr><td>${esc(t.name)}</td><td>${esc(t.role)}</td><td>${esc(t.contact)}</td><td>${esc(t.notes)}</td></tr>`).join('')}<tr><td>${esc(a.agencyName)}</td><td>Régie / gérance</td><td>${esc(a.agencyContact)}</td><td></td></tr><tr><td>${esc(a.ownerName)}</td><td>Propriétaire / bailleur</td><td>${esc(a.ownerContact)}</td><td></td></tr></table></div><div class="section"><div class="section-title">Clés, badges et accessoires</div><table class="simple-table"><tr><th>Type</th><th style="width:18%">Quantité</th><th>Remarque</th></tr>${a.keys.map(k=>`<tr><td>${esc(k.type)}</td><td>${esc(k.qty)}</td><td>${esc(k.notes)}</td></tr>`).join('')}</table></div><div class="legal"><b>Réserves :</b> les défauts constatés doivent être indiqués précisément. Toute réserve ou contestation doit être inscrite avant signature. Un exemplaire du présent procès-verbal est destiné à chaque partie.</div></div>`;

  // === PIÈCES ===
  a.rooms.forEach(r=>{
    body+=`<div class="room-page"><div class="room-head"><div class="room-name">${esc(r.name)}</div></div><table class="room-table"><tr><th style="width:18%">Élément</th><th style="width:11%">État</th><th>Observation / défaut</th><th style="width:17%">À charge de</th><th style="width:7%">Photo n°</th></tr>${r.elements.map(e=>`<tr><td>${esc(e.name)}</td><td>${esc(e.state)}</td><td>${esc(e.observation)}</td><td>${esc(e.charge)}</td><td>${esc(e.photoNo)}</td></tr>`).join('')}</table>${r.notes?`<div class="room-note"><b>Remarques :</b><br>${esc(r.notes).replace(/\n/g,'<br>')}</div>`:''}</div>`;
    body+=photoPages(r.name,r.photos);
  });

  // === PAGE SIGNATURES ===
  body+=`<div class="sign-page"><div class="header"><div><div class="brand">Clôture du procès-verbal</div><div class="title">Observations et signatures</div></div><div class="typebox">${esc(a.type)}</div></div><div class="section"><div class="section-title">Observations générales / réserves</div><div class="info-box">${esc(a.notes).replace(/\n/g,'<br>')||'&nbsp;'}</div></div>`;
  body+=photoPages('Photos générales',a.photos);
  body+=`<div class="section"><div class="section-title">Signatures des parties</div><div class="legal">Les parties confirment avoir pris connaissance du présent procès-verbal. Les réserves éventuelles doivent être mentionnées ci-dessus avant signature. Chaque partie reçoit un exemplaire.</div><div class="sign-grid"><div class="sign-box"><b>Locataire(s) / colocataire(s)</b>${a.signatures.tenantSignature?`<br><img src="${a.signatures.tenantSignature}">`:`<div class="sign-line">Signature / date</div>`}</div><div class="sign-box"><b>Régie / propriétaire</b>${a.signatures.ownerSignature?`<br><img src="${a.signatures.ownerSignature}">`:`<div class="sign-line">Signature / date</div>`}</div></div></div></div>`;

  // === DÉCOUPAGE EN PAGES PHYSIQUES ===
  // On injecte tout dans un conteneur temporaire hors écran,
  // puis on mesure et on coupe en blocs de 190mm (hauteur utile par page en paysage)
  // Unité : 1mm = 3.7795px à 96dpi
  const MM_TO_PX = 3.7795;
  const PAGE_H_MM = 174; // hauteur utile par page (190mm - padding 8mm*2 + marge interne)
  const PAGE_H_PX = PAGE_H_MM * MM_TO_PX;

  // Créer conteneur temporaire pour mesure
  let measureDiv = document.createElement('div');
  measureDiv.style.cssText = 'position:fixed;top:-9999px;left:0;width:261mm;font-family:Arial,Helvetica,sans-serif;font-size:7.2pt;line-height:1.15;visibility:hidden;';
  measureDiv.innerHTML = body;
  document.body.appendChild(measureDiv);

  // Récupérer les enfants directs (cover, room-page, sign-page, photo-page)
  let nodes = Array.from(measureDiv.children);
  let pages = [];
  let currentPageHTML = '';
  let currentH = 0;

  nodes.forEach(node => {
    let h = node.getBoundingClientRect().height;
    if(currentH > 0 && currentH + h > PAGE_H_PX){
      pages.push(currentPageHTML);
      currentPageHTML = node.outerHTML;
      currentH = h;
    } else {
      currentPageHTML += node.outerHTML;
      currentH += h;
    }
  });
  if(currentPageHTML) pages.push(currentPageHTML);
  document.body.removeChild(measureDiv);

  // Générer le HTML final avec .print-page par page
  let finalHTML = pages.map(p => `<div class="print-page">${p}</div>`).join('');
  $('#printArea').innerHTML = finalHTML;
  setTimeout(()=>window.print(), 150);
}

function exportAll(){let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});let url=URL.createObjectURL(blob);let a=document.createElement('a');a.href=url;a.download='etat-des-lieux-suisse-donnees.json';a.click();URL.revokeObjectURL(url)}
function importAll(file){let r=new FileReader();r.onload=e=>{try{db=JSON.parse(e.target.result);migrate();save();renderAll();alert('Import terminé.')}catch(err){alert('Fichier invalide.')}};r.readAsText(file)}
function deleteSelected(){let a=apt();if(!a)return;if(confirm('Supprimer ce dossier ?')){db.apartments=db.apartments.filter(x=>x.id!==a.id);db.selectedId=db.apartments[0]?.id||null;save();renderAll()}}
document.addEventListener('DOMContentLoaded',async()=>{if('serviceWorker' in navigator){try{let regs=await navigator.serviceWorker.getRegistrations();for(let r of regs){await r.unregister()}let keys=await caches.keys();for(let k of keys){await caches.delete(k)}}catch(e){}}load();renderAll();$('#roomList').addEventListener('click',handleRoomClick);$('#btnNewApartment').onclick=newApartment;$('#btnAddTenant').onclick=addTenant;$('#btnAddKey').onclick=addKey;$('#btnAddRoom').onclick=addRoom;$('#btnAddTenantInside').onclick=addTenant;$('#btnAddKeyInside').onclick=addKey;$('#btnAddRoomInside').onclick=addRoom;$('#btnSave').onclick=()=>{save();alert('Sauvegardé')};$('#btnPrint').onclick=printDoc;$('#btnExport').onclick=exportAll;$('#btnDelete').onclick=deleteSelected;$('#searchInput').oninput=renderList;$('#fileImport').onchange=e=>{if(e.target.files[0])importAll(e.target.files[0])};$$('.tabs button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));$$('[data-clear]').forEach(b=>b.onclick=()=>clearSig(b.dataset.clear))})
