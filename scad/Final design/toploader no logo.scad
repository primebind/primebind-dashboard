// PrimeBind Toploader Case — Flat (no logo)
// Identical to pb_toploader_test.scad but front face is fully flat — no logo cutout.
//
// EXPORT:
//   RENDER = "body" → toploader_flat_body.stl
//   RENDER = "cap"  → toploader_flat_cap.stl

// ─── INTERNAL DIMENSIONS ───────────────────────────────────────
inner_w   = 76.0;
inner_d   = 2.0;

// ─── WALLS ─────────────────────────────────────────────────────
face_wall = 4.0;
side_wall = 8.0;
floor_t   = 3.0;

// ─── WINDOW — sized to show only the Pokemon card ──────────────
card_w      = 63.0;
card_h      = 88.0;
card_bottom = 4.0;
win_w  = card_w;
win_x  = side_wall + (inner_w - win_w) / 2;
win_z  = floor_t + card_bottom;

// ─── OUTER GEOMETRY ────────────────────────────────────────────
outer_w   = inner_w + 2*side_wall;    // 92mm
outer_d   = inner_d + 2*face_wall;    // 10mm
r_edge    = 4.0;

// ─── HEIGHTS ───────────────────────────────────────────────────
body_h    = 95.0;    // floor 3mm + interior 92mm (window shows full 88mm card)
cap_h     = 14.0;    // ceiling 4mm + interior 10mm

// ─── MAGNETS ───────────────────────────────────────────────────
mag_r        = 1.8;
mag_dep      = 3.2;
mag_seal     = 0.8;
mag_corner_x = side_wall / 2;
mag_cy       = outer_d / 2;
snap_r       = 1.5;
snap_h       = 1.0;

$fn = 32;

// ─── ROUNDED BOX MODULES ───────────────────────────────────────
module rrect_flat_top(x, y, z, r) {
    hull() {
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, r]) sphere(r=r, $fn=16);
        translate([0, 0, z-0.01]) cube([x, y, 0.01]);
    }
}

module rrect_flat_bottom(x, y, z, r) {
    hull() {
        cube([x, y, 0.01]);
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, z-r]) sphere(r=r, $fn=16);
    }
}

// ─── BODY ──────────────────────────────────────────────────────
module body() {
    difference() {
        rrect_flat_top(outer_w, outer_d, body_h, r_edge);

        // interior cavity
        translate([side_wall, face_wall, floor_t])
            cube([inner_w, inner_d, body_h]);

        // back face window — card-sized opening, hides toploader border
        translate([win_x, outer_d - face_wall, win_z])
            cube([win_w, face_wall, body_h - win_z]);

        // 2 square magnet pockets with snap lip
        for (mx = [mag_corner_x, outer_w - mag_corner_x]) {
            translate([mx - mag_r, mag_cy - mag_r, body_h - mag_dep - mag_seal])
                cube([mag_r*2, mag_r*2, mag_dep - snap_h]);
            translate([mx - snap_r, mag_cy - snap_r, body_h - mag_seal - snap_h])
                cube([snap_r*2, snap_r*2, snap_h]);
        }
    }
}

// ─── CAP ───────────────────────────────────────────────────────
module cap() {
    difference() {
        rrect_flat_bottom(outer_w, outer_d, cap_h, r_edge);

        // interior cavity
        translate([side_wall, face_wall, 0])
            cube([inner_w, inner_d, cap_h - face_wall]);

        // 2 square magnet pockets with snap lip
        for (mx = [mag_corner_x, outer_w - mag_corner_x]) {
            translate([mx - snap_r, mag_cy - snap_r, mag_seal])
                cube([snap_r*2, snap_r*2, snap_h]);
            translate([mx - mag_r, mag_cy - mag_r, mag_seal + snap_h])
                cube([mag_r*2, mag_r*2, mag_dep - snap_h]);
        }
    }
}

// ─── RENDER ────────────────────────────────────────────────────
// "body" → export toploader_flat_body.stl
// "cap"  → export toploader_flat_cap.stl
// "both" → preview assembled with gap
RENDER = "cap";

if (RENDER == "both" || RENDER == "body") color("white") body();
if (RENDER == "both" || RENDER == "cap")  color("white") translate([0, 0, body_h + 40]) cap();
