// PrimeBind Influencer Case — V3.2
// Reference: user-provided image — white rounded capsule case with side barrel hinge
//
// KEY DESIGN POINTS:
//   - Very rounded exterior (pill cross-section, r_edge=8mm)
//   - Cap same exact footprint as body — flush seam, no external overlap
//   - Cap sits ON TOP, same exterior profile, ~20% of total height
//   - Barrel hinge on right face (visible side mechanism, 3-knuckle, pin in Y direction)
//   - Magnets at LEFT and RIGHT tips of body top face / cap bottom face
//   - Logo larger, rotated +90° on front face
//
// HOW IT WORKS:
//   Body:  tall sleeve, floor at Z=0, open at top (Z=body_h)
//   Cap:   same outer dims as body, closed ceiling, open at bottom — sits flush on top
//   Binder: open edge DOWN on body floor, spine up through cap ceiling zone
//   Open:  flip cap back on hinge, reach in via finger notch
//
// PRINT STRATEGY (K2 Plus CFS, 2 filaments):
//   BLACK:  body + cap
//   WHITE:  logo_cap() — fills front face pocket flush
//
// PRINT ORIENTATION:
//   Body: front face on bed (logo face down) — best logo surface quality
//         Footprint ≈ outer_w × body_h (280 × 280mm), Height = outer_d (42mm)
//   Cap:  open bottom on bed — Footprint ≈ outer_w × outer_d, Height = cap_h (73mm)
//
// EXPORT (comment out unused modules before each export):
//   1. body_black.stl  → comment out: cap(), logo_cap()
//   2. cap_black.stl   → comment out: body(), logo_cap()
//   3. logo_white.stl  → comment out: body(), cap()

// ─── BINDER DIMENSIONS ─────────────────────────────────────────
binder_w   = 260;
binder_d   = 34;
binder_h   = 350;

// ─── WALLS ─────────────────────────────────────────────────────
fit_gap    = 2.0;
face_wall  = 3.0;   // front and back walls (no magnets)
side_wall  = 9.0;   // left/right walls — 9mm safely seats 8×3mm magnet in top face

// ─── GEOMETRY ──────────────────────────────────────────────────
inner_w    = binder_w + fit_gap;          // 262
inner_d    = binder_d + fit_gap;          // 36
outer_w    = inner_w + 2*side_wall;       // 280
outer_d    = inner_d + 2*face_wall;       // 42
floor_t    = 3.0;
r_edge     = 8.0;   // exterior edge rounding — aggressive pill shape per reference

// ─── HEIGHTS ───────────────────────────────────────────────────
// body_h increased so binder spine sits lower, away from hinge zone
// cap_h hardcoded short so hinge doesn't catch on binder top
body_h     = 311;
cap_h      = 45;   // 30/70 split of 16mm shortfall — total interior now 350mm

// ─── MAGNETS (tips of side walls, Z-axis pockets) ──────────────
mag_r      = 4.2;   // 8×3mm disc + 0.4mm tolerance
mag_dep    = 3.2;   // 3mm thick + 0.2mm tolerance
mag_y      = outer_d / 2;                // centered front-to-back

// ─── HINGE (barrel, BACK face, axis in X direction) ────────────
// Back face = Y=outer_d, opposite the logo face — hinge at top
k_r        = 4.0;   // knuckle radius
pin_r      = 1.7;   // M3 pin radius
k_w        = 18.0;  // knuckle width in X direction (each knuckle)
k_gap      = 0.5;   // tolerance between knuckles

// 3 knuckles centered on outer_w, interleaved in X at Y=outer_d back face
// Body: 2 outer knuckles | Cap: 1 center knuckle
// Total span in X: 3×k_w + 2×k_gap = 55mm, centered at outer_w/2
k_span     = 3*k_w + 2*k_gap;           // 55mm
k_x0       = (outer_w - k_span) / 2;    // left edge of knuckle group = 112.5
// knuckle axis sits behind back face at Y=outer_d+k_r, Z=body_h (junction top)

