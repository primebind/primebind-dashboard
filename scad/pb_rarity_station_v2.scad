// PrimeBind TCG Rarity Station — V2
// Companion to TCG Content Backdrop. Sits flat on table in front of the backdrop.
//
// Zone order LEFT → RIGHT: HIT (rarest, smallest bucket) → C (most common, biggest bucket)
// All zones share the same base height — uniform yellow floor, buckets rise above it.
// Bucket SIZE (width × wall height) is proportional to how many cards you pull per pack.
//
//   HIT  50mm wide  15mm deep  — rarely fills, small bucket
//   R    52mm wide  20mm deep
//   RH   55mm wide  25mm deep  — 1 guaranteed per pack
//   U    68mm wide  30mm deep  — 3 per pack
//   C    76mm wide  40mm deep  — 6 per pack, biggest bucket
//
// PRINT: Single color (black). ~319mm × 100mm. Fits K2 Plus in one job, no supports.

// ─── CARD ─────────────────────────────────────────────────────────────────────
card_w = 63;

// ─── ZONE CONFIG — left to right: rarest → most common ───────────────────────
n_zones     = 5;
zone_widths = [50,    52,  55,   68,  76];   // HIT → C: narrower to wider
zone_wh     = [15,    20,  25,   30,  40];   // HIT → C: shallower to deeper bucket

// ─── BASE (uniform across all zones — this is the solid yellow floor) ─────────
base_floor_h = 12;    // ALL zones have this exact base height — buckets sit on top
base_d       = 100;   // depth front-to-back

// ─── BUCKET GEOMETRY ──────────────────────────────────────────────────────────
nub_d        = 5;     // front nub depth — catches card bottom edge
nub_h        = 8;     // front nub height above zone floor
back_wall_t  = 5;     // solid back wall at rear of each bucket

// ─── STRUCTURE ────────────────────────────────────────────────────────────────
outer_wall_t = 3;
div_t        = 3;     // divider thickness between zones
sym_dep      = 0.8;   // symbol emboss depth

// ─── DERIVED ──────────────────────────────────────────────────────────────────
total_w = outer_wall_t
        + zone_widths[0] + div_t
        + zone_widths[1] + div_t
        + zone_widths[2] + div_t
        + zone_widths[3] + div_t
        + zone_widths[4]
        + outer_wall_t;
// = 3 + 50+3 + 52+3 + 55+3 + 68+3 + 76 + 3 = 319mm ✓

function zone_x(i) = outer_wall_t
    + (i > 0 ? zone_widths[0] + div_t : 0)
    + (i > 1 ? zone_widths[1] + div_t : 0)
    + (i > 2 ? zone_widths[2] + div_t : 0)
    + (i > 3 ? zone_widths[3] + div_t : 0);

function zone_cx(i)  = zone_x(i) + zone_widths[i] / 2;
function zone_top(i) = base_floor_h + zone_wh[i];

$fn = 64;

// ─── STAR POLYGON ─────────────────────────────────────────────────────────────
module star_2d(r_out, r_in) {
    polygon([for (i = [0:9])
        let(a = i * 36 - 90, r = (i % 2 == 0) ? r_out : r_in)
        [r * cos(a), r * sin(a)]]);
}

// ─── RARITY SYMBOLS on front nub face ────────────────────────────────────────
// Centered vertically in the nub area (base_floor_h to base_floor_h+nub_h).
// Always visible from the front even with a card in the slot.
sym_cz = base_floor_h + nub_h / 2;   // = 16mm

module sym_hit(cx) {
    // ★★★ triple star — small, spread across narrow slot
    for (dx = [-9, 0, 9]) {
        translate([cx + dx, -0.1, sym_cz]) rotate([90, 0, 0])
        linear_extrude(sym_dep + 0.1) star_2d(3.8, 1.7);
    }
}

module sym_rare(cx) {
    // ★ filled star
    translate([cx, -0.1, sym_cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1) star_2d(5, 2.2);
}

module sym_rh(cx) {
    // ☆ open star — foil but not a hit
    translate([cx, -0.1, sym_cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    difference() {
        star_2d(5, 2.2);
        scale([0.55, 0.55]) star_2d(5, 2.2);
    }
}

module sym_uncommon(cx) {
    // ◇ open diamond
    translate([cx, -0.1, sym_cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    rotate([0, 0, 45])
    difference() { square(9, center=true); square(5.5, center=true); }
}

module sym_common(cx) {
    // ◯ open ring
    translate([cx, -0.1, sym_cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    difference() { circle(r=4.5); circle(r=2.8); }
}

// ─── ZONE LABELS — small text on the base portion of front face ───────────────
module zone_labels() {
    labels = ["HIT", "R", "RH", "U", "C"];
    for (i = [0:4]) {
        translate([zone_cx(i), -0.1, base_floor_h / 2]) rotate([90, 0, 0])
        linear_extrude(sym_dep + 0.1)
        text(labels[i], size=4, font="Liberation Sans:style=Bold",
             halign="center", valign="center");
    }
}

// ─── BRANDING ─────────────────────────────────────────────────────────────────
module branding() {
    translate([total_w / 2, -0.1, 3]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    text("PRIMEBIND", size=5,
         font="Bunken Tech Sans Pro ExBd:style=ExtraBold Italic",
         halign="center", valign="center");
}

// ─── ZONE SOLID ───────────────────────────────────────────────────────────────
module zone_block(i) {
    translate([zone_x(i), 0, 0])
        cube([zone_widths[i], base_d, zone_top(i)]);
}

// ─── DIVIDER — height is max of adjacent zones ────────────────────────────────
module div_block(i) {
    h = max(zone_top(i), zone_top(i + 1));
    translate([zone_x(i) + zone_widths[i], 0, 0])
        cube([div_t, base_d, h]);
}

// ─── OUTER WALLS ──────────────────────────────────────────────────────────────
module outer_walls() {
    // Left — height of HIT zone (shortest)
    cube([outer_wall_t, base_d, zone_top(0)]);
    // Right — height of C zone (tallest)
    translate([total_w - outer_wall_t, 0, 0])
        cube([outer_wall_t, base_d, zone_top(4)]);
}

// ─── BUCKET CUTS ──────────────────────────────────────────────────────────────

// Main interior cut — the open bucket space
module slot_interior(i) {
    translate([zone_x(i), nub_d, base_floor_h])
        cube([zone_widths[i], base_d - nub_d - back_wall_t, zone_wh[i] + 1]);
}

// Open the front face above the nub so card face is visible from front
module slot_front_open(i) {
    translate([zone_x(i), -0.1, base_floor_h + nub_h])
        cube([zone_widths[i], nub_d + 0.2, zone_wh[i] - nub_h + 1]);
}

// ─── ASSEMBLY ─────────────────────────────────────────────────────────────────
difference() {
    union() {
        for (i = [0:4]) zone_block(i);
        for (i = [0:3]) div_block(i);
        outer_walls();
    }
    // Bucket openings
    for (i = [0:4]) {
        slot_interior(i);
        slot_front_open(i);
    }
    // Symbols and labels
    sym_hit(zone_cx(0));
    sym_rare(zone_cx(1));
    sym_rh(zone_cx(2));
    sym_uncommon(zone_cx(3));
    sym_common(zone_cx(4));
    zone_labels();
    branding();
}
