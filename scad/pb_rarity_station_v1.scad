// PrimeBind TCG Rarity Station — V1
// Companion base to the TCG Content Backdrop. Sits flat on the table in front
// of the backdrop foot. Cards pulled from packs are placed in their rarity zone.
//
// ─── ZONES (left → right, common → rarest) ───────────────────────────────────
//   1. C   — Common         ◯ ring symbol
//   2. U   — Uncommon       ◇ diamond symbol
//   3. RH  — Reverse Holo   ☆ open star symbol
//   4. R   — Rare / ex      ★ filled star symbol
//   5. HIT — IR / SIR / MHR ★★★ triple star
//
// ─── PRINT ───────────────────────────────────────────────────────────────────
//   Single color (black). ~337mm × 100mm × 22mm.
//   Fits K2 Plus 350mm bed in one job. Print flat — no supports needed.
//   Multi-color option: export zones as separate STL for white rarity symbols.

// ─── CARD ────────────────────────────────────────────────────────────────────
card_w       = 63;    // Pokemon card width (short dimension)
card_h       = 88;    // Pokemon card height (long dimension)

// ─── ZONE CONFIG ─────────────────────────────────────────────────────────────
n_zones      = 5;
div_t        = 3.0;   // divider wall thickness between zones
wall_t       = 5.0;   // outer left/right wall thickness
back_wall_t  = 5.0;   // solid back wall thickness
front_lip_d  = 5.0;   // front lip depth — physical card stop
front_lip_h  = 12.0;  // front lip height above base floor — enough to hold cards in

// ─── OVERALL DIMENSIONS ──────────────────────────────────────────────────────
slot_w       = card_w + 2;    // 65mm — 1mm clearance per side for easy card placement
base_d       = 100.0;         // depth front-to-back
base_floor_h = 5.0;           // height of solid base floor below zone openings
zone_depth   = 16.0;          // depth of card slot (front-to-back inside zone)
zone_h       = card_h - 20;   // 68mm — visible card height above zone floor
div_h        = zone_h + 10;   // divider total height above floor (exceeds card so cards stay in zone)

total_w      = wall_t + n_zones * slot_w + (n_zones - 1) * div_t + wall_t;
// = 5 + 5×65 + 4×3 + 5 = 347mm ✓ fits K2 Plus

// ─── SLOPE ───────────────────────────────────────────────────────────────────
// Each zone has a sloped floor: lower at front (toward camera), higher at rear.
// Cards rest with bottom edge on zone floor, leaning back against rear wall.
// Slope rise: 8mm over zone_depth — gentle lean toward camera.
slope_rise   = 8.0;

// ─── SYMBOL EMBOSS ───────────────────────────────────────────────────────────
sym_dep      = 0.8;   // symbol cut depth (into front lip face)

$fn = 64;

// ─── DERIVED POSITIONS ───────────────────────────────────────────────────────
function zone_x(i) = wall_t + i * (slot_w + div_t);
function zone_cx(i) = zone_x(i) + slot_w / 2;

// ─── 5-POINT STAR POLYGON ────────────────────────────────────────────────────
module star_2d(r_out, r_in) {
    polygon([for (i = [0 : 9])
        let(a = i * 36 - 90)
        let(r = (i % 2 == 0) ? r_out : r_in)
        [r * cos(a), r * sin(a)]
    ]);
}

// ─── RARITY SYMBOLS (embossed on front lip face, Y=0 plane) ──────────────────

