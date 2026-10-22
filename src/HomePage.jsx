import { byId, image } from "./data";
import CropImage from "./CropImage";
const defaults={title:"DHÆG-MOND",subtitle:"Enter the Celestial Archive",description:"Discover characters, alternate universes, and the stories behind their appearances.",featuredType:"character",featuredId:"marble",background:"",accent:"#c7a76a",showFeatured:true,universeIds:["celestial-circuit","afterlight","prism-promise"]};
export default function HomePage({db,onCollection,onManage,onOpenCharacter,onOpenSkin,onOpenUniverse}){
 const h={...defaults,...db.homepage};
 const character=h.featuredType==="character"?byId(db.characters,h.featuredId):null;
 const skin=h.featuredType==="skin"?byId(db.skins,h.featuredId):null;
 const featured=character||skin;
 const artwork=h.background||(skin?.artwork)||(character?.splash)||(db.characters[0]?.splash)||"";
 const crop=skin?.artworkCropPresets?.banner??skin?.artworkCrop??character?.splashCropPresets?.banner??character?.splashCrop;
 const desktopCrop=h.backgroundCropPresets?.desktop??(h.background?undefined:crop);
 const mobileCrop=h.backgroundCropPresets?.mobile??desktopCrop;
 return <main className="shell welcome" style={{"--welcome-accent":h.accent}}>
  <header className="topbar"><span className="brand">DHÆG-MOND <small>THE CELESTIAL ARCHIVE</small></span><button className="outline-button" onClick={onManage}>⚙ Manage Collection</button></header>
  <section className="welcome-hero"><div className="welcome-background">{artwork&&<><CropImage className="home-desktop-art" src={artwork} crop={desktopCrop} alt=""/><CropImage className="home-mobile-art" src={artwork} crop={mobileCrop} alt=""/></>}</div><div className="welcome-shade"/><div className="welcome-copy"><p className="eyebrow">✦ WELCOME TO THE ARCHIVE</p><h1>{h.title}</h1><h2>{h.subtitle}</h2><p>{h.description}</p><div className="welcome-buttons"><button className="primary-button" onClick={onCollection}>ENTER COLLECTION →</button>{h.showFeatured&&featured&&<button className="outline-button" onClick={()=>character?onOpenCharacter(character.id):onOpenSkin(skin.id)}>EXPLORE {featured.name.toUpperCase()}</button>}</div></div><div className="welcome-index">{db.characters.length} CHARACTERS <span>✧</span> {db.skins.length} SKINS <span>✧</span> {db.universes.length} UNIVERSES</div></section>
  <section className="welcome-universes"><p className="eyebrow">EXPLORE THE WORLDS</p><h2>Featured Universes</h2><div className="welcome-universe-grid">{(h.universeIds||[]).map(id=>byId(db.universes,id)).filter(Boolean).map(u=><button key={u.id} onClick={()=>onOpenUniverse(u.id)} className="welcome-universe-card"><span className="eyebrow">{u.subtitle}</span><strong>{u.name}</strong><p>{u.description}</p><small>EXPLORE COLLECTION ↗</small></button>)}</div></section>
 </main>;
}
