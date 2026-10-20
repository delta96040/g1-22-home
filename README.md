# G1-22 Home Planner

Interactive 3D planner for **Plot G1-22, DLF Panchkula**. Furnish every room, walk through the house at eye level, and export to-scale SVG plans.

**Live:** https://delta96040.github.io/g1-22-home/

## What it does
- 3D model of the floor plan traced from the DLF / Bhagwati Properties brochure, with brochure sizes on every room
- Cutaway walls, flat plan view, and first-person walk mode (WASD or on-screen joystick)
- 130+ pieces of furniture: beds, sofas, TVs, ACs, mirrors, wardrobes, shoe racks, study tables, laptops, dining and bar sets, kitchen and bathroom fittings
- Drag to place; furniture snaps flat against walls and shows its clearance to each wall in cm
- Exact sizes, height off the floor, rotation and colour for every piece
- Per-room floor finish and wall paint
- Plan editor: resize rooms, draw or remove walls, add or move doors, sliding doors, windows and openings, add or delete rooms
- Export SVG plans (whole floor or one room, 1 unit = 1 cm), PNG snapshots, a furniture list (CSV), design files and share links
- Undo/redo; designs save automatically in your browser

## Run locally
It is a static site with no build step:

```
python3 -m http.server 8000
```
then open http://localhost:8000.

## Credits
- Furniture models: [Kenney Furniture Kit 2.0](https://kenney.nl/assets/furniture-kit), CC0 (converted to GLB; see `models/LICENSE-Kenney.txt`)
- [three.js](https://threejs.org) r160, MIT (vendored in `vendor/three`)
- Room positions are approximate tracings of the sales brochure, not architectural drawings.
