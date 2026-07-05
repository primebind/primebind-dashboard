// PrimeBind TCG Content Backdrop — V3
// PANEL:  Identical to V1 — no changes.
// BASE:   Thin plate (8mm) + raised spine only at slot position.
//         ~65% less material than V1 solid slab.
//
// --- COORDINATE SYSTEM --------------------------------------------------------
//   X  = panel width (left/right), 320mm
//   Y  = panel height (along bed); becomes vertical when panel stands up
//   Z  = panel thickness; front face = Z_max, faces camera when standing
//
// --- EXPORT -------------------------------------------------------------------
//   1. tcg_backdrop_panel.stl   → backdrop_panel()      [black]
//   2. tcg_backdrop_logo.stl    → backdrop_logo_fill()  [white CFS]
//   3. tcg_backdrop_base_v3.stl → backdrop_base()       [black]

// --- PANEL -------------------------------------------------------------------
panel_w   = 320;
panel_h   = 300;
panel_t   = 8;    // 8mm — backdrop is decorative, no load
r_panel   = 8;

// --- LOGO --------------------------------------------------------------------
logo_scale   = 0.85;
logo_depth   = 2.0;
logo_tx      = panel_w/2 + 305;
logo_ty      = panel_h/2 + 230;

// --- POKEMON PEG RING --------------------------------------------------------
peg_dia      = 8.4;
peg_dep      = 6;
peg_ring_r   = 100;

// --- MODULAR INTERLOCK -------------------------------------------------------
tab_w   = 8;
tab_h   = 28;
tab_z0  = 1;
tab_gap = 0.4;

// --- PANEL EDGE MAGNETS (left + right sides) ---------------------------------
pmag_r   = 1.5;   // 3mm disc
pmag_dep = 3.0;
pmag_y1  = panel_h * 0.22;   // 66mm — below tab zone
pmag_y2  = panel_h * 0.50;   // 150mm — center height
pmag_y3  = panel_h * 0.78;   // 234mm — above tab zone

// --- BASE CHANNEL (panel bottom edge drops into full-width groove) -----------
// Full-width channel eliminates 3-tab design; channel walls resist forward tipping.
ch_d   = 12;              // channel depth — panel sinks 12mm into base
ch_w   = panel_t + 0.3;  // 8.3mm — 0.15mm clearance per side (snug fit)
ch_yc  = 15;             // channel Y center (15mm from front edge)

// --- BASE END MAGNETS + SNAP TABS (connect to wing bases) --------------------
emag_r   = 1.5;
emag_dep = 3.0;
emag_ya  = 10;    // clear channel front wall (ch_yc=15, front bumper at Y≈10.8)
emag_yb  = 40;
emag_yc  = 100;
emag_yd  = 220;
etab_l   = 6;     // tab protrusion in X
etab_h   = 4;     // tab height (Z) — centered in plate_h
etab_d   = 15;    // tab width (Y)
etab_z   = 5;     // (plate_h=15 - etab_h=4) / 2 ≈ 5 — centers tab in plate height
etab_gap = 0.3;   // clearance used by wing base socket

// --- BASE (flat plate + full-width channel) ----------------------------------
base_d    = 300;   // matches panel_h — full 320×300 footprint
base_r    = 8;
plate_h   = 15;   // 15mm plate height
bump_h    = 8;    // bumper wall height above plate surface — adds 8mm grip above channel
bump_t    = 3;    // bumper wall thickness in Y

$fn = 48;

// =============================================================================
// LOGO
// =============================================================================

module logo_profile() {
  translate([-1122.52/2, -793.70/2])
    import("primebindlogo.svg");
}

module logo_pocket() {
  translate([logo_tx, logo_ty, panel_t - logo_depth])
    scale([logo_scale, logo_scale, 1])
      linear_extrude(height = logo_depth + 1)
        logo_profile();
}

module backdrop_logo_fill() {
  color("white")
  translate([logo_tx, logo_ty, panel_t - logo_depth])
    scale([logo_scale, logo_scale, 1])
      linear_extrude(height = logo_depth)
        logo_profile();
}

