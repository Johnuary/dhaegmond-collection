import React from "react";
// Render a deliberately small safe Markdown subset as React elements, never raw HTML.
function inline(text){return String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part,i)=>part.startsWith("**")&&part.endsWith("**")?<strong key={i}>{part.slice(2,-2)}</strong>:part.startsWith("*")&&part.endsWith("*")?<em key={i}>{part.slice(1,-1)}</em>:part);}
export default function StoryMarkup({body}){
 const lines=String(body||"").split("\n");const result=[];let paragraph=[];let items=[];
 const flush=()=>{if(paragraph.length){result.push(<p key={`p${result.length}`}>{inline(paragraph.join(" "))}</p>);paragraph=[];}if(items.length){result.push(<ul key={`ul${result.length}`}>{items.map((x,i)=><li key={i}>{inline(x)}</li>)}</ul>);items=[];}};
 lines.forEach(line=>{const l=line.trim();if(!l){flush();return;}if(l.startsWith("- ")){if(paragraph.length)flush();items.push(l.slice(2));return;}if(/^#{1,3} /.test(l)){flush();const match=l.match(/^(#{1,3}) (.*)/);result.push(match[1].length===1?<h2 key={result.length}>{inline(match[2])}</h2>:<h3 key={result.length}>{inline(match[2])}</h3>);return;}if(l==="---"){flush();result.push(<hr key={result.length}/>);return;}if(l.startsWith("> ")){flush();result.push(<blockquote key={result.length}>{inline(l.slice(2))}</blockquote>);return;}if(items.length)flush();paragraph.push(l);});flush();return <>{result}</>;
}
