// PrimeBind Influencer Case — V3.4
// Reference: user-provided image — white rounded capsule case, magnet-close lid
//
// KEY DESIGN POINTS:
//   - Very rounded exterior (pill cross-section, r_edge=8mm)
//   - Cap same exact footprint as body — flush seam, no external overlap
//   - Cap sits ON TOP, same exterior profile, ~20% of total height
//   - 4 corner magnets: sealed inside body (pause-at-layer) + cap (pre-place on bed)
//   - Logo larger, rotated +90° on front face
//
// HOW IT WORKS:
//   Body:  tall sleeve, floor at Z=0, open at top (Z=body_h)
//   Cap:   same outer dims as body, closed ceiling, open at bottom — sits flush on top
//   Binder: open edge DOWN on body floor, spine up through cap ceiling zone
//   Open:  lift cap straight up (magnets release), reach in via finger notch
//
// PRINT STRATEGY (K2 Plus CFS, 2 filaments):
//   BLACK:  body + cap
//   WHITE:  logo_cap() — fills front face pocket flush
//
// PRINT ORIENTATION:
//   Body: STANDING — floor on bed, junction face at ceiling — best logo surface quality
//         Footprint ≈ outer_w × body_h (280 × 280mm), Height = outer_d (42mm)
//   Cap:  CEILING-DOWN — ceiling on bed, junction face at ceiling
//         Footprint ≈ outer_w × outer_d, Height = cap_h (73mm)
//
// EXPORT (comment out unused modules before each export):
//   1. body_black.stl  → comment out: cap()   [logo shape is a through-hole]
//   2. cap_black.stl   → comment out: body()  [JOSEF debossed on front face]
//   NOTE: to change the name, edit name_text at the top of this file
//   NOTE: uncomment logo_cap() in RENDER if you ever want a filled logo insert instead

// ─── BINDER DIMENSIONS ─────────────────────────────────────────
binder_w   = 264.7;  // inner_w = 266.7mm = 10.50" internal length
binder_d   = 39;     // inner_d = 41mm internal depth
binder_h   = 350;

// ─── WALLS ─────────────────────────────────────────────────────
fit_gap    = 2.0;
face_wall  = 4.0;   // front and back walls — 4mm leaves 1mm backing behind logo pocket
side_wall  = 12.0;  // left/right walls — 12mm safely seats 8×3mm magnet with 1.7mm wall each side

// ─── GEOMETRY ──────────────────────────────────────────────────
inner_w    = binder_w + fit_gap;          // 262
inner_d    = binder_d + fit_gap;          // 36
outer_w    = inner_w + 2*side_wall;       // 280
outer_d    = inner_d + 2*face_wall;       // 42
floor_t    = 3.0;
r_edge     = 8.0;   // exterior edge rounding — aggressive pill shape per reference

// ─── HEIGHTS ───────────────────────────────────────────────────
body_h     = 319.9;  // body internal = 316.865mm; total internal = 316.865 + 41.275 = 358.14mm = 14.10"
cap_h      = 45;     // cap internal = 41.275mm

// ─── MAGNETS (4 corners, Z-axis pockets, sealed inside with pause-at-layer) ──
mag_r        = 4.3;   // 8mm magnet + 0.6mm clearance = drops in easily, sealed by print
mag_dep      = 3.2;   // 3mm magnet + 0.2mm tolerance
mag_seal     = 0.8;   // sealed skin above pocket (4 × 0.2mm layers) — printer pauses here
mag_corner_x = side_wall / 2;    // 4.5mm — centered in 9mm side wall
mag_corner_y = 8.0;              // 8mm from front/back outer face

// ─── FINGER NOTCH ──────────────────────────────────────────────
notch_r    = 14.0;

// ─── NAME TAG (debossed into cap ceiling exterior) ──────────────
name_text  = "JOSEF";
name_size  = 22;        // character height mm — adjust to taste
name_font  = "Bunken Tech Sans Pro ExBd:style=Italic";  // primebindfont.ttf — must be in same folder as this .scad file
name_depth = 1.5;       // how deep to cut into the front face

// ─── LOGO ──────────────────────────────────────────────────────
logo_depth = 2.0;   // 2mm deboss + 1mm backing (face_wall=4mm, pocket=3mm, backing=1mm)
logo_scale = 0.55;
logo_cx    = 197;    // X offset from face center (+ = right)
logo_cz    = 160;    // Z offset from body center (+ = up)

