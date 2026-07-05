# Chat Summary — June 17, 2026

## 3D Print Projects Active

### Cap for KIKE (influencer gifting)
- **Status:** Two print versions sliced and saved in `Orca Final/`
  - `Cap w: Kike Name.3mf` — multi-color single job (black body + white letters, 146 filament changes, 3h14m)
  - `Cap w: name separate.3mf` — two-piece sequential (2h40m, 1 filament change)
- **SCAD:** `pb_cap_name_kike.scad`
- **Key fix:** Magnet holes at Z=0 (not Z=-1) — the -1 hack caused OrcaSlicer to float model 1mm off bed
- **Pending:** Print both versions, compare results, pick preferred approach

### TCG Backdrop V2 — Rarity Sort Foot
- **File:** `tcg_backdrop_v2.scad`
- **What changed from V1:** Panel and logo IDENTICAL. Foot outer dimensions IDENTICAL (50.6mm deep, 8mm base, same jaw heights). Only the card slots changed: 4 equal 68mm slots → 5 rarity-proportioned notches
- **Notch widths:** C=76mm, U=62mm, RH=49mm, R=49mm, HIT=49mm
- **Concept:** Open laptop — panel = screen, foot = keyboard base lying flat. Card-shaped notches cut into front face. Cards slot in as pulled from packs.
- **Rarity symbols** carved into front lip face of each notch (always visible below any placed card)
- **V1 file untouched**

### Rarity Station (standalone companion piece)
- **File:** `pb_rarity_station_v2.scad`
- **Concept:** Sits flat on table in front of backdrop. 5 zones for manually sorting cards as pulled.
- **Zone order LEFT → RIGHT:** HIT (smallest) → R → RH → U → C (biggest)
- **Design logic:**
  - Uniform base floor height (12mm) across ALL zones — the "yellow" is the same height everywhere
  - Bucket SIZE = width × wall height, proportional to cards-per-pack frequency
  - C: 76mm wide, 40mm deep bucket — holds 6 commons comfortably
  - HIT: 50mm wide, 15mm deep — small bucket, rarely fills
- **Rarity symbols:** Carved into front nub face (always camera-visible)

### Pack Opening System (concept discussed, not fully built)
- **3-part concept proposed:**
  1. Pack Rack — holds sealed packs (pb_pack_system_p1_rack.scad exists but was deprioritized)
  2. Card Hopper — magazine after opening pack, feeds into Part 3
  3. Reveal/Sort Machine — mechanical card eject + gate routes to rarity bin
- **Decision:** Start mechanical (user sets gate, pulls trigger), electronics (light sensor for foil detection) added later as upgrade
- **Status:** On hold — pursuing backdrop v2 + rarity station first

### Pack Opening Contraption concepts discussed
- Gravity ramp reveal
- Card elevator / toaster pop-up mechanism
- Rotating drum (roulette)
- Dial sorter
- **None built yet** — the backdrop v2 notches cover the immediate sorting need

## Design Principles Established
- **Rarity proportionality:** Zone size reflects how often you pull that rarity, not equal treatment
- **HIT is a pedestal, not a bucket** — smallest footprint but most visual prominence
- **Commons need real space** — 6 per pack, need the biggest zone
- **Backdrop foot stays same dimensions** — only notch widths change in v2

## Files in scad/ folder
```
pb_cap_name_kike.scad           — influencer cap (KIKE, dual-color)
pb_influencer_magnet.scad       — influencer case base
pb_influencer_case_v3_final.scad
pb_rarity_station_v2.scad       — standalone rarity sorter
pb_pack_system_p1_rack.scad     — pack display rack (concept, deprioritized)
tcg_backdrop_v1.scad            — original backdrop (DO NOT EDIT)
tcg_backdrop_v2.scad            — backdrop with rarity notches in foot
tcg_backdrop_v1 2.scad          — duplicate, ignore
```

## Pending / Next Session
- [ ] Print KIKE cap (multi-color version) and review results
- [ ] Render tcg_backdrop_v2.scad and review foot notch proportions
- [ ] Render pb_rarity_station_v2.scad and review uniform base + proportional buckets
- [ ] Final binder dimensions from Jason (manufacturer) needed before redesigning cap with sealed magnets
- [ ] Pack opening contraption — build reveal machine once backdrop v2 is approved
