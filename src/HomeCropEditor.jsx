import { useRef, useState } from "react";
import CropImage, { cropValues, normalCrop } from "./CropImage";

const views = [
  { id: "desktop", label: "Desktop / wide view", aspect: "16 / 9" },
  { id: "mobile", label: "Mobile / tall view", aspect: "9 / 16" }
];

export default function HomeCropEditor({ src, presets = {}, onChange, title = "Homepage Background Framing", description = "Keep faces in frame independently on desktop and mobile. Drag the artwork or use the sliders.", context = "homepage" }) {
  const [active, setActive] = useState("desktop");
  const dragging = useRef(null);
  const crop = (id) => cropValues(presets[id] ?? normalCrop);
  const current = crop(active);
  const save = (id, next) => onChange({ ...presets, [id]: cropValues(next) });
  const adjust = (field, value) => save(active, { ...current, [field]: Number(value) });
  function start(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const box = e.currentTarget.getBoundingClientRect();
    dragging.current = { x: e.clientX, y: e.clientY, width: box.width, height: box.height, crop: current, id: active };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    const d = dragging.current;
    if (!d) return;
    const sensitivity = 1 / Math.max(1, d.crop.zoom);
    save(d.id, { ...d.crop,
      x: d.crop.x - (e.clientX - d.x) / d.width * 100 * sensitivity,
      y: d.crop.y - (e.clientY - d.y) / d.height * 100 * sensitivity
    });
  }
  function stop() { dragging.current = null; }
  if (!src) return <p className="muted">Choose an image first to adjust its framing.</p>;
  return <section className="home-framing-editor">
    <div className="gallery-heading"><div><h3>{title}</h3><p className="muted">{description}</p></div><button className="outline-button" type="button" onClick={() => save(active, normalCrop)}>Reset selected view</button></div>
    <div className="home-framing-tabs" role="group" aria-label="Artwork framing screen size">
      {views.map(v => <button key={v.id} type="button" aria-pressed={active===v.id} className={active===v.id?"active":""} onClick={() => setActive(v.id)}>{v.label}</button>)}
    </div>
    <div className="home-framing-layout">
      <div className="home-framing-main">
        <div className="home-framing-canvas" style={{aspectRatio:views.find(v=>v.id===active).aspect,maxWidth:active==="mobile"?"310px":"680px"}} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
          <CropImage src={src} crop={current} alt={`${title} preview`} draggable={false}/><span className="home-framing-hint">✥ DRAG TO POSITION</span>
        </div>
        <div className="crop-sliders">
          <label>Horizontal focus <output>{Math.round(current.x)}%</output><input type="range" min="0" max="100" value={current.x} onChange={e=>adjust("x",e.target.value)}/></label>
          <label>Vertical focus <output>{Math.round(current.y)}%</output><input type="range" min="0" max="100" value={current.y} onChange={e=>adjust("y",e.target.value)}/></label>
          <label>Zoom <output>{current.zoom.toFixed(2)}×</output><input type="range" min="1" max="3" step="0.05" value={current.zoom} onChange={e=>adjust("zoom",e.target.value)}/></label>
        </div>
      </div>
      <div className="home-framing-side"><strong>Live page previews</strong>{views.map(v => <button type="button" key={v.id} className={`home-framing-option ${active===v.id?"active":""}`} onClick={()=>setActive(v.id)}><span className="home-framing-mini" style={{aspectRatio:v.aspect,maxWidth:v.id==="mobile"?"150px":undefined}}><CropImage src={src} crop={crop(v.id)} alt="" draggable={false}/></span><span>{v.label}</span></button>)}</div>
    </div>
    <p className="muted">These presets affect only the {context}. Other uses of the artwork keep their own framing. The original image is never modified.</p>
  </section>;
}
