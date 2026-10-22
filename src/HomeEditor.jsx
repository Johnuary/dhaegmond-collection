import { useState } from "react";
import { image, byId } from "./data";
import CropImage from "./CropImage";
import HomeCropEditor from "./HomeCropEditor";
const defaults={title:"DHÆG-MOND",subtitle:"Enter the Celestial Archive",description:"Discover characters, alternate universes, and the stories behind their appearances.",featuredType:"character",featuredId:"marble",background:"",accent:"#c7a76a",showFeatured:true,universeIds:["celestial-circuit","afterlight","prism-promise"]};
export default function HomeEditor({db,onSave}){
 const h={...defaults,...db.homepage};
 const choices=h.featuredType==="skin"?db.skins:db.characters;
 const [preview,setPreview]=useState(true);
 function change(key,value){onSave({...db,homepage:{...h,[key]:value}});}
 const character=h.featuredType==="character"?byId(db.characters,h.featuredId):null;
 const skin=h.featuredType==="skin"?byId(db.skins,h.featuredId):null;
 const src=h.background||skin?.artwork||character?.splash||"";
 return <div className="home-editor"><div className="editor-title"><div><p className="eyebrow">WELCOME EXPERIENCE</p><h2>Homepage Designer</h2><p className="muted">Customize your opening screen. Changes save locally with the rest of your collection.</p></div></div>
  <div className="editor-fields"><label className="field"><span>Hero title</span><input value={h.title} onChange={e=>change("title",e.target.value)}/></label><label className="field"><span>Subtitle</span><input value={h.subtitle} onChange={e=>change("subtitle",e.target.value)}/></label><label className="field"><span>Welcome description</span><textarea rows="3" value={h.description} onChange={e=>change("description",e.target.value)}/></label>
  <label className="field"><span>Featured entry type</span><select value={h.featuredType} onChange={e=>onSave({...db,homepage:{...h,featuredType:e.target.value,featuredId:(e.target.value==="skin"?db.skins:db.characters)[0]?.id||""}})}><option value="character">Character</option><option value="skin">Skin</option></select></label>
  <label className="field"><span>Featured {h.featuredType}</span><select value={h.featuredId} onChange={e=>change("featuredId",e.target.value)}><option value="">Select entry</option>{choices.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
  <label className="field"><span>Background image path (optional override)</span><input value={h.background} onChange={e=>change("background",e.target.value)} placeholder="skins/red-rider-marble.png or https://..."/></label>
  <label className="field"><span>Accent color</span><input type="color" value={/^#[0-9a-f]{6}$/i.test(h.accent)?h.accent:defaults.accent} onChange={e=>change("accent",e.target.value)}/></label>
  <label className="field"><span><input type="checkbox" checked={!!h.showFeatured} onChange={e=>change("showFeatured",e.target.checked)}/> Show featured profile button</span></label></div>
  <HomeCropEditor src={src} presets={h.backgroundCropPresets || {}} onChange={backgroundCropPresets=>change("backgroundCropPresets",backgroundCropPresets)}/>
  <section className="home-editor-universes"><h3>Homepage Universe Shortcuts</h3><p className="muted">Select which universes appear below the hero. They link to the Collection's universe browser.</p><div className="home-universe-options">{db.universes.map(u=><label key={u.id}><input type="checkbox" checked={(h.universeIds||[]).includes(u.id)} onChange={e=>change("universeIds",e.target.checked?[...(h.universeIds||[]),u.id]:(h.universeIds||[]).filter(id=>id!==u.id))}/> {u.name}</label>)}</div></section>
  <section className="home-editor-preview"><div className="gallery-heading"><h3>Live Welcome Preview</h3><button className="outline-button" onClick={()=>setPreview(v=>!v)}>{preview?"Hide":"Show"} Preview</button></div>{preview&&<div className="home-preview-canvas" style={{"--welcome-accent":h.accent}}><div className="home-preview-image">{src&&<CropImage src={src} crop={h.backgroundCropPresets?.desktop} alt=""/>}</div><div className="home-preview-copy"><small>THE CELESTIAL ARCHIVE</small><strong>{h.title}</strong><span>{h.subtitle}</span><p>{h.description}</p></div></div>}</section>
  <button className="outline-button" onClick={()=>onSave({...db,homepage:{...defaults}})}>Reset homepage to defaults</button>
 </div>;
}
