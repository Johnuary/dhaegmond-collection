# Dhæg-Mond Collection · Phase 35 — Linked Encyclopedia

This is a complete replacement project based on Phase 34. Preserve your existing `public/images` directory and export a JSON backup before upgrading.

## New
- Shareable dedicated hash routes `#/factions/:id`, `#/locations/:id`, `#/codex/:id`, and `#/timelines/:id`.
- Universal Search opens an exact record rather than a generic section.
- Faction, Atlas and Codex browse cards open the new detail pages.
- Cross-record links for characters, skins, related published stories, locations, organizations, and universes.
- Character Overview links directly to linked organization, location and Codex records.
- Timeline detail links to a focused interactive timeline.

## Install
`npm install` then `npm run dev`; validate before publishing with `npm run build`.

Collection data uses the same localStorage key as before. JSON imports from previous versions should remain compatible. Browser-only changes are not published to GitHub Pages automatically.
