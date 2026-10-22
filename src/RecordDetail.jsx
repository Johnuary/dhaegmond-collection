import { byId, image } from "./data";
import CropImage from "./CropImage";

const CONFIG = {
 faction: {collection:"factions",heading:"ORGANIZATION DOSSIER",back:"factions"},
 location: {collection:"locations",heading:"LOCATION DOSSIER",back:"atlas"},
 codex: {collection:"codexEntries",heading:"DIVINE CODEX RECORD",back:"codex"},
 timeline: {collection:"timelines",heading:"CHRONOLOGY RECORD",back:"library/timeline"}
};
function safeText(value){return typeof value === "string" ? value : "";}
export default function RecordDetail({db,kind,id,onNavigate}) {
 const config=CONFIG[kind];
 const item=config ? byId(db[config.collection] || [],id) : null;
 const label=config?.heading||"ARCHIVE RECORD";
 const go=(path)=>onNavigate(path);
 const link=(kind,id)=>go(`${kind}/${encodeURIComponent(id)}`);
 const section=(title,children)=>children?.length ? <section className="record-section"><h2>{title}</h2><div className="record-links">{children}</div></section> : null;
 const related=(array,key,route,secondary)=>{
  const ids=Array.isArray(array)?array:[];
  return ids.map(ref=>{const found=byId(db[key]||[],ref);return found?<button className="record-link" key={ref} onClick={()=>go(route==="collection/universes"?`collection/universes/${encodeURIComponent(ref)}`:`${route}/${encodeURIComponent(ref)}`)}><strong>{found.name}</strong>{secondary&&<small>{safeText(found[secondary])}</small>}<span>↗</span></button>:null}).filter(Boolean);
 };
 if(!item)return <main className="shell"><header className="topbar"><span className="brand">DHÆG-MOND <small>ARCHIVE</small></span><button className="outline-button" onClick={()=>go(config?.back||"collection")}>← Browse records</button></header><section className="record-page"><h1>Record not found</h1><p>This entry may have been removed or may not exist in your local collection.</p></section></main>;
 const universe=byId(db.universes||[],item.universeId);
 const artwork=item.artwork||item.image||item.emblem||"";
 const chars=kind==="faction"?(item.members||[]).map(m=>m.characterId):item.characterIds;
 const factionIds=kind==="location"?item.factionIds:kind==="codex"?item.factionIds:[];
 const stories=(db.stories||[]).filter(s=>s.status==="Published" && ((item.storyIds||[]).includes(s.id) || (kind==="faction"&&(s.factionIds||[]).includes(item.id)) || (kind==="location"&&(s.locationIds||[]).includes(item.id)) || (kind==="codex"&&(s.codexIds||[]).includes(item.id)))).map(s=>s.id);
 const memberRows=kind==="faction"?(item.members||[]).map(m=>{const person=byId(db.characters,m.characterId);return person?<button className="record-link" key={m.characterId} onClick={()=>link("characters",person.id)}><strong>{person.name}</strong><small>{m.role||"Member"}{m.isLeader?" · Leader":""}</small><span>↗</span></button>:null}).filter(Boolean):[];
 const relations=kind==="faction"?(item.relations||[]).map(r=>{const found=byId(db.factions,r.factionId);return found?<button className="record-link" key={r.factionId} onClick={()=>link("factions",found.id)}><strong>{found.name}</strong><small>{r.type||"Connection"}</small><span>↗</span></button>:null}).filter(Boolean):[];
 return <main className="shell"><header className="topbar"><span className="brand">DHÆG-MOND <small>ENCYCLOPEDIA</small></span><div className="header-actions"><button className="outline-button" onClick={()=>go(config.back)}>← Back to {kind==="timeline"?"Timelines":kind==="location"?"Atlas":kind==="codex"?"Codex":"Factions"}</button><button className="outline-button" onClick={()=>go("search")}>Search</button><button className="outline-button" onClick={()=>go("manage")}>Manage</button></div></header>
 <article className="record-page"><p className="eyebrow">{label}</p><h1>{item.name}</h1><p className="record-subtitle">{[item.subtitle||item.type||item.category,universe?.name,item.region].filter(Boolean).join(" · ")}</p>{artwork&&<div className="record-cover"><CropImage src={artwork} alt={item.name}/></div>}{item.description&&<p className="record-lead">{item.description}</p>}{item.history&&<section className="record-section"><h2>History</h2><div className="record-prose">{safeText(item.history).split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}</div></section>}{item.lore&&<section className="record-section"><h2>Lore</h2><div className="record-prose">{safeText(item.lore).split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}</div></section>}
 {kind==="timeline"&&<><section className="record-section"><h2>Act Structure</h2><div className="record-links">{(item.acts||[]).map((act,i)=><span className="record-pill" key={i}>{act}</span>)}</div></section><section className="record-section"><h2>Timeline Viewer</h2><p>Open this timeline in the interactive chronology to see chapter placements and edit bars.</p><button className="primary-button" onClick={()=>go(`library/timeline?focus=${encodeURIComponent(item.id)}`)}>Open timeline →</button></section></>}
 {kind==="location"&&<>{item.parentId&&section("Located Within",related([item.parentId],"locations","locations"))}{section("Associated Factions",related(factionIds,"factions","factions","type"))}{section("Associated Characters",related(chars,"characters","characters","title"))}</>}
 {kind==="faction"&&<>{section("Members & Leadership",memberRows)}{section("Alliances & Rivalries",relations)}</>}
 {kind==="codex"&&<>{item.epithet&&<p className="record-lead">{item.epithet}</p>}{section("Characters",related(chars,"characters","characters","title"))}{section("Skins",related(item.skinIds,"skins","skins","tier"))}{section("Factions",related(factionIds,"factions","factions","type"))}{section("Locations",related(item.locationIds,"locations","locations","type"))}</>}
 {section("Related Stories",related([...new Set([...(item.storyIds||[]),...stories])].filter(s=>byId(db.stories||[],s)?.status==="Published"),"stories","stories","category"))}
 {universe&&section("Universe",related([universe.id],"universes","collection/universes"))}
 <div className="record-footer"><button className="outline-button" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);alert("Link copied");}catch{window.prompt("Copy this record URL",window.location.href);}}}>Copy record link</button></div></article></main>;
}
