// PrimeBind 9PB Binder Box — 4-Corner Magnet Lift-Off Lid (V2)
//
// CHANGES FROM V1:
//   - No hinge — lid lifts straight off, held by 4 corner magnets
//   - Back wall thickened to 12mm (matches front) to seat rear magnets
//   - outer_d: 240 → 252mm so interior depth stays ~228mm (same as v1)
//   - 3 vent holes in base floor — prevents vacuum when removing binder
//
// PRINT STRATEGY (K2 Plus CFS — 2 filaments):
//   BLACK spool: base tray + lid body
//   WHITE spool: logo cap (fills lid pocket flush)
//
// EXPORT & SLICER WORKFLOW:
//   1. Comment out lid() + logo_cap() → File > Export > STL → base_black.stl
//   2. Comment out base() + logo_cap() → File > Export > STL → lid_black.stl
//   3. Comment out base() + lid()     → File > Export > STL → logo_white.stl
//   4. Open OrcaSlicer → Import as Multi-Material
//      Assign black to base + lid, white to logo cap
//
// ASSEMBLY:
//   1. Press 8×3mm magnets into all 8 pockets (4 in base top, 4 in lid bottom)
//   2. Test polarity before gluing — front pair must attract to front pair, etc.
//   3. CA glue to seat magnets flush

// ─── BOX PARAMETERS ────────────────────────────────────────────
outer_w  = 290;    // box outer width (X)
outer_d  = 252;    // box outer depth (Y) — increased from 240 to keep interior depth
outer_h  = 55;     // base tray height (Z)
wall     = 1.5;    // side wall thickness
front_w  = 12.0;   // front wall — seats 2 front magnets
back_w   = 12.0;   // back wall — seats 2 rear magnets
lid_t    = 5.0;    // lid panel thickness

// ─── MAGNET PARAMETERS ─────────────────────────────────────────
mag_r    = 4.2;    // pocket radius (8mm disc + 0.4 tolerance)
mag_dep  = 3.2;    // pocket depth (3mm disc + 0.2 tolerance)
mag_x    = 70;     // X offset from centerline (puts magnets near corners)

// ─── VENT HOLES ────────────────────────────────────────────────
vent_r   = 3.0;    // 6mm diameter — small enough to be subtle
vent_count = 3;    // evenly spaced across base floor

// ─── LOGO PARAMETERS ───────────────────────────────────────────
logo_depth = 3.0;
logo_scale = 0.50;
logo_dx    = 130;
logo_dy    = -180;

$fn = 32;

// ─── DERIVED ───────────────────────────────────────────────────
inner_w = outer_w - 2*wall;
inner_d = outer_d - front_w - back_w;  // ~228mm

// ─── LOGO PROFILE (2D) ─────────────────────────────────────────
module logo_profile() {
    rotate([0, 0, -90])
        translate([-1122.52/2, -793.70/2])
            import("primebindlogo.svg");
}

module logo_pocket() {
    translate([outer_w/2 + logo_dx, outer_d/2 + logo_dy, lid_t - logo_depth])
        scale([logo_scale, logo_scale, 1])
            linear_extrude(height = logo_depth + 1)
                logo_profile();
}

module logo_cap() {
    color("white")
    translate([outer_w/2 + logo_dx, outer_d/2 + logo_dy, lid_t - logo_depth])
        scale([logo_scale, logo_scale, 1])
            linear_extrude(height = logo_depth)
                logo_profile();
}

// ─── BASE ──────────────────────────────────────────────────────
module base() {
    difference() {
        cube([outer_w, outer_d, outer_h]);
        // interior cavity
        translate([wall, front_w, wall])
            cube([inner_w, inner_d, outer_h - wall + 1]);
        // 4 corner magnet pockets in top face
        for (pos = [
            [outer_w/2 - mag_x, front_w/2],           // front-left
            [outer_w/2 + mag_x, front_w/2],           // front-right
            [outer_w/2 - mag_x, outer_d - back_w/2],  // back-left
            [outer_w/2 + mag_x, outer_d - back_w/2]   // back-right
        ])
            translate([pos[0], pos[1], outer_h - mag_dep])
                cylinder(r = mag_r, h = mag_dep + 1);
        // floor vent holes — hidden under box, prevent vacuum when removing binder
        for (i = [0 : vent_count - 1])
            translate([
                wall + (inner_w / (vent_count + 1)) * (i + 1),
                outer_d / 2,
                -1
            ])
                cylinder(r = vent_r, h = wall + 2);
    }
}

// ─── LID ───────────────────────────────────────────────────────
module lid() {
    difference() {
        cube([outer_w, outer_d, lid_t]);
        logo_pocket();
        // 4 corner magnet pockets in bottom face
        for (pos = [
            [outer_w/2 - mag_x, front_w/2],           // front-left
            [outer_w/2 + mag_x, front_w/2],           // front-right
            [outer_w/2 - mag_x, outer_d - back_w/2],  // back-left
            [outer_w/2 + mag_x, outer_d - back_w/2]   // back-right
        ])
            translate([pos[0], pos[1], -1])
                cylinder(r = mag_r, h = mag_dep + 1);
    }
}

// ─── RENDER ────────────────────────────────────────────────────
color("sienna") base();
translate([0, outer_d + 50, 0]) {
    color("dimgray") lid();
    logo_cap();
}
