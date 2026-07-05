// PrimeBind TCG Content Backdrop — V1
// Hero backdrop: PrimeBind logo fills panel, 8 peg holes in ring around logo center
// for Pokemon figures. Card display stands integrated into rear of foot.
//
// ─── COORDINATE SYSTEM (model = print orientation, flat on bed) ──────────────────
//   X  = panel width (left/right), 320mm
//   Y  = panel height (along bed); becomes vertical when panel stands up
//   Z  = panel thickness; front face = Z_max, faces camera when standing
//
// ─── STANDING ORIENTATION ────────────────────────────────────────────────────────
//   Stand panel on Y=0 edge → front face (Z=panel_t) faces camera
//   Logo fills the panel face; Pokemon figures peg into 8 holes ringing the logo
//   Card slots are in the FOOT behind the standing panel
//
// ─── EXPORT ──────────────────────────────────────────────────────────────────────
//   1. tcg_backdrop_panel.stl   → backdrop_panel()      [black]
//   2. tcg_backdrop_logo.stl    → backdrop_logo_fill()  [white, CFS — fills logo pocket]
//   3. tcg_backdrop_foot.stl    → backdrop_foot()       [black]
//   4. tcg_peg_base.stl         → pokemon_peg_base()    [any color]
//
//   Single-color: render backdrop_panel() + backdrop_logo_fill() together

// ─── PANEL ───────────────────────────────────────────────────────────────────────
panel_w   = 320;
panel_h   = 250;
panel_t   = 14;
r_panel   = 8;

// ─── LOGO ────────────────────────────────────────────────────────────────────────
// SVG: 1122.52 × 793.70 units (primebindlogo.svg)
// Quadrupled from v0 scale — logo now fills most of the panel
// +100 X / +100 Y offsets correct the SVG's internal content position
logo_scale   = 0.85;            // ~4× original — 955mm SVG width → fills/bleeds panel
logo_depth   = 2.0;             // pocket depth into front face (white fill sits flush)
logo_tx      = panel_w/2 + 305; // = 465 — corrects SVG content offset
logo_ty      = panel_h/2 + 255; // = 380 — corrects SVG content offset

// ─── POKEMON PEG RING ────────────────────────────────────────────────────────────
// 8 holes at 45° intervals in a ring around the logo center
// Holes outside the panel boundary are naturally absent (nothing to cut)
peg_dia      = 8.4;    // 8mm peg + 0.4mm tolerance
peg_dep      = 12;     // socket depth into front face (leaves 2mm back wall)
peg_ring_r   = 100;    // ring radius from logo center

// ─── MODULAR INTERLOCK ───────────────────────────────────────────────────────────
tab_w   = 8;
tab_h   = 28;
tab_z0  = 2;
tab_gap = 0.4;

// ─── FOOT ────────────────────────────────────────────────────────────────────────
// Layout front→back (Y direction, Y=0 = camera side):
//
//   [CARD STANDS]  [FRONT JAW]  [panel gap]  [BACK JAW]
//     Y=0..18        Y=18..27    Y=27..41.6   Y=41.6..50.6
//     35mm tall       20mm tall                60mm tall (hidden, counterweight)
//
// Cards display at the front (camera side). Tall jaw is fully hidden behind panel.
// Lip is on the BACK edge of each card slot (Y=14..18) — stops card sliding toward panel.

foot_wall_t    = 9;
foot_gap       = panel_t + 0.6;   // 14.6mm panel slot clearance
foot_grip_h    = 20;              // front jaw height — low profile, doesn't block backdrop
foot_base_h    = 8;
foot_stand_d   = 18;              // card stand area depth (Y, camera side)
foot_stand_h   = 25;              // card slot opening height
slot_z_start   = 10;              // card slot floor = cards sit 10mm off table
back_jaw_h     = 60;              // back jaw height — hidden, acts as counterweight
foot_lip_d     = 4;               // lip depth at back of each slot (Y) — stops card sliding back
foot_lip_h     = 10;              // lip height (Z) — short catch nub only

// Computed Y positions
front_jaw_y    = foot_stand_d;                        // = 18mm
back_jaw_y     = foot_stand_d + foot_wall_t + foot_gap; // = 41.6mm
foot_total_d   = foot_stand_d + foot_wall_t + foot_gap + foot_wall_t; // = 50.6mm

n_card_stands     = 4;
card_sw           = 68;
stand_wall_sep    = 10;
stand_total_used  = n_card_stands * card_sw + (n_card_stands - 1) * stand_wall_sep;
stand_x0          = (panel_w - stand_total_used) / 2;   // 9mm left margin

// ─── POKEMON PEG BASE ────────────────────────────────────────────────────────────
peg_base_r   = 18;
peg_base_h   = 4;
peg_male_h   = 13;
peg_male_dia = peg_dia - 0.4;   // 8.0mm — snug friction fit in 8.4mm panel holes

$fn = 48;

// ════════════════════════════════════════════════════════════════════════════════
// LOGO
// ════════════════════════════════════════════════════════════════════════════════

