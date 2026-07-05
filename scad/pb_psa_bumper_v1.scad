// PrimeBind PSA Grade Card Bumper V1
// Perimeter frame for PSA graded cards — front and back fully open
// Body + cap snap together with magnets; card faces 100% exposed
//
// --- PSA STANDARD SLAB: 66×93×9.5mm + 1mm clearance per dimension
//
// --- EXPORT -------------------------------------------------------------------
//   1. pb_psa_body.stl   → RENDER = "body"   [black]
//   2. pb_psa_cap.stl    → RENDER = "cap"    [black or color]
//   3. pb_psa_stand.stl  → RENDER = "stand"  [black]
//   RENDER = "both" shows body + cap assembled for preview

$fn = 48;

// ─── PSA SLAB DIMS ─────────────────────────────────────────────
psa_w = 66.0;
psa_h = 93.0;
psa_d = 9.5;

// ─── INTERIOR (slab + 1mm clearance each dimension) ───────────
inner_w = psa_w + 1;    // 67.0mm
inner_d = psa_d + 1;    // 10.5mm
inner_h = psa_h + 1;    // 94.0mm — split between body + cap below

// ─── FRAME WALLS ───────────────────────────────────────────────
side_wall = 5.0;    // left + right walls only — no face walls
floor_t   = 3.0;    // body floor + cap ceiling
r_edge    = 3.0;

// ─── OUTER DIMS ────────────────────────────────────────────────
outer_w = inner_w + 2 * side_wall;   // 77mm
outer_d = inner_d;                    // 10.5mm — both faces open

// ─── HEIGHT SPLIT ──────────────────────────────────────────────
body_h = 80.0;   // body: 77mm interior (80-3)
cap_h  = 20.0;   // cap:  17mm interior (20-3) → total 94mm ✓

// ─── WINDOW LIP ────────────────────────────────────────────────
lip_w = 1.5;   // overhang on each side of window — card can't slide out face
lip_t = 1.5;   // lip depth front-to-back

// ─── MAGNETS (3mm disc, press-fit square pockets) ──────────────
mag_r    = 1.5;   // 3.0mm pocket = 3mm magnet press fit
mag_dep  = 3.2;
mag_seal = 0.8;
snap_r   = 1.2;   // 2.4mm snap lip — retains magnet during pause-at-layer
snap_h   = 1.0;

mag_lx = side_wall / 2;             // left mag X center  = 2.5mm
mag_rx = outer_w - side_wall / 2;   // right mag X center = 74.5mm
mag_cy = outer_d / 2;               // depth center       = 5.25mm

// ─── STAND ─────────────────────────────────────────────────────
lean   = 15;
base_w = outer_w + 16;   // 93mm oval width
base_d = 60.0;
base_h = 15.0;
g_dep  = 8.3;             // groove depth along lean axis (8mm vertical — no window to clear)

RENDER = "all";

// =============================================================================
// HELPER
// =============================================================================

module rbox(w, d, h, r) {
    hull() {
        for (xi = [r, w - r]) for (yi = [r, d - r])
            translate([xi, yi, 0]) cylinder(r=r, h=h);
    }
}

// =============================================================================
// BODY
// Frame: left wall + right wall + bottom floor. Front + back fully open.
// Slab drops in from top. Magnets at top face of each side wall.
// =============================================================================

