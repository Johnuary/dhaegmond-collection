import {CodexEditor} from "./DivineCodex";
import {AtlasEditor} from "./WorldAtlas";
import {FactionEditor} from "./Factions";
import {timelinesFor} from "./timelines";
import { BattleEditor, PersonalEditor } from "./BattlePersonal";
import StoryEditor from "./StoryEditor";
import HomeCropEditor from "./HomeCropEditor";
import CreationWizard from "./CreationWizard";
import HomeEditor from "./HomeEditor";
import { useRef, useState } from "react";
import GlobalThemeEditor from "./GlobalThemeEditor";
import { artworkCategories, byId, image, tiers, uid } from "./data";
import CropImage, { cropValues, normalCrop, framingPresets } from "./CropImage";

const fields = {
  characters: ["name","title","region","accent","portrait","splash","power","faction","overviewTitle","overview","loreTitle","lore"],
  skins: ["name","characterId","tier","universeId","artwork","description"],
  universes: ["name","subtitle","description"]
};
const labels = {characters:"Characters",skins:"Skins",universes:"Universes",library:"Artwork Library",homepage:"Homepage",globaltheme:"Global Theme",stories:"Stories / Library",factions:"Factions & Organizations",atlas:"World Atlas & Locations",codex:"Divine Codex",timeline:"Timeline Settings"};
const characterTabs = [
  {id:"overview",label:"Overview"},
  {id:"personal",label:"Personal"},
  {id:"abilities",label:"Abilities"},
  {id:"combat",label:"Combat"},
  {id:"lore",label:"Lore"},
  {id:"relationships",label:"Relationships"},
  {id:"artwork",label:"Artwork"},
  {id:"appearance",label:"Appearance"}
];
const characterFieldTab = {
  name:"overview",title:"overview",region:"overview",faction:"overview",overviewTitle:"overview",overview:"overview",
  power:"abilities",loreTitle:"lore",lore:"lore",portrait:"artwork",splash:"artwork",accent:"appearance"
};
const multiline = new Set(["overview","lore","description"]);
const imageFields = new Set(["portrait","splash","artwork","file"]);
const defaultVisuals = { background: "#071321", glow: "#c7a76a", border: "#b69860" };
const cropTemplates = [
  { id: "balanced", title: "Balanced", note: "Centered composition", value: {x:50,y:50,zoom:1} },
  { id: "face", title: "Face Focus", note: "Closer portrait framing", value: {x:50,y:29,zoom:1.85} },
  { id: "body", title: "Full Body", note: "Maximum outfit visibility", value: {x:50,y:55,zoom:1} },
  { id: "action", title: "Action Focus", note: "Dynamic off-center framing", value: {x:65,y:42,zoom:1.25} }
];
function ThemeEditor({ value, onChange, label }) {
  const current = {...defaultVisuals, ...(value||{})};
  const fields = [["background", "Backdrop"], ["glow", "Lighting accent"], ["border", "Frame border"]];
  return <section className="theme-editor"><h3>{label} visual theme</h3><p className="muted">Customize this entry without editing CSS. Changes apply to the profile or skin page immediately.</p><div className="theme-color-grid">{fields.map(([key,name])=><label key={key} className="theme-color-field"><span>{name}</span><input type="color" aria-label={`${name} color`} value={/^#[0-9a-f]{6}$/i.test(current[key])?current[key]:defaultVisuals[key]} onChange={e=>onChange({...current,[key]:e.target.value})}/><code>{current[key]}</code></label>)}</div><div className="theme-sample" style={{background:`linear-gradient(130deg, ${current.background}, ${current.glow}30)`,borderColor:current.border,boxShadow:`inset 0 0 45px ${current.glow}22`}}><span style={{color:current.glow}}>✦ CELESTIAL PROFILE</span><strong>Live theme preview</strong><small>Backdrop · accent · frame</small></div><button type="button" className="outline-button" onClick={()=>onChange({...defaultVisuals})}>Reset theme</button></section>;
}


const identityOptions = {
  layout: [["classic","Classic Overlay"],["split","Split Showcase"],["centered","Centered Emblem"]],
  motif: [["star","Celestial Star"],["stone","Stone / Strength"],["elemental","Elemental Rings"],["prism","Prismatic Diamond"],["none","None"]],
  heading: [["cinematic","Cinematic Serif"],["modern","Modern Sans"],["editorial","Editorial" ]]
};
function IdentityEditor({ value, onChange, label }) {
  const current = {layout:"classic",motif:"star",heading:"cinematic",...(value||{})};
  return <section className="identity-editor"><h3>{label} identity & presentation</h3><p className="muted">Choose a hero composition, decorative motif and typography. These change the actual character or skin page, without changing artwork or other profiles.</p>
    <div className="identity-controls">{Object.entries(identityOptions).map(([key,choices])=><label key={key} className="field"><span>{key === "layout" ? "Profile layout" : key === "motif" ? "Decorative motif" : "Heading typography"}</span><select value={current[key]} onChange={e=>onChange({...current,[key]:e.target.value})}>{choices.map(([v,title])=><option key={v} value={v}>{title}</option>)}</select></label>)}</div>
    <div className={`identity-mini-preview identity-layout-${current.layout} identity-motif-${current.motif} identity-heading-${current.heading}`}><span className="identity-ornament" aria-hidden="true">{current.motif==="stone"?"◆":current.motif==="elemental"?"◎":current.motif==="prism"?"◇":current.motif==="none"?"":"✧"}</span><div><small>THE CELESTIAL ARCHIVE</small><strong>YOUR CHARACTER</strong><span>Live composition preview</span></div></div>
    <button className="outline-button" type="button" onClick={()=>onChange({layout:"classic",motif:"star",heading:"cinematic"})}>Reset identity</button>
  </section>;
}

function newEntry(type, db) {
  if (type === "characters") return {id:uid(),name:"New Character",title:"",region:"South",accent:"",portrait:"",splash:"",power:"",faction:"",overviewTitle:"",overview:"",loreTitle:"",lore:"",abilities:[],timeline:[],relationships:[]};
  if (type === "skins") return {id:uid(),name:"New Skin",characterId:db.characters[0]?.id || "",tier:"Unassigned",universeId:db.universes[0]?.id || "",artwork:"",description:"",artworks:[]};
  return {id:uid(),name:"New Universe",subtitle:"",description:""};
}

function CropControls({ value, crop, presets, onPresetsChange, label, defaultPreset = "card" }) {
  const [active, setActive] = useState(defaultPreset);
  const drag = useRef(null);
  const current = cropValues(presets?.[active] ?? crop);
  const presetValue = (id) => cropValues(presets?.[id] ?? crop);
  const savePreset = (id, next) => onPresetsChange({ ...presets, [id]: cropValues(next) });
  const update = (key, number) => savePreset(active, { ...current, [key]: Number(number) });

  // Dragging translates the pointer movement into a shift of the image's focus.
  // The original file remains untouched. Pointer capture keeps dragging responsive
  // when the mouse moves beyond the preview boundary.
  function pointerDown(event) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    drag.current = { x: event.clientX, y: event.clientY, width: rect.width, height: rect.height, start: current, preset: active };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event) {
    if (!drag.current) return;
    const d = drag.current;
    const multiplier = 1 / Math.max(1, d.start.zoom);
    savePreset(d.preset, {
      ...d.start,
      x: d.start.x - (event.clientX - d.x) / d.width * 100 * multiplier,
      y: d.start.y - (event.clientY - d.y) / d.height * 100 * multiplier
    });
  }
  function pointerUp() { drag.current = null; }

  if (!value) return null;
  return <section className="crop-control-panel">
    <div className="crop-panel-head">
      <strong>Framing presets: {label}</strong>
      <button type="button" className="outline-button" onClick={() => savePreset(active, normalCrop)}>Reset this preset</button>
    </div>
    <p className="muted">Drag the large image to reposition it. Choose a preset below to edit that view. All three previews update as you work.</p>
    <div className="framing-preset-tabs" role="group" aria-label={`${label} framing preset`}>
      {framingPresets.map(p => <button type="button" key={p.id} className={active===p.id?"active":""} aria-pressed={active===p.id} onClick={()=>setActive(p.id)}>{p.name}</button>)}
    </div>
    <div className="framing-live-layout">
      <div className="framing-main">
        <div className="crop-demo-frame crop-drag-surface" style={{aspectRatio: framingPresets.find(p=>p.id===active)?.aspect||"16 / 9",maxWidth:active==="card"?"300px":"540px"}}
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={pointerUp} aria-label={`Drag to position ${label} in ${active} preset`}>
          <CropImage src={value} crop={current} alt={`${label} ${active} framing preview`} draggable={false}/>
          <span className="crop-drag-hint" aria-hidden="true">✥ DRAG TO REFRAME</span>
        </div>
        <div className="crop-template-picker"><strong>Quick framing templates</strong><p className="muted">Apply to the selected preset only. Fine-tune by dragging or using the sliders.</p><div className="crop-template-buttons">{cropTemplates.map(t=><button type="button" key={t.id} title={t.note} onClick={()=>savePreset(active,t.value)}>{t.title}</button>)}</div></div>
        <div className="crop-sliders">
          <label>Horizontal focus <output>{Math.round(current.x)}%</output><input type="range" min="0" max="100" step="1" value={current.x} onChange={e=>update("x",e.target.value)} /></label>
          <label>Vertical focus <output>{Math.round(current.y)}%</output><input type="range" min="0" max="100" step="1" value={current.y} onChange={e=>update("y",e.target.value)} /></label>
          <label>Zoom <output>{current.zoom.toFixed(2)}×</output><input type="range" min="1" max="3" step="0.05" value={current.zoom} onChange={e=>update("zoom",e.target.value)} /></label>
        </div>
      </div>
      <div className="framing-live-previews" aria-label="Live preview of all framing presets">
        {framingPresets.map(p => <button type="button" key={p.id} className={`framing-live-option ${active===p.id?"active":""}`} onClick={()=>setActive(p.id)} aria-pressed={active===p.id}>
          <span className="framing-live-image" style={{aspectRatio:p.aspect}}><CropImage src={value} crop={presetValue(p.id)} alt="" draggable={false}/></span>
          <span className="framing-live-caption">{p.name} <small>{p.aspect.replaceAll(" ", "")}</small></span>
        </button>)}
      </div>
    </div>
    <p className="muted">Each preset saves independently. Changes automatically update collection cards, banners, and skin previews. The original artwork is unchanged and all presets are included in JSON exports.</p>
  </section>;
}

function ImageInput({value,onChange,label,crop,presets,onPresetsChange,defaultPreset="card"}) {
  const [error,setError] = useState("");
  async function upload(e) {
    const file=e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {setError("Select an image file.");return;}
    if (file.size > 650000) {setError("Images above 650 KB can exceed browser storage. Compress this image or use a file path instead.");return;}
    const reader = new FileReader();
    reader.onload = () => {setError("");onChange(String(reader.result));};
    reader.onerror = () => setError("Image could not be read.");
    reader.readAsDataURL(file);
    e.target.value="";
  }
  return <div className="field"><span>{label}</span><input aria-label={label} value={value||""} onChange={e=>onChange(e.target.value)} placeholder="skins/example.png or https://..."/>
    <span className="upload-label">Or upload a small image <input type="file" accept="image/*" onChange={upload}/></span>
    {error&&<small className="error">{error}</small>}
    {value&&(onPresetsChange?<CropControls key={label} value={value} crop={crop} presets={presets} onPresetsChange={onPresetsChange} defaultPreset={defaultPreset} label={label}/>:<img className="image-preview" src={image(value)} alt="Image preview"/>)}
  </div>;
}

export default function CollectionManager({db,onSave,onClose,onExport,onImport,onReset,saveError}) {
  const [wizardOpen,setWizardOpen]=useState(false);
  const [characterTab,setCharacterTab]=useState("overview");
  const [editingTimeline,setEditingTimeline]=useState("main-chronology");
  const [type,setType]=useState("characters");
  const [selectedId,setSelectedId]=useState(db.characters[0]?.id||null);
  const [query,setQuery]=useState("");
  const [collapsedSkinGroups,setCollapsedSkinGroups]=useState([]);
  const fileRef=useRef(null);
  const items=(type==="library"||type==="homepage"||type==="globaltheme") ? [] : (db[type]||[]);
  const item=byId(items,selectedId);
  const visible=items.filter(x=>x.name.toLowerCase().includes(query.toLowerCase()));
  const [dragIndex,setDragIndex]=useState(null);
  const [libraryQuery,setLibraryQuery]=useState("");
  const [libraryCategory,setLibraryCategory]=useState("All");
  const [librarySkin,setLibrarySkin]=useState("All");
  const artworkLibrary=db.skins.flatMap(skin=>(skin.artworks||[]).filter(art=>art.file).map(art=>({...art,skinId:skin.id,skinName:skin.name})));
  const filteredLibrary=artworkLibrary.filter(art=>(libraryCategory==="All"||art.category===libraryCategory)&&(librarySkin==="All"||art.skinId===librarySkin)&&`${art.title} ${art.skinName} ${art.description||""}`.toLowerCase().includes(libraryQuery.toLowerCase()));

  function patch(value) {
    onSave({...db,[type]:items.map(x=>x.id===selectedId?value:x)});
  }
  function setField(key,value) {patch({...item,[key]:value});}
  function selectType(next) {setCharacterTab("overview");setType(next);setSelectedId((next==="library"||next==="homepage"||next==="globaltheme")?null:db[next]?.[0]?.id||null);setQuery("");}
  function add() {
    if(type==="timeline")return;
    if(type==="stories"){const value={id:uid(),name:"Untitled Story",category:"Backstory",summary:"",body:"",chapters:[{id:`chapter-${uid()}`,title:"Chapter 1",body:""}],series:"",seriesOrder:1,cover:"",universeId:"",characterIds:[],skinIds:[],status:"Draft",updatedAt:new Date().toISOString()};onSave({...db,stories:[...(db.stories||[]),value]});setSelectedId(value.id);return;}
    if(type==="skins"&&(!db.characters.length||!db.universes.length)){alert("Create a character and universe first.");return;}
    const value=newEntry(type,db);
    onSave({...db,[type]:[...items,value]});setSelectedId(value.id);setCharacterTab("overview");
  }
  function remove() {
    if(!item||!window.confirm(`Permanently delete ${item.name}?`))return;
    const next=items.filter(x=>x.id!==item.id);
    const newDb={...db,[type]:next};
    if(type==="characters") {
      newDb.stories=(db.stories||[]).map(story=>({...story,characterIds:(story.characterIds||[]).filter(id=>id!==item.id)}));
      newDb.skins=db.skins.filter(x=>x.characterId!==item.id);
      newDb.characters=next.map(c=>({...c,relationships:(c.relationships||[]).filter(r=>r.characterId!==item.id)}));
    }
    if(type==="skins")newDb.stories=(db.stories||[]).map(story=>({...story,skinIds:(story.skinIds||[]).filter(id=>id!==item.id)}));
    if(type==="universes")newDb.stories=(db.stories||[]).map(story=>story.universeId===item.id?{...story,universeId:""}:story);
    if(type==="universes") newDb.skins=db.skins.map(s=>s.universeId===item.id?{...s,universeId:""}:s);
    onSave(newDb);setSelectedId(next[0]?.id||null);
  }
  function updateCollection(key,next) {setField(key,next);}
  function updateRelation(targetId,checked) {
    const chars=db.characters.map(c=> {
      if(c.id===item.id) return {...c,relationships: checked?[...(c.relationships||[]).filter(r=>r.characterId!==targetId),{characterId:targetId,type:"Connected"}]:(c.relationships||[]).filter(r=>r.characterId!==targetId)};
      if(c.id===targetId) return {...c,relationships:checked?[...(c.relationships||[]).filter(r=>r.characterId!==item.id),{characterId:item.id,type:"Connected"}]:(c.relationships||[]).filter(r=>r.characterId!==item.id)};
      return c;
    });
    onSave({...db,characters:chars});
  }
  function updateRelationType(targetId,value) {
    const chars=db.characters.map(c=>c.id===item.id?{...c,relationships:(c.relationships||[]).map(r=>r.characterId===targetId?{...r,type:value}:r)}:c);
    onSave({...db,characters:chars});
  }
  function updateArtwork(i,key,value) {updateCollection("artworks",(item.artworks||[]).map((a,j)=>i===j?{...a,[key]:value}:a));}
  function removeArtwork(i) {updateCollection("artworks",(item.artworks||[]).filter((_,j)=>j!==i));}
  function moveArtwork(from,to) {
    const entries=[...(item.artworks||[])];
    if(from<0||to<0||from>=entries.length||to>=entries.length||from===to)return;
    const [moving]=entries.splice(from,1);entries.splice(to,0,moving);
    updateCollection("artworks",entries);
  }
  function copyArtworkToSkin(art,targetId) {
    const next=db.skins.map(s=>s.id===targetId?{...s,artworks:[...(s.artworks||[]),{id:uid(),title:art.title,category:art.category,file:art.file,description:art.description||"",crop:art.crop}]}:s);
    onSave({...db,skins:next});
  }
  function setSkinCover(skinId,file,crop) {
    onSave({...db,skins:db.skins.map(s=>s.id===skinId?{...s,artwork:file,artworkCrop:crop||{...normalCrop}}:s)});
  }
  const optionsFor=(field)=>field==="region"?["North","Central","South"]:field==="tier"?tiers:null;

  return <main className="shell manager-page">
    <header className="topbar"><span className="brand">DHÆG-MOND <small>COLLECTION MANAGER</small></span><button className="outline-button" onClick={onClose}>← Back to Collection</button></header>
    {wizardOpen&&<CreationWizard db={db} onClose={()=>setWizardOpen(false)} onCreate={(nextDb,kind,id)=>{onSave(nextDb);setType(kind);setSelectedId(id);setCharacterTab("overview");setWizardOpen(false);}}/>}
    <div className="manager-heading"><div><p className="eyebrow">LOCAL EDITOR</p><h1>Manage Collection</h1><p>Changes save in this browser. Export regular backups to keep your collection safe.</p></div><div className="manager-actions"><button className="primary-button" onClick={()=>setWizardOpen(true)}>✦ Creation Wizard</button><button onClick={onExport}>Export JSON</button><button onClick={()=>fileRef.current?.click()}>Import JSON</button><input ref={fileRef} hidden type="file" accept=".json,application/json" onChange={async e=>{const f=e.target.files?.[0];if(f)await onImport(f);e.target.value="";}}/><button onClick={onReset}>Reset Data</button></div></div>
    {saveError&&<p className="error-banner">{saveError}</p>}
    <div className="manager-layout"><aside className="manager-sidebar"><div className="manager-types">{Object.keys(labels).map(x=><button key={x} className={type===x?"active":""} onClick={()=>selectType(x)}>{labels[x]} <span>{x==="library"?artworkLibrary.length:(x==="homepage"||x==="globaltheme"||x==="timeline")?"✧":(x==="codex"?(db.codexEntries||[]):(db[x]||[])).length}</span></button>)}</div>{type!=="library"&&type!=="homepage"&&type!=="globaltheme"&&type!=="timeline"&&type!=="factions"&&type!=="atlas"&&type!=="codex"&&<><input className="field-input" placeholder={`Find ${type}...`} value={query} onChange={e=>setQuery(e.target.value)}/><button className="primary-button wide" onClick={add}>+ Add {type==="stories"?"story":type.slice(0,-1)}</button><div className="manager-list">{type==="skins" ? <div className="skin-group-list">{[...db.characters.map(c=>({id:c.id,name:c.name,skins:visible.filter(s=>s.characterId===c.id)})),{id:"__unassigned",name:"Unassigned Character",skins:visible.filter(s=>!db.characters.some(c=>c.id===s.characterId))}].filter(g=>g.skins.length>0).map(group=>{const closed=collapsedSkinGroups.includes(group.id);return <div className="skin-group" key={group.id}><button className="skin-group-heading" aria-expanded={!closed} onClick={()=>setCollapsedSkinGroups(old=>old.includes(group.id)?old.filter(id=>id!==group.id):[...old,group.id])}><span>{closed?"▸":"▾"} {group.name}</span><span>{group.skins.length}</span></button>{!closed&&<div className="skin-group-items">{[...group.skins].sort((a,b)=>a.name.localeCompare(b.name)).map(x=><button key={x.id} className={x.id===selectedId?"active":""} onClick={()=>{setSelectedId(x.id);setCharacterTab("overview");}}>{x.name||"Untitled"}</button>)}</div>}</div>})}</div> : visible.map(x=><button key={x.id} className={x.id===selectedId?"active":""} onClick={()=>{setSelectedId(x.id);setCharacterTab("overview");}}>{x.name||"Untitled"}</button>)}</div></>} {type==="globaltheme"&&<p className="muted">Set a global palette, typography, navigation, and atmosphere.</p>} {type==="homepage"&&<p className="muted">Build your collection’s opening screen, featured hero, and universe shortcuts.</p>} {type==="library"&&<p className="muted">Browse every uploaded or linked artwork. Reuse pieces across skins without copying image data.</p>}</aside>
    <section className="manager-editor">{type==="codex" ? <CodexEditor db={db} onSave={onSave}/> : type==="atlas" ? <AtlasEditor db={db} onSave={onSave}/> : type==="factions" ? <FactionEditor db={db} onSave={onSave}/> : type==="timeline" ? <section className="timeline-settings"><p className="eyebrow">CHRONOLOGY MANAGER</p><h2>Independent Story Timelines</h2><p className="muted">Each timeline has independent acts, lanes, and colors. Chapters may appear on multiple timelines. Older chapter placements remain on Main Chronology.</p>
   <div className="chapter-actions"><button className="primary-button" onClick={()=>{const t={id:uid(),name:"New Timeline",description:"",universeId:"",acts:["Act I","Act II","Act III"],laneColors:{}};onSave({...db,timelines:[...timelinesFor(db),t]});setEditingTimeline(t.id);}}>+ New timeline</button>
   <button onClick={()=>{const t=timelinesFor(db).find(t=>t.id===editingTimeline)||timelinesFor(db)[0];const copy={...structuredClone(t),id:uid(),name:t.name+" (Copy)"};onSave({...db,timelines:[...timelinesFor(db),copy]});setEditingTimeline(copy.id);}}>Duplicate timeline</button></div>
   <label className="field"><span>Choose timeline</span><select value={timelinesFor(db).some(t=>t.id===editingTimeline)?editingTimeline:timelinesFor(db)[0].id} onChange={e=>setEditingTimeline(e.target.value)}>{timelinesFor(db).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
   {(()=>{const all=timelinesFor(db),current=all.find(t=>t.id===editingTimeline)||all[0];const patch=(change)=>onSave({...db,timelines:all.map(t=>t.id===current.id?{...t,...change}:t)});return <div className="timeline-settings-fields">
     <label className="field"><span>Timeline name</span><input value={current.name} onChange={e=>patch({name:e.target.value})}/></label>
     <label className="field"><span>Description</span><textarea rows={3} value={current.description||""} onChange={e=>patch({description:e.target.value})}/></label>
     <label className="field"><span>Universe (optional)</span><select value={current.universeId||""} onChange={e=>patch({universeId:e.target.value})}><option value="">All / mixed universes</option>{db.universes.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
     <h3>Acts / sections</h3>{(current.acts||[]).map((act,i)=><label className="field" key={i}><span>Section {i+1}</span><input value={act} onChange={e=>patch({acts:current.acts.map((a,j)=>i===j?e.target.value:a)})}/></label>)}
     <div className="chapter-actions"><button onClick={()=>patch({acts:[...current.acts,`Act ${current.acts.length+1}`]})}>+ Add section</button><button className="danger-button" disabled={current.acts.length<=1} onClick={()=>{if(window.confirm("Remove final section? Existing chapter positions may be clipped."))patch({acts:current.acts.slice(0,-1)});}}>Remove final section</button></div>
     <button className="danger-button" disabled={all.length<=1||current.id==="main-chronology"} onClick={()=>{if(!window.confirm(`Delete timeline '${current.name}'? Chapter placements on that timeline will no longer display. Back up first.`))return;onSave({...db,timelines:all.filter(t=>t.id!==current.id)});setEditingTimeline(all.find(t=>t.id!==current.id)?.id);}}>Delete timeline</button>
   </div>})()}</section> : type==="globaltheme" ? <GlobalThemeEditor value={db.globalTheme} onChange={globalTheme=>onSave({...db,globalTheme})}/> : type==="homepage" ? <HomeEditor db={db} onSave={onSave}/> : type==="library" ? <div className="art-library"><div className="editor-title"><div><p className="eyebrow">VISUAL ARCHIVE</p><h2>Artwork Library</h2><p className="muted">{artworkLibrary.length} artworks across {db.skins.length} skins. Select a skin in the editor to change its order.</p></div></div><div className="library-filters"><input aria-label="Search artworks" placeholder="Search artwork or skin..." value={libraryQuery} onChange={e=>setLibraryQuery(e.target.value)}/><select aria-label="Artwork category" value={libraryCategory} onChange={e=>setLibraryCategory(e.target.value)}><option>All</option>{artworkCategories.map(c=><option key={c}>{c}</option>)}</select><select aria-label="Skin" value={librarySkin} onChange={e=>setLibrarySkin(e.target.value)}><option value="All">All Skins</option>{db.skins.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div className="library-grid">{filteredLibrary.map((art,index)=><div className="library-tile" key={`${art.skinId}-${art.id}-${index}`}><div className="library-image"><img src={image(art.file)} alt={art.title} loading="lazy"/></div><div className="library-tile-info"><strong>{art.title}</strong><small>{art.skinName} · {art.category}</small><div className="library-tile-actions"><button onClick={()=>setSkinCover(art.skinId,art.file,art.crop)}>Set cover</button><select aria-label={`Copy ${art.title} to skin`} value="" onChange={e=>{if(e.target.value)copyArtworkToSkin(art,e.target.value);}}><option value="">Copy to skin…</option>{db.skins.filter(s=>s.id!==art.skinId).map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></div></div></div>)}</div>{!filteredLibrary.length&&<p className="empty-state">No artwork matches your filters. Add image entries under Skins → Artwork Archive.</p>}</div> : type==="stories" ? <StoryEditor key={item?.id||"none"} story={item} db={db} onChange={next=>patch({...next,updatedAt:new Date().toISOString()})} onDelete={remove}/> : !item?<div className="empty-state">Choose an entry or create one to begin.</div>:<><div className="editor-title"><div><p className="eyebrow">EDIT {(type==="stories"?"STORY":type.slice(0,-1).toUpperCase())}</p><h2>{item.name}</h2><small>ID: {item.id}</small></div><button className="danger-button" onClick={remove}>Delete</button></div>
    {type==="characters"&&<nav className="character-editor-tabs" aria-label="Character editor sections">
      {characterTabs.map(t=><button type="button" key={t.id} className={characterTab===t.id?"active":""} aria-current={characterTab===t.id?"page":undefined} onClick={()=>setCharacterTab(t.id)}>{t.label}</button>)}
    </nav>}
    <div className="editor-fields">{fields[type].filter(field=>type!=="characters"||characterFieldTab[field]===characterTab).map(field=>{
      const label=field.replace(/([A-Z])/g," $1").replace(/^./,m=>m.toUpperCase());
      if(imageFields.has(field))return <ImageInput key={field} label={label} value={item[field]} onChange={value=>setField(field,value)} crop={item[`${field}Crop`]} presets={item[`${field}CropPresets`]} onPresetsChange={value=>setField(`${field}CropPresets`,value)} defaultPreset={field==="splash"?"banner":"card"}/>;
      const options=optionsFor(field);
      if(field==="characterId")return <label className="field" key={field}><span>Character</span><select value={item.characterId} onChange={e=>setField(field,e.target.value)}>{db.characters.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>;
      if(field==="universeId")return <label className="field" key={field}><span>Universe</span><select value={item.universeId} onChange={e=>setField(field,e.target.value)}><option value="">None</option>{db.universes.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label>;
      if(options)return <label className="field" key={field}><span>{label}</span><select value={item[field]||options[0]} onChange={e=>setField(field,e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>;
      return <label className="field" key={field}><span>{label}</span>{multiline.has(field)?<textarea rows="3" value={item[field]||""} onChange={e=>setField(field,e.target.value)}/>:<input value={item[field]||""} onChange={e=>setField(field,e.target.value)}/>}</label>;
    })}</div>
    {type==="skins"&&<HomeCropEditor key={`featured-${item.id}`} src={item.artwork} presets={item.featuredBannerCropPresets||{}} onChange={featuredBannerCropPresets=>setField("featuredBannerCropPresets",featuredBannerCropPresets)} title="Featured Collection Banner Framing" description="Independently frame this skin when it appears in the featured carousel. Desktop and mobile have separate positioning and zoom." context="featured collection banner"/>}
    {(type==="skins"||(type==="characters"&&characterTab==="appearance"))&&<ThemeEditor value={item.visualTheme} onChange={theme=>setField("visualTheme",theme)} label={type==="characters"?"Character":"Skin"}/>}
    {(type==="skins"||(type==="characters"&&characterTab==="appearance"))&&<IdentityEditor value={item.presentation} onChange={v=>setField("presentation",v)} label={type==="characters"?"Character":"Skin"}/>}
    {type==="characters"&&characterTab==="combat"&&<BattleEditor character={item} onChange={patch}/>} 
    {type==="characters"&&characterTab==="personal"&&<PersonalEditor personal={item.personal} onChange={personal=>setField("personal",personal)}/>}
    {type==="characters"&&characterTab==="abilities"&&<div className="editor-extra"><h3>Abilities</h3>{(item.abilities||[]).map((a,i)=><div className="edit-row" key={a.id||i}><input aria-label="Ability name" placeholder="Ability" value={a.name} onChange={e=>updateCollection("abilities",item.abilities.map((v,j)=>i===j?{...v,name:e.target.value}:v))}/><input aria-label="Ability description" placeholder="Description" value={a.description} onChange={e=>updateCollection("abilities",item.abilities.map((v,j)=>i===j?{...v,description:e.target.value}:v))}/><button onClick={()=>updateCollection("abilities",item.abilities.filter((_,j)=>j!==i))}>Remove</button></div>)}<button className="outline-button" onClick={()=>updateCollection("abilities",[...(item.abilities||[]),{id:uid(),name:"",description:""}])}>+ Add ability</button>
    </div>}
    {type==="characters"&&characterTab==="lore"&&<div className="editor-extra"><h3>Story Timeline</h3>{(item.timeline||[]).map((v,i)=><div className="edit-row" key={i}><input aria-label={`Timeline event ${i+1}`} value={v} onChange={e=>updateCollection("timeline",item.timeline.map((x,j)=>j===i?e.target.value:x))}/><button onClick={()=>updateCollection("timeline",item.timeline.filter((_,j)=>i!==j))}>Remove</button></div>)}<button className="outline-button" onClick={()=>updateCollection("timeline",[...(item.timeline||[]),""])}>+ Add event</button>
    </div>}
    {type==="characters"&&characterTab==="relationships"&&<div className="editor-extra"><h3>Relationships</h3><p className="muted">Checking a connection adds the reverse connection too. Each side can have its own relationship label.</p><div className="relation-editor">{db.characters.filter(c=>c.id!==item.id).map(c=>{const rel=(item.relationships||[]).find(r=>r.characterId===c.id);return <div className="relation-edit" key={c.id}><label><input type="checkbox" checked={!!rel} onChange={e=>updateRelation(c.id,e.target.checked)}/> {c.name}</label>{rel&&<input aria-label={`Relationship to ${c.name}`} value={rel.type} onChange={e=>updateRelationType(c.id,e.target.value)}/>}</div>})}</div></div>}
    {type==="skins"&&<div className="editor-extra"><h3>Artwork Archive</h3><p className="muted">Drag artwork entries to change their gallery order, or use ↑ ↓ buttons. You can also browse and reuse art in Artwork Library. For large files, enter a public/images path.</p>{(item.artworks||[]).map((art,i)=><div className={`artwork-edit artwork-reorder ${dragIndex===i?"dragging":""}`} key={art.id} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragIndex!==null)moveArtwork(dragIndex,i);setDragIndex(null);}}><div className="artwork-order"><span draggable onDragStart={e=>{e.dataTransfer.effectAllowed="move";setDragIndex(i);}} onDragEnd={()=>setDragIndex(null)} className="drag-handle" title="Drag to reorder">⠿ Drag</span><span>Artwork {i+1}</span><button aria-label={`Move ${art.title} up`} disabled={i===0} onClick={()=>moveArtwork(i,i-1)}>↑</button><button aria-label={`Move ${art.title} down`} disabled={i===(item.artworks||[]).length-1} onClick={()=>moveArtwork(i,i+1)}>↓</button>{art.file&&<button onClick={()=>patch({...item,artwork:art.file,artworkCrop:art.crop||{...normalCrop},artworkCropPresets:art.cropPresets||{}})}>Use as cover</button>}</div><div className="edit-row"><input aria-label="Artwork title" placeholder="Artwork title" value={art.title} onChange={e=>updateArtwork(i,"title",e.target.value)}/><select aria-label="Artwork category" value={art.category} onChange={e=>updateArtwork(i,"category",e.target.value)}>{artworkCategories.map(c=><option key={c}>{c}</option>)}</select><button onClick={()=>removeArtwork(i)}>Remove</button></div><ImageInput label="Artwork file" value={art.file} onChange={value=>updateArtwork(i,"file",value)} crop={art.crop} presets={art.cropPresets} onPresetsChange={value=>updateArtwork(i,"cropPresets",value)} defaultPreset="preview"/><label className="field"><span>Caption</span><textarea value={art.description||""} onChange={e=>updateArtwork(i,"description",e.target.value)}/></label></div>)}<button className="outline-button" onClick={()=>updateCollection("artworks",[...(item.artworks||[]),{id:uid(),title:"New Artwork",category:"Reference Sheet",file:"",description:""}])}>+ Add artwork</button></div>}
    <p className="editor-footnote">Autosaved to this browser • Export JSON before clearing browser data or moving devices.</p></>}</section></div>
  </main>;
}
