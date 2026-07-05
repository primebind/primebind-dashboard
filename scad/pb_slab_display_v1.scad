// pb_slab_display_v1.scad — PrimeBind PSA Card Show Display
//
// Freestanding waterfall stand for PSA slabs at vendor shows.
// 2 columns × 4 rows = 8 slabs visible simultaneously.
// Slabs slot in from the top, tilt 8° back — stable, easy to pull out.
// Grade label and card face fully visible from the front.
//
// Workflow: transport in slab book → transfer slabs to display at show
//
// Print: Matte PLA | flat on bed | no supports
// Minitest: scale to 40% to verify slot fit before full print

// ── PSA slab (confirmed dimensions) ─────────────────────────────────────────
SLAB_W = 81.0;    // 3.19″
SLAB_H = 136.5;   // 5.38″
SLAB_T = 6.35;    // 0.25″

// ── Layout ───────────────────────────────────────────────────────────────────
COLS = 2;
ROWS = 4;

// ── Slot geometry ─────────────────────────────────────────────────────────────
SLOT_W     = SLAB_W + 0.6;   // 81.6mm — snug but hand-removable
SLOT_DEPTH = 22;              // how deep slab sits in slot (bottom lip)
SLOT_TILT  = 8;               // degrees backward — stable, grade label visible
LIP_H      = 4;               // bottom ledge height that slab rests on

// ── Structure ─────────────────────────────────────────────────────────────────
WALL       = 3.5;   // side walls and dividers between columns
COL_GAP    = 5;     // gap between the two columns (wider for finger access)
BASE_T     = 4;     // base plate thickness
BACK_T     = 4;     // back wall thickness

// ── Row stepping (cascade) ────────────────────────────────────────────────────
// Each row steps back and up, creating the waterfall silhouette.
// Deeper step = more separation = easier to grab individual slabs.
ROW_STEP_D = 26;    // horizontal depth per step (front to back)
ROW_STEP_H = 12;    // height rise per step

// ── Derived ───────────────────────────────────────────────────────────────────
// Slot internal height — slab sits SLOT_DEPTH deep, the rest is open above
// The slot guides the slab sides; bottom lip stops it from sliding through
SLOT_H_INTERNAL = SLOT_DEPTH + LIP_H;

// Total stand width
STAND_W = WALL + SLOT_W + COL_GAP + SLOT_W + WALL;   // ~178mm

// Total stand depth (base plate)
STAND_D = ROWS * ROW_STEP_D + BACK_T;   // ~108mm

// Total stand height at back row
STAND_H = BASE_T + ROWS * ROW_STEP_H + SLOT_H_INTERNAL;   // ~90mm

echo("─────────────────────────────────────");
echo("Stand footprint:", STAND_W, "×", STAND_D, "mm");
echo("Stand height:", STAND_H, "mm");
echo("Slot width:", SLOT_W, "mm");
echo("─────────────────────────────────────");


// ── Single slot ───────────────────────────────────────────────────────────────
// A slot holds one PSA slab. The slab enters from the top, rests on the
// lip at the bottom, and is cradled by two side walls.
// The assembly is rotated SLOT_TILT° so the slab leans back.
module slot(col_x, row) {
    x = col_x;
    // Each row steps back (y) and up (z)
    base_z = BASE_T + row * ROW_STEP_H;
    base_y = (ROWS - 1 - row) * ROW_STEP_D;  // row 0 = front, row 3 = back

    translate([x, base_y, base_z])
    rotate([SLOT_TILT, 0, 0])
    difference() {
        // Outer slot body
        cube([SLOT_W + WALL*2, BACK_T + SLOT_DEPTH, SLOT_H_INTERNAL + WALL]);

        // Inner slot void (slab sits here)
        translate([WALL, BACK_T, LIP_H])
            cube([SLOT_W, SLOT_DEPTH + 0.1, SLOT_H_INTERNAL]);

        // Chamfer at top opening to guide slab in
        translate([WALL - 1.5, BACK_T, LIP_H + SLOT_H_INTERNAL - 3])
            rotate([0, 45, 0])
            cube([3, SLOT_DEPTH + 1, 3]);
        translate([WALL + SLOT_W - 1.5, BACK_T, LIP_H + SLOT_H_INTERNAL - 3])
            rotate([0, 45, 0])
            cube([3, SLOT_DEPTH + 1, 3]);

        // Finger notch in back wall — reach behind slab to push it up
        translate([WALL + SLOT_W/2 - 10, -0.1, LIP_H])
            cube([20, BACK_T + 0.2, SLOT_DEPTH * 0.6]);
    }
}


// ── Base plate ────────────────────────────────────────────────────────────────
module base_plate() {
    cube([STAND_W, STAND_D, BASE_T]);

    // Small front lip to stop slabs if pulled forward too aggressively
    translate([0, 0, BASE_T])
        cube([STAND_W, 3, 4]);
}


// ── Full display stand ────────────────────────────────────────────────────────
module slab_display() {
    // Base
    base_plate();

    // Column x origins: left column and right column
    col_x = [WALL, WALL + SLOT_W + COL_GAP];

    // Slots — 2 columns × 4 rows
    for (c = [0 : COLS-1]) {
        for (r = [0 : ROWS-1]) {
            slot(col_x[c], r);
        }
    }
}


// ── Render ────────────────────────────────────────────────────────────────────
slab_display();
