// PrimeBind Pack Opening System — Part 1: Pack Display Rack
//
// Holds 3 sealed booster packs upright for display — packs lean against
// the back wall, art visible from the front. PrimeBind logo embossed on
// the front lip.
//
// MODULAR: Side connector tabs allow two units to snap together side by side
// for 6-pack capacity without glue.
//
// PRINT: Single color. Fits K2 Plus in one job (~268mm × 30mm × 122mm).
// Recommended: Black or Obsidian. Print upright (as designed — no rotation).
//
// PART OF: PrimeBind Pack Opening System
//   Part 1 → This file (rack)
//   Part 2 → pb_pack_system_p2_hopper.scad
//   Part 3 → pb_pack_system_p3_sorter.scad

// ── PACK DIMENSIONS ──────────────────────────────────────────────────────────
pack_w   = 85;    // Pokemon booster pack width (mm)
pack_h   = 130;   // pack height standing upright
pack_t   = 6;     // pack thickness sealed
pack_tol = 1.0;   // clearance on each side of pack (slide-in tolerance)

// ── RACK CONFIG ───────────────────────────────────────────────────────────────
n_packs  = 3;     // slots per unit (print 2 units for 6 packs)
div_t    = 2.5;   // divider thickness
wall_t   = 3.0;   // outer wall thickness
base_t   = 5.0;   // base plate thickness
lip_h    = 22.0;  // front lip height — holds pack bottom in, art visible above
back_h   = 115.0; // back wall height — packs lean here, top few mm visible above

// ── DEPTH DESIGN ─────────────────────────────────────────────────────────────
// Front wall → pack slot → air gap → back wall
front_wall_d = wall_t;
slot_d       = pack_t + 2 * pack_tol;   // 8mm
air_gap_d    = 12.0;   // space behind slot — adds rigidity, not wasted
back_wall_d  = wall_t;
total_d      = front_wall_d + slot_d + air_gap_d + back_wall_d;   // ~26mm

// ── WIDTH ─────────────────────────────────────────────────────────────────────
slot_w   = pack_w + 2 * pack_tol;        // 87mm per slot
total_w  = wall_t + n_packs * slot_w + (n_packs - 1) * div_t + wall_t;
// 3 slots: 3 + 3×87 + 2×2.5 + 3 = 272mm ✓ fits K2 Plus 350mm bed

// ── CONNECTOR TABS (modular side join) ────────────────────────────────────────
// Male tab on right side, female slot on left side.
// Two units click together: right tab of unit A slides into left slot of unit B.
tab_w    = 8.0;
tab_h    = 20.0;
tab_d    = total_d * 0.6;    // tab spans 60% of depth
tab_z    = base_t + 10.0;    // height off base where tab sits

$fn = 32;

// ── HELPERS ──────────────────────────────────────────────────────────────────

// Rounded base fillet for front lip to base transition
module fillet_strip(len, r) {
    translate([0, 0, 0])
    rotate([0, 90, 0])
    cylinder(r=r, h=len, $fn=16);
}

// ── BASE PLATE ────────────────────────────────────────────────────────────────
module base_plate() {
    cube([total_w, total_d, base_t]);
}

// ── FRONT LIP ─────────────────────────────────────────────────────────────────
// Low front wall that cradles the bottom of each pack.
// Pack art is fully visible above the lip.
module front_lip() {
    translate([0, 0, base_t])
        cube([total_w, front_wall_d, lip_h]);
}

// ── BACK WALL ─────────────────────────────────────────────────────────────────
// Full-height rear wall. Packs lean against this.
// Chamfered top edge so packs slide in smoothly.
module back_wall() {
    translate([0, total_d - back_wall_d, base_t])
        cube([total_w, back_wall_d, back_h]);
}

// ── OUTER SIDE WALLS ──────────────────────────────────────────────────────────
module side_walls() {
    // Left wall
    cube([wall_t, total_d, base_t + back_h]);
    // Right wall
    translate([total_w - wall_t, 0, 0])
        cube([wall_t, total_d, base_t + back_h]);
}

// ── SLOT DIVIDERS ─────────────────────────────────────────────────────────────
// Vertical walls between pack slots — extend full height of back wall.
module dividers() {
    for (i = [1 : n_packs - 1]) {
        x = wall_t + i * slot_w + (i - 1) * div_t;
        translate([x, 0, base_t])
            cube([div_t, total_d, back_h]);
    }
}

// ── FLOOR SUPPORT RIBS ────────────────────────────────────────────────────────
// Triangular ribs on base floor of each slot — cradle pack bottom, add rigidity.
// Each rib is a thin triangle bridging front wall to back wall at base level.
module slot_floor_ribs() {
    for (i = [0 : n_packs - 1]) {
        cx = wall_t + i * (slot_w + div_t) + slot_w / 2;
        // small center rib under each slot
        translate([cx - 1, front_wall_d, base_t])
            cube([2, slot_d, 2]);
    }
}

// ── CONNECTOR — MALE TAB (right side) ────────────────────────────────────────
module connector_tab_male() {
    translate([total_w, (total_d - tab_d) / 2, tab_z])
        cube([tab_w, tab_d, tab_h]);
}

// ── CONNECTOR — FEMALE SLOT (left side, negative) ────────────────────────────
module connector_slot_female() {
    // Cut into left wall to receive male tab from adjacent unit
    // Add 0.3mm clearance for fit
    translate([-0.1, (total_d - tab_d) / 2, tab_z])
        cube([tab_w + 0.3, tab_d, tab_h]);
}

// ── PRIMEBIND LOGO (embossed on front lip face) ───────────────────────────────
module logo_emboss() {
    translate([total_w / 2, -0.1, base_t + lip_h / 2])
        rotate([90, 0, 0])
            linear_extrude(height = 1.0)
                text("PRIMEBIND", size = 9,
                     font = "Bunken Tech Sans Pro ExBd:style=ExtraBold Italic",
                     halign = "center", valign = "center");
}

// ── PACK COUNT LABEL PER SLOT (small number, back wall) ──────────────────────
module slot_labels() {
    for (i = [0 : n_packs - 1]) {
        cx = wall_t + i * (slot_w + div_t) + slot_w / 2;
        translate([cx, total_d - back_wall_d - 0.1, base_t + lip_h + 8])
            rotate([90, 0, 0])
                linear_extrude(height = 0.8)
                    text(str(i + 1), size = 10,
                         font = "Liberation Sans:style=Bold",
                         halign = "center", valign = "center");
    }
}

// ── TOP CHAMFER ON BACK WALL (guide for sliding packs in) ────────────────────
module back_wall_chamfer() {
    chamfer_size = 5;
    translate([0, total_d - back_wall_d - chamfer_size, base_t + back_h - chamfer_size])
        rotate([45, 0, 0])
            cube([total_w, chamfer_size * 1.5, chamfer_size * 1.5]);
}

// ── ASSEMBLY ──────────────────────────────────────────────────────────────────
difference() {
    union() {
        base_plate();
        front_lip();
        back_wall();
        side_walls();
        dividers();
        slot_floor_ribs();
        connector_tab_male();   // male tab on right side
    }
    connector_slot_female();    // female slot cut from left side
    logo_emboss();
    back_wall_chamfer();
}
