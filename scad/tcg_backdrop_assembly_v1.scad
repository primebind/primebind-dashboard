// PrimeBind TCG Backdrop — Full Assembly Preview V1
// All 6 pieces in assembled (trapezoidal) configuration.
// Not for printing — visual layout / fit check only.
//
// Pieces shown:
//   1. Center panel + logo fill   (black / white)
//   2. Center base                (black)
//   3. Right wing panel           (gold)
//   4. Left wing panel            (gold, mirrored)
//   5. Right wing base            (black)
//   6. Left wing base             (black, mirrored)
//
// Corner connectors and junction brackets omitted (small — see wing_v1 file).

use <tcg_backdrop_v3.scad>
use <tcg_backdrop_wing_v1.scad>

$fn = 48;

// ─── POSITIONING CONSTANTS ────────────────────────────────────────────────
// Must match values in each individual file.
P_W   = 320;    // panel_w
P_T   = 8;      // panel_t (center panel is 8mm; wing panels stay at 15mm)
PL_H  = 15;     // plate_h  (base plate height)
SL_Y  = 15;     // slt_yc   (center panel Y center — matches wing base slt_yc=15)
W_ANG = 30;     // wing_angle
WB_D  = 300;    // wbase_d

// Wing panel slot is at slt_yc=15 (near inner front of wing base)
wslot = 15;     // wing base slt_yc — places wing panel adjacent to center panel

// ─── 1. CENTER BASE ──────────────────────────────────────────────────────
color("black") backdrop_base();

// ─── 2. CENTER PANEL ─────────────────────────────────────────────────────
translate([0, SL_Y + P_T / 2, PL_H])
  rotate([90, 0, 0]) {
    color("black") backdrop_panel();
    backdrop_logo_fill();
  }

// ─── 3. RIGHT WING BASE ──────────────────────────────────────────────────
translate([P_W, 0, 0])
  rotate([0, 0, W_ANG])
    color("black") wing_base();

// ─── 4. LEFT WING BASE ───────────────────────────────────────────────────
translate([0, 0, 0])
  rotate([0, 0, -W_ANG])
    scale([-1, 1, 1])
      color("black") wing_base();

// ─── 5. RIGHT WING PANEL ─────────────────────────────────────────────────
translate([P_W - sin(W_ANG) * wslot,
           cos(W_ANG) * wslot,
           PL_H])
  rotate([0, 0, W_ANG])
    rotate([90, 0, 0])
      color("gold") wing_panel();

// ─── 6. LEFT WING PANEL ──────────────────────────────────────────────────
translate([sin(W_ANG) * wslot,
           cos(W_ANG) * wslot,
           PL_H])
  rotate([0, 0, -W_ANG])
    scale([-1, 1, 1])
      rotate([90, 0, 0])
        color("gold") wing_panel();
