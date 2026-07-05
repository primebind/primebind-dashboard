// PrimeBind TCG Content Backdrop — V1
// Hero backdrop: PrimeBind logo fills panel, 8 peg holes in ring around logo center
// for Pokemon figures. Panel plugs into a separate base from above.
//
// --- COORDINATE SYSTEM (model = print orientation, flat on bed) ---------------
//   X  = panel width (left/right), 320mm
//   Y  = panel height (along bed); becomes vertical when panel stands up
//   Z  = panel thickness; front face = Z_max, faces camera when standing
//
// --- STANDING ORIENTATION -----------------------------------------------------
//   Stand panel on Y=0 edge → front face (Z=panel_t) faces camera
//   Logo fills the panel face; Pokemon figures peg into 8 holes ringing the logo
//   Panel bottom drops into groove of backdrop_base() — gravity holds it upright
//
// --- BASE DESIGN --------------------------------------------------------------
//   Flat slab: 320×330×25mm — fits K2 Plus bed in one print
//   Groove at Y=245mm: 245mm in front of panel, 70mm behind
//   Panel plugs in 18mm deep
//
// --- EXPORT -------------------------------------------------------------------
//   1. tcg_backdrop_panel.stl   → backdrop_panel()      [black]
//   2. tcg_backdrop_logo.stl    → backdrop_logo_fill()  [white CFS]
//   3. tcg_backdrop_base.stl    → backdrop_base()       [black]

// --- PANEL -------------------------------------------------------------------
panel_w   = 320;
panel_h   = 250;
panel_t   = 14;
r_panel   = 8;

// --- LOGO --------------------------------------------------------------------
// SVG: 1122.52 x 793.70 units (primebindlogo.svg)
logo_scale   = 0.85;
logo_depth   = 2.0;
logo_tx      = panel_w/2 + 305;   // = 465 — corrects SVG content offset
logo_ty      = panel_h/2 + 255;   // = 380 — corrects SVG content offset

// --- POKEMON PEG RING --------------------------------------------------------
peg_dia      = 8.4;
peg_dep      = 12;
peg_ring_r   = 100;

// --- MODULAR INTERLOCK -------------------------------------------------------
tab_w   = 8;
tab_h   = 28;
tab_z0  = 2;
tab_gap = 0.4;

// --- BASE --------------------------------------------------------------------
base_d      = 330;             // total front-to-back depth
base_h      = 25;              // flat height throughout
base_r      = 8;               // corner rounding
slot_w      = panel_t + 0.6;  // = 14.6mm
slot_y      = 245;             // groove position — 245mm from front, 70mm from rear
slot_depth  = 18;              // panel plugs 18mm into base

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
// PANEL
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
    union() {
      panel_body();
      // right edge modular tab (male)
      translate([panel_w, panel_h/2 - tab_h/2, tab_z0])
        cube([tab_w, tab_h, panel_t - 2*tab_z0]);
    }
    // left edge modular socket (female)
    translate([-0.01, panel_h/2 - tab_h/2 - tab_gap/2, tab_z0 - tab_gap/2])
      cube([tab_w + 0.01, tab_h + tab_gap, panel_t - 2*tab_z0 + tab_gap]);

    // logo pocket
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

// =============================================================================
// BASE — flat slab, panel plugs in from above
// =============================================================================

module backdrop_base() {
  difference() {
    // flat slab with rounded corners
    hull() {
      for (xi = [base_r, panel_w - base_r])
        for (yi = [base_r, base_d - base_r])
          translate([xi, yi, 0]) cylinder(r=base_r, h=base_h);
    }

    // panel slot — full width, open at top
    translate([-0.01, slot_y, base_h - slot_depth])
      cube([panel_w + 0.02, slot_w, slot_depth + 0.01]);
  }
}

// =============================================================================
// RENDER PREVIEW
// =============================================================================

backdrop_panel();
backdrop_logo_fill();

translate([0, -(base_d + 25), 0])
  backdrop_base();