module bumper_body() {
    difference() {
        rbox(outer_w, outer_d, body_h, r_edge);

        // interior channel — full inner width, between the two face lips
        translate([side_wall, lip_t, floor_t])
            cube([inner_w, outer_d - 2*lip_t, body_h]);
        // front face window — lip_w narrower each side, card can only enter from top
        translate([side_wall + lip_w, -0.01, floor_t])
            cube([inner_w - 2*lip_w, lip_t + 0.01, body_h]);
        // back face window
        translate([side_wall + lip_w, outer_d - lip_t, floor_t])
            cube([inner_w - 2*lip_w, lip_t + 0.01, body_h]);

        // left magnet pocket (snap lip at top — entry point)
        translate([mag_lx - mag_r, mag_cy - mag_r, body_h - mag_dep - mag_seal])
            cube([mag_r*2, mag_r*2, mag_dep - snap_h]);
        translate([mag_lx - snap_r, mag_cy - snap_r, body_h - mag_seal - snap_h])
            cube([snap_r*2, snap_r*2, snap_h]);

        // right magnet pocket
        translate([mag_rx - mag_r, mag_cy - mag_r, body_h - mag_dep - mag_seal])
            cube([mag_r*2, mag_r*2, mag_dep - snap_h]);
        translate([mag_rx - snap_r, mag_cy - snap_r, body_h - mag_seal - snap_h])
            cube([snap_r*2, snap_r*2, snap_h]);
    }
}

// =============================================================================
// CAP
// Left wall + right wall + top floor. Snaps down over body top.
// Magnets at bottom face — snap lip at bottom (entry when printed ceiling-down).
// =============================================================================

module bumper_cap() {
    difference() {
        rbox(outer_w, outer_d, cap_h, r_edge);

        // interior channel
        translate([side_wall, lip_t, 0])
            cube([inner_w, outer_d - 2*lip_t, cap_h - floor_t]);
        // front face window
        translate([side_wall + lip_w, -0.01, 0])
            cube([inner_w - 2*lip_w, lip_t + 0.01, cap_h - floor_t]);
        // back face window
        translate([side_wall + lip_w, outer_d - lip_t, 0])
            cube([inner_w - 2*lip_w, lip_t + 0.01, cap_h - floor_t]);

        // left magnet pocket (snap lip at bottom in SCAD — entry when ceiling-down)
        translate([mag_lx - snap_r, mag_cy - snap_r, mag_seal])
            cube([snap_r*2, snap_r*2, snap_h]);
        translate([mag_lx - mag_r, mag_cy - mag_r, mag_seal + snap_h])
            cube([mag_r*2, mag_r*2, mag_dep - snap_h]);

        // right magnet pocket
        translate([mag_rx - snap_r, mag_cy - snap_r, mag_seal])
            cube([snap_r*2, snap_r*2, snap_h]);
        translate([mag_rx - mag_r, mag_cy - mag_r, mag_seal + snap_h])
            cube([mag_r*2, mag_r*2, mag_dep - snap_h]);
    }
}

// =============================================================================
// STAND
// Same lean groove concept as toploader stand — resized for PSA bumper.
// Bumper has no window so groove can be deeper (8mm) for better grip.
// =============================================================================

module psa_stand() {
    cut_l = outer_w + 0.4;
    cut_w = outer_d + 0.4;

    difference() {
        scale([base_w / base_d, 1, 1])
            cylinder(r = base_d / 2, h = base_h);

        translate([0, 0, base_h])
            rotate([lean, 0, 0])
                translate([-cut_l/2, -cut_w/2, -g_dep])
                    rbox(cut_l, cut_w, g_dep + 1, r_edge);
    }
}

// =============================================================================
// RENDER
// =============================================================================

if      (RENDER == "body")  { color("white") bumper_body(); }
else if (RENDER == "cap")   { color("white") bumper_cap();  }
else if (RENDER == "stand") { color("white") psa_stand();   }
else if (RENDER == "both")  {
    color("white") bumper_body();
    translate([0, 0, body_h + 2]) color("white") bumper_cap();

} else if (RENDER == "all") {
    // Stand
    color("white") psa_stand();

    // Bumper assembled and standing in stand groove (15° lean)
    translate([0, 0, base_h])
    rotate([-lean, 0, 0]) {
        // body — rotated from print-flat to upright
        translate([-outer_w/2, -outer_d/2, 0])
        translate([0, outer_d, 0])
        rotate([90, 0, 0])
            color("white") bumper_body();

        // cap on top of body
        translate([-outer_w/2, -outer_d/2, body_h])
        translate([0, outer_d, 0])
        rotate([90, 0, 0])
            color("gray") bumper_cap();
    }
}