// ─── FINGER NOTCH ──────────────────────────────────────────────
notch_r    = 14.0;

// ─── LOGO ──────────────────────────────────────────────────────
logo_depth = 3.0;
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

// ─── HINGE KNUCKLE (back face, axis in X direction) ────────────
// Called at translate([x_pos, outer_d + k_r, z_pos]) — knuckle cylinder
// sits behind the back face, tab connects it back down/up to the face.
// body_side=true: tab drops DOWN (Z negative) into body zone
// body_side=false: tab rises UP (Z positive) into cap zone
module back_knuckle(x_pos, z_pos, body_side) {
    kr_use = body_side ? k_r : k_r - k_gap;
    translate([x_pos, outer_d + k_r, z_pos])
        difference() {
            union() {
                // barrel cylinder, axis in X direction
                rotate([0, 90, 0]) cylinder(r=kr_use, h=k_w);
                // backing tab: connects barrel to back face (Y=outer_d)
                translate([0, -k_r, body_side ? -k_r : 0])
                    cube([k_w, k_r, k_r]);
            }
            // pin hole along X through full knuckle width
            rotate([0, 90, 0]) cylinder(r=pin_r, h=k_w + 1);
        }
}

// ─── BODY ──────────────────────────────────────────────────────
module body() {
    difference() {
        union() {
            rrect_flat_top(outer_w, outer_d, body_h, r_edge);

            // body knuckle LEFT — sits on back face at Z=body_h, drops tab downward
            back_knuckle(k_x0, body_h, true);

            // body knuckle RIGHT
            back_knuckle(k_x0 + 2*k_w + 2*k_gap, body_h, true);
        }

        // interior cavity: open at top, closed floor
        translate([side_wall, face_wall, floor_t])
            cube([inner_w, inner_d, body_h]);

        // logo pocket on front face (Y=0)
        logo_pocket_front();

        // finger notch: shallow indent at center top of front face — lift cue, not a hole
        translate([outer_w/2, -1, body_h])
            rotate([-90, 0, 0])
                cylinder(r=notch_r, h=2.0);

        // magnet pocket: top of LEFT side wall tip
        translate([side_wall/2, mag_y, body_h - mag_dep])
            cylinder(r=mag_r, h=mag_dep + 1);

        // magnet pocket: top of RIGHT side wall tip
        translate([outer_w - side_wall/2, mag_y, body_h - mag_dep])
            cylinder(r=mag_r, h=mag_dep + 1);

        // clearance for cap center knuckle (extends k_r below body_h into body zone)
        translate([k_x0 + k_w, outer_d - 1, body_h - k_r])
            cube([k_w + 2*k_gap, k_r*2 + 2, k_r + 1]);
    }
}

// ─── CAP ───────────────────────────────────────────────────────
module cap() {
    difference() {
        union() {
            rrect_flat_bottom(outer_w, outer_d, cap_h, r_edge);

            // cap center knuckle — at Z=0 (bottom of cap = junction), tab rises upward
            back_knuckle(k_x0 + k_w + k_gap, 0, false);
        }

        // interior: open at bottom, 3mm ceiling at top
        translate([side_wall, face_wall, 0])
            cube([inner_w, inner_d, cap_h - face_wall]);

        // magnet pocket: bottom of LEFT side wall tip
        translate([side_wall/2, mag_y, -1])
            cylinder(r=mag_r, h=mag_dep + 1);

        // magnet pocket: bottom of RIGHT side wall tip
        translate([outer_w - side_wall/2, mag_y, -1])
            cylinder(r=mag_r, h=mag_dep + 1);

        // clearance for body outer knuckles (extend k_r above body_h into cap zone)
        for (bkx = [k_x0, k_x0 + 2*k_w + 2*k_gap])
            translate([bkx, outer_d - 1, -k_r])
                cube([k_w, k_r*2 + 2, k_r + 1]);
    }
}

// ─── RENDER ────────────────────────────────────────────────────
color("sienna") body();
logo_cap();
translate([0, 0, body_h + 20])
    color("dimgray") cap();
