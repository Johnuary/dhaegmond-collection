import { useState } from "react";

export const presets = {
  celestial:{name:"Celestial Archive",background:"#071321",surface:"#10283a",accent:"#c8a96d",text:"#e9dfc9",font:"cinematic",navigation:"ornate",atmosphere:"starlight"},
  north:{name:"Northern Court",background:"#101923",surface:"#263041",accent:"#d8b983",text:"#f4e9d5",font:"cinematic",navigation:"ornate",atmosphere:"frost"},
  south:{name:"Southern Underground",background:"#101a1c",surface:"#1b3232",accent:"#72c1a3",text:"#e0ebe4",font:"modern",navigation:"compact",atmosphere:"embers"},
  prism:{name:"Prism Promise",background:"#131429",surface:"#232444",accent:"#c4a0ff",text:"#f7efff",font:"editorial",navigation:"minimal",atmosphere:"prism"}
};
export function normalizedTheme(value={}) {return {...presets.celestial,...value};}
export default function GlobalThemeEditor({value,onChange}){
 const theme=normalizedTheme(value);
 const [copyStatus,setCopyStatus]=useState("");
 const change=(key,val)=>onChange({...theme,[key]:val});
 const colors=[["background","Background"],["surface","Panels"],["accent","Accent"],["text","Text"]];
 return <section className="global-theme-editor">
  <div className="editor-title"><div><p className="eyebrow">PHASE 18 · THEME SYSTEM</p><h2>Global Theme Studio</h2><p className="muted">Choose a look for the entire client. Character and skin-specific accents can still override selected details.</p></div></div>
  <h3>Theme presets</h3><div className="global-preset-grid">{Object.entries(presets).map(([id,preset])=><button key={id} className="global-preset" style={{background:preset.background,borderColor:preset.accent,color:preset.text}} onClick={()=>onChange({...preset})}><span style={{background:preset.accent}} className="theme-swatch"/><strong>{preset.name}</strong><small>{preset.atmosphere} · {preset.font}</small></button>)}</div>
  <h3>Custom palette</h3><div className="global-color-grid">{colors.map(([key,label])=><label key={key}><span>{label}</span><input type="color" value={/^#[0-9a-f]{6}$/i.test(theme[key])?theme[key]:presets.celestial[key]} onChange={e=>change(key,e.target.value)}/><code>{theme[key]}</code></label>)}</div>
  <div className="global-options"><label>Headings<select value={theme.font} onChange={e=>change("font",e.target.value)}><option value="cinematic">Cinematic serif</option><option value="modern">Modern sans</option><option value="editorial">Editorial italic</option></select></label><label>Navigation<select value={theme.navigation} onChange={e=>change("navigation",e.target.value)}><option value="ornate">Ornate</option><option value="compact">Compact</option><option value="minimal">Minimal</option></select></label><label>Atmosphere<select value={theme.atmosphere} onChange={e=>change("atmosphere",e.target.value)}><option value="starlight">Starlight</option><option value="frost">Frost</option><option value="embers">Embers</option><option value="prism">Prism</option><option value="none">None</option></select></label></div>
  <h3>Live preview</h3><div className={`global-preview global-font-${theme.font} global-nav-${theme.navigation}`} style={{"--global-bg":theme.background,"--global-surface":theme.surface,"--global-accent":theme.accent,"--global-text":theme.text}}><div className="preview-nav">DHÆG-MOND <span>COLLECTION ✦ UNIVERSES</span></div><div className="preview-hero"><small>✦ THE CELESTIAL ARCHIVE</small><strong>MARBLE</strong><span>The Guardian of Strength</span><div className="preview-button">EXPLORE PROFILE →</div></div></div>
  <div className="theme-footer"><button className="outline-button" onClick={()=>onChange({...presets.celestial})}>Reset to default</button><button className="outline-button" onClick={async()=>{try{await navigator.clipboard.writeText(JSON.stringify(theme,null,2));setCopyStatus("Theme JSON copied");}catch{setCopyStatus("Copy unavailable; use Export JSON above");}}}>Copy theme JSON</button><span className="muted" role="status">{copyStatus}</span></div>
  <p className="muted">Changes are saved immediately in this browser and included in Export JSON. Back up your collection before resetting browser data.</p>
 </section>;
}