$fn = 32;

// ─── ROUNDED BOX VARIANTS ──────────────────────────────────────
// All edges rounded (not used directly but kept for reference)
module rrect(x, y, z, r) {
    hull() {
        for (xi = [r, x-r]) for (yi = [r, y-r]) for (zi = [r, z-r])
            translate([xi, yi, zi]) sphere(r=r, $fn=16);
    }
}
// Rounded sides + bottom, FLAT top edge — used for body
// Top face and top perimeter edge are perfectly sharp/straight
module rrect_flat_top(x, y, z, r) {
    hull() {
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, r]) sphere(r=r, $fn=16);
        translate([0, 0, z-0.01]) cube([x, y, 0.01]);
    }
}
// Rounded sides + top, FLAT bottom edge — used for cap
// Bottom face and bottom perimeter edge are perfectly sharp/straight
module rrect_flat_bottom(x, y, z, r) {
    hull() {
        cube([x, y, 0.01]);
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, z-r]) sphere(r=r, $fn=16);
    }
}

// ─── LOGO PROFILE ──────────────────────────────────────────────
module logo_profile() {
    rotate([0, 0, 0])               // +90° from v3.1 (was -90°); dial in after render
        translate([-1122.52/2, -793.70/2])
            import("primebindlogo.svg");
}

// rotate([90,0,0]) maps 2D XY onto XZ plane; extrude direction is -Y
// so we start the translate at Y=logo_depth+1 so the shape occupies Y=0..logo_depth+1
// (cuts INTO the front face when differenced from body)
module logo_pocket_front() {
    translate([outer_w/2 + logo_cx, logo_depth + 1, body_h/2 + logo_cz])
        rotate([90, 0, 0])
            scale([logo_scale, logo_scale, 1])
                linear_extrude(height = logo_depth + 1)
                    logo_profile();
}

// cap starts at Y=logo_depth so it fills the pocket from Y=logo_depth down to Y=0 — flush
module logo_cap() {
    color("white")
    translate([outer_w/2 + logo_cx, logo_depth, body_h/2 + logo_cz])
        rotate([90, 0, 0])
            scale([logo_scale, logo_scale, 1])
                linear_extrude(height = logo_depth)
                    logo_profile();
}

// ─── BODY ──────────────────────────────────────────────────────
module body() {
    difference() {
        rrect_flat_top(outer_w, outer_d, body_h, r_edge);

        // interior cavity: open at top, closed floor
        translate([side_wall, face_wall, floor_t])
            cube([inner_w, inner_d, body_h]);

        // logo pocket on front face (Y=0)
        logo_pocket_front();

// 4 corner magnet pockets — sealed: mag_seal skin at junction face (Z=body_h)
        // Body prints STANDING → pause at printer Z ≈ 316mm, insert magnets, resume
        for (mx = [mag_corner_x, outer_w - mag_corner_x])
            for (my = [mag_corner_y, outer_d - mag_corner_y])
                translate([mx, my, body_h - mag_dep - mag_seal])
                    cylinder(r=mag_r, h=mag_dep);

    }
}

// ─── NAME TAG MODULE ───────────────────────────────────────────
// Debossed into cap front face (Y=0) — same side as PB logo on body
// Mirrors logo_pocket_front(): rotates text into X-Z plane, cuts into Y=0
module name_pocket_front() {
    translate([outer_w/2 - 0.2, name_depth + 1, cap_h/2 - 4])
        rotate([90, 0, 0])
            linear_extrude(height = name_depth + 1)
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

        // name debossed into front face (Y=0) — same side as PB logo
        name_pocket_front();

        // 4 corner magnet pockets — sealed: mag_seal skin at junction face (Z=0)
        // Cap prints CEILING-DOWN → pause at printer Z ≈ 41mm, insert magnets, resume
        for (mx = [mag_corner_x, outer_w - mag_corner_x])
            for (my = [mag_corner_y, outer_d - mag_corner_y])
                translate([mx, my, mag_seal])
                    cylinder(r=mag_r, h=mag_dep);

    }
}

// ─── RENDER ────────────────────────────────────────────────────
color("sienna") body();
// logo_cap();  ← removed: logo shape is a through-hole, not a filled pocket
translate([0, 0, body_h + 20])
    color("dimgray") cap();
