// Pokemon ETB Storage Case — V1
// Upright display/storage case for a Pokemon Elite Trainer Box.
//
// ORIENTATION:
//   ETB stands upright inside the case.
//   The large artwork face (190mm tall × 165mm wide) faces OUTWARD (case front).
//   The lid covers the TOP of the case (90mm × 165mm opening).
//   To access ETB: remove lid, grip ETB through the side notches, lift out.
//
// STANDARD ETB (Scarlet & Violet era): ~190mm tall × 165mm wide × 90mm deep
// Dimensions vary slightly by set — measure yours and update etb_h/etb_w/etb_d below.
//
// ─── PRINT (two separate jobs, both flat, no supports) ────────────────────────
//   Part 1 — etb_case_base()  ≈ 185 × 110 × 198mm  (tall — allow ~3hr)
//   Part 2 — etb_case_lid()   ≈ 185 × 110 × 5mm    (fast)
//   Both fit K2 Plus bed (350×350mm).
//
// ─── MAGNETS ─────────────────────────────────────────────────────────────────
//   6mm dia × 2mm thick neodymium discs — 8 total (4 per piece).
//   Pockets are at the 4 top corners of the case. Walls are 8mm thick there
//   to give the pocket enough material on all sides.
//   Test polarity before gluing. CA glue or UV resin to seal.
//   Case:  drop magnets in from the TOP of the rim (Z direction).
//   Lid:   push magnets in from the BOTTOM face of the lid.

// ─── ETB DIMENSIONS (measure your box!) ──────────────────────────────────────
etb_h = 190;   // ETB height (the tall/artwork face dimension, standing upright)
etb_w = 165;   // ETB width  (left-right when facing the artwork)
etb_d = 90;    // ETB depth  (front-to-back)

// ─── CASE GEOMETRY ───────────────────────────────────────────────────────────
// Axis convention:
//   X = left-right (etb_w direction, 165mm)  →  case "width"
//   Y = front-back (etb_d direction, 90mm)   →  case "depth"
//   Z = up-down    (etb_h direction, 190mm)  →  case "height"
//
// The case front (Y=0 face, 185×198mm) corresponds to the ETB artwork face.
// The case top (Z=total_h, 185×110mm) is where the lid sits.

fit_gap  = 2.0;           // clearance per side — easy in/out
wall_t   = 8.0;           // wall thickness — 8mm gives room for 6mm corner magnets
floor_t  = 3.5;           // base floor thickness
tray_h   = etb_h + 4.0;  // tray walls slightly taller than ETB — fully enclosed
lid_t    = 5.0;           // lid panel thickness
r_outer  = 5.0;           // outer corner radius

// ─── MAGNETS ─────────────────────────────────────────────────────────────────
mag_dia     = 6.0;
mag_thick   = 2.0;
mag_tol     = 0.15;   // radial press-fit tolerance
mag_skin    = 0.6;    // thin layer left above/below magnet to seat it
// Magnet center is at the center of the corner wall cross-section: wall_t/2 = 4mm.
// At this position: 0.85mm of material on both the outer and inner faces.
mag_setback = wall_t / 2;   // = 4mm from outer corner to magnet center

// ─── FINGER NOTCHES ──────────────────────────────────────────────────────────
// Rectangular cutouts in the two SHORT end walls (left & right, X faces).
// Open the lid, reach in from both sides, grip and lift ETB out.
notch_w = 60;    // notch span in Y (front-back), centered on the 110mm wall
notch_h = 40;    // notch height from top of case downward

// ─── DERIVED ─────────────────────────────────────────────────────────────────
inner_w = etb_w + 2 * fit_gap;     // 169mm
inner_d = etb_d + 2 * fit_gap;     // 94mm
outer_w = inner_w + 2 * wall_t;    // 185mm
outer_d = inner_d + 2 * wall_t;    // 110mm
total_h = floor_t + tray_h;        // 197.5mm

$fn = 64;

// ─── ROUNDED BOX ─────────────────────────────────────────────────────────────
module rbox(l, w, h, r) {
    hull()
        for (x = [r, l - r], y = [r, w - r])
            translate([x, y, 0]) cylinder(r=r, h=h);
}

// ─── MAGNET CORNER POSITIONS ─────────────────────────────────────────────────
// One magnet centered in each of the 4 top corner cross-sections.
mag_pts = [
    [mag_setback,            mag_setback           ],
    [outer_w - mag_setback,  mag_setback           ],
    [mag_setback,            outer_d - mag_setback ],
    [outer_w - mag_setback,  outer_d - mag_setback ],
];

// ─── BASE TRAY ───────────────────────────────────────────────────────────────
module etb_case_base() {
    difference() {
        // Outer shell — rounded corners
        rbox(outer_w, outer_d, total_h, r_outer);

        // Inner cavity — ETB stands upright here
        translate([wall_t, wall_t, floor_t])
            cube([inner_w, inner_d, tray_h + 1]);

        // Magnet pockets — drilled from top of case rim (Z direction)
        for (mp = mag_pts)
            translate([mp[0], mp[1], total_h - mag_thick - mag_skin])
                cylinder(d = mag_dia + mag_tol * 2, h = mag_thick + mag_skin + 0.5);

        // Finger notch — left short wall (X=0)
        // Centered in the 110mm wall depth, spans notch_w, from top down notch_h
        translate([-0.1, outer_d / 2 - notch_w / 2, total_h - notch_h])
            cube([wall_t + 0.2, notch_w, notch_h + 1]);

        // Finger notch — right short wall (X=outer_w)
        translate([outer_w - wall_t - 0.1, outer_d / 2 - notch_w / 2, total_h - notch_h])
            cube([wall_t + 0.2, notch_w, notch_h + 1]);
    }
}

// ─── LID ─────────────────────────────────────────────────────────────────────
module etb_case_lid() {
    difference() {
        // Flat panel — same XY footprint as case top
        rbox(outer_w, outer_d, lid_t, r_outer);

        // Magnet pockets — drilled from bottom face of lid (Z direction)
        for (mp = mag_pts)
            translate([mp[0], mp[1], -0.01])
                cylinder(d = mag_dia + mag_tol * 2, h = mag_thick + mag_skin + 0.5);
    }
}

// ─── PREVIEW ─────────────────────────────────────────────────────────────────
// To export STLs: render one part at a time, F6, Export as STL.

color("dimgray") etb_case_base();

translate([0, 0, total_h + 15])
    color("dimgray") etb_case_lid();