// Common — open circle ring ◯
module sym_common(cx) {
    cz = base_floor_h + front_lip_h * 0.5;
    translate([cx, -0.1, cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    difference() {
        circle(r = 7);
        circle(r = 4.5);
    }
}

// Uncommon — open diamond ◇
module sym_uncommon(cx) {
    cz = base_floor_h + front_lip_h * 0.5;
    translate([cx, -0.1, cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    rotate([0, 0, 45])
    difference() {
        square(13, center = true);
        square(8.5, center = true);
    }
}

// Reverse Holo — open star ☆
module sym_rh(cx) {
    cz = base_floor_h + front_lip_h * 0.5;
    translate([cx, -0.1, cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    difference() {
        star_2d(8, 3.5);
        scale([0.55, 0.55]) star_2d(8, 3.5);
    }
}

// Rare / ex — filled star ★
module sym_rare(cx) {
    cz = base_floor_h + front_lip_h * 0.5;
    translate([cx, -0.1, cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    star_2d(8, 3.5);
}

// HIT (IR/SIR/MHR) — three filled stars ★★★
module sym_hit(cx) {
    cz = base_floor_h + front_lip_h * 0.5;
    for (dx = [-12, 0, 12]) {
        translate([cx + dx, -0.1, cz]) rotate([90, 0, 0])
        linear_extrude(sym_dep + 0.1)
        star_2d(5, 2.2);
    }
}

// ─── ZONE LABEL TEXT (small rarity name below each symbol) ───────────────────
module zone_label(cx, label) {
    cz = base_floor_h + 3;
    translate([cx, -0.1, cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    text(label, size = 4.5,
         font = "Liberation Sans:style=Bold",
         halign = "center", valign = "center");
}

// ─── SLOPED ZONE FLOOR (wedge cut per zone) ───────────────────────────────────
// Removes a wedge from inside each zone so the floor slopes:
// lowest at Y = front_lip_d (front), highest at Y = front_lip_d + zone_depth (back).
// Cards rest on this slope, angled toward camera.
module zone_slope_cut(x) {
    floor_y_start = front_lip_d;
    floor_y_end   = front_lip_d + zone_depth;
    floor_z_front = base_floor_h;                  // zone floor height at front
    floor_z_back  = base_floor_h + slope_rise;     // zone floor height at back

    // Hull of two thin slabs creates a precise wedge cut
    hull() {
        // Front of slope: cut from floor_z_front up (removes upper material at front)
        translate([x, floor_y_start, floor_z_front])
            cube([slot_w, 0.01, div_h + 2]);
        // Back of slope: cut from floor_z_back up (shallower cut at back)
        translate([x, floor_y_end, floor_z_back])
            cube([slot_w, 0.01, div_h - slope_rise + 2]);
    }
}

// ─── ZONE OPEN TOP (above the sloped floor, full depth behind lip) ────────────
// Opens each zone above the slope so cards can be placed in.
module zone_open_cut(x) {
    // Open the zone interior from front_lip_d rearward to back wall
    translate([x, front_lip_d, base_floor_h])
        cube([slot_w, base_d - front_lip_d - back_wall_t, div_h + 2]);
}

// ─── BASE BODY ────────────────────────────────────────────────────────────────
module base_body() {
    // Solid block — everything except zones and cuts
    cube([total_w, base_d, base_floor_h + div_h]);
}

// ─── PRIMEBIND BRANDING ───────────────────────────────────────────────────────
module branding() {
    // Centered on front face between bottom edge and first symbol
    translate([total_w / 2, -0.1, 2.0]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    text("PRIMEBIND", size = 5.5,
         font = "Bunken Tech Sans Pro ExBd:style=ExtraBold Italic",
         halign = "center", valign = "center");
}

// ─── ASSEMBLY ─────────────────────────────────────────────────────────────────
difference() {
    base_body();

    // Open each zone and create its sloped floor
    for (i = [0 : n_zones - 1]) {
        zone_open_cut(zone_x(i));
        zone_slope_cut(zone_x(i));
    }

    // Rarity symbols on front lip face (Y=0)
    sym_common(zone_cx(0));
    sym_uncommon(zone_cx(1));
    sym_rh(zone_cx(2));
    sym_rare(zone_cx(3));
    sym_hit(zone_cx(4));

    // Zone text labels (C / U / RH / R / HIT) below each symbol
    zone_label(zone_cx(0), "C");
    zone_label(zone_cx(1), "U");
    zone_label(zone_cx(2), "RH");
    zone_label(zone_cx(3), "R");
    zone_label(zone_cx(4), "HIT");

    // PrimeBind branding
    branding();
}
