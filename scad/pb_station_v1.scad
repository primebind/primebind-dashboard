// PrimeBind Station — Pack Opening Desk Organizer v1
// Sections (left→right): Toploader Spring Magazine | Exact Fit Sleeves | Regular Sleeves
//
// KEY FEATURE: Spring-loaded toploader magazine — follower plate keeps stack
// pressed forward at all times. Grab from front, spring advances stack.
// Follower slot visible on right wall — handle travels as stack is consumed.
//
// DIMS: ~230mm wide × 181mm deep × 103mm tall
// PRINT: Standing upright on the base (floor on bed)
// FITS: K2 Plus 350×350mm bed in one piece

$fn = 32;

// ─── SHARED ────────────────────────────────────────────────────
wall    = 3.0;
r_edge  = 5.0;
base_h  = 6.0;
sep     = 2.0;   // gap between sections (modular aesthetic)

// ─── TOPLOADER MAGAZINE ────────────────────────────────────────
// Standard 35pt rigid toploader: 66×91mm face, ~3.2mm thick
tl_w    = 66.0;
tl_h    = 91.0;
tl_t    = 3.2;
tl_n    = 50;

mag_iw  = tl_w + 3.0;          // 69mm inner W (1.5mm clearance per side)
mag_ih  = tl_h + 3.0;          // 94mm inner H
mag_id  = tl_n * tl_t + 15;    // 175mm inner D (160mm stack + 15mm spring space)
mag_ow  = mag_iw + wall * 2;   // 75mm outer W
mag_oh  = mag_ih + wall;        // 97mm height above base (base is floor, wall is ceiling)
mag_od  = mag_id + wall * 2;   // 181mm outer D

front_lip = 10.0;   // retaining lip at top+bottom of front opening

// Spring follower slot — horizontal groove in right wall
// follower handle rides in this slot, visible from outside
fol_h      = 4.0;    // slot height
fol_margin = 18.0;   // closed ends (keeps slot from reaching corners)

// ─── SLEEVE WELLS ─────────────────────────────────────────────
// Standard sleeve depth (all formats fit within 95mm)
sl_id   = 97.0;   // inner cavity depth

// Exact fit sleeves (Dragon Shield PF, KMC Perfect Fit): 64×89mm
// 200 sleeves ≈ 10mm thick — well sized for 400+
ef_iw   = 67.0;
ef_ih   = 55.0;
ef_ow   = ef_iw + wall * 2;   // 73mm
ef_oh   = ef_ih + wall;        // 58mm height above base

// Regular sleeves (Dragon Shield, Ultra Pro Matte): 67×93mm
// 200 sleeves ≈ 18mm thick — well sized for 300+
reg_iw  = 72.0;
reg_ih  = 55.0;
reg_ow  = reg_iw + wall * 2;  // 78mm
reg_oh  = reg_ih + wall;       // 58mm height above base

// ─── LAYOUT ───────────────────────────────────────────────────
x_mag   = 0;
x_ef    = x_mag + mag_ow + sep;          // 77mm
x_reg   = x_ef  + ef_ow  + sep;         // 152mm
total_w = x_reg + reg_ow;               // 230mm

// ─── HELPER ───────────────────────────────────────────────────
module rbox(x, y, z, r) {
    hull() {
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, 0]) cylinder(r=r, h=z);
    }
}

// ─── BASE PLATE ────────────────────────────────────────────────
// Unified floor across all sections — visual anchor of the station
module base_plate() {
    rbox(total_w, mag_od, base_h, r_edge);
}

// ─── TOPLOADER MAGAZINE ────────────────────────────────────────
module magazine() {
    translate([x_mag, 0, 0])
        difference() {
            // outer shell — tallest section, visual focal point
            rbox(mag_ow, mag_od, base_h + mag_oh, r_edge);

            // interior cavity — toploaders stand upright and stack front→back
            translate([wall, wall, base_h])
                cube([mag_iw, mag_id, mag_ih]);

            // front opening — shows toploader face through center
            // top+bottom lips retain the stack in place
            translate([wall, -1, base_h + front_lip])
                cube([mag_iw, wall + 2, mag_ih - front_lip * 2]);

            // follower slot — horizontal groove in right wall
            // spring follower handle protrudes here and slides as stack shrinks
            translate([mag_ow - wall - 0.01, wall + fol_margin, base_h + mag_ih/2 - fol_h/2])
                cube([wall + 1, mag_id - fol_margin * 2, fol_h]);
        }
}

// ─── SLEEVE WELL ───────────────────────────────────────────────
module sleeve_well(x_pos, iw, ih, oh) {
    ow = iw + wall * 2;
    translate([x_pos, 0, 0])
        difference() {
            // outer shell — shorter than magazine for visual hierarchy
            rbox(ow, mag_od, base_h + oh, r_edge);

            // open-top cavity — front sl_id portion is the sleeve zone
            // back portion is solid (structural + future utility compartment)
            translate([wall, wall, base_h])
                cube([iw, sl_id, ih + wall + 1]);
        }
}

// ─── STATION ───────────────────────────────────────────────────
module station() {
    color("white") union() {
        base_plate();
        magazine();
        sleeve_well(x_ef,  ef_iw,  ef_ih,  ef_oh);
        sleeve_well(x_reg, reg_iw, reg_ih, reg_oh);
    }
}

station();
