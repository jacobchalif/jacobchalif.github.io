"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";

type Entry = Record<string, unknown> & { id?: string };
type StudioData = Record<string, unknown> & { publications: Entry[] };
type Field = [string, string, ("long" | "lines" | "checkbox" | "status" | "presentation")?];
type Config = { title: string; single?: boolean; fields: Field[] };

const configs: Record<string, Config> = {
  profile: { title: "Profile", single: true, fields: [["name","Name"],["email","Email"],["website","Website"]] },
  education: { title: "Education", fields: [["organization","Institution"],["location","Location"],["role","Degree"],["date","Dates"],["bullets","Details / bullets","lines"]] },
  researchExperience: { title: "Research experience", fields: [["organization","Organization"],["location","Location"],["role","Role"],["date","Dates"],["bullets","Accomplishments / bullets","lines"]] },
  publications: { title: "Publications", fields: [["year","Year"],["status","Status","status"],["title","Title","long"],["authors","Authors","long"],["journal","Journal / citation detail","long"],["doi","DOI URL"],["highlightHref","Highlight URL"],["showWebsite","Show on website","checkbox"],["showCv","Show in CV","checkbox"]] },
  funding: { title: "Research funding", fields: [["label","Year"],["text","Description","long"]] },
  fieldwork: { title: "Field research", fields: [["location","Location"],["date","Dates"],["bullets","Details / bullets","lines"]] },
  service: { title: "Professional service", fields: [["label","Role / label"],["text","Details","long"]] },
  awards: { title: "Honors and awards", fields: [["label","Award"],["text","Institution and year","long"]] },
  outreach: { title: "Science outreach", fields: [["label","Activity"],["text","Description","long"]] },
  skills: { title: "Skills and certifications", fields: [["label","Category"],["text","Details","long"]] },
  engagement: { title: "Local engagement", fields: [["label","Organization"],["text","Role and dates","long"]] },
  mentoring: { title: "Undergraduate mentoring", fields: [["name","Student"],["details","Details","long"]] },
  conferenceAbstracts: { title: "Conference abstracts", fields: [["year","Year"],["authors","Authors","long"],["title","Title","long"],["conference","Conference or meeting","long"],["location","Location"],["presentationType","Presentation type","presentation"]] },
};

const text = (value: unknown) => String(value ?? "");
function firstSurname(authors: unknown, surnameFirst = false) {
  const first = text(authors).split(",")[0].trim();
  return surnameFirst ? first : first.split(/\s+/).at(-1) || "Unknown author";
}
function summary(section: string, item: Entry) {
  if (section === "publications") return `${firstSurname(item.authors)} et al., ${text(item.year)}`;
  if (section === "conferenceAbstracts") return [firstSurname(item.authors, true), item.year, item.conference].filter(Boolean).join(", ");
  return text(item.name || item.organization || item.location || item.label || item.title || item.year || "Untitled entry");
}