// =============================================================================
// PANEL (unchanged from V1)
// =============================================================================

module panel_body() {
  hull() {
    for (xi = [r_panel, panel_w - r_panel])
      for (yi = [r_panel, panel_h - r_panel])
        translate([xi, yi, 0]) cylinder(r=r_panel, h=panel_t);
  }
}

module backdrop_panel() {
  difference() {
    panel_body();
    // left edge magnet pockets
    for (my = [pmag_y1, pmag_y2, pmag_y3])
      translate([-0.01, my, panel_t / 2])
        rotate([0, 90, 0])
          cylinder(r = pmag_r, h = pmag_dep + 0.01);
    // right edge magnet pockets
    for (my = [pmag_y1, pmag_y2, pmag_y3])
      translate([panel_w + 0.01, my, panel_t / 2])
        rotate([0, -90, 0])
          cylinder(r = pmag_r, h = pmag_dep + 0.01);
    logo_pocket();
    for (a = [0 : 45 : 315]) {
      px = logo_tx + peg_ring_r * cos(a);
      py = logo_ty + peg_ring_r * sin(a);
      translate([px, py, panel_t - peg_dep])
        cylinder(d=peg_dia, h=peg_dep + 1);
    }
  }
}

// =============================================================================
// BASE — flat plate + full-width channel
// Panel bottom edge drops straight down into 12mm-deep channel.
// Channel walls (not magnets) resist forward/backward tipping.
// =============================================================================

module backdrop_base() {
  difference() {
    union() {
      // flat plate — full footprint, 8mm tall
      hull() {
        translate([0,              0,              0]) cube([0.01, 0.01, plate_h]);          // left-front — sharp (meets left wing inner corner at X=0, Y=0)
        translate([panel_w,        0,              0]) cube([0.01, 0.01, plate_h]);          // right-front — sharp (meets right wing inner corner at X=320, Y=0)
        translate([base_r,         base_d - base_r, 0]) cylinder(r=base_r, h=plate_h);     // left-back
        translate([panel_w - base_r, base_d - base_r, 0]) cylinder(r=base_r, h=plate_h);   // right-back
      }
      // front bumper wall — grips panel above plate surface
      translate([-0.01, ch_yc - ch_w/2 - bump_t, plate_h])
        cube([panel_w + 0.02, bump_t, bump_h]);
      // back bumper wall
      translate([-0.01, ch_yc + ch_w/2, plate_h])
        cube([panel_w + 0.02, bump_t, bump_h]);
    }
    // Full-width channel — extends through bumper walls for full 16mm effective grip
    translate([-0.01, ch_yc - ch_w/2, plate_h - ch_d])
      cube([panel_w + 0.02, ch_w, ch_d + bump_h + 0.01]);
    // right end face magnet pockets
    for (by = [emag_ya, emag_yb, emag_yc, emag_yd])
      translate([panel_w + 0.01, by, plate_h / 2])
        rotate([0, -90, 0])
          cylinder(r = emag_r, h = emag_dep + 0.01);
    // left end face magnet pockets
    for (by = [emag_ya, emag_yb, emag_yc, emag_yd])
      translate([-0.01, by, plate_h / 2])
        rotate([0, 90, 0])
          cylinder(r = emag_r, h = emag_dep + 0.01);
  }
}

// =============================================================================
// RENDER — toggle to preview or export
// =============================================================================
//   Export 1 → tcg_backdrop_panel.stl  → backdrop_panel()      [Hyper PLA Black]
//   Export 2 → tcg_backdrop_logo.stl   → backdrop_logo_fill()  [Hyper PLA White]
//   Export 3 → tcg_backdrop_base.stl   → backdrop_base()       [Hyper PLA Black]

// Side-by-side preview (both pieces in print orientation):
backdrop_panel();
backdrop_logo_fill();
translate([0, -(base_d + 15), 0])
  backdrop_base();

// Single-piece exports — comment preview above, uncomment one:
//backdrop_panel();
//backdrop_logo_fill();
//backdrop_base();
