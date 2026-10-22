import React from "react";

export const STAT_NAMES = ["Power", "Defense", "Range", "Speed", "Technique", "Versatility"];
const rating = (value) => Math.max(0, Math.min(5, Number(value) || 0));
export const COMBAT_CLASSES = [
 {id:"Bruiser",description:"A durable close-range fighter who balances offense with resilience."},
 {id:"Vanguard",description:"A front-line protector who intercepts threats and holds ground."},
 {id:"Duelist",description:"A specialist in focused one-on-one engagements and precision."},
 {id:"Artillery",description:"A distant attacker with strong reach and zone pressure."},
 {id:"Support",description:"A team enabler using protection, recovery, or enhancement."},
 {id:"Controller",description:"A battlefield shaper who restricts movement or disrupts enemies."},
 {id:"Assassin",description:"A mobile specialist who isolates and eliminates priority targets."},
 {id:"Skirmisher",description:"An adaptable fighter who excels at mobile, repeated engagements."},
 {id:"Tank",description:"An endurance specialist who absorbs pressure and protects allies."},
 {id:"Specialist",description:"A unique combatant whose abilities defy standard roles."}
];
const TYPES = ["Signature", "Special", "Ultimate", "Finisher", "Other"];
const safeList = value => Array.isArray(value) ? value : [];
const splitList = value => value.split("\n").map(s=>s.trim()).filter(Boolean);

export function BattleProfile({character}) {
 const combat = character.combat || {};
 const moves = safeList(combat.moves);
 const primaryClass = COMBAT_CLASSES.find(c=>c.id===combat.primaryClass);
 const secondaryClass = COMBAT_CLASSES.find(c=>c.id===combat.secondaryClass && c.id!==combat.primaryClass);
 const details = [
  ["Combat Role",combat.role],["Fighting Style",combat.style],
  ["Weapons / Equipment",combat.equipment],["Strengths",combat.strengths],
  ["Weaknesses",combat.weaknesses],["Limitations",combat.limitations],
  ["Battle Notes",combat.notes]
 ].filter(([,value])=>value);
 return <div className="battle-profile">
  <p className="eyebrow">CELESTIAL FLOW</p><h2>{character.power||"Abilities"}</h2>
  <h3>Combat Classification</h3>
  {(primaryClass||secondaryClass)?<div className="combat-class-row">
   {[primaryClass,secondaryClass].filter(Boolean).map((entry,i)=><article className="combat-class-card" key={entry.id}><small>{i===0?"PRIMARY ROLE":"SECONDARY ROLE"}</small><h4>{entry.id}</h4><p>{entry.description}</p></article>)}
  </div>:<p className="muted">No combat classification assigned yet.</p>}
  {combat.classNotes&&<p className="combat-class-notes">{combat.classNotes}</p>}
  <h3>Combat Ratings</h3><p className="muted">Each rating is out of five stars. Unrated stats show a dash.</p>
  <div className="battle-stats">{STAT_NAMES.map(name=>{const n=rating(combat.stats?.[name]);return <div className="battle-stat" key={name}><strong>{name}</strong><span className="battle-stars" aria-label={`${name}: ${n ? n+" out of 5" : "not rated"}`}>{n?"★".repeat(n)+"☆".repeat(5-n):"Not rated"}</span></div>})}</div>
  <h3>Celestial Abilities</h3><div className="ability-grid">{safeList(character.abilities).map((a,i)=><div className="ability" key={a.id||i}><span>✦</span><div><h3>{a.name}</h3><p>{a.description}</p></div></div>)}</div>{!character.abilities?.length&&<p className="muted">No abilities entered yet.</p>}
  <h3>Signature & Special Moves</h3>{moves.length?<div className="move-grid">{moves.map((m,i)=><article className="battle-move" key={m.id||i}><small>{m.type||"Signature"}</small><h4>{m.name||"Unnamed Move"}</h4><p>{m.description||"No description yet."}</p>{m.effect&&<p><strong>Effect:</strong> {m.effect}</p>}{m.cost&&<p><strong>Cost / Drawback:</strong> {m.cost}</p>}</article>)}</div>:<p className="muted">No moves entered yet.</p>}
  {details.length>0&&<><h3>Combat Dossier</h3><div className="combat-facts">{details.map(([label,value])=><div key={label}><small>{label}</small><p>{value}</p></div>)}</div></>}
 </div>;
}

