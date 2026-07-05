// PrimeBind Influencer Case — Magnet Lift-Off Version
// Pill-shape body + cap. Cap lifts straight off — NO hinge.
// 4 magnets total: 2 in body top (left + right side walls), 2 in cap bottom.
//
// ─── HOW IT WORKS ──────────────────────────────────────────────────────────
//   Body:  tall sleeve, floor at Z=0, open at top (Z=body_h)
//   Cap:   same outer dims, closed ceiling, open at bottom — lifts straight off
//   Open:  pinch finger notch on front face, pull cap straight up
//
// ─── PRINT STRATEGY (K2 Plus CFS) ──────────────────────────────────────────
//   BLACK:  body + cap
//   WHITE:  logo_cap() — fills front face logo pocket flush
//
// ─── PRINT ORIENTATION ──────────────────────────────────────────────────────
//   Body: front face on bed (logo face down) — best logo surface quality
//         Footprint ≈ 280 × 311mm, Height = 42mm
//   Cap:  open bottom on bed — Footprint ≈ 280 × 42mm, Height = 45mm
//
// ─── EXPORT ─────────────────────────────────────────────────────────────────
//   1. body_black.stl  → comment out cap() and logo_cap() calls at bottom
//   2. cap_black.stl   → comment out body() and logo_cap() calls at bottom
//   3. logo_white.stl  → comment out body() and cap() calls at bottom

// ─── BINDER DIMENSIONS ─────────────────────────────────────────────────────
binder_w   = 260;
binder_d   = 34;
binder_h   = 350;

// ─── WALLS ─────────────────────────────────────────────────────────────────
fit_gap    = 2.0;
face_wall  = 3.0;   // front and back walls
side_wall  = 9.0;   // left/right walls — thick enough to seat 8×3mm magnets

// ─── GEOMETRY ──────────────────────────────────────────────────────────────
inner_w    = binder_w + fit_gap;          // 262
inner_d    = binder_d + fit_gap;          // 36
outer_w    = inner_w + 2*side_wall;       // 280
outer_d    = inner_d + 2*face_wall;       // 42
floor_t    = 3.0;
r_edge     = 8.0;

// ─── HEIGHTS ───────────────────────────────────────────────────────────────
body_h     = 311;
cap_h      = 45;    // total interior = 350mm (body_h - floor_t + cap_h - face_wall = 350)

// ─── MAGNETS (8×3mm disc, Z-axis pockets in side walls) ────────────────────
// 4 pairs = 8 magnets total: one in each corner (front-left, front-right,
// back-left, back-right). Body has 4 pockets at top; cap has 4 at bottom.
mag_r       = 4.2;   // 8mm dia + 0.4mm tolerance
mag_dep     = 3.2;   // 3mm thick + 0.2mm tolerance
mag_y_front = 10;              // Y from front face — clears face_wall + mag radius
mag_y_back  = outer_d - 10;   // Y from front face toward back corner (= 32mm)

// ─── FINGER NOTCH ──────────────────────────────────────────────────────────
notch_r    = 14.0;

// ─── LOGO ──────────────────────────────────────────────────────────────────
logo_depth = 3.0;
logo_scale = 0.55;
logo_cx    = 197;
logo_cz    = 160;

$fn = 32;

// ─── ROUNDED BOX HELPERS ───────────────────────────────────────────────────
// Flat top edge (body — sharp seam at junction)
module rrect_flat_top(x, y, z, r) {
    hull() {
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, r]) sphere(r=r, $fn=16);
        translate([0, 0, z-0.01]) cube([x, y, 0.01]);
    }
}
// Flat bottom edge (cap — sharp seam at junction)
module rrect_flat_bottom(x, y, z, r) {
    hull() {
        cube([x, y, 0.01]);
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, z-r]) sphere(r=r, $fn=16);
    }
}

// ─── LOGO ──────────────────────────────────────────────────────────────────
module logo_profile() {
    translate([-1122.52/2, -793.70/2])
        import("primebindlogo.svg");
}

module logo_pocket_front() {
    translate([outer_w/2 + logo_cx, logo_depth + 1, body_h/2 + logo_cz])
        rotate([90, 0, 0])
            scale([logo_scale, logo_scale, 1])
                linear_extrude(height = logo_depth + 1)
                    logo_profile();
}

module logo_cap() {
    color("white")
    translate([outer_w/2 + logo_cx, logo_depth, body_h/2 + logo_cz])
        rotate([90, 0, 0])
            scale([logo_scale, logo_scale, 1])
                linear_extrude(height = logo_depth)
                    logo_profile();
}

// ─── BODY ──────────────────────────────────────────────────────────────────
module body() {
    difference() {
        rrect_flat_top(outer_w, outer_d, body_h, r_edge);

        // interior cavity
        translate([side_wall, face_wall, floor_t])
            cube([inner_w, inner_d, body_h]);

        // logo pocket on front face (Y=0)
        logo_pocket_front();

        // finger notch — shallow indent at center top of front face
        translate([outer_w/2, -1, body_h])
            rotate([-90, 0, 0])
                cylinder(r=notch_r, h=2.0);

        // magnet pockets — 4 corners, top of side walls
        for (mx = [side_wall/2, outer_w - side_wall/2])
            for (my = [mag_y_front, mag_y_back])
                translate([mx, my, body_h - mag_dep])
                    cylinder(r=mag_r, h=mag_dep + 1);
    }
}

// ─── CAP ───────────────────────────────────────────────────────────────────
module cap() {
    difference() {
        rrect_flat_bottom(outer_w, outer_d, cap_h, r_edge);

        // interior: open at bottom, face_wall ceiling at top
        translate([side_wall, face_wall, 0])
            cube([inner_w, inner_d, cap_h - face_wall]);

        // magnet pockets — 4 corners, bottom of side walls
        for (mx = [side_wall/2, outer_w - side_wall/2])
            for (my = [mag_y_front, mag_y_back])
                translate([mx, my, -1])
                    cylinder(r=mag_r, h=mag_dep + 1);
    }
}

// ─── RENDER ────────────────────────────────────────────────────────────────
color("sienna") body();
logo_cap();
translate([0, 0, body_h + 20])
    color("dimgray") cap();