module logo_profile() {
  translate([-1122.52/2, -793.70/2])
    import("primebindlogo.svg");
}

// Cut into front face — used inside backdrop_panel() difference block
module logo_pocket() {
  translate([logo_tx, logo_ty, panel_t - logo_depth])
    scale([logo_scale, logo_scale, 1])
      linear_extrude(height = logo_depth + 1)
        logo_profile();
}

// White fill piece — separate CFS export; sits flush at Z=panel_t
module backdrop_logo_fill() {
  color("white")
  translate([logo_tx, logo_ty, panel_t - logo_depth])
    scale([logo_scale, logo_scale, 1])
      linear_extrude(height = logo_depth)
        logo_profile();
}

// ════════════════════════════════════════════════════════════════════════════════
// PANEL
// ════════════════════════════════════════════════════════════════════════════════

module panel_body() {
  hull() {
    for (xi = [r_panel, panel_w - r_panel])
      for (yi = [r_panel, panel_h - r_panel])
        translate([xi, yi, 0]) cylinder(r=r_panel, h=panel_t);
  }
}

module backdrop_panel() {
  difference() {
    union() {
      panel_body();
      // right edge modular tab (male)
      translate([panel_w, panel_h/2 - tab_h/2, tab_z0])
        cube([tab_w, tab_h, panel_t - 2*tab_z0]);
    }
    // left edge modular socket (female)
    translate([-0.01, panel_h/2 - tab_h/2 - tab_gap/2, tab_z0 - tab_gap/2])
      cube([tab_w + 0.01, tab_h + tab_gap, panel_t - 2*tab_z0 + tab_gap]);

    // logo pocket — fills with white CFS logo_fill piece
    logo_pocket();

    // 8 peg holes in ring around logo center
    for (a = [0 : 45 : 315]) {
      px = logo_tx + peg_ring_r * cos(a);
      py = logo_ty + peg_ring_r * sin(a);
      translate([px, py, panel_t - peg_dep])
        cylinder(d=peg_dia, h=peg_dep + 1);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// FOOT — panel grip + rear card display stands
// ════════════════════════════════════════════════════════════════════════════════
//
// Side view (Y direction, front = Y=0):
//   [front jaw 9mm] [panel gap 14.6mm] [back jaw+card area 27mm]
//   Front jaw: clamps panel front face
//   Back section: clamps panel back + houses 4 vertical card slots
//
// Card slot anatomy (each slot):
//   - X: card_sw = 68mm wide
//   - Y: from back_y + foot_lip_d to back_y + back_wall_d (4mm lip at front)
//   - Z: opens from foot_grip_h upward (card slot floor at 38mm, slot height 50mm)
//   foot_lip_d = 4mm solid wall at front of each slot — card leans on it, won't fall forward
//
// Print orientation:
//   Base on bed (Z=0 = bottom of foot), card slots open upward
//   No supports needed — all overhangs are within spec

module backdrop_foot() {
  difference() {
    union() {
      // base plate — full foot depth
      cube([panel_w, foot_total_d, foot_base_h]);
      // card stand area — FRONT (camera side, Y=0), shorter, cards displayed here
      cube([panel_w, foot_stand_d, slot_z_start + foot_stand_h]);
      // front grip jaw — panel front face presses against this
      translate([0, front_jaw_y, 0])
        cube([panel_w, foot_wall_t, foot_grip_h]);
      // back jaw — TALL, hidden behind panel, counterweight
      translate([0, back_jaw_y, 0])
        cube([panel_w, foot_wall_t, back_jaw_h]);
    }
    // card slot cuts — lip at FRONT (outward/camera side), open at back
    for (i = [0 : n_card_stands - 1]) {
      slot_x = stand_x0 + i * (card_sw + stand_wall_sep);
      // main slot cut: starts at foot_lip_d, leaving front lip wall
      translate([slot_x, foot_lip_d, slot_z_start])
        cube([card_sw, foot_stand_d - foot_lip_d + 0.01, foot_stand_h + 1]);
      // trim front lip above foot_lip_h — short nub at base only
      translate([slot_x, -0.01, slot_z_start + foot_lip_h])
        cube([card_sw, foot_lip_d + 0.01, foot_stand_h - foot_lip_h + 1]);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// POKEMON PEG BASE — universal adapter glued to any flat-back figure
// ════════════════════════════════════════════════════════════════════════════════

module pokemon_peg_base() {
  cylinder(r=peg_base_r, h=peg_base_h);
  translate([0, 0, peg_base_h])
    cylinder(d=peg_male_dia, h=peg_male_h);
}

// ════════════════════════════════════════════════════════════════════════════════
// RENDER PREVIEW
// ════════════════════════════════════════════════════════════════════════════════

backdrop_panel();
backdrop_logo_fill();

translate([0, -(foot_total_d + 25), 0])
  backdrop_foot();

translate([panel_w + 30, 0, 0])
  pokemon_peg_base();
