// PrimeBind 9PB Binder Box — Book-Style Hinge + Magnet Closure + CFS Logo
//
// PRINT STRATEGY (K2 Plus CFS — 2 filaments):
//   BLACK spool: base tray + lid body
//   WHITE spool: logo cap (fills the lid pocket flush)
//   The slicer assembles them into one print — no glue, no post-work
//
// EXPORT & SLICER WORKFLOW:
//   1. Export base:     comment out lid() and logo_cap() → File > Export > STL → base_black.stl
//   2. Export lid body: comment out base() and logo_cap() → File > Export > STL → lid_black.stl
//   3. Export logo cap: comment out base() and lid() → File > Export > STL → logo_white.stl
//   4. Open OrcaSlicer → File > Import > Import as Multi-Material
//      Assign black to base_black.stl + lid_black.stl, white to logo_white.stl
//      Slicer handles purge tower + color switching automatically
//
// ASSEMBLY (after printing):
//   1. Interlock 3 knuckles — base outer two + lid center
//   2. Slide M3 screw through all 3 as hinge pin
//   3. Press 8x3mm magnets into pockets — test polarity first (must attract, not repel)

// ─── BOX PARAMETERS ────────────────────────────────────────────
outer_w   = 290;   // box outer width (X)
outer_d   = 240;   // box outer depth (Y) — hinge at back face
outer_h   = 55;    // base tray height (Z)
wall      = 1.5;   // side, back, and floor thickness
front_w   = 12.0;  // front wall thickness — must be > mag_r*2 + clearance to hide pockets
lid_t     = 5.0;   // lid panel thickness

k_r       = 4.0;   // knuckle radius (8mm OD)
pin_r     = 1.7;   // pin hole radius (3.4mm — M3 + 0.4 clearance)
k_w       = 25.0;  // knuckle segment width
k_gap     = 0.5;   // clearance between adjacent knuckle faces

mag_r     = 4.2;   // magnet pocket radius (8mm disc + 0.4 tolerance)
mag_dep   = 3.2;   // magnet pocket depth (3mm disc + 0.2 tolerance)
mag_x     = 70;    // X offset from centerline for each magnet

// ─── LOGO PARAMETERS ───────────────────────────────────────────
logo_depth = 3.0;  // how deep the pocket is + how tall the white cap is
logo_scale = 0.50; // SVG 1122x793 rotated — larger fill
logo_dx    = 130;  // fine-tune X (height)
logo_dy    = -180; // fine-tune Y (left/right)

$fn = 32;

// ─── DERIVED ───────────────────────────────────────────────────
inner_w = outer_w - 2 * wall;
inner_d = outer_d - wall - front_w;

total_k = 3 * k_w + 2 * k_gap;
k0      = (outer_w - total_k) / 2;
bk1_x   = k0;
lk_x    = k0 + k_w + k_gap;
bk2_x   = k0 + 2 * k_w + 2 * k_gap;

// ─── LOGO PROFILE (2D) ─────────────────────────────────────────
module logo_profile() {
    rotate([0, 0, -90])
        translate([-1122.52/2, -793.70/2])
            import("primebindlogo.svg");
}

// ─── LOGO POCKET (recessed into top face of lid) ───────────────
module logo_pocket() {
    translate([outer_w/2 + logo_dx, outer_d/2 + logo_dy, lid_t - logo_depth])
        scale([logo_scale, logo_scale, 1])
            linear_extrude(height = logo_depth + 1)
                logo_profile();
}

// ─── LOGO CAP (white piece — fills pocket flush) ───────────────
// Export this STL and assign WHITE filament in OrcaSlicer
module logo_cap() {
    color("white")
    translate([outer_w/2 + logo_dx, outer_d/2 + logo_dy, lid_t - logo_depth])
        scale([logo_scale, logo_scale, 1])
            linear_extrude(height = logo_depth)
                logo_profile();
}

// ─── KNUCKLE CYLINDER ──────────────────────────────────────────
module knuckle_cyl(x_start) {
    translate([x_start, outer_d, k_r])
        rotate([0, 90, 0])
            difference() {
                cylinder(r = k_r, h = k_w);
                translate([0, 0, -1]) cylinder(r = pin_r, h = k_w + 2);
            }
}

// ─── BASE ──────────────────────────────────────────────────────
module base() {
    difference() {
        union() {
            cube([outer_w, outer_d, outer_h]);
            translate([bk1_x, outer_d - wall, outer_h]) cube([k_w, wall, k_r]);
            translate([bk2_x, outer_d - wall, outer_h]) cube([k_w, wall, k_r]);
            translate([0, 0, outer_h]) knuckle_cyl(bk1_x);
            translate([0, 0, outer_h]) knuckle_cyl(bk2_x);
        }
        translate([wall, front_w, wall])
            cube([inner_w, inner_d, outer_h - wall + 1]);
        for (mx = [outer_w/2 - mag_x, outer_w/2 + mag_x])
            translate([mx, front_w / 2, outer_h - mag_dep])
                cylinder(r = mag_r, h = mag_dep + 1);
    }
}

// ─── LID BODY (black — has logo pocket) ────────────────────────
module lid() {
    difference() {
        union() {
            cube([outer_w, outer_d, lid_t]);
            translate([lk_x, outer_d - wall, 0]) cube([k_w, wall, k_r * 2]);
            knuckle_cyl(lk_x);
        }
        logo_pocket();
        for (mx = [outer_w/2 - mag_x, outer_w/2 + mag_x])
            translate([mx, front_w / 2, -1])
                cylinder(r = mag_r, h = mag_dep + 1);
    }
}

// ─── RENDER ────────────────────────────────────────────────────
// Preview shows assembled lid (black body + white logo cap together)
// Comment out pieces individually to export each STL
color("sienna") base();
translate([0, outer_d + 50, 0]) {
    color("dimgray") lid();   // BLACK — export as lid_black.stl
    logo_cap();              // WHITE — export as logo_white.stl
}
