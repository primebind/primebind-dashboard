// PrimeBind Influencer Case — V3
// AirPods-style sleeve: tall body + sliding cap, side magnets
//
// HOW IT WORKS:
//   Body:  tall sleeve, open at top, closed floor, logo on front face
//   Cap:   slides over top of body, held by side magnets, lifts off to open
//   Binder sits open-edge DOWN, spine at top (spine slides in first from top)
//   Finger notch on front face near top — push binder up to extract
//
// NOTE: Hinge mechanism added in v4 after prototype fit is confirmed
//
// PRINT STRATEGY (K2 Plus CFS — 2 filaments):
//   BLACK:  body + cap
//   WHITE:  logo cap (fills front face pocket flush)
//
// PRINT ORIENTATION:
//   Body: lay on FRONT FACE (logo face on bed) — best surface quality on logo
//         Footprint: outer_w × body_h, Height: outer_d
//   Cap:  lay on OPEN BOTTOM (bottom rim on bed)
//         Footprint: cap_outer_w × cap_outer_d, Height: cap_h
//
// EXPORT:
//   1. Comment out cap() + logo_cap() → body_black.stl
//   2. Comment out body() + logo_cap() → cap_black.stl
//   3. Comment out body() + cap()     → logo_white.stl

// ─── BINDER DIMENSIONS (estimate — measure real binder before final print) ───
binder_w   = 260;   // width of binder (side to side)
binder_d   = 34;    // thickness of binder (front to back)
binder_h   = 350;   // height of binder (standing up)

// ─── FIT ───────────────────────────────────────────────────────
fit_gap    = 2.0;   // clearance around binder inside body
cap_gap    = 0.5;   // clearance between body exterior and cap interior

// ─── WALLS ─────────────────────────────────────────────────────
face_wall  = 3.0;   // front and back wall thickness
side_wall  = 5.0;   // left and right wall thickness — thicker to seat magnets

// ─── INTERIOR & EXTERIOR ───────────────────────────────────────
inner_w    = binder_w + fit_gap;              // 262
inner_d    = binder_d + fit_gap;              // 36
outer_w    = inner_w + 2*side_wall;           // 272
outer_d    = inner_d + 2*face_wall;           // 42
floor_t    = 3.0;                             // floor thickness

// ─── BODY & CAP HEIGHTS ────────────────────────────────────────
body_h     = 300;
overlap    = 15;                              // how far cap slides over body
cap_open   = binder_h - body_h;              // 50 — exposed binder above body
cap_h      = cap_open + overlap + 3.0;       // 68 — cap total height (3mm ceiling)

// ─── CAP DIMENSIONS (slides over body exterior) ────────────────
cap_inner_w = outer_w + 2*cap_gap;           // 273
cap_inner_d = outer_d + 2*cap_gap;           // 43
cap_outer_w = cap_inner_w + 2*face_wall;     // 279 — cap front/back walls
cap_outer_d = cap_inner_d + 2*side_wall;     // 53 — cap side walls

// ─── MAGNETS (in side walls) ───────────────────────────────────
mag_r      = 4.2;   // 8mm disc + 0.4 tolerance
mag_dep    = 3.2;   // 3mm disc + 0.2 tolerance
mag_z      = body_h - overlap/2;             // centered in overlap zone
mag_y      = outer_d / 2;                    // centered front-to-back

// ─── FINGER NOTCH (front face, near top) ───────────────────────
notch_r    = 14.0;

// ─── LOGO (on front face — XZ plane) ───────────────────────────
logo_depth = 3.0;
logo_scale = 0.22;  // SVG 1122x793 rotated — 0.22 fits 268×300 front face
logo_cx    = 0;     // X offset from face center (+ = right)
logo_cz    = -40;   // Z offset from body center (- = lower, keeps logo clear of cap)

$fn = 32;

// ─── LOGO PROFILE (2D, same SVG as v1/v2) ──────────────────────
module logo_profile() {
    rotate([0, 0, -90])
        translate([-1122.52/2, -793.70/2])
            import("primebindlogo.svg");
}

// ─── LOGO POCKET (recessed into front face) ────────────────────
// rotate([90,0,0]) maps 2D XY → 3D XZ plane, extrude goes in +Y (into wall)
module logo_pocket_front() {
    translate([outer_w/2 + logo_cx, -1, body_h/2 + logo_cz])
        rotate([90, 0, 0])
            scale([logo_scale, logo_scale, 1])
                linear_extrude(height = logo_depth + 1)
                    logo_profile();
}

// ─── LOGO CAP (white piece fills pocket flush) ─────────────────
module logo_cap() {
    color("white")
    translate([outer_w/2 + logo_cx, 0, body_h/2 + logo_cz])
        rotate([90, 0, 0])
            scale([logo_scale, logo_scale, 1])
                linear_extrude(height = logo_depth)
                    logo_profile();
}

// ─── BODY ──────────────────────────────────────────────────────
module body() {
    difference() {
        // outer shell
        cube([outer_w, outer_d, body_h]);

        // interior cavity — open at top, floor at bottom
        translate([side_wall, face_wall, floor_t])
            cube([inner_w, inner_d, body_h]);

        // logo pocket on front face (Y=0)
        logo_pocket_front();

        // finger notch: semicircle on front face at top edge
        // push finger here to help lift binder out
        translate([outer_w/2, -1, body_h])
            rotate([-90, 0, 0])
                cylinder(r=notch_r, h=face_wall + 1);

        // side magnet pockets — left face (X=0)
        translate([-1, mag_y, mag_z])
            rotate([0, 90, 0])
                cylinder(r=mag_r, h=mag_dep + 1);

        // side magnet pockets — right face (X=outer_w)
        translate([outer_w - mag_dep, mag_y, mag_z])
            rotate([0, 90, 0])
                cylinder(r=mag_r, h=mag_dep + 1);
    }
}

// ─── CAP ───────────────────────────────────────────────────────
module cap() {
    difference() {
        // outer shell
        cube([cap_outer_w, cap_outer_d, cap_h]);

        // interior cavity — open at bottom, ceiling at top
        translate([face_wall, side_wall, 0])
            cube([cap_inner_w, cap_inner_d, cap_h - 3.0]);

        // side magnet pockets — left inner face
        // aligns with body magnets when cap is slid to closed position
        translate([face_wall - 1, cap_outer_d/2, cap_h - overlap/2])
            rotate([0, 90, 0])
                cylinder(r=mag_r, h=mag_dep + 1);

        // side magnet pockets — right inner face
        translate([face_wall + cap_inner_w - mag_dep, cap_outer_d/2, cap_h - overlap/2])
            rotate([0, 90, 0])
                cylinder(r=mag_r, h=mag_dep + 1);
    }
}

// ─── RENDER ────────────────────────────────────────────────────
color("sienna") body();
logo_cap();
translate([outer_w + 40, 0, 0])
    color("dimgray") cap();
