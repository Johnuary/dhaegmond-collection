import {timelinesFor,chapterPlacement} from "./timelines";
import {useMemo,useRef,useState} from "react";

const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const phases=["Early","Middle","Late"];
const hueList=["#c88a79","#9e94dc","#7eaed7","#7cc5a2","#e3be7c","#d799c7"];
const point=(act,part=0)=>Number(act)*3+Number(part);
const unpack=(n)=>({act:Math.floor(n/3),part:n%3});

export default function StoryTimeline({db,onSave,onLibrary,onManage,onOpenStory,initialTimelineId}){
 const [universe,setUniverse]=useState("All"),[series,setSeries]=useState("All"),[lane,setLane]=useState("All"),[search,setSearch]=useState(""),[includeDrafts,setIncludeDrafts]=useState(false),[edit,setEdit]=useState(false);
 const timelineList=timelinesFor(db); const [timelineId,setTimelineId]=useState(timelineList.some(t=>t.id===initialTimelineId)?initialTimelineId:timelineList[0].id); const chosen=timelineList.find(t=>t.id===timelineId)||timelineList[0];
 const trackRefs=useRef({}); const gesture=useRef(null); const [live,setLive]=useState(null);
 const acts=chosen.acts?.length?chosen.acts:["Act I"];
 const slots=acts.length*3;
 const chapters=useMemo(()=>(db.stories||[]).flatMap(story=>(story.chapters?.length?story.chapters:[{id:"legacy",title:"Chapter 1",body:story.body||""}]).map((chapter,index)=>({story,chapter,index}))),[db.stories]);
 const knownLanes=[...new Set(chapters.map(x=>chapterPlacement(x.chapter,chosen.id)?.lane).filter(Boolean))].sort();
 const seriesOptions=[...new Set((db.stories||[]).map(s=>s.series).filter(Boolean))].sort();
 const items=chapters.filter(({story,chapter})=>{
  const laneName=chapterPlacement(chapter,chosen.id)?.lane?.trim(); if(!laneName)return false;
  if(!includeDrafts&&story.status!=="Published")return false;
  if(universe!=="All"&&story.universeId!==universe)return false;
  if(series!=="All"&&story.series!==series)return false;
  if(lane!=="All"&&laneName!==lane)return false;
  return `${story.name} ${chapter.title} ${laneName}`.toLowerCase().includes(search.toLowerCase());
 }).map(x=>{
  const t=chapterPlacement(x.chapter,chosen.id);const start=clamp(point(t.start||0,t.startPart||0),0,slots-1);
  const end=clamp(point(t.end??t.start??0,t.endPart??2),start,slots-1);
  return {...x,lane:t.lane.trim(),start,end,key:`${x.story.id}:${x.chapter.id}`};
 });
 const lanes=[...new Set(items.map(x=>x.lane))].sort();
 const colors=chosen.laneColors||{};
 const laneColor=(name)=>colors[name]||hueList[Math.max(0,knownLanes.indexOf(name))%hueList.length];
 const updateLaneColor=(name,color)=>onSave({...db,timelines:timelineList.map(t=>t.id===chosen.id?{...t,laneColors:{...colors,[name]:color}}:t)});
 const patchChapter=(item,changes)=>{
  const newStories=db.stories.map(s=>s.id!==item.story.id?s:{...s,chapters:(s.chapters||[]).map(c=>c.id!==item.chapter.id?c:{...c,timelinePlacements:{...c.timelinePlacements,[chosen.id]:{...(chapterPlacement(c,chosen.id)||{}),...changes}}}),updatedAt:new Date().toISOString()});
  onSave({...db,stories:newStories});
 };
 const getSlot=(ev,refName)=>{
  const rect=trackRefs.current[refName]?.getBoundingClientRect();
  return rect?clamp(Math.floor(((ev.clientX-rect.left)/rect.width)*slots),0,slots-1):0;
 };
 const pointerStart=(ev,item,action)=>{
  if(!edit)return; ev.preventDefault(); ev.stopPropagation();
  ev.currentTarget.setPointerCapture(ev.pointerId);
  gesture.current={key:item.key,action,anchor:getSlot(ev,item.lane),start:item.start,end:item.end};
  setLive({key:item.key,start:item.start,end:item.end});
 };
 const pointerMove=(ev,item)=>{
  const g=gesture.current;if(!g||g.key!==item.key)return;
  const step=getSlot(ev,item.lane)-g.anchor;let start=g.start,end=g.end;
  if(g.action==="move"){const width=end-start; start=clamp(start+step,0,slots-1-width);end=start+width;}
  if(g.action==="left")start=clamp(start+step,0,end);
  if(g.action==="right")end=clamp(end+step,start,slots-1);
  setLive({key:item.key,start,end});
 };
 const pointerEnd=(ev,item)=>{
  const g=gesture.current;if(!g||g.key!==item.key)return;
  const pos=live?.key===item.key?live:{start:item.start,end:item.end};
  gesture.current=null;setLive(null);
  patchChapter(item,{start:unpack(pos.start).act,startPart:unpack(pos.start).part,end:unpack(pos.end).act,endPart:unpack(pos.end).part});
 };
 const rangeLabel=(s,e)=>`${acts[Math.floor(s/3)]} · ${phases[s%3]} → ${acts[Math.floor(e/3)]} · ${phases[e%3]}`;
 return <main className="shell"><header className="topbar"><span className="brand">DHÆG-MOND <small>CHRONOLOGY</small></span><div className="header-actions"><button className="outline-button" onClick={onLibrary}>← Library</button><button className="outline-button" onClick={onManage}>⚙ Manage</button></div></header>
 <section className="collection-content"><div className="section-heading"><div className="section-sigil">⌛</div><p className="eyebrow">THE CELESTIAL LIBRARY</p><h1>{chosen.name.toUpperCase()}</h1><p>Plan parallel plotlines across acts, with Early, Middle and Late subdivisions. Adjust chapters directly on the timeline.</p></div>
 <div className="timeline-selector"><label className="field"><span>Timeline</span><select value={chosen.id} onChange={e=>{setTimelineId(e.target.value);setLive(null);}}>{timelineList.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><div><strong>{chosen.name}</strong><p className="muted">{chosen.description||"Independent timeline"}</p></div></div>
 <div className="story-filter-panel"><input aria-label="Search timeline" placeholder="Search stories, chapters, lanes" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Universe" value={universe} onChange={e=>setUniverse(e.target.value)}><option value="All">All Universes</option>{db.universes.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select><select aria-label="Series" value={series} onChange={e=>setSeries(e.target.value)}><option value="All">All Series</option>{seriesOptions.map(s=><option key={s}>{s}</option>)}</select><select aria-label="Storyline" value={lane} onChange={e=>setLane(e.target.value)}><option value="All">All Storylines</option>{knownLanes.map(l=><option key={l}>{l}</option>)}</select><label className="timeline-draft-toggle"><input type="checkbox" checked={includeDrafts} onChange={e=>setIncludeDrafts(e.target.checked)}/> Show drafts (local editor only)</label><label className="timeline-draft-toggle"><input type="checkbox" checked={edit} onChange={e=>setEdit(e.target.checked)}/> Edit timeline bars</label></div>
 <p className="eyebrow">{items.length} PLACED CHAPTERS · {lanes.length} STORYLINES</p>
 {edit&&<p className="timeline-instruction">Drag the center of a bar to move it. Drag its left or right handle to adjust its span. Changes save automatically. Use the color pickers beside each lane to customize colors.</p>}
 <div className="timeline-scroll"><div className="timeline-board timeline-board-advanced" style={{"--act-count":acts.length,"--slot-count":slots}}><div className="timeline-axis"><div className="timeline-corner">STORYLINE</div>{acts.map((act,i)=><div className="timeline-act" key={i}><strong>{act}</strong><div className="timeline-subhead">{phases.map(p=><span key={p}>{p}</span>)}</div></div>)}</div>
 {lanes.map(name=><div className="timeline-lane" key={name}><div className="timeline-lane-title"><span>{name}</span>{edit&&<input type="color" aria-label={`Color for ${name}`} value={laneColor(name)} onChange={e=>updateLaneColor(name,e.target.value)}/>}</div><div className="timeline-track timeline-precise-track" ref={el=>{trackRefs.current[name]=el;}}>{items.filter(x=>x.lane===name).map((item,i)=>{const preview=live?.key===item.key?live:item;const left=preview.start/slots*100;const width=(preview.end-preview.start+1)/slots*100;return <div className={`timeline-segment ${edit?"editable":""}`} key={item.key} style={{left:`${left}%`,width:`${width}%`,top:`${i*65+9}px`,"--lane-color":laneColor(name)}} onPointerMove={ev=>pointerMove(ev,item)} onPointerUp={ev=>pointerEnd(ev,item)} onPointerCancel={ev=>{gesture.current=null;setLive(null);}} title={`${item.story.name}: ${rangeLabel(preview.start,preview.end)}`}><button className="timeline-segment-main" onPointerDown={ev=>pointerStart(ev,item,"move")} onClick={()=>{if(!edit)onOpenStory(item.story.id);}} aria-label={`${item.chapter.title} ${rangeLabel(preview.start,preview.end)}`}><strong>{item.chapter.title||"Untitled chapter"}</strong><small>{item.story.name}{item.story.status!=="Published"?" · Draft":""}</small></button>{edit&&<><span className="timeline-resize left" onPointerDown={ev=>pointerStart(ev,item,"left")} title="Adjust start"/><span className="timeline-resize right" onPointerDown={ev=>pointerStart(ev,item,"right")} title="Adjust end"/></>}</div>})}<div className="timeline-track-spacer" style={{height:`${Math.max(1,items.filter(x=>x.lane===name).length)*65+15}px`}}/></div></div>)}
 </div></div>{!items.length&&<div className="empty-state"><h3>No chapters placed yet</h3><p>Open Manage Collection → Stories / Library → Timeline and assign chapter lanes and act positions.</p></div>}
 <p className="muted">Each act has three planning subdivisions, not precise dates. Existing chapters without subdivision values continue to display. To manage hidden or unpublished stories, open the Collection Manager.</p></section></main>;
}