export default function StudioClient() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [data, setData] = useState<StudioData | null>(null);
  const [section, setSection] = useState("profile");
  const [entryId, setEntryId] = useState("profile");
  const [status, setStatus] = useState("Loading…");
  const [email, setEmail] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null);
  const config = configs[section];
  const items = useMemo(() => !data ? [] : config.single ? [data.profile as Entry] : (data[section] as Entry[] || []), [data, section, config.single]);
  const current = items.find(item => (item.id || "profile") === entryId) || items[0];

  useEffect(() => {
    const saved = window.localStorage.getItem("cv-studio-theme");
    setTheme(saved === "light" || saved === "dark" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);
  useEffect(() => { fetch("/api/cv-studio").then(async response => {
    const payload = await response.json(); if (response.status === 403) { window.location.assign("/signin-with-chatgpt?return_to=%2Fcv-studio"); return; } if (!response.ok) throw new Error(payload.error);
    setData({ ...payload.cv, publications: payload.publications }); setEmail(payload.email); setStatus("Saved");
  }).catch(error => setStatus(error.message)); }, []);

  function change(key: string, value: unknown) {
    if (!data || !current) return;
    current[key] = value;
    setData({ ...data }); setStatus("Unsaved");
  }
  function switchSection(key: string) {
    setSection(key); const next = configs[key].single ? "profile" : ((data?.[key] as Entry[])?.[0]?.id || ""); setEntryId(next); setSelectedIds(next ? [next] : []); setSelectionAnchorId(next || null);
  }
  function addEntry() {
    if (!data || config.single) return;
    const item: Entry = { id: `${section}-${Date.now()}` };
    for (const [key,,type] of config.fields) item[key] = type === "lines" ? [] : type === "checkbox" ? true : type === "status" ? "published" : "";
    (data[section] as Entry[]).push(item); setEntryId(item.id!); setSelectedIds([item.id!]); setSelectionAnchorId(item.id!); setData({ ...data }); setStatus("Unsaved");
  }
  function remove() {
    if (!data || !current || config.single || !confirm("Delete this entry?")) return;
    const next = items.filter(item => item.id !== current.id); data[section] = next; setEntryId(next[0]?.id || ""); setSelectedIds(next[0]?.id ? [next[0].id] : []); setSelectionAnchorId(next[0]?.id || null); setData({ ...data }); setStatus("Unsaved");
  }
  function move(delta: number) {
    if (!data || !current) return; const list = data[section] as Entry[]; const from = list.findIndex(x => x.id === current.id), to = from + delta;
    if (from < 0 || to < 0 || to >= list.length) return; [list[from], list[to]] = [list[to], list[from]]; setData({ ...data }); setStatus("Unsaved");
  }
  function selectItem(id: string, event: MouseEvent<HTMLButtonElement>) {
    if (config.single) return;
    if (event.shiftKey && selectionAnchorId) {
      const anchor = items.findIndex(item => item.id === selectionAnchorId), clicked = items.findIndex(item => item.id === id);
      if (anchor >= 0 && clicked >= 0) setSelectedIds(items.slice(Math.min(anchor, clicked), Math.max(anchor, clicked) + 1).map(item => item.id!));
    } else if (event.metaKey || event.ctrlKey) {
      setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(value => value !== id) : [...selectedIds, id]); setSelectionAnchorId(id);
    } else {
      setSelectedIds([id]); setSelectionAnchorId(id);
    }
    setEntryId(id);
  }
  function startDrag(id: string) {
    setDraggedId(id); setDropTarget(null);
    if (!selectedIds.includes(id)) { setSelectedIds([id]); setSelectionAnchorId(id); setEntryId(id); }
  }
  function dragOver(targetId: string, after: boolean) {
    if (!draggedId) return; const movingIds = selectedIds.includes(draggedId) ? selectedIds : [draggedId];
    setDropTarget(movingIds.includes(targetId) ? null : { id: targetId, after });
  }
  function drop(targetId: string, after: boolean) {
    if (!data || !draggedId) return; const list = data[section] as Entry[]; const movingIds = selectedIds.includes(draggedId) ? selectedIds : [draggedId];
    if (movingIds.includes(targetId)) { setDraggedId(null); setDropTarget(null); return; }
    const moved = list.filter(item => movingIds.includes(item.id!)), remaining = list.filter(item => !movingIds.includes(item.id!)); const target = remaining.findIndex(item => item.id === targetId); if (target < 0) return;
    remaining.splice(target + (after ? 1 : 0), 0, ...moved); data[section] = remaining; setEntryId(draggedId); setSelectedIds(moved.map(item => item.id!)); setDraggedId(null); setDropTarget(null); setData({ ...data }); setStatus("Unsaved");
  }
  async function publish() {
    if (!data) return; setStatus("Publishing…"); const { publications, ...cv } = data;
    const response = await fetch("/api/cv-studio", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ cv, publications }) });
    const payload = await response.json(); if (!response.ok) { setStatus("Failed"); alert(payload.error); return; }
    setStatus("Published"); alert("Saved. GitHub is rebuilding the website and PDF.");
  }
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); window.localStorage.setItem("cv-studio-theme", next);
  }

  return <main className="online-studio" data-theme={theme}>
    <header><h1>CV Studio</h1><span>{email}</span><span className="studio-status">{status}</span><button className="studio-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? "☀ Light" : "☾ Dark"}</button><a href="/signout-with-chatgpt?return_to=%2F">Sign out</a><button onClick={publish} disabled={!data}>Save & publish</button></header>
    <div className="studio-shell"><nav>{Object.entries(configs).map(([key, value]) => <button className={key === section ? "active" : ""} onClick={() => switchSection(key)} key={key}>{value.title}<small>{value.single ? "" : text((data?.[key] as Entry[])?.length)}</small></button>)}</nav>
      <section className="studio-workspace"><div className="studio-heading"><div><h2>{config.title}</h2><p>Drag to reorder. Hold Command/Ctrl to select individual entries or Shift to select a range.</p></div></div>
        <div className="studio-grid"><div className="studio-list">{items.map(item => <button key={item.id || "profile"} draggable={!config.single} onDragStart={() => startDrag(item.id!)} onDragEnd={() => { setDraggedId(null); setDropTarget(null); }} onDragOver={event => { event.preventDefault(); dragOver(item.id!, event.clientY > event.currentTarget.getBoundingClientRect().top + event.currentTarget.offsetHeight / 2); }} onDrop={event => drop(item.id!, event.clientY > event.currentTarget.getBoundingClientRect().top + event.currentTarget.offsetHeight / 2)} onClick={event => selectItem(item.id || "profile", event)} className={`${(item.id || "profile") === (current?.id || "profile") ? "active" : ""} ${selectedIds.includes(item.id!) ? "selected" : ""} ${draggedId && (selectedIds.includes(item.id!) || draggedId === item.id) ? "dragging" : ""} ${dropTarget?.id === item.id ? (dropTarget.after ? "drop-after" : "drop-before") : ""}`}><strong>{summary(section, item)}</strong><small>{text(item.date || item.role || item.status || item.details || item.text || item.email)}</small></button>)}{!config.single && <button className="studio-add-entry" onClick={addEntry}><strong>＋ Add entry</strong><small>Creates a new item at the end of this list</small></button>}</div>
          <div className="studio-editor">{current && <>{config.fields.map(([key,label,type]) => <label key={key}>{label}{type === "long" || type === "lines" ? <textarea value={type === "lines" ? (current[key] as string[] || []).join("\n") : text(current[key])} onChange={event => change(key, type === "lines" ? event.target.value.split("\n").filter(Boolean) : event.target.value)} /> : type === "checkbox" ? <input type="checkbox" checked={Boolean(current[key])} onChange={event => change(key, event.target.checked)} /> : type === "status" ? <select value={text(current[key])} onChange={event => change(key,event.target.value)}><option value="published">Published</option><option value="in_review">In review</option><option value="in_preparation">In preparation</option></select> : type === "presentation" ? <select value={text(current[key])} onChange={event => change(key,event.target.value)}><option value="">Not specified</option><option>Talk</option><option>Poster</option></select> : <input value={text(current[key])} onChange={event => change(key,event.target.value)} />}</label>)}{!config.single && <div className="studio-actions"><button onClick={() => move(-1)}>Move earlier</button><button onClick={() => move(1)}>Move later</button><button className="danger" onClick={remove}>Delete</button></div>}</>}</div>
        </div></section></div>
  </main>;
}
