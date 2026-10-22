import {timelinesFor,chapterPlacement} from "./timelines";
import {useRef,useState} from "react";
const categories=["Backstory","Lore","Short Story","Spin-off","What If","Other"];
const chapterId=()=>`chapter-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
export default function StoryEditor({story,db,onChange,onDelete}){
 const [tab,setTab]=useState("details"),[chapterIndex,setChapterIndex]=useState(0);
 const textRef=useRef(null);
 const timelines=timelinesFor(db); const [timelineId,setTimelineId]=useState(timelines[0].id); const chosenTimeline=timelines.find(t=>t.id===timelineId)||timelines[0];
 if(!story)return <div className="empty-state">Choose a story or create one to begin writing.</div>;
 const update=(key,value)=>onChange({...story,[key]:value});
 const toggle=(key,id)=>{const values=story[key]||[];update(key,values.includes(id)?values.filter(x=>x!==id):[...values,id]);};
 // Legacy manuscripts stay intact. They are shown as one editable first chapter until split intentionally.
 const chapters=Array.isArray(story.chapters)&&story.chapters.length?story.chapters:[{id:"legacy",title:"Chapter 1",body:story.body||""}];
 const index=Math.min(chapterIndex,chapters.length-1),active=chapters[index];
 const writeChapter=(next)=>{const updated=chapters.map((c,i)=>i===index?{...c,...next}:c);onChange({...story,chapters:updated});};
 const addChapter=()=>{const next=[...chapters,{id:chapterId(),title:`Chapter ${chapters.length+1}`,body:""}];onChange({...story,chapters:next});setChapterIndex(next.length-1);};
 const deleteChapter=()=>{if(chapters.length===1){if(window.confirm("Clear the only chapter?")){writeChapter({body:"",title:"Chapter 1"});}return;}if(!window.confirm(`Delete ${active.title}?`))return;onChange({...story,chapters:chapters.filter((_,i)=>i!==index)});setChapterIndex(Math.max(0,index-1));};
 const moveChapter=(direction)=>{const target=index+direction;if(target<0||target>=chapters.length)return;const next=[...chapters];[next[index],next[target]]=[next[target],next[index]];onChange({...story,chapters:next});setChapterIndex(target);};
 const insert=(before,after="",placeholder="text")=>{const el=textRef.current;if(!el)return;const start=el.selectionStart,end=el.selectionEnd;const original=active.body||"";const middle=original.slice(start,end)||placeholder;writeChapter({body:original.slice(0,start)+before+middle+after+original.slice(end)});requestAnimationFrame(()=>{el.focus();el.setSelectionRange(start+before.length,start+before.length+middle.length);});};
 const totalWords=chapters.reduce((sum,c)=>sum+(c.body||"").trim().split(/\s+/).filter(Boolean).length,0);
 return <section className="story-editor">
  <div className="editor-title"><div><p className="eyebrow">CELESTIAL WRITING STUDIO</p><h2>{story.name||"Untitled Story"}</h2><small>{story.status||"Draft"} · {chapters.length} chapters · {totalWords} words · Autosaved locally</small></div><button className="danger-button" onClick={onDelete}>Delete story</button></div>
  <nav className="character-editor-tabs" aria-label="Story editing sections">{[["details","Details & Series"],["writing","Chapters & Writing"],["connections","Connections"],["timeline","Timeline"]].map(([key,label])=><button key={key} className={tab===key?"active":""} onClick={()=>setTab(key)}>{label}</button>)}</nav>
  {tab==="details"&&<div className="editor-fields">
   <label className="field"><span>Story title</span><input value={story.name||""} onChange={e=>update("name",e.target.value)}/></label>
   <label className="field"><span>Category</span><select value={story.category||"Short Story"} onChange={e=>update("category",e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
   <label className="field"><span>Status</span><select value={story.status||"Draft"} onChange={e=>update("status",e.target.value)}>{["Draft","Published"].map(s=><option key={s}>{s}</option>)}</select></label>
   <label className="field"><span>Universe</span><select value={story.universeId||""} onChange={e=>update("universeId",e.target.value)}><option value="">No specific universe</option>{db.universes.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
   <label className="field"><span>Series name (optional; identical names group stories)</span><input list="library-series-names" value={story.series||""} onChange={e=>update("series",e.target.value)} placeholder="e.g. The Corruption Saga"/><datalist id="library-series-names">{[...new Set((db.stories||[]).map(s=>s.series).filter(Boolean))].map(s=><option key={s} value={s}/>)}</datalist></label>
   <label className="field"><span>Series order (1, 2, 3…)</span><input type="number" min="1" step="1" value={story.seriesOrder??1} onChange={e=>update("seriesOrder",Math.max(1,Number(e.target.value)||1))}/></label>
   <label className="field"><span>Cover artwork path (within public/images) or image URL</span><input value={story.cover||""} onChange={e=>update("cover",e.target.value)} placeholder="skins/afterlight-marble.png"/></label>
   {story.cover&&<img className="story-cover-preview" src={story.cover.startsWith("data:")||story.cover.startsWith("http")?story.cover:`${import.meta.env.BASE_URL}images/${story.cover.replace(/^\/?images\//,"")}`} alt="Story cover preview"/>}
   <label className="field"><span>Short description / summary</span><textarea rows={4} value={story.summary||""} onChange={e=>update("summary",e.target.value)}/></label>
  </div>}
  {tab==="writing"&&<div className="story-writing"><div className="story-writing-meta"><strong>Chapters & manuscript</strong><span>{totalWords} total words</span></div>
   <div className="chapter-tabs">{chapters.map((c,i)=><button key={c.id} className={i===index?"active":""} onClick={()=>setChapterIndex(i)}>{i+1}. {c.title||"Untitled"}</button>)}<button onClick={addChapter}>+ Chapter</button></div>
   <div className="chapter-actions"><button onClick={()=>moveChapter(-1)} disabled={index===0}>↑ Earlier</button><button onClick={()=>moveChapter(1)} disabled={index===chapters.length-1}>↓ Later</button><button className="danger-button" onClick={deleteChapter}>Delete chapter</button></div>
   <label className="field"><span>Chapter title</span><input value={active.title||""} onChange={e=>writeChapter({title:e.target.value})}/></label>
   <div className="format-toolbar"><button onClick={()=>insert("**","**","bold text")}>Bold</button><button onClick={()=>insert("*","*","italic text")}>Italic</button><button onClick={()=>insert("## ","","Heading")}>Heading</button><button onClick={()=>insert("> ","","Quote")}>Quote</button><button onClick={()=>insert("- ","","List item")}>List</button><button onClick={()=>insert("\n---\n","","")}>Divider</button></div>
   <textarea ref={textRef} aria-label="Chapter manuscript" rows={22} placeholder="Begin your chapter..." value={active.body||""} onChange={e=>writeChapter({body:e.target.value})}/>
   <p className="muted">Formatting uses Markdown: **bold**, *italic*, ## headings, &gt; quotes, and - lists. Drafts autosave in this browser; export JSON backups regularly. Older single-body stories remain editable as one chapter.</p>
  </div>}
  {tab==="timeline"&&<div className="editor-fields"><h3>Timeline placements</h3><p className="muted">A chapter may appear on multiple independent timelines. Choose the timeline before editing a placement.</p>
   <label className="field"><span>Editing timeline</span><select value={chosenTimeline.id} onChange={e=>setTimelineId(e.target.value)}>{timelines.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
   {chapters.map((c,i)=>{const placement=chapterPlacement(c,chosenTimeline.id);const names=chosenTimeline.acts||[];
    const patchPlacement = (patch) => {
      const next = chapters.map((row, j) => {
        if (i !== j) return row;
        const previous = chapterPlacement(row, chosenTimeline.id) || {};
        return {
          ...row,
          timelinePlacements: {
            ...row.timelinePlacements,
            [chosenTimeline.id]: { ...previous, ...patch }
          }
        };
      });
      onChange({ ...story, chapters: next });
    };
    const clearPlacement=()=>{const next=chapters.map((row,j)=>{if(i!==j)return row;const placements={...row.timelinePlacements};delete placements[chosenTimeline.id];return {...row,timelinePlacements:placements,...(chosenTimeline.id==="main-chronology"?{timeline:null}:{})};});onChange({...story,chapters:next});};
    return <div key={c.id} className="timeline-edit-chapter"><h3>{i+1}. {c.title||"Untitled chapter"}</h3>
     <label className="timeline-draft-toggle"><input type="checkbox" checked={!!placement} onChange={e=>e.target.checked?patchPlacement({lane:"",start:0,end:0,startPart:0,endPart:2}):clearPlacement()}/> Include on {chosenTimeline.name}</label>
     {placement&&<div className="timeline-edit-fields"><label className="field"><span>Storyline lane</span><input value={placement.lane||""} list="timeline-lanes" placeholder="Marble, Cordelia, Side Plot..." onChange={e=>patchPlacement({lane:e.target.value})}/></label>
     <label className="field"><span>Start act</span><select value={placement.start??0} onChange={e=>{const v=+e.target.value;patchPlacement({start:v,end:Math.max(v,placement.end??v)});}}>{names.map((act,n)=><option value={n} key={n}>{act}</option>)}</select></label>
     <label className="field"><span>End act</span><select value={placement.end??0} onChange={e=>{const v=+e.target.value;patchPlacement({end:v,start:Math.min(v,placement.start??0)});}}>{names.map((act,n)=><option value={n} key={n}>{act}</option>)}</select></label>
     <label className="field"><span>Start within act</span><select value={placement.startPart??0} onChange={e=>patchPlacement({startPart:+e.target.value})}>{["Early","Middle","Late"].map((x,n)=><option value={n} key={x}>{x}</option>)}</select></label>
     <label className="field"><span>End within act</span><select value={placement.endPart??2} onChange={e=>patchPlacement({endPart:+e.target.value})}>{["Early","Middle","Late"].map((x,n)=><option value={n} key={x}>{x}</option>)}</select></label></div>}
    </div>})}<datalist id="timeline-lanes">{db.characters.map(c=><option key={c.id} value={c.name}/>)}</datalist></div>}
  {tab==="connections"&&<div className="story-connections"><h3>Linked characters</h3><div className="story-check-grid">{db.characters.map(c=><label key={c.id}><input type="checkbox" checked={(story.characterIds||[]).includes(c.id)} onChange={()=>toggle("characterIds",c.id)}/>{c.name}</label>)}</div><h3>Linked skins / AU appearances</h3><div className="story-check-grid">{db.skins.map(s=><label key={s.id}><input type="checkbox" checked={(story.skinIds||[]).includes(s.id)} onChange={()=>toggle("skinIds",s.id)}/>{s.name}</label>)}</div></div>}
 </section>;
}
