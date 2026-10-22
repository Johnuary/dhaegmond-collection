// Initial collection. Changes made in the manager are saved in this browser.
export const tierColors = {
  Classic: "#9fb4c3", Fantastical: "#559bff", Valorous: "#e25665",
  Marvelous: "#e5c16d", Celestial: "#a979f5", Cosmical: "#f4a9df",
  Unassigned: "#8597a8"
};
export const tiers = Object.keys(tierColors);
export const artworkCategories = ["Splash Art", "Reference Sheet", "Alternate Form", "Concept Art"];

export const seed = {
  timelineActs: ["Act I","Act II","Act III","Act IV","Act V"],
  timelines: [{id:"main-chronology",name:"Main Chronology",description:"Original story timeline",universeId:"",acts:["Act I","Act II","Act III","Act IV","Act V"],laneColors:{}}],
  universes: [
    {id:"classic",name:"Dhæg-Mond",subtitle:"The Original Universe",description:"The world of Celestials, divine powers, rival factions and the Corruption Saga."},
    {id:"celestial-circuit",name:"Celestial Circuit",subtitle:"Racing Universe",description:"Advanced racing technology, rival drivers and extraordinary competition."},
    {id:"afterlight",name:"AFTERLIGHT",subtitle:"Music Universe",description:"A boy group universe centered on music, fashion and performance."},
    {id:"prism-promise",name:"Prism Promise",subtitle:"Magical Hero Universe",description:"Students awakened by Radiance protect their secret identities."},
    {id:"shoreline",name:"Shoreline",subtitle:"Coastal Collection",description:"Coastal-inspired appearances."},
    {id:"werewolf",name:"Werewolf",subtitle:"Supernatural Universe",description:"A world of supernatural transformations."},
    {id:"floral-soiree",name:"Floral Soirée",subtitle:"Floral Collection",description:"Dreamlike floral motifs and elaborate costumes."}
  ],
  codexEntries: [],
  atlasMaps: [],
  locations: [],
  factions: [
    {id:"com",name:"COM Gang",type:"Gang",universeId:"classic",region:"South",description:"A Southern gang led by Marble.",history:"",emblem:"",color:"#75b8a7",members:[{characterId:"marble",role:"Leader",isLeader:true}],relations:[{factionId:"club-carmine",type:"Rival"}]},
    {id:"club-carmine",name:"Club Carmine",type:"Organization",universeId:"classic",region:"South",description:"A rival faction operating in the South.",history:"",emblem:"",color:"#c86877",members:[],relations:[{factionId:"com",type:"Rival"}]}
  ],
  characters: [
    {id:"marble",name:"Marble",title:"The Guardian of Strength",region:"South",portrait:"characters/marble.png",splash:"marble-splash.png",power:"Super-strength",faction:"COM Gang",overviewTitle:"The Strength Behind the Silence",overview:"Once known as Nicholas, Marble is a humble yet formidable Celestial whose extraordinary strength protects the people he considers family. Beneath his reserved exterior is a history shaped by loss, loyalty and survival.",loreTitle:"Nicholas, Before Marble",lore:"Marble's history is intertwined with Freyr and Cordelia, who knew him before his rise to leadership. Years of separation and hardship have changed him, though his compassion remains.",abilities:[{id:"strength",name:"Super-strength",description:"Primary Celestial ability."}],timeline:["Life as Nicholas","Freyr and Cordelia","Rise of the Gang","The Corruption Saga"],relationships:[{characterId:"freyr",type:"Old Friend"},{characterId:"cordelia",type:"Old Friend"}]},
    {id:"freyr",name:"Freyr",title:"The Elemental Celestial",region:"North",portrait:"characters/freyr.png",splash:"characters/freyr.png",power:"Elemental Manipulation",faction:"LeRouge Family",overviewTitle:"The Northern Heir",overview:"A Northern Celestial whose journey conflicts with his family's expectations and Dhæg-Mond's growing dangers.",loreTitle:"A Journey Beyond the North",lore:"Freyr's story connects Northern aristocracy to his friendships beyond its borders.",abilities:[{id:"elements",name:"Elemental Manipulation",description:"Primary Celestial ability."}],timeline:["Life in the North","Friendships in the South","Return to the North","The Corruption Saga"],relationships:[{characterId:"marble",type:"Old Friend"},{characterId:"cordelia",type:"Old Friend"}]},
    {id:"cordelia",name:"Cordelia",title:"The Energy Celestial",region:"Central",portrait:"characters/cordelia.png",splash:"characters/cordelia.png",power:"Energy Manipulation",faction:"Unassigned",overviewTitle:"The Investigator",overview:"A Central Celestial whose investigative work leads toward the Midnight Market's secrets.",loreTitle:"Following the Evidence",lore:"Cordelia investigates the mystery surrounding Nicholas and the corruption threat.",abilities:[{id:"energy",name:"Energy Manipulation",description:"Primary Celestial ability."}],timeline:["Life as a Detective","The Investigation","The Midnight Market","The Corruption Saga"],relationships:[{characterId:"marble",type:"Old Friend"},{characterId:"freyr",type:"Old Friend"}]}
  ],
  skins: [
    {id:"classic-marble",characterId:"marble",name:"Classic Marble",tier:"Classic",universeId:"classic",artwork:"skins/classic-marble.png",description:"Marble's original appearance in Dhæg-Mond.",artworks:[{id:"classic-splash",title:"Classic Splash Art",category:"Splash Art",file:"skins/classic-marble.png",description:"Marble's original appearance."}]},
    {id:"red-rider-marble",characterId:"marble",name:"Red Rider Marble",tier:"Valorous",universeId:"celestial-circuit",artwork:"skins/red-rider-marble.png",description:"A formidable competitor in the Celestial Circuit.",artworks:[{id:"red-rider-splash",title:"Red Rider Splash Art",category:"Splash Art",file:"skins/red-rider-marble.png",description:"Marble's racing illustration."}]},
    {id:"werewolf-marble",characterId:"marble",name:"Werewolf Marble",tier:"Unassigned",universeId:"werewolf",artwork:"skins/werewolf-marble.png",description:"A transformation revealing Marble's feral instincts.",artworks:[{id:"werewolf-splash",title:"Werewolf Splash Art",category:"Splash Art",file:"skins/werewolf-marble.png",description:"Supernatural transformation."}]},
    {id:"afterlight-marble",characterId:"marble",name:"AFTERLIGHT Marble",tier:"Unassigned",universeId:"afterlight",artwork:"skins/afterlight-marble.png",description:"Leader and all-rounder of AFTERLIGHT.",artworks:[{id:"afterlight-splash",title:"AFTERLIGHT Splash Art",category:"Splash Art",file:"skins/afterlight-marble.png",description:"A performance-inspired look."}]},
    {id:"shoreline-marble",characterId:"marble",name:"Shoreline Marble",tier:"Unassigned",universeId:"shoreline",artwork:"skins/shoreline-marble.png",description:"A coastal-inspired interpretation of Marble.",artworks:[{id:"shoreline-splash",title:"Shoreline Splash Art",category:"Splash Art",file:"skins/shoreline-marble.png",description:"Coastal appearance."}]}
  ]
};

// Accept public/images paths, external http(s) URLs, and imported data URLs.
export function image(path = "") {
  if (!path) return "";
  if (/^(https?:\/\/|data:image\/)/i.test(path)) return path;
  return `${import.meta.env.BASE_URL}images/${path.replace(/^\/?(public\/)?images\//, "")}`;
}
export const byId = (items, id) => items.find(item => item.id === id);
export const skinsFor = (db, id) => db.skins.filter(skin => skin.characterId === id);
export const artworksFor = (skin) => skin?.artworks?.length ? skin.artworks : skin ? [{id:`${skin.id}-cover`,title:`${skin.name} Splash`,category:"Splash Art",file:skin.artwork,description:""}] : [];
export const uid = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
