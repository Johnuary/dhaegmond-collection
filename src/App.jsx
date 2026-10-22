import RecordDetail from "./RecordDetail";
import UniversalSearch from "./UniversalSearch";
import DivineCodex from "./DivineCodex";
import WorldAtlas from "./WorldAtlas";
import Factions from "./Factions";
import RelationshipWeb from "./RelationshipWeb";
import {normalizeTimelines} from "./timelines";
import { useCallback, useEffect, useState } from "react";
import { seed, image, byId, skinsFor, tierColors } from "./data";
import CharacterCollection from "./CharacterCollection";
import CollectionManager from "./CollectionManager";
import SkinDetail from "./SkinDetail";
import ArtworkViewer from "./ArtworkViewer";
import CropImage from "./CropImage";
import HomePage from "./HomePage";
import {normalizedTheme} from "./GlobalThemeEditor";
import { BattleProfile, PersonalProfile } from "./BattlePersonal";
import StoriesLibrary from "./StoriesLibrary";
import StoryReader from "./StoryReader";
import StoryTimeline from "./StoryTimeline";

const KEY="dhaegmond-collection-v6";
const FAVKEY="dhaegmond-favorites-v8";
function readFavorites(){try{const value=JSON.parse(localStorage.getItem(FAVKEY)||"[]");return Array.isArray(value)?value:[];}catch{return [];}}
function readCollection(){try{const raw=localStorage.getItem(KEY);if(!raw)return normalizeDb(structuredClone(seed));const parsed=JSON.parse(raw);return validCollection(parsed)?normalizeDb(parsed):normalizeDb(structuredClone(seed));}catch{return normalizeDb(structuredClone(seed));}}
function validCollection(db){return !!db&&["characters","skins","universes"].every(key=>Array.isArray(db[key])&&db[key].every(x=>x&&typeof x.id==="string"&&typeof x.name==="string"))&&db.characters.every(c=>Array.isArray(c.relationships)&&Array.isArray(c.abilities)&&Array.isArray(c.timeline))&&db.skins.every(s=>Array.isArray(s.artworks));}
function normalizeDb(db){return normalizeTimelines({...db,stories:Array.isArray(db.stories)?db.stories:[],factions:Array.isArray(db.factions)?db.factions:[],locations:Array.isArray(db.locations)?db.locations:[],codexEntries:Array.isArray(db.codexEntries)?db.codexEntries:[],atlasMaps:Array.isArray(db.atlasMaps)?db.atlasMaps:[],timelineActs:Array.isArray(db.timelineActs)&&db.timelineActs.length?db.timelineActs:["Act I","Act II","Act III","Act IV","Act V"]});}
const tabs=["Overview","Personal","Abilities","Lore","Relationships","Skins","Stories"];
// Hash routes are compatible with GitHub Pages and static hosting.
function currentRoute(){
 const parts=window.location.hash.replace(/^#\/?/,"").split("?")[0].split("/").filter(Boolean);
 if(parts[0]==="characters"&&parts[1])return {page:"profile",id:decodeURIComponent(parts[1])};
 if(parts[0]==="skins"&&parts[1])return {page:"skin",id:decodeURIComponent(parts[1])};
 if(parts[0]==="stories"&&parts[1])return {page:"story",id:decodeURIComponent(parts[1])};
 if(parts[0]==="search")return {page:"search"};
 if(["factions","locations","codex","timelines"].includes(parts[0])&&parts[1])return {page:"record",kind:({factions:"faction",locations:"location",codex:"codex",timelines:"timeline"})[parts[0]],id:decodeURIComponent(parts[1])};
 if(parts[0]==="codex")return {page:"codex"};
 if(parts[0]==="atlas")return {page:"atlas"};
 if(parts[0]==="factions")return {page:"factions"};
 if(parts[0]==="relationships")return {page:"relationships"};
 if(parts[0]==="library"&&parts[1]==="timeline")return {page:"timeline"};
 if(parts[0]==="library")return {page:"library"};
 if(parts[0]==="manage")return {page:"manager"};
 if(parts[0]==="collection")return {page:"collection",universeId:parts[1]==="universes"?decodeURIComponent(parts[2]||""):""};
 return {page:"home"};
}
function routeTo(path){
 const target="#/"+path;
 if(window.location.hash!==target)window.location.hash=target;
 else window.dispatchEvent(new HashChangeEvent("hashchange"));
}
const BACKUP_FORMAT="dhaegmond-collection-backup";
const BACKUP_VERSION=1;
function fileDownload(content,filename){
 const blob=new Blob([content],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function App(){
 const [favorites,setFavorites]=useState(readFavorites),[db,setDb]=useState(readCollection),[saveError,setSaveError]=useState(""),[route,setRoute]=useState(currentRoute),[tab,setTab]=useState("Overview"),[skinId,setSkinId]=useState(null),[tier,setTier]=useState("All"),[viewer,setViewer]=useState(false);
 const page=route.page;
 const globalTheme=normalizedTheme(db.globalTheme);
 useEffect(()=>{const root=document.documentElement; const entries={"--global-bg":globalTheme.background,"--global-surface":globalTheme.surface,"--global-accent":globalTheme.accent,"--global-text":globalTheme.text};Object.entries(entries).forEach(([key,value])=>root.style.setProperty(key,value));document.body.dataset.atmosphere=globalTheme.atmosphere;document.body.dataset.navigation=globalTheme.navigation;document.body.dataset.heading=globalTheme.font;return ()=>{Object.keys(entries).forEach(key=>root.style.removeProperty(key));delete document.body.dataset.atmosphere;delete document.body.dataset.navigation;delete document.body.dataset.heading;};},[globalTheme.background,globalTheme.surface,globalTheme.accent,globalTheme.text,globalTheme.atmosphere,globalTheme.navigation,globalTheme.font]);
 const charId=page==="profile"?route.id:(page==="skin"?byId(db.skins,route.id)?.characterId:"marble");
 useEffect(()=>{
  const sync=()=>{setRoute(currentRoute());setViewer(false);setTier("All");window.scrollTo(0,0);};
  window.addEventListener("hashchange",sync);
  return ()=>window.removeEventListener("hashchange",sync);
 },[]);
 useEffect(()=>{if(page==="skin")setSkinId(route.id);else if(page==="profile")setSkinId(skinsFor(db,charId)[0]?.id||null);},[page,charId,route.id]);
 function toggleFavorite(id){setFavorites(old=>{const next=old.includes(id)?old.filter(x=>x!==id):[...old,id];try{localStorage.setItem(FAVKEY,JSON.stringify(next));}catch{}return next;});}
 function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));setDb(normalizeDb(next));setSaveError("");}catch{setSaveError("Browser storage is full or unavailable. Your latest change is visible but may not persist after a reload. Export JSON now and consider smaller images or file paths.");setDb(normalizeDb(next));}}
 function exportJSON(){
  const backup={format:BACKUP_FORMAT,version:BACKUP_VERSION,exportedAt:new Date().toISOString(),collection:db,favorites};
  fileDownload(JSON.stringify(backup,null,2),`dhaegmond-backup-${new Date().toISOString().slice(0,10)}.json`);
 }
 async function importJSON(file){
  try{
   if(file.size>20*1024*1024)throw new Error("Backup exceeds 20 MB. Keep large artwork in public/images instead.");
   const parsed=JSON.parse(await file.text());
   const wrapped=parsed?.format===BACKUP_FORMAT;
   if(wrapped&&parsed.version!==BACKUP_VERSION)throw new Error("Unsupported backup version.");
   const incoming=wrapped?parsed.collection:parsed;
   if(!validCollection(incoming))throw new Error("This file is not a valid Phase 6–10 collection backup.");
   if(!window.confirm("Replace your current collection with this backup? Export your current data first."))return;
   save(normalizeDb(incoming));
   if(wrapped&&Array.isArray(parsed.favorites)){
    const ids=parsed.favorites.filter(id=>typeof id==="string");
    setFavorites(ids);
    try{localStorage.setItem(FAVKEY,JSON.stringify(ids));}catch{}
   }
   routeTo("");
  }catch(e){alert(`Import failed: ${e.message}`);}
 }
 function reset(){if(window.confirm("Reset ALL edits and restore the original demo collection? Export a backup first.")){save(structuredClone(seed));routeTo("");}}
 function openCharacter(id,openingTab="Overview"){if(!byId(db.characters,id))return;setTier("All");setTab(openingTab);setViewer(false);routeTo(`characters/${encodeURIComponent(id)}`);window.scrollTo(0,0);}
 function openSkin(id){const skin=byId(db.skins,id);if(!skin)return;setViewer(false);routeTo(`skins/${encodeURIComponent(id)}`);window.scrollTo(0,0);}
 function goHome(){routeTo("collection");setViewer(false);window.scrollTo(0,0);}
 function goWelcome(){routeTo("");setViewer(false);window.scrollTo(0,0);}
 function backToProfile(){setTab("Skins");routeTo(`characters/${encodeURIComponent(charId)}`);window.scrollTo(0,0);}
 const char=byId(db.characters,charId),charSkins=skinsFor(db,charId),selectedSkin=charSkins.find(s=>s.id===skinId)||charSkins[0],filteredSkins=charSkins.filter(s=>tier==="All"||s.tier===tier);
 function chooseTier(next){setTier(next);if(next!=="All"&&!charSkins.some(s=>s.id===skinId&&s.tier===next)){setSkinId(charSkins.find(s=>s.tier===next)?.id||null);}}
 const closeViewer=useCallback(()=>setViewer(false),[]);
 if(page==="home")return <HomePage db={db} favorites={favorites} onCollection={goHome} onManage={()=>routeTo("manage")} onOpenCharacter={openCharacter} onOpenSkin={openSkin} onOpenUniverse={id=>routeTo(`collection/universes/${encodeURIComponent(id)}`)}/>;
 if(page==="record")return <RecordDetail db={db} kind={route.kind} id={route.id} onNavigate={routeTo}/>;
 if(page==="search")return <UniversalSearch db={db} onBack={goHome} onManage={()=>routeTo("manage")} onNavigate={routeTo}/>;
 if(page==="codex")return <DivineCodex db={db} onBack={goHome} onManage={()=>routeTo("manage")} onOpenCharacter={openCharacter} onOpenSkin={openSkin} onOpenStory={id=>routeTo(`stories/${encodeURIComponent(id)}`)} onOpenAtlas={id=>routeTo(id?`locations/${encodeURIComponent(id)}`:"atlas")} onOpenRecord={id=>routeTo(`codex/${encodeURIComponent(id)}`)} onOpenFactions={id=>routeTo(id?`factions/${encodeURIComponent(id)}`:"factions")}/>;
 if(page==="atlas")return <WorldAtlas db={db} onBack={goHome} onManage={()=>routeTo("manage")} onOpenCharacter={openCharacter} onOpenFaction={id=>routeTo(id?`factions/${encodeURIComponent(id)}`:"factions")} onOpenRecord={id=>routeTo(`locations/${encodeURIComponent(id)}`)}/>;
 if(page==="factions")return <Factions db={db} onBack={goHome} onManage={()=>routeTo("manage")} onOpenCharacter={openCharacter} onOpenRecord={id=>routeTo(`factions/${encodeURIComponent(id)}`)}/>;
 if(page==="relationships")return <RelationshipWeb db={db} onSave={save} onBack={goHome} onOpenCharacter={openCharacter}/>;
 if(page==="timeline")return <StoryTimeline db={db} onSave={save} onLibrary={()=>routeTo("library")} onManage={()=>routeTo("manage")} onOpenStory={id=>routeTo(`stories/${encodeURIComponent(id)}`)} initialTimelineId={new URLSearchParams(window.location.hash.split("?")[1]||"").get("focus")}/>;
 if(page==="library")return <StoriesLibrary db={db} onOpenStory={id=>routeTo(`stories/${encodeURIComponent(id)}`)} onOpenCharacter={openCharacter} onOpenSkin={openSkin} onCollection={goHome} onManage={()=>routeTo("manage")} onTimeline={()=>routeTo("library/timeline")}/>;
 if(page==="story")return <StoryReader db={db} storyId={route.id} onLibrary={()=>routeTo("library")} onOpenCharacter={openCharacter} onOpenSkin={openSkin} onOpenStory={id=>routeTo(`stories/${encodeURIComponent(id)}`)}/>;
 if(page==="manager")return <CollectionManager db={db} onSave={save} onClose={goHome} onExport={exportJSON} onImport={importJSON} onReset={reset} saveError={saveError}/>;
 if(page==="collection")return <CharacterCollection key={route.universeId||"all"} initialUniverse={route.universeId||"All"} db={db} onOpenCharacter={openCharacter} onOpenSkin={openSkin} onManage={()=>routeTo("manage")} favorites={favorites} onToggleFavorite={toggleFavorite} onWelcome={goWelcome} onLibrary={()=>routeTo("library")} onRelationships={()=>routeTo("relationships")} onFactions={()=>routeTo("factions")} onAtlas={()=>routeTo("atlas")} onCodex={()=>routeTo("codex")} onSearch={()=>routeTo("search")}/>;
 if(page==="skin"){const skin=byId(db.skins,route.id);return skin?<SkinDetail key={skin.id} db={db} skin={skin} onBack={backToProfile} onCollection={goHome}/>:<main className="shell"><button onClick={goHome}>Collection</button><p>Skin not found.</p></main>;}
 if(!char)return <main className="shell"><button onClick={goHome}>← Collection</button><p>Character not found. The link may point to a deleted character.</p></main>;
 return <main className={`shell identity-layout-${char.presentation?.layout||"classic"} identity-motif-${char.presentation?.motif||"star"} identity-heading-${char.presentation?.heading||"cinematic"}`} style={{"--character-accent":char.visualTheme?.glow||char.accent||({North:"#cdb073",Central:"#80bfd9",South:"#78c9b2"}[char.region]||"#d9bd81"),"--visual-bg":char.visualTheme?.background||"#071321","--visual-glow":char.visualTheme?.glow||char.accent||"#c7a76a","--visual-border":char.visualTheme?.border||"#b69860"}}><header className="topbar"><span className="brand">DHÆG-MOND <small>COLLECTION</small></span><div className="header-actions"><button className="outline-button" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);alert("Profile link copied!");}catch{window.prompt("Copy this link:",window.location.href);}}}>Copy Profile Link</button><button className="outline-button" onClick={goHome}>← Back to Collection</button></div></header><div className="hero themed-hero"><div className="hero-glow" aria-hidden="true"/><div className="character-theme-glow" aria-hidden="true"/><span className="hero-identity-ornament" aria-hidden="true">{char.presentation?.motif==="stone"?"◆":char.presentation?.motif==="elemental"?"◎":char.presentation?.motif==="prism"?"◇":char.presentation?.motif==="none"?"":"✧"}</span><CropImage src={char.splash||char.portrait} crop={char.splashCropPresets?.banner ?? char.splashCrop} alt={`${char.name} artwork`}/><div className="hero-label"><div className="hero-rule"><span>✦</span> THE CELESTIAL ARCHIVE</div><p className="eyebrow">{char.title}</p><h1>{char.name}</h1><p className="eyebrow">{char.region} Region</p></div></div><nav className="tabs">{tabs.map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</nav><section className="profile-content">
 {tab==="Overview"&&<><p className="eyebrow">CHARACTER OVERVIEW</p><h2>{char.overviewTitle}</h2><p>{char.overview}</p><div className="stats"><span>REGION: {char.region}</span><span>POWER: {char.power}</span><span>FACTION: {char.faction}</span></div><h3>Locations</h3><div className="pills">{(db.locations||[]).filter(l=>(l.characterIds||[]).includes(char.id)).map(l=><button key={l.id} onClick={()=>routeTo(`locations/${encodeURIComponent(l.id)}`)}>{l.name}</button>)}</div><h3>Organizations</h3><div className="pills">{(db.factions||[]).filter(f=>(f.members||[]).some(m=>m.characterId===char.id)).map(f=><button key={f.id} onClick={()=>routeTo(`factions/${encodeURIComponent(f.id)}`)}>{f.name}</button>)}</div><h3>Divine Codex</h3><div className="pills">{(db.codexEntries||[]).filter(e=>(e.characterIds||[]).includes(char.id)).map(e=><button key={e.id} onClick={()=>routeTo(`codex/${encodeURIComponent(e.id)}`)}>{e.name} ↗</button>)}</div><h3>Connections</h3><div className="pills">{(char.relationships||[]).map(r=><button key={r.characterId} onClick={()=>openCharacter(r.characterId)} disabled={!byId(db.characters,r.characterId)}>{byId(db.characters,r.characterId)?.name||r.characterId} · {r.type}</button>)}</div></>}
 {tab==="Personal"&&<PersonalProfile character={char}/>}
 {tab==="Abilities"&&<BattleProfile character={char}/>}
 {tab==="Lore"&&<><p className="eyebrow">CHARACTER BIOGRAPHY</p><h2>{char.loreTitle}</h2><p>{char.lore}</p><h3>Story Timeline</h3><div className="timeline">{(char.timeline||[]).map((event,i)=><div key={i}><b>{i+1}</b><span>{event}</span></div>)}</div></>}
 {tab==="Relationships"&&<><button className="outline-button" onClick={()=>routeTo("relationships")}>✦ View Interactive Relationship Web →</button><p className="eyebrow">CHARACTER CONNECTIONS</p><h2>{char.name}'s Relationships</h2><div className="relation-grid">{(char.relationships||[]).map(rel=>{const other=byId(db.characters,rel.characterId);return <button className="relation-card" key={rel.characterId} disabled={!other} onClick={()=>openCharacter(rel.characterId)}><div className="relation-image">{other?<CropImage src={other.portrait} crop={other.portraitCropPresets?.card ?? other.portraitCrop} alt=""/>:"?"}</div><strong>{other?.name||rel.characterId}</strong><small>{rel.type}</small></button>})}</div>{!char.relationships?.length&&<p className="muted">No relationships added yet.</p>}</>}
 {tab==="Stories"&&<><p className="eyebrow">CONNECTED STORIES</p><h2>Stories featuring {char.name}</h2><div className="story-grid">{(db.stories||[]).filter(s=>s.status==="Published"&&((s.characterIds||[]).includes(char.id)||(s.skinIds||[]).some(id=>byId(db.skins,id)?.characterId===char.id))).map(story=><button key={story.id} className="story-card" onClick={()=>routeTo(`stories/${encodeURIComponent(story.id)}`)}><span className="eyebrow">{story.category}</span><h2>{story.name}</h2><p>{story.summary}</p><small>READ STORY →</small></button>)}</div></>}
 {tab==="Skins"&&<><div className="gallery-heading"><div><p className="eyebrow">APPEARANCES</p><h2>{char.name}'s Skin Collection</h2></div><select aria-label="Filter skin tiers" value={tier} onChange={e=>chooseTier(e.target.value)}><option value="All">All Tiers</option>{[...new Set(charSkins.map(s=>s.tier))].map(t=><option key={t}>{t}</option>)}</select></div><div className="skin-layout"><div className="skin-rail">{filteredSkins.map(s=><button key={s.id} className={`skin-thumb ${selectedSkin?.id===s.id?"selected":""}`} style={{"--card-accent":tierColors[s.tier]||"#b6a27e"}} onClick={()=>setSkinId(s.id)}><div className="thumb-image"><CropImage src={s.artwork} crop={s.artworkCropPresets?.card ?? s.artworkCrop} alt=""/></div><strong>{s.name}</strong><small style={{color:tierColors[s.tier]}}>{s.tier}</small></button>)}</div>{selectedSkin?<div className="featured"><button className="featured-art" onClick={()=>setViewer(true)}><CropImage src={selectedSkin.artwork} crop={selectedSkin.artworkCropPresets?.preview ?? selectedSkin.artworkCrop} alt={`${selectedSkin.name} splash art`}/><span>⛶ VIEW FULL SPLASH</span></button><div className="featured-info"><p className="eyebrow">{byId(db.universes,selectedSkin.universeId)?.name||"Unassigned Universe"}</p><h2>{selectedSkin.name}</h2><span className="tier" style={{color:tierColors[selectedSkin.tier],borderColor:tierColors[selectedSkin.tier]}}>{selectedSkin.tier}</span><p>{selectedSkin.description}</p><button className="primary-button" onClick={()=>openSkin(selectedSkin.id)}>Explore Skin →</button></div></div>:<div className="empty-state">No skins in this selection. Add one through Manage Collection.</div>}</div></>}
 </section>{viewer&&selectedSkin&&<ArtworkViewer artworks={[{id:selectedSkin.id,title:selectedSkin.name,category:"Splash Art",file:selectedSkin.artwork}]} index={0} onChange={()=>{}} onClose={closeViewer}/>}</main>;
}
