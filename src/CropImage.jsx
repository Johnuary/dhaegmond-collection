import { image } from "./data";

export const normalCrop = { x: 50, y: 50, zoom: 1 };
export const framingPresets = [
  { id: "card", name: "Portrait Card", aspect: "3 / 4" },
  { id: "banner", name: "Cinematic Banner", aspect: "16 / 9" },
  { id: "preview", name: "Skin Preview", aspect: "16 / 9" }
];
export function cropValues(crop) {
  const safe = (number, fallback, minimum, maximum) => {
    const n = Number(number);
    return Number.isFinite(n) ? Math.min(maximum, Math.max(minimum, n)) : fallback;
  };
  return {
    x: safe(crop?.x ?? 50, 50, 0, 100),
    y: safe(crop?.y ?? 50, 50, 0, 100),
    zoom: safe(crop?.zoom ?? 1, 1, 1, 3)
  };
}
export function getCrop(record, preset = "card", legacyField = "crop") {
  return record?.cropPresets?.[preset] ?? record?.[legacyField] ?? normalCrop;
}
export function cropStyle(crop) {
  const { x, y, zoom } = cropValues(crop);
  return { objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` };
}
export default function CropImage({ src, crop, alt = "", className = "", ...props }) {
  return <img {...props} className={`crop-image ${className}`} src={image(src)} alt={alt} style={{ ...(props.style || {}), ...cropStyle(crop) }} />;
}
