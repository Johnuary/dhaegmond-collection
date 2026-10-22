import { useMemo, useState } from "react";
import { byId } from "./data";
import CropImage from "./CropImage";

const TYPES = ["All", "Characters", "Skins", "Universes", "Stories", "Factions", "Locations", "Codex", "Timelines"];
function normalize(value) { return String(value ?? "").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function entry(type, id, title, description, keywords, image, path, extra = "") {
  return { type, id, title: title || "Untitled", description: description || "", keywords: keywords || "", image, path, extra };
}
function buildIndex(db) {
  const list = [];
  for (const c of db.characters || []) list.push(entry("Characters", c.id, c.name, c.overview || c.lore, [c.title,c.region,c.faction,c.power,...(c.abilities || []).map(a => a.name),...(c.relationships || []).map(r => byId(db.characters,r.characterId)?.name)].join(" "), c.portrait, `characters/${encodeURIComponent(c.id)}`, c.region));
  for (const s of db.skins || []) list.push(entry("Skins", s.id, s.name, s.description, [s.tier,byId(db.characters,s.characterId)?.name,byId(db.universes,s.universeId)?.name].join(" "), s.artwork, `skins/${encodeURIComponent(s.id)}`, s.tier));
  for (const u of db.universes || []) list.push(entry("Universes", u.id, u.name, u.description, u.subtitle, null, `collection/universes/${encodeURIComponent(u.id)}`, "Universe"));
  for (const s of db.stories || []) if (s.status === "Published") list.push(entry("Stories", s.id, s.name, s.summary, [s.category,s.series,byId(db.universes,s.universeId)?.name,...(s.characterIds||[]).map(id=>byId(db.characters,id)?.name),...(s.skinIds||[]).map(id=>byId(db.skins,id)?.name),...(s.chapters||[]).map(ch=>ch.name||ch.title)].join(" "), s.cover || s.coverImage, `stories/${encodeURIComponent(s.id)}`, s.category));
  for (const f of db.factions || []) list.push(entry("Factions", f.id, f.name, f.description || f.history, [f.type,f.territory,byId(db.universes,f.universeId)?.name,...(f.members||[]).map(m=>byId(db.characters,m.characterId)?.name)].join(" "), f.emblem || f.image, `factions/${encodeURIComponent(f.id)}`, f.type));
  for (const l of db.locations || []) list.push(entry("Locations", l.id, l.name, l.description || l.history, [l.type,l.region,byId(db.universes,l.universeId)?.name,...(l.characterIds||[]).map(id=>byId(db.characters,id)?.name)].join(" "), l.image || l.artwork, `locations/${encodeURIComponent(l.id)}`, l.type));
  for (const c of db.codexEntries || []) list.push(entry("Codex", c.id, c.name, c.description || c.summary || c.lore, [c.category,c.epithet,byId(db.universes,c.universeId)?.name,...(c.characterIds||[]).map(id=>byId(db.characters,id)?.name)].join(" "), c.image || c.artwork, `codex/${encodeURIComponent(c.id)}`, c.category));
  for (const t of db.timelines || []) list.push(entry("Timelines", t.id, t.name, t.description, byId(db.universes,t.universeId)?.name, null, `timelines/${encodeURIComponent(t.id)}`, "Timeline"));
  return list;
}
export default function UniversalSearch({ db, onNavigate, onBack, onManage }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const all = useMemo(() => buildIndex(db), [db]);
  const results = useMemo(() => {
    const words = normalize(query).trim().split(/\s+/).filter(Boolean);
    return all.map(item => {
      const title = normalize(item.title), haystack = normalize([item.title,item.description,item.keywords,item.extra].join(" "));
      if ((type !== "All" && item.type !== type) || !words.every(word=>haystack.includes(word))) return null;
      const score = words.reduce((sum,word)=>sum+(title===word?10:title.startsWith(word)?6:title.includes(word)?4:1),0);
      return {...item, score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score || a.title.localeCompare(b.title));
  }, [all,query,type]);
  const categoryCounts = useMemo(()=>Object.fromEntries(TYPES.slice(1).map(t=>[t,results.filter(x=>x.type===t).length])),[results]);
  return <main className="shell"><header className="topbar"><span className="brand">DHÆG-MOND <small>UNIVERSAL SEARCH</small></span><div className="header-actions"><button className="outline-button" onClick={onBack}>← Collection</button><button className="outline-button" onClick={onManage}>⚙ Manage Collection</button></div></header><section className="search-page"><p className="eyebrow">✧ THE CELESTIAL ARCHIVE</p><h1>Search the Archive</h1><p className="muted">Find characters, skins, universes, published stories, factions, locations, Codex lore, and timelines in one place.</p><label className="search-input-label" htmlFor="universal-query">Search by name, lore, affiliation, or keyword</label><input id="universal-query" className="universal-input" type="search" autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Dhæg-Mond…"/><div className="search-filters" aria-label="Filter search results">{TYPES.map(t=><button type="button" key={t} className={type===t?"active":""} onClick={()=>setType(t)}>{t}</button>)}</div><p className="eyebrow">{results.length} RESULTS {query?`FOR “${query}”`:"IN THE ARCHIVE"}</p>{type==="All"&&<div className="search-counts">{Object.entries(categoryCounts).filter(([,count])=>count).map(([name,count])=><span key={name}>{name}: {count}</span>)}</div>}<div className="search-result-grid">{results.map(item=><button className="search-result" key={`${item.type}:${item.id}`} type="button" onClick={()=>onNavigate(item.path)}><div className="search-result-art">{item.image?<CropImage src={item.image} alt=""/>:<span aria-hidden="true">✦</span>}</div><div className="search-result-info"><span className="eyebrow">{item.type}{item.extra?` · ${item.extra}`:""}</span><h2>{item.title}</h2><p>{item.description || "Explore this archive entry."}</p><small>VIEW ENTRY →</small></div></button>)}</div>{results.length===0&&<div className="empty-state">No results found. Try a shorter term or select All categories.</div>}</section></main>;
}
