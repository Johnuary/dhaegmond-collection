import {useEffect,useState} from "react";
import {byId} from "./data";
import StoryMarkup from "./StoryMarkup";
const coverUrl=(value)=>!value?"":/^(https?:|data:|blob:)/.test(value)?value:`${import.meta.env.BASE_URL}images/${value.replace(/^\/?images\//,"")}`;
export default function StoryReader({db,storyId,onLibrary,onOpenCharacter,onOpenSkin,onOpenStory}){
 const [index,setIndex]=useState(0);
 useEffect(()=>setIndex(0),[storyId]);
 const story=byId(db.stories||[],storyId);
 if(!story||story.status!=="Published")return <main className="shell"><header className="topbar"><button className="outline-button" onClick={onLibrary}>← Library</button></header><p className="empty-state">Story not found or currently in draft.</p></main>;
 const chapters=Array.isArray(story.chapters)&&story.chapters.length?story.chapters:[{id:"legacy",title:"Story",body:story.body||""}];
 const current=Math.min(index,chapters.length-1),chapter=chapters[current];
 const related=(db.stories||[]).filter(s=>s.status==="Published"&&s.id!==story.id&&story.series&&s.series===story.series).sort((a,b)=>(a.seriesOrder||1)-(b.seriesOrder||1));
 const total=chapters.reduce((n,c)=>n+(c.body||"").trim().split(/\s+/).filter(Boolean).length,0);
 return <main className="shell"><header className="topbar"><span className="brand">DHÆG-MOND <small>LIBRARY</small></span><button className="outline-button" onClick={onLibrary}>← All Stories</button></header><article className="story-reader">
 {story.cover&&<img className="story-reader-cover" src={coverUrl(story.cover)} alt={`${story.name} cover`}/>}
 <div className="story-reader-header"><p className="eyebrow">{story.category||"Story"} · {byId(db.universes,story.universeId)?.name||"Across Worlds"}</p><h1>{story.name}</h1>{story.series&&<p className="eyebrow">{story.series} · Part {story.seriesOrder||1}</p>}{story.summary&&<p className="story-summary">{story.summary}</p>}<small>{chapters.length} chapters · {total} words</small></div>
 <nav className="reader-chapters" aria-label="Select chapter">{chapters.map((c,i)=><button key={c.id} className={i===current?"active":""} onClick={()=>{setIndex(i);window.scrollTo({top:0,behavior:"smooth"});}}>{i+1}. {c.title||`Chapter ${i+1}`}</button>)}</nav>
 <div className="reader-chapter-title"><p className="eyebrow">CHAPTER {current+1} OF {chapters.length}</p><h2>{chapter.title}</h2></div>
 <div className="story-prose"><StoryMarkup body={chapter.body}/></div>
 <div className="reader-pagination"><button className="outline-button" disabled={current===0} onClick={()=>{setIndex(current-1);window.scrollTo(0,0);}}>← Previous chapter</button><button className="outline-button" disabled={current===chapters.length-1} onClick={()=>{setIndex(current+1);window.scrollTo(0,0);}}>Next chapter →</button></div>
 {related.length>0&&<div className="related-series"><h2>More in {story.series}</h2>{related.map(s=><button key={s.id} onClick={()=>onOpenStory?.(s.id)}>{s.seriesOrder||1}. {s.name} →</button>)}</div>}
 <div className="story-related"><h2>Connected to this story</h2><div className="story-tags">{(story.characterIds||[]).map(id=>{const c=byId(db.characters,id);return c&&<button key={id} onClick={()=>onOpenCharacter(id)}>{c.name} ↗</button>})}{(story.skinIds||[]).map(id=>{const s=byId(db.skins,id);return s&&<button key={id} onClick={()=>onOpenSkin(id)}>{s.name} ↗</button>})}</div></div></article></main>;
}
