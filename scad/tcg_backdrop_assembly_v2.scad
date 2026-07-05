// PrimeBind TCG Backdrop — Full Assembly V2
// Shows all 6 pieces assembled into the trapezoidal backdrop configuration.
// NOT for printing — visual layout and fit check only.
//
// Pieces:
//   1. Center base          (black)    320×300×15mm — flat plate + 12mm channel
//   2. Center panel         (black)    320×300×8mm  — flat bottom, drops into channel
//   3. Center logo fill     (white)    CFS color; same STL origin as panel
//   4. Right wing base      (black)    trapezoidal, 30° from center
//   5. Left wing base       (black)    mirror of right
//   6. Right wing panel     (gold)     320×300×8mm, drops into channel
//   7. Left wing panel      (gold)     mirror of right
//
// All panels are 8mm thick.
// Corner connectors (small white brackets) omitted for clarity — see wing file.

use <tcg_backdrop_v3.scad>
use <tcg_backdrop_wing_v1.scad>

$fn = 48;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
// Keep in sync with individual files.

// Center
P_W    = 320;   // panel_w
P_H    = 300;   // panel_h
P_T    = 8;     // panel_t — all panels 8mm
PL_H   = 15;    // plate_h — base plate height
CH_YC  = 15;    // ch_yc   — channel Y center in both bases
CH_D   = 12;    // ch_d    — channel depth (panel sinks 12mm into base)

// Wings
W_ANG  = 30;    // wing_angle (degrees)
WB_D   = 300;   // wbase_d
WP_T   = 8;     // wing panel_t (now 8mm, same as center)
W_SLOT = 17.0;  // ch_yc_wing(13.0) + WP_T/2(4) = 17.0 — aligns wing panel face flush with center panel
BS_D      = 15;    // base_junction bs_d — bracket insertion depth, for placement
WP_OFFSET = W_SLOT * tan(W_ANG);  // ≈9.81mm — places panel inner corner exactly flush at X_world=320

// Connector/bracket positioning (must match params in wing file)
CONN_SLOT_DEP = 10;   // slot_dep
CONN_WALL     = 10;   // conn_wall
TB_SL_H       = 35;   // top_bracket slot height (tb_h=40 minus tb_cap=5)
// Top bracket: slot A center at world Y=CH_YC; bottom of bracket so slots wrap panel tops.
TB_X = P_W - CONN_SLOT_DEP;             // 310 — slot A spans X=310..320 (right junction)
TB_Y = CH_YC - CONN_WALL / 2;           // 10  — slot A center at Y=15 (channel center)
TB_Z = PL_H - CH_D + P_H - TB_SL_H;    // 268 — bracket bottom; 5mm cap sticks above panel top at Z=303

// ─── 1. CENTER BASE ──────────────────────────────────────────────────────────
color("DimGray") backdrop_base();

// ─── 2. CENTER PANEL + LOGO ──────────────────────────────────────────────────
// Rotate 180° around the panel's own vertical center axis (world Z through panel midpoint).
// translate to panel center → rotate([0,0,180]) → translate back.
// Panel bottom sinks CH_D=12mm into base channel; bottom edge at Z = PL_H - CH_D = 3
translate([P_W/2, CH_YC, 0])
  rotate([0, 0, 180])
    translate([-P_W/2, -CH_YC, 0])
      translate([0, CH_YC + P_T/2, PL_H - CH_D])
        rotate([90, 0, 0]) {
          color("black") backdrop_panel();
          backdrop_logo_fill();
        }


// ─── 5. TOP BRACKETS — temporarily removed
// translate([TB_X, TB_Y, TB_Z])  color("white") top_bracket("right");
// translate([0, TB_Y, TB_Z])  scale([-1, 1, 1])  color("white") top_bracket("right");

// ─── 6. RIGHT WING BASE ──────────────────────────────────────────────────────
translate([P_W, 0, 0])
  rotate([0, 0, W_ANG])
    color("DimGray") wing_base();

// ─── 7. LEFT WING BASE ───────────────────────────────────────────────────────
translate([0, 0, 0])
  rotate([0, 0, -W_ANG])
    scale([-1, 1, 1])
      color("DimGray") wing_base();

// ─── 8. RIGHT WING PANEL ─────────────────────────────────────────────────────
// W_SLOT centers panel in channel; WP_OFFSET shifts inner end past center base corner.
// Net: panel inner end at wing-local X≈8.66mm (inner face of wing at X_local=0 maps to X=320 world).
translate([P_W - sin(W_ANG)*W_SLOT + WP_OFFSET*cos(W_ANG),
           cos(W_ANG)*W_SLOT + WP_OFFSET*sin(W_ANG),
           PL_H - CH_D])
  rotate([0, 0, W_ANG])
    rotate([90, 0, 0])
      color("Goldenrod") wing_panel();

// ─── 9. LEFT WING PANEL ──────────────────────────────────────────────────────
translate([sin(W_ANG)*W_SLOT - WP_OFFSET*cos(W_ANG),
           cos(W_ANG)*W_SLOT + WP_OFFSET*sin(W_ANG),
           PL_H - CH_D])
  rotate([0, 0, -W_ANG])
    scale([-1, 1, 1])
      rotate([90, 0, 0])
        color("Goldenrod") wing_panel();