const PERSONAL_FIELDS = [
 ["birthday","Birthday"],["age","Age"],["nationality","Nationality"],["ethnicity","Ethnicity"],
 ["species","Species"],["mbti","Personality Type (MBTI)"],["height","Height"],
 ["pronouns","Pronouns"],["occupation","Occupation"],["residence","Residence"]
];
export function PersonalProfile({character}) {
 const p=character.personal||{};
 const fields=PERSONAL_FIELDS.filter(([key])=>String(p[key]||"").trim());
 const extras=[["Likes",safeList(p.likes)],["Dislikes",safeList(p.dislikes)],["Hobbies",safeList(p.hobbies)]].filter(([,v])=>v.length);
 return <div className="personal-profile"><p className="eyebrow">CHARACTER DOSSIER</p><h2>{character.name}: Personal</h2>
 {fields.length?<div className="personal-facts">{fields.map(([key,label])=><div key={key}><small>{label}</small><strong>{p[key]}</strong></div>)}</div>:<p className="muted">Personal information hasn't been filled in yet.</p>}
 {extras.map(([title,values])=><section key={title}><h3>{title}</h3><div className="personal-tags">{values.map((v,i)=><span key={`${v}-${i}`}>{v}</span>)}</div></section>)}
 {p.traits&&<section><h3>Personality Traits</h3><p>{p.traits}</p></section>}
 {p.trivia&&<section><h3>Other Notes / Trivia</h3><p>{p.trivia}</p></section>}
 </div>;
}

export function BattleEditor({character,onChange}) {
 const combat=character.combat||{};
 const update=(key,value)=>onChange({...character,combat:{...combat,[key]:value}});
 const updateMove=(index,field,value)=>update("moves",safeList(combat.moves).map((m,i)=>i===index?{...m,[field]:value}:m));
 return <section className="editor-extra structured-editor"><h3>Battle Profile</h3><p className="muted">Rate each attribute from 1 to 5 stars. Choose “Unrated” when you haven't decided.</p>
 <div className="stat-editor-grid">{STAT_NAMES.map(name=><label className="field" key={name}><span>{name}</span><select value={rating(combat.stats?.[name])} onChange={e=>update("stats",{...combat.stats,[name]:Number(e.target.value)})}><option value="0">Unrated</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}</select></label>)}</div>
 <h3>Combat Classification</h3>
 <div className="class-editor-grid">
  {["primaryClass","secondaryClass"].map((key,i)=><label className="field" key={key}><span>{i===0?"Primary class":"Secondary class (optional)"}</span><select value={combat[key]||""} onChange={e=>update(key,e.target.value)}><option value="">Unassigned</option>{COMBAT_CLASSES.filter(c=>key==="primaryClass"||c.id!==combat.primaryClass).map(c=><option key={c.id} value={c.id}>{c.id}</option>)}</select></label>)}
 </div>
 <div className="combat-class-reference">{COMBAT_CLASSES.map(c=><div key={c.id}><strong>{c.id}</strong><p>{c.description}</p></div>)}</div>
 <label className="field"><span>Classification notes / hybrid fighting style</span><textarea rows="2" value={combat.classNotes||""} onChange={e=>update("classNotes",e.target.value)} placeholder="How do their combat roles overlap?"/></label>
 <h3>Signature & Special Moves</h3>{safeList(combat.moves).map((m,i)=><div className="move-editor" key={m.id||i}><div className="edit-row"><input aria-label="Move name" placeholder="Move name" value={m.name||""} onChange={e=>updateMove(i,"name",e.target.value)}/><select aria-label="Move type" value={m.type||"Signature"} onChange={e=>updateMove(i,"type",e.target.value)}>{TYPES.map(t=><option key={t}>{t}</option>)}</select><button onClick={()=>update("moves",safeList(combat.moves).filter((_,j)=>j!==i))}>Remove</button></div>{[["description","Description"],["effect","Effects / conditions"],["cost","Cost, cooldown, or drawback"]].map(([key,label])=><label className="field" key={key}><span>{label}</span><textarea rows="2" value={m[key]||""} onChange={e=>updateMove(i,key,e.target.value)}/></label>)}</div>)}<button className="outline-button" onClick={()=>update("moves",[...safeList(combat.moves),{id:crypto.randomUUID?.()||String(Date.now()),type:"Signature",name:"",description:"",effect:"",cost:""}])}>+ Add move</button>
 <h3>Additional Combat Information</h3><div className="combat-editor-grid">{[["role","Combat role"],["style","Fighting style"],["equipment","Weapons / equipment"],["strengths","Strengths"],["weaknesses","Weaknesses"],["limitations","Limitations"],["notes","Other battle notes"]].map(([key,label])=><label className="field" key={key}><span>{label}</span><textarea rows="2" value={combat[key]||""} onChange={e=>update(key,e.target.value)}/></label>)}</div>
 </section>;
}
export function PersonalEditor({personal,onChange}) {
 const p=personal||{};
 const update=(key,value)=>onChange({...p,[key]:value});
 return <section className="editor-extra structured-editor"><h3>Personal Information</h3><p className="muted">Shown only on the original character's Personal tab. Leave unknown fields blank.</p><div className="personal-editor-grid">{PERSONAL_FIELDS.map(([key,label])=><label className="field" key={key}><span>{label}</span><input value={p[key]||""} onChange={e=>update(key,e.target.value)} placeholder={label}/></label>)}</div>
 {[["likes","Likes"],["dislikes","Dislikes"],["hobbies","Hobbies"]].map(([key,label])=><label className="field" key={key}><span>{label} (one per line)</span><textarea rows="3" value={safeList(p[key]).join("\n")} onChange={e=>update(key,splitList(e.target.value))}/></label>)}
 {[["traits","Personality traits"],["trivia","Other notes / trivia"]].map(([key,label])=><label className="field" key={key}><span>{label}</span><textarea rows="3" value={p[key]||""} onChange={e=>update(key,e.target.value)}/></label>)}
 </section>;
}
