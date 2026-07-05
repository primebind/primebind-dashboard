// PrimeBind TCG Backdrop — Mini Test Print
// All 6 pieces at 1/3 scale, laid flat for a single K2 Plus print (350×350mm bed).
// Use this to verify channel fit, bumper alignment, and wing angle before printing full size.
//
// Layout:
//   Row 1: center panel | right wing panel | left wing panel (mirrored)
//   Row 2: center base  | right wing base  | left wing base  (mirrored)
//
// After printing: stand the panels in their bases, press wing bases against center base.
// The 30° angle, channel grip, and bumper alignment should all be checkable by hand.

use <tcg_backdrop_v3.scad>
use <tcg_backdrop_wing_v1.scad>

$fn = 48;

S   = 1/3;       // scale — fits 3×2 grid in 350×350mm with room to spare
GAP = 8;         // gap between pieces (mm, at print scale)

PW = 320 * S;    // ≈ 106.7mm — scaled piece width
PH = 300 * S;    // = 100mm  — scaled piece depth

// ─── LOGO FILL PREVIEW ───────────────────────────────────────────────────────
color("white")
    scale([S, S, S]) backdrop_logo_fill();

/*
// ─── ROW 1: PANELS ───────────────────────────────────────────────────────────

// Center panel + logo fill
color("DimGray")
    scale([S, S, S]) backdrop_panel();
color("white")
    scale([S, S, S]) backdrop_logo_fill();

// Right wing panel
translate([PW + GAP, 0, 0])
    color("Goldenrod")
        scale([S, S, S]) wing_panel();

// Left wing panel — mirrored
translate([3 * PW + 2 * GAP, 0, 0])
    color("Goldenrod")
        scale([S, S, S]) mirror([1, 0, 0]) wing_panel();

// ─── ROW 2: BASES ────────────────────────────────────────────────────────────

// Center base
translate([0, PH + GAP, 0])
    color("DimGray")
        scale([S, S, S]) backdrop_base();

// Right wing base
translate([PW + GAP, PH + GAP, 0])
    color("DimGray")
        scale([S, S, S]) wing_base();

// Left wing base — mirrored
translate([3 * PW + 2 * GAP, PH + GAP, 0])
    color("DimGray")
        scale([S, S, S]) mirror([1, 0, 0]) wing_base();
*/
