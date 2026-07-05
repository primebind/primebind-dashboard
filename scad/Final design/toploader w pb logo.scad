// PrimeBind Toploader Case — Test Piece
// Internal: 76mm W (X) × 2mm D (Y) × 102mm H (Z total, body + cap)
// Body: 81mm interior (~80%) | Cap: 21mm interior (~20%)
// Front face (Y=0): window with 3mm border lip — card visible, can't fall forward
// Back face (Y=outer_d): PrimeBind logo cutout, 2mm backing
// Cap: Josef name deboss only
//
// PRINT:
//   Body: STANDING — pause at printer Z ≈ 80mm, insert 2 magnets, resume
//   Cap:  CEILING-DOWN — pause at printer Z ≈ 21mm, insert 2 magnets, resume
//   Print sequence: BY LAYER to enable Add Pause
//
// EXPORT:
//   RENDER = "body" → toploader_body.stl
//   RENDER = "cap"  → toploader_cap.stl

// ─── INTERNAL DIMENSIONS ───────────────────────────────────────
inner_w   = 76.0;    // X — card width
inner_d   = 2.0;     // Y — card depth

// ─── WALLS ─────────────────────────────────────────────────────
face_wall = 4.0;
side_wall = 8.0;
floor_t   = 3.0;

// ─── WINDOW — sized to show only the Pokemon card ──────────────
card_w      = 63.0;   // Pokemon card width (confirmed 63×88mm standard)
card_h      = 88.0;   // Pokemon card height
card_bottom = 4.0;    // card sits 4mm from interior floor
win_w      = card_w;
win_x      = side_wall + (inner_w - win_w) / 2;          // centered: 18.5mm
win_z      = floor_t + card_bottom;                       // 7mm
cap_win_h  = floor_t + card_bottom + card_h - body_h;    // 12mm — card top inside cap

// ─── OUTER GEOMETRY ────────────────────────────────────────────
outer_w   = inner_w + 2*side_wall;    // 100mm
outer_d   = inner_d + 2*face_wall;    // 10mm
r_edge    = 4.0;

// ─── HEIGHTS (80/20 split) ─────────────────────────────────────
body_h    = 95.0;    // floor 3mm + interior 92mm (window shows full 88mm card)
cap_h     = 14.0;    // ceiling 4mm + interior 10mm

// ─── MAGNETS — 3×3mm discs, 2 pockets, one per side wall ───────
mag_r        = 1.8;    // pocket half-width (3.6mm opening, 0.3mm clearance per side)
mag_dep      = 3.2;
mag_seal     = 0.8;
mag_corner_x = side_wall / 2;
mag_cy       = outer_d / 2;
snap_r       = 1.5;    // snap lip half-width = exact magnet radius (3.0mm, zero clearance)
snap_h       = 1.0;    // height of snap constriction — magnet snaps past, can't fly back out

// ─── LOGO (back face) ──────────────────────────────────────────
logo_scale = 0.27;
logo_cx    = 101;   // +4 to compensate for side_wall 12→8 (outer_w/2 shifts -4mm)
logo_cz    = 83;
logo_depth = 2.0;

// ─── NAME TAG (cap front face) ─────────────────────────────────
name_text  = "Josef";
name_size  = 11;
name_font  = "Bunken Tech Sans Pro ExBd:style=Italic";
name_depth = 1.5;

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

// ─── LOGO ──────────────────────────────────────────────────────
module logo_profile() {
    translate([-1122.52/2, -793.70/2])
        import("primebindlogo.svg");
}

// Logo on front face (Y=0) — same approach as binder case
module logo_pocket_front() {
    translate([outer_w/2 + logo_cx, logo_depth + 1, body_h/2 + logo_cz])
        rotate([90, 0, 0])
            scale([logo_scale, logo_scale, 1])
                linear_extrude(height = logo_depth + 1)
                    logo_profile();
}

// ─── NAME POCKET (cap front face) ──────────────────────────────
module name_pocket_front() {
    translate([outer_w/2, name_depth + 1, cap_h/2 - 2])
        rotate([90, 0, 0])
            linear_extrude(height = name_depth + 1)
                text(name_text, size = name_size, font = name_font,
                     halign = "center", valign = "center");
}

// ─── BODY ──────────────────────────────────────────────────────
module body() {
    difference() {
        rrect_flat_top(outer_w, outer_d, body_h, r_edge);

        // interior cavity
        translate([side_wall, face_wall, floor_t])
            cube([inner_w, inner_d, body_h]);

        // front face logo cutout
        logo_pocket_front();

        // back face window — card-sized opening, hides toploader border
        translate([win_x, outer_d - face_wall, win_z])
            cube([win_w, face_wall, body_h - win_z]);

        // 2 square magnet pockets — body: snap lip at TOP (entry), main pocket below
        for (mx = [mag_corner_x, outer_w - mag_corner_x]) {
            // main pocket — full clearance
            translate([mx - mag_r, mag_cy - mag_r, body_h - mag_dep - mag_seal])
                cube([mag_r*2, mag_r*2, mag_dep - snap_h]);
            // snap lip — tight fit, magnet snaps past and is held below
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

        // 2 square magnet pockets — cap: snap lip at BOTTOM in SCAD (entry when ceiling-down)
        for (mx = [mag_corner_x, outer_w - mag_corner_x]) {
            // snap lip — entry point (SCAD Z=mag_seal), magnet snaps past into main pocket
            translate([mx - snap_r, mag_cy - snap_r, mag_seal])
                cube([snap_r*2, snap_r*2, snap_h]);
            // main pocket — full clearance above snap lip
            translate([mx - mag_r, mag_cy - mag_r, mag_seal + snap_h])
                cube([mag_r*2, mag_r*2, mag_dep - snap_h]);
        }
    }
}

// ─── RENDER ────────────────────────────────────────────────────
// RENDER = "both"  → preview assembled with gap
// RENDER = "body"  → export body STL
// RENDER = "cap"   → export cap STL
// "body" → export toploader_body.stl
// "cap"  → export toploader_cap.stl
// "both" → preview assembled with gap
RENDER = "both";

if (RENDER == "both" || RENDER == "body") color("white") body();
if (RENDER == "both" || RENDER == "cap")  color("white") translate([0, 0, body_h + 40]) cap();
