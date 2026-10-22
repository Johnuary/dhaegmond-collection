import { useEffect, useRef, useState } from "react";
import { image } from "./data";
export default function ArtworkViewer({artworks,index,onChange,onClose}) {
 const [zoom,setZoom]=useState(1),[pos,setPos]=useState({x:0,y:0});const drag=useRef(null),close=useRef(null);
 const art=artworks[index];
 const reset=()=>{setZoom(1);setPos({x:0,y:0});};
 const change=d=>{reset();onChange((index+d+artworks.length)%artworks.length);};
 const zoomBy=d=>{setZoom(z=>Math.max(1,Math.min(4,Math.round((z+d)*100)/100)));};
 useEffect(()=>{if(zoom===1)setPos({x:0,y:0});},[zoom]);
 useEffect(()=>{close.current?.focus();const before=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=before;};},[]);
 useEffect(()=>{const key=e=>{if(e.key==="Escape")onClose();if(e.key==="ArrowLeft"&&artworks.length>1)change(-1);if(e.key==="ArrowRight"&&artworks.length>1)change(1);if(e.key==="+"||e.key==="=")zoomBy(.25);if(e.key==="-")zoomBy(-.25);if(e.key==="0")reset();};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);},[index,artworks.length,onClose,onChange]);
 if(!art)return null;
 return <div className="viewer" role="dialog" aria-modal="true" aria-label="Artwork viewer"><header><div><p className="eyebrow">{art.category}</p><h2>{art.title}</h2></div><button ref={close} onClick={onClose}>✕ Close</button></header><div className="viewer-stage">{artworks.length>1&&<button className="prev" aria-label="Previous artwork" onClick={()=>change(-1)}>‹</button>}<div className="viewer-image" onPointerDown={e=>{if(zoom<=1)return;drag.current={x:e.clientX-pos.x,y:e.clientY-pos.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current)setPos({x:e.clientX-drag.current.x,y:e.clientY-drag.current.y});}} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null} style={{cursor:zoom>1?"grab":"default"}}><img draggable="false" src={image(art.file)} alt={art.title} style={{transform:`translate(${pos.x}px,${pos.y}px) scale(${zoom})`}}/></div>{artworks.length>1&&<button className="next" aria-label="Next artwork" onClick={()=>change(1)}>›</button>}</div><footer><div className="viewer-controls"><button onClick={()=>zoomBy(-.25)} disabled={zoom<=1}>−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>zoomBy(.25)} disabled={zoom>=4}>+</button><button onClick={reset}>Reset</button></div><span>{index+1} / {artworks.length}</span></footer></div>;
}
