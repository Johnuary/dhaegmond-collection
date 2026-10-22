export const DEFAULT_TIMELINE_ID = "main-chronology";
export function timelinesFor(db) {
  if (Array.isArray(db.timelines) && db.timelines.length) return db.timelines;
  return [{id:DEFAULT_TIMELINE_ID,name:"Main Chronology",description:"Original story timeline",universeId:"",acts:db.timelineActs?.length?db.timelineActs:["Act I","Act II","Act III","Act IV","Act V"],laneColors:db.timelineLaneColors||{}}];
}
export function normalizeTimelines(db) {
  const timelines=timelinesFor(db);
  return {...db,timelines};
}
export function chapterPlacement(chapter,id) {
  return chapter.timelinePlacements?.[id] || (id===DEFAULT_TIMELINE_ID?chapter.timeline:null);
}
