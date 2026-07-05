// PrimeBind Influencer Cap — Josef
// Standalone cap only. Print ceiling-down (rounded top on bed, open bottom facing up).
// Pause at Z ≈ 41mm → insert 4 magnets → resume → sealed.

// ─── BINDER DIMENSIONS ─────────────────────────────────────────
binder_w   = 264.7;
binder_d   = 39;

// ─── WALLS ─────────────────────────────────────────────────────
fit_gap    = 2.0;
face_wall  = 4.0;
side_wall  = 12.0;

// ─── GEOMETRY ──────────────────────────────────────────────────
inner_w    = binder_w + fit_gap;
inner_d    = binder_d + fit_gap;
outer_w    = inner_w + 2*side_wall;
outer_d    = inner_d + 2*face_wall;
r_edge     = 8.0;

// ─── HEIGHT ────────────────────────────────────────────────────
cap_h      = 45;     // cap internal = 41.275mm

// ─── MAGNETS ───────────────────────────────────────────────────
mag_r        = 4.3;   // 8mm magnet + 0.6mm clearance = drops in easily, sealed by print
mag_dep      = 3.2;
mag_seal     = 0.8;   // sealed skin at junction face — pause before this prints
mag_corner_x = side_wall / 2;
mag_corner_y = 8.0;

// ─── NAME TAG ──────────────────────────────────────────────────
name_text  = "Josef";
name_size  = 22;
name_font  = "Bunken Tech Sans Pro ExBd:style=Italic";
name_depth = 1.5;

$fn = 32;

// ─── ROUNDED BOX — flat bottom edge, rounded top ───────────────
module rrect_flat_bottom(x, y, z, r) {
    hull() {
        cube([x, y, 0.01]);
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, z-r]) sphere(r=r, $fn=16);
    }
}

// ─── NAME POCKET (deboss — subtracted from cap body) ───────────
module name_pocket_front() {
    translate([outer_w/2 - 0.2, name_depth + 1, cap_h/2 - 4])
        rotate([90, 0, 0])
            linear_extrude(height = name_depth + 1)
                text(name_text, size = name_size, font = name_font,
                     halign = "center", valign = "center");
}

// ─── NAME INLAY (solid fill — white STL, sits inside deboss cavity) ─
module name_inlay() {
    translate([outer_w/2 - 0.2, name_depth, cap_h/2 - 4])
        rotate([90, 0, 0])
            linear_extrude(height = name_depth)
                text(name_text, size = name_size, font = name_font,
                     halign = "center", valign = "center");
}

// ─── CAP ───────────────────────────────────────────────────────
module cap() {
    difference() {
        rrect_flat_bottom(outer_w, outer_d, cap_h, r_edge);

        // interior: open at bottom, 3mm ceiling at top
        translate([side_wall, face_wall, 0])
            cube([inner_w, inner_d, cap_h - face_wall]);

        // name debossed into front face
        name_pocket_front();

        // 4 corner magnet pockets — square so magnet drops in flat, no tilt/head crash
        // Cap prints CEILING-DOWN → pause at printer Z ≈ 41mm, insert magnets, resume
        for (mx = [mag_corner_x, outer_w - mag_corner_x])
            for (my = [mag_corner_y, outer_d - mag_corner_y])
                translate([mx - mag_r, my - mag_r, mag_seal])
                    cube([mag_r*2, mag_r*2, mag_dep]);
    }
}

// ─── RENDER ────────────────────────────────────────────────────
// EXPORT 1 → cap_josef_black.stl:  set RENDER = "body"
// EXPORT 2 → cap_josef_white.stl:  set RENDER = "text"
RENDER = "body";

if (RENDER == "body") cap();
if (RENDER == "text") name_inlay();
