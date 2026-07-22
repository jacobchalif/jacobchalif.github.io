import { createServer } from "node:http";
import { copyFile, mkdir, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(projectRoot, "content", "publications.json");
const sectionsPath = path.join(projectRoot, "content", "cv-sections.json");
const cvPath = path.join(projectRoot, "content", "cv.json");
const port = Number(process.env.CV_STUDIO_PORT || 4174);
const openSessions = new Set();
let shutdownTimer;

const html = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CV Studio</title><style>
:root{--paper:#f7f5ef;--ink:#1c1e1c;--muted:#6c716b;--rule:#c9c8c0;--orange:#eb4e21;--white:#fff}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}header{position:sticky;top:0;z-index:3;background:rgba(247,245,239,.96);border-bottom:1px solid var(--rule);padding:18px 28px;display:flex;align-items:center;gap:18px}header h1{font-size:20px;margin:0;margin-right:auto}button{font:inherit;border:1px solid var(--ink);background:transparent;padding:9px 14px;cursor:pointer}button.primary{background:var(--ink);color:white}button.danger{color:#a21e12;border-color:#d7aaa5}.status{color:var(--muted);min-width:100px}.layout{display:grid;grid-template-columns:minmax(280px,34%) 1fr;min-height:calc(100vh - 70px)}aside{border-right:1px solid var(--rule);padding:24px;overflow:auto}.filters{display:flex;gap:8px;margin-bottom:18px}.filters button.active{background:var(--ink);color:white}.card{background:var(--white);border:1px solid var(--rule);padding:14px;margin-bottom:10px;cursor:pointer}.card.selected{border-color:var(--orange);box-shadow:inset 3px 0 var(--orange)}.card b{display:block;font-size:14px}.card small{color:var(--muted)}main{padding:34px;max-width:920px}form{display:grid;grid-template-columns:1fr 1fr;gap:18px}label{display:grid;gap:6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}label.wide{grid-column:1/-1}input,select,textarea{font:inherit;color:var(--ink);background:white;border:1px solid var(--rule);padding:11px 12px;width:100%}textarea{min-height:105px;resize:vertical}.checks{grid-column:1/-1;display:flex;gap:24px}.checks label{display:flex;flex-direction:row;align-items:center;text-transform:none;letter-spacing:0;font-size:14px}.checks input{width:auto}.actions{grid-column:1/-1;display:flex;gap:10px;padding-top:8px}.hint{grid-column:1/-1;color:var(--muted);font-size:13px;border-top:1px solid var(--rule);padding-top:18px}code{background:#e8e6df;padding:2px 5px}@media(max-width:760px){.layout{grid-template-columns:1fr}aside{border-right:0;border-bottom:1px solid var(--rule);max-height:42vh}main{padding:24px}form{grid-template-columns:1fr}label.wide,.checks,.actions,.hint{grid-column:1}}
</style></head><body>
<header><h1>Jacob Chalif · CV Studio</h1><a href="/sections" style="border:1px solid;padding:9px 14px;text-decoration:none;color:inherit">Edit rest of CV</a><span class="status" id="status">Loading…</span><button id="generate">Generate LaTeX</button><button id="add">+ Add publication</button><button class="primary" id="save">Save all changes</button></header>
<div class="layout"><aside><div class="filters"><button data-filter="all" class="active">All</button><button data-filter="website">Website</button><button data-filter="cv">CV</button></div><div id="list"></div></aside>
<main><form id="form"><label>Year<input name="year" required></label><label>Status<select name="status"><option value="published">Published</option><option value="in_review">In review</option><option value="in_preparation">In preparation</option></select></label><label class="wide">Title<textarea name="title" required></textarea></label><label class="wide">Authors<textarea name="authors" required></textarea></label><label class="wide">Journal / citation detail<input name="journal" required></label><label>DOI URL<input name="doi" type="url" placeholder="https://doi.org/…"></label><label>Highlight URL<input name="highlightHref" type="url"></label><div class="checks"><label><input type="checkbox" name="showWebsite"> Show on website</label><label><input type="checkbox" name="showCv"> Show in CV</label></div><div class="actions"><button type="button" id="up">Move up</button><button type="button" id="down">Move down</button><button type="button" class="danger" id="remove">Delete</button></div><p class="hint">Saving updates <code>content/publications.json</code>. The Publications page reads this file automatically. Run <code>pnpm cv:generate</code> to create an updated LaTeX file from your attached CV.</p></form></main></div>
<script>
let publications=[],selectedId=null,filter='all',dirty=false;
const list=document.querySelector('#list'),form=document.querySelector('#form'),statusEl=document.querySelector('#status');
const slug=s=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55);
function selected(){return publications.find(p=>p.id===selectedId)}
function setStatus(text){statusEl.textContent=text}
function syncForm(){const p=selected(); for(const el of form.elements){if(!el.name)continue;el.type==='checkbox'?el.checked=Boolean(p?.[el.name]):el.value=p?.[el.name]??''} form.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=!p)}
function render(){const shown=publications.filter(p=>filter==='all'||(filter==='website'?p.showWebsite:p.showCv));list.innerHTML=shown.map(p=>'<div class="card '+(p.id===selectedId?'selected':'')+'" data-id="'+p.id+'"><b>'+escapeHtml(p.title)+'</b><small>'+p.year+' · '+p.status.replaceAll('_',' ')+'</small></div>').join('')||'<p>No matching publications.</p>';list.querySelectorAll('.card').forEach(el=>el.onclick=()=>{selectedId=el.dataset.id;render();syncForm()})}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function changed(){dirty=true;setStatus('Unsaved');render()}
form.addEventListener('input',e=>{const p=selected();if(!p||!e.target.name)return;p[e.target.name]=e.target.type==='checkbox'?e.target.checked:e.target.value;changed()});
document.querySelector('#add').onclick=()=>{const p={id:'new-'+Date.now(),year:String(new Date().getFullYear()),status:'published',title:'New publication',authors:'J. I. Chalif',journal:'',doi:'',highlightHref:'',showWebsite:true,showCv:true};publications.unshift(p);selectedId=p.id;changed();syncForm();form.elements.title.select()};
document.querySelector('#remove').onclick=()=>{const p=selected();if(!p||!confirm('Delete this publication?'))return;publications=publications.filter(x=>x.id!==p.id);selectedId=publications[0]?.id??null;changed();syncForm()};
function move(delta){const i=publications.findIndex(p=>p.id===selectedId),j=i+delta;if(i<0||j<0||j>=publications.length)return;[publications[i],publications[j]]=[publications[j],publications[i]];changed()}
document.querySelector('#up').onclick=()=>move(-1);document.querySelector('#down').onclick=()=>move(1);
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render()});
document.querySelector('#save').onclick=async()=>{for(const p of publications){if(p.id.startsWith('new-'))p.id=slug(p.authors.split(',')[0]+'-'+p.year+'-'+p.title)||crypto.randomUUID()}selectedId=selected()?.id??publications[0]?.id;setStatus('Saving…');const response=await fetch('/api/publications',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(publications)});if(!response.ok){setStatus('Save failed');alert(await response.text());return}dirty=false;setStatus('Saved');render()};
document.querySelector('#generate').onclick=async()=>{setStatus('Generating…');const response=await fetch('/api/generate',{method:'POST'});const message=await response.text();setStatus(response.ok?'Generated':'Failed');alert(message)};
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
fetch('/api/publications').then(r=>r.json()).then(data=>{publications=data;selectedId=data[0]?.id??null;render();syncForm();setStatus('Saved')}).catch(e=>{setStatus('Load failed');alert(e)});
fetch('/api/session').then(response=>response.text()).catch(()=>{});
</script></body></html>`;

const sectionsHtml = String.raw`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CV Studio · Guided editor</title><style>
:root{--paper:#f7f5ef;--ink:#1c1e1c;--muted:#6c716b;--rule:#c9c8c0;--orange:#eb4e21}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}header{position:sticky;top:0;z-index:3;background:rgba(247,245,239,.97);border-bottom:1px solid var(--rule);padding:16px 24px;display:flex;align-items:center;gap:14px}h1{font-size:20px;margin:0;margin-right:auto}button,.button{font:inherit;border:1px solid var(--ink);background:transparent;color:var(--ink);padding:9px 13px;text-decoration:none;cursor:pointer}.primary{background:var(--ink);color:white}.danger{color:#a21e12;border-color:#d7aaa5}.status{color:var(--muted);min-width:80px}.layout{display:grid;grid-template-columns:230px 310px minmax(420px,1fr);min-height:calc(100vh - 68px)}aside,.entries{padding:18px;border-right:1px solid var(--rule);overflow:auto}.section{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--rule);padding:12px 7px}.section.active{color:var(--orange);font-weight:700}.entry{background:white;border:1px solid var(--rule);padding:12px;margin-bottom:9px;cursor:pointer}.entry.active{border-color:var(--orange);box-shadow:inset 3px 0 var(--orange)}.entry b{display:block}.entry small{color:var(--muted)}main{padding:28px;min-width:0}h2{font-size:31px;margin:0 0 22px}.field{display:grid;gap:6px;margin-bottom:16px;font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted)}input,textarea{font:15px/1.45 inherit;color:var(--ink);background:white;border:1px solid var(--rule);padding:11px;width:100%}textarea{min-height:105px;resize:vertical}.actions{display:flex;gap:9px;margin-top:20px}.notice{background:#fff7df;border:1px solid #e2cb83;padding:18px}.notice a{text-decoration:underline}.add{width:100%;margin-bottom:14px}@media(max-width:900px){header{flex-wrap:wrap}h1{width:100%}.layout{grid-template-columns:1fr}.entries,aside{border-right:0;border-bottom:1px solid var(--rule);max-height:32vh}main{padding:22px}}
.layout{grid-template-columns:240px minmax(0,1fr)}aside{padding:22px 16px;background:#efede6}.section{display:flex;justify-content:space-between;align-items:center;border:0;border-radius:8px;margin:2px 0;padding:11px 12px}.section:hover{background:#e5e2d9}.section.active{background:white;color:var(--ink);box-shadow:0 1px 4px rgba(0,0,0,.08)}.section span{font-size:11px;color:var(--muted);font-weight:400}.workspace{padding:38px clamp(24px,4vw,58px);max-width:1500px}.workspace-head{display:flex;align-items:start;justify-content:space-between;gap:24px;margin-bottom:26px}.workspace-head h2{font-size:38px;letter-spacing:-.035em;margin:0 0 6px}.workspace-head p{margin:0;color:var(--muted)}.content-grid{display:grid;grid-template-columns:minmax(280px,.8fr) minmax(440px,1.2fr);gap:22px;align-items:start}#list{display:grid;gap:8px;max-height:calc(100vh - 190px);overflow-y:auto;padding-right:4px}.entry{display:grid;grid-template-columns:1fr auto;gap:8px;padding:15px 17px;border-radius:8px;margin:0}.entry[draggable=true]{cursor:grab}.entry[draggable=true]:active{cursor:grabbing}.entry.dragging{opacity:.38}.entry.drop-target{border-color:var(--orange);background:#fff8f2}.entry small{grid-column:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.entry:after{content:'Edit';grid-column:2;grid-row:1/3;align-self:center;color:var(--muted);font-size:12px}.entry.active:after{content:'Editing';color:var(--orange)}#editor{background:white;border:1px solid var(--rule);border-radius:10px;padding:26px;position:sticky;top:92px;max-height:calc(100vh - 116px);overflow-y:auto}.editor-title{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:var(--orange);margin-bottom:20px}.field{font-size:12px;text-transform:none;letter-spacing:0;font-weight:600;color:var(--ink)}input,textarea,select{font:inherit;color:var(--ink);background:#fbfaf7;border:1px solid var(--rule);border-radius:6px;padding:11px 12px;width:100%}textarea{min-height:92px}.actions{padding-top:18px;border-top:1px solid var(--rule)}header #pdf{background:var(--orange);border-color:var(--orange);color:white}header #save{background:var(--ink);color:white}.add{width:auto;margin:0}@media(max-width:980px){.content-grid{grid-template-columns:1fr}#list{max-height:36vh}#editor{position:static;max-height:none}}@media(max-width:900px){.layout{grid-template-columns:1fr}aside{max-height:none;display:flex;gap:4px;overflow-x:auto;padding:10px}.section{min-width:max-content}.workspace{padding:24px 18px}.workspace-head{align-items:center}#editor{padding:20px}}
</style></head><body><header><h1>CV Studio</h1><span class="status" id="status">Loading…</span><button id="pdf">Save & Generate PDF</button><button class="primary" id="save">Save changes</button></header><div class="layout"><aside id="nav"></aside><main class="workspace"><div class="workspace-head"><div><h2 id="section-title"></h2><p id="section-help"></p></div><button class="add" id="add">+ Add entry</button></div><div class="content-grid"><div id="list"></div><div id="editor"></div></div></main></div><script>
const configs={profile:{title:'Profile',single:true,fields:[['name','Name'],['email','Email'],['website','Website']]},education:{title:'Education',fields:[['organization','Institution'],['location','Location'],['role','Degree'],['date','Dates'],['bullets','Details / bullets','lines']]},researchExperience:{title:'Research experience',fields:[['organization','Organization'],['location','Location'],['role','Role'],['date','Dates'],['bullets','Accomplishments / bullets','lines']]},publications:{title:'Publications',fields:[['year','Year'],['status','Status','status'],['title','Title','long'],['authors','Authors','long'],['journal','Journal / citation detail','long'],['doi','DOI URL'],['highlightHref','Highlight URL'],['showWebsite','Show on website','checkbox'],['showCv','Show in CV','checkbox']]},funding:{title:'Research funding',fields:[['label','Year'],['text','Description','long']]},fieldwork:{title:'Field research',fields:[['location','Location'],['date','Dates'],['bullets','Details / bullets','lines']]},service:{title:'Professional service',fields:[['label','Role / label'],['text','Details','long']]},awards:{title:'Honors and awards',fields:[['label','Award'],['text','Institution and year','long']]},outreach:{title:'Science outreach',fields:[['label','Activity'],['text','Description','long']]},skills:{title:'Skills and certifications',fields:[['label','Category'],['text','Details','long']]},engagement:{title:'Local engagement',fields:[['label','Organization'],['text','Role and dates','long']]},mentoring:{title:'Undergraduate mentoring',fields:[['name','Student'],['details','Details','long']]},conferenceAbstracts:{title:'Conference abstracts',fields:[['year','Year'],['authors','Authors','long'],['title','Title','long'],['conference','Conference or meeting','long'],['location','Location'],['presentationType','Presentation type','presentation']]}};
const descriptions={profile:'Your name and contact links.',education:'Degrees and academic programs.',researchExperience:'Positions, responsibilities, and accomplishments.',publications:'One list for both the CV and website.',funding:'Grants, awards, and research support.',fieldwork:'Field campaigns and the work completed there.',service:'Reviewing, organizing, and professional contributions.',awards:'Honors, scholarships, and recognitions.',outreach:'Teaching, talks, media, and public engagement.',skills:'Technical capabilities and certifications.',engagement:'Community and environmental involvement.',mentoring:'Students you have supervised or advised.',conferenceAbstracts:'Enter authors, title, meeting, location, and presentation type separately. The CV formats the complete citation automatically.'};
let data=null,sectionKey='profile',entryId=null,dirty=false,draggedId=null;const nav=document.querySelector('#nav'),list=document.querySelector('#list'),editor=document.querySelector('#editor'),statusEl=document.querySelector('#status'),add=document.querySelector('#add'),sectionTitle=document.querySelector('#section-title'),sectionHelp=document.querySelector('#section-help');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));const setStatus=s=>statusEl.textContent=s;const collection=()=>configs[sectionKey].single?[data.profile]:data[sectionKey];const current=()=>collection().find(x=>(x.id??'profile')===entryId);
function mark(){dirty=true;setStatus('Unsaved');renderList()}
function renderNav(){nav.innerHTML=Object.entries(configs).map(([key,c])=>'<button class="section '+(key===sectionKey?'active':'')+'" data-key="'+key+'">'+c.title+'<span>'+(c.single?'':data[key].length)+'</span></button>').join('');nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{sectionKey=b.dataset.key;entryId=configs[sectionKey].single?'profile':collection()[0]?.id??null;render()})}
function summary(item){if(sectionKey==='publications'){const firstAuthor=String(item.authors||'').split(',')[0].trim();const surname=firstAuthor.split(/\s+/).at(-1)||'Unknown author';return surname+' et al., '+(item.year||'Year')}if(sectionKey==='conferenceAbstracts'){const firstAuthor=String(item.authors||'').split(',')[0].trim()||'Unknown author';return [firstAuthor,item.year,item.conference].filter(Boolean).join(', ')}return item.name||item.organization||item.location||item.label||item.title||item.year||'Untitled entry'}
function renderList(){const cfg=configs[sectionKey];add.hidden=cfg.single;list.innerHTML=collection().map(item=>'<div class="entry '+((item.id??'profile')===entryId?'active':'')+'" data-id="'+(item.id??'profile')+'" '+(cfg.single?'':'draggable="true"')+'><b>'+esc(summary(item))+'</b><small>'+esc(item.date||item.role||item.status?.replaceAll('_',' ')||item.details||item.text||item.email||'')+'</small></div>').join('');list.querySelectorAll('.entry').forEach(el=>{el.onclick=()=>{entryId=el.dataset.id;renderList();renderEditor()};if(cfg.single)return;el.ondragstart=e=>{draggedId=el.dataset.id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedId);requestAnimationFrame(()=>el.classList.add('dragging'))};el.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move';el.classList.add('drop-target')};el.ondragleave=()=>el.classList.remove('drop-target');el.ondrop=e=>{e.preventDefault();el.classList.remove('drop-target');if(!draggedId||draggedId===el.dataset.id)return;const items=collection(),from=items.findIndex(x=>x.id===draggedId);if(from<0)return;const after=e.clientY>el.getBoundingClientRect().top+el.offsetHeight/2;const [moved]=items.splice(from,1);let target=items.findIndex(x=>x.id===el.dataset.id);if(target<0)return;items.splice(target+(after?1:0),0,moved);entryId=draggedId;draggedId=null;mark()};el.ondragend=()=>{draggedId=null;list.querySelectorAll('.entry').forEach(x=>x.classList.remove('dragging','drop-target'))}})}
function fieldControl(key,type,item){if(type==='lines'||type==='long')return '<textarea data-key="'+key+'">'+esc(type==='lines'?(item[key]||[]).join('\n'):item[key])+'</textarea>';if(type==='status')return '<select data-key="'+key+'"><option value="published" '+(item[key]==='published'?'selected':'')+'>Published</option><option value="in_review" '+(item[key]==='in_review'?'selected':'')+'>In review</option><option value="in_preparation" '+(item[key]==='in_preparation'?'selected':'')+'>In preparation</option></select>';if(type==='presentation')return '<select data-key="'+key+'"><option value="" '+(!item[key]?'selected':'')+'>Not specified</option><option value="Talk" '+(item[key]==='Talk'?'selected':'')+'>Talk</option><option value="Poster" '+(item[key]==='Poster'?'selected':'')+'>Poster</option></select>';if(type==='checkbox')return '<input data-key="'+key+'" type="checkbox" style="width:auto" '+(item[key]?'checked':'')+'>';return '<input data-key="'+key+'" value="'+esc(item[key])+'">'}
function renderEditor(){const cfg=configs[sectionKey],item=current();if(!item){editor.innerHTML='<p>Add an entry to begin.</p>';return}editor.innerHTML='<div class="editor-title">'+(cfg.single?'Profile details':'Edit entry')+'</div>'+cfg.fields.map(([key,label,type])=>'<label class="field">'+label+fieldControl(key,type,item)+'</label>').join('')+(cfg.single?'':'<div class="actions"><button id="up">Move earlier</button><button id="down">Move later</button><button class="danger" id="remove">Delete entry</button></div>');editor.querySelectorAll('[data-key]').forEach(el=>el.oninput=()=>{const field=cfg.fields.find(f=>f[0]===el.dataset.key),type=field?.[2];item[el.dataset.key]=type==='lines'?el.value.split('\n').map(x=>x.trim()).filter(Boolean):type==='checkbox'?el.checked:el.value;mark()});if(!cfg.single){document.querySelector('#up').onclick=()=>move(-1);document.querySelector('#down').onclick=()=>move(1);document.querySelector('#remove').onclick=remove}}
function render(){sectionTitle.textContent=configs[sectionKey].title;sectionHelp.textContent=descriptions[sectionKey];renderNav();renderList();renderEditor()}function move(delta){const items=collection(),i=items.findIndex(x=>x.id===entryId),j=i+delta;if(i<0||j<0||j>=items.length)return;[items[i],items[j]]=[items[j],items[i]];mark();renderList()}function remove(){if(!confirm('Delete this entry?'))return;data[sectionKey]=collection().filter(x=>x.id!==entryId);entryId=data[sectionKey][0]?.id??null;mark();render()}
add.onclick=()=>{const cfg=configs[sectionKey],item={id:sectionKey+'-'+Date.now()};for(const [key,,type] of cfg.fields)item[key]=type==='lines'?[]:type==='checkbox'?true:type==='status'?'published':'';data[sectionKey].unshift(item);entryId=item.id;mark();render()};
async function saveEverything(){setStatus('Saving…');const {publications,...cvData}=data;const responses=await Promise.all([fetch('/api/cv',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(cvData)}),fetch('/api/publications',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(publications)})]);if(responses.some(r=>!r.ok)){setStatus('Failed');alert('One or more sections could not be saved.');return false}dirty=false;setStatus('Saved');return true}document.querySelector('#save').onclick=saveEverything;document.querySelector('#pdf').onclick=async()=>{if(!await saveEverything())return;setStatus('Building PDF…');const r=await fetch('/api/pdf',{method:'POST'});const message=await r.text();setStatus(r.ok?'PDF ready':'Failed');alert(message)};addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});Promise.all([fetch('/api/cv').then(r=>r.json()),fetch('/api/publications').then(r=>r.json())]).then(([cv,pubs])=>{data={...cv,publications:pubs};entryId='profile';render();setStatus('Saved')}).catch(e=>{setStatus('Load failed');alert(e)});
fetch('/api/session').then(response=>response.text()).catch(()=>{});
</script></body></html>`;

function send(response, status, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, { "content-type": contentType, "cache-control": "no-store" });
  response.end(body);
}

function run(executable, args, options = {}) {
  return new Promise((resolve, reject) => execFile(executable, args, options, (error, stdout, stderr) => {
    if (error) reject(new Error(stderr || stdout || error.message));
    else resolve({ stdout, stderr });
  }));
}

async function buildPdf() {
  const tectonic = ["/opt/homebrew/bin/tectonic", "/usr/local/bin/tectonic"].find(existsSync);
  if (!tectonic) throw new Error("The PDF compiler is not installed. Install Tectonic with: brew install tectonic");
  await run(process.execPath, [path.join(projectRoot, "scripts", "generate-cv.mjs")], { cwd: projectRoot });
  const generatedDir = path.join(projectRoot, "cv", "generated");
  const texPath = path.join(generatedDir, "main.tex");
  const generatedPdf = path.join(generatedDir, "main.pdf");
  await run(tectonic, ["--outdir", generatedDir, texPath], { cwd: generatedDir });
  if (!existsSync(generatedPdf)) throw new Error("The compiler finished without creating main.pdf.");

  const publicPdf = path.join(projectRoot, "public", "documents", "Jacob_Chalif_CV.pdf");
  await copyFile(generatedPdf, publicPdf);
  const tempDir = path.join(projectRoot, "tmp", "pdfs", "cv-pages");
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });
  const pdftoppm = "/Users/jacobchalif/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm";
  await run(pdftoppm, ["-png", "-r", "150", publicPdf, path.join(tempDir, "page")]);
  const pngs = (await readdir(tempDir)).filter((name) => /^page-\d+\.png$/.test(name)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  if (!pngs.length) throw new Error("The PDF was created, but its page previews could not be rendered.");
  const pageDir = path.join(projectRoot, "public", "documents", "cv-pages");
  for (const name of await readdir(pageDir)) if (/^page-\d+\.webp$/.test(name)) await unlink(path.join(pageDir, name));
  const cwebp = "/opt/homebrew/bin/cwebp";
  for (let index = 0; index < pngs.length; index += 1) await run(cwebp, ["-quiet", "-q", "88", path.join(tempDir, pngs[index]), "-o", path.join(pageDir, `page-${index + 1}.webp`)]);
  await writeFile(path.join(projectRoot, "content", "cv-pages.json"), `${JSON.stringify({ pageCount: pngs.length }, null, 2)}\n`, "utf8");
  await rm(tempDir, { recursive: true, force: true });
  return pngs.length;
}

function validPublication(value) {
  return value && typeof value.id === "string" && typeof value.year === "string" &&
    ["published", "in_review", "in_preparation"].includes(value.status) &&
    typeof value.title === "string" && value.title.trim() &&
    typeof value.authors === "string" && value.authors.trim() &&
    typeof value.journal === "string" && typeof value.doi === "string" &&
    typeof value.highlightHref === "string" && typeof value.showWebsite === "boolean" &&
    typeof value.showCv === "boolean";
}

const server = createServer(async (request, response) => {
  try {
    if (request.url === "/api/session" && request.method === "GET") {
      clearTimeout(shutdownTimer);
      response.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store", "connection": "keep-alive" });
      response.write("CV Studio session\n");
      openSessions.add(response);
      const keepAlive = setInterval(() => response.write(" \n"), 15000);
      response.on("close", () => {
        clearInterval(keepAlive);
        openSessions.delete(response);
        if (openSessions.size === 0) shutdownTimer = setTimeout(() => server.close(() => process.exit(0)), 2500);
      });
      return;
    }
    if (request.url === "/" && request.method === "GET") return send(response, 200, sectionsHtml, "text/html; charset=utf-8");
    if (request.url === "/publications-editor" && request.method === "GET") return send(response, 200, html, "text/html; charset=utf-8");
    if (request.url === "/sections" && request.method === "GET") return send(response, 200, sectionsHtml, "text/html; charset=utf-8");
    if (request.url === "/api/publications" && request.method === "GET") return send(response, 200, await readFile(dataPath, "utf8"), "application/json; charset=utf-8");
    if (request.url === "/api/publications" && request.method === "PUT") {
      let body = "";
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 2_000_000) throw new Error("Request is too large");
      }
      const data = JSON.parse(body);
      if (!Array.isArray(data) || !data.every(validPublication)) return send(response, 400, "Invalid publication data");
      if (new Set(data.map((entry) => entry.id)).size !== data.length) return send(response, 400, "Publication IDs must be unique");
      await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      return send(response, 204, "");
    }
    if (request.url === "/api/cv-sections" && request.method === "GET") return send(response, 200, await readFile(sectionsPath, "utf8"), "application/json; charset=utf-8");
    if (request.url === "/api/cv-sections" && request.method === "PUT") {
      let body = "";
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 5_000_000) throw new Error("Request is too large");
      }
      const data = JSON.parse(body);
      const valid = data && data.version === 1 && Array.isArray(data.sections) && data.sections.every((section) =>
        section && typeof section.id === "string" && typeof section.title === "string" && typeof section.content === "string");
      const hasPublications = data?.sections?.filter((section) => section.id === "publications" && section.content === "{{PUBLICATIONS}}\n").length === 1;
      if (!valid || !hasPublications) return send(response, 400, "Invalid CV section data");
      await writeFile(sectionsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      return send(response, 204, "");
    }
    if (request.url === "/api/cv" && request.method === "GET") return send(response, 200, await readFile(cvPath, "utf8"), "application/json; charset=utf-8");
    if (request.url === "/api/cv" && request.method === "PUT") {
      let body = "";
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 8_000_000) throw new Error("Request is too large");
      }
      const data = JSON.parse(body);
      const arrays = ["education", "researchExperience", "funding", "fieldwork", "service", "awards", "outreach", "skills", "engagement", "mentoring", "conferenceAbstracts"];
      const valid = data && data.version === 2 && data.profile && typeof data.profile.name === "string" && arrays.every((key) => Array.isArray(data[key]));
      if (!valid) return send(response, 400, "Invalid guided CV data");
      await writeFile(cvPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      return send(response, 204, "");
    }
    if (request.url === "/api/generate" && request.method === "POST") {
      execFile(process.execPath, [path.join(projectRoot, "scripts", "generate-cv.mjs")], { cwd: projectRoot }, (error, stdout, stderr) => {
        if (error) return send(response, 500, stderr || error.message);
        send(response, 200, `${stdout}\nYour updated file is ready at cv/generated/main.tex`);
      });
      return;
    }
    if (request.url === "/api/pdf" && request.method === "POST") {
      try {
        const pageCount = await buildPdf();
        return send(response, 200, `PDF ready. Updated the website PDF and ${pageCount} mobile page previews.`);
      } catch (error) {
        return send(response, 500, error instanceof Error ? error.message : "PDF generation failed");
      }
    }
    send(response, 404, "Not found");
  } catch (error) {
    send(response, 500, error instanceof Error ? error.message : "Unexpected error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`CV Studio is ready at http://127.0.0.1:${port}`);
  console.log("Press Ctrl+C to stop it.");
});
