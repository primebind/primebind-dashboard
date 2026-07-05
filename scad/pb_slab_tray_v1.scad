// pb_slab_tray_v1.scad — PrimeBind PSA Slab Tray Book
// Stackable trays for PSA graded card display and transport
//
// Components:
//   slab_tray()    — standard tray, 2x2 pockets, pegs on top / holes on bottom
//   top_cover()    — flat lid, peg holes on underside
//   bottom_cover() — flat base, peg holes on top face
//
// Print: Matte PLA, flat on bed, no supports needed
// Minitest: scale to 1/3 in slicer before committing to full tray print

// ── Slab dimensions ──────────────────────────────────────────────────────────
// PSA standard holder with 0.5mm clearance per side
SLAB_W  = 91.0;   // holder width  (~90mm)
SLAB_H  = 122.0;  // holder height (~121mm)
SLAB_T  = 5.5;    // actual slab thickness

// ── Layout ───────────────────────────────────────────────────────────────────
COLS = 2;
ROWS = 2;

// ── Structure ─────────────────────────────────────────────────────────────────
WALL_O    = 4.0;   // outer wall thickness
WALL_I    = 3.0;   // wall between adjacent pockets
BASE_T    = 2.0;   // tray floor thickness
POCKET_D  = 5.0;   // pocket depth; slab (5.5mm) sits 0.5mm proud for easy grab
COVER_T   = 4.0;   // top/bottom cover thickness

// ── Alignment pegs ───────────────────────────────────────────────────────────
PEG_D   = 4.0;    // peg diameter
PEG_H   = 2.0;    // peg height above tray top face
PEG_TOL = 0.4;    // diametric clearance for holes
PEG_IN  = 8.0;    // inset from each corner

// ── Thumb-push holes ─────────────────────────────────────────────────────────
PUSH_D  = 16.0;   // diameter; centered in each pocket floor

// ── Derived dimensions ────────────────────────────────────────────────────────
TW = WALL_O*2 + SLAB_W*COLS + WALL_I*(COLS-1);  // 193mm
TH = WALL_O*2 + SLAB_H*ROWS + WALL_I*(ROWS-1);  // 255mm
TD = BASE_T + POCKET_D;                           //   7mm tray body height


// ── Helpers ───────────────────────────────────────────────────────────────────

module at_corners() {
    for (x = [PEG_IN, TW - PEG_IN])
    for (y = [PEG_IN, TH - PEG_IN])
        translate([x, y, 0]) children();
}

module peg() {
    cylinder(h=PEG_H, d=PEG_D, $fn=24);
}

module peg_hole(depth) {
    // slight countersink at opening to guide pegs in
    cylinder(h=depth + 0.1, d=PEG_D + PEG_TOL, $fn=24);
    translate([0, 0, depth - 0.5])
        cylinder(h=1.5, d1=PEG_D + PEG_TOL, d2=PEG_D + PEG_TOL + 1.0, $fn=24);
}

module pocket_origin(col, row) {
    translate([
        WALL_O + col * (SLAB_W + WALL_I),
        WALL_O + row * (SLAB_H + WALL_I),
        0
    ]) children();
}


// ── Slab Tray ─────────────────────────────────────────────────────────────────
module slab_tray() {
    difference() {
        cube([TW, TH, TD]);

        // slab pockets (open at top)
        for (c = [0:COLS-1], r = [0:ROWS-1])
            pocket_origin(c, r)
                translate([0, 0, BASE_T])
                cube([SLAB_W, SLAB_H, POCKET_D + 0.1]);

        // thumb-push holes centered in each pocket floor
        for (c = [0:COLS-1], r = [0:ROWS-1])
            pocket_origin(c, r)
                translate([SLAB_W/2, SLAB_H/2, -0.1])
                cylinder(h=BASE_T + 0.2, d=PUSH_D, $fn=32);

        // alignment holes — bottom face receives pegs from tray below
        at_corners()
            translate([0, 0, -0.1])
            peg_hole(BASE_T);
    }

    // alignment pegs — top face inserts into tray or cover above
    translate([0, 0, TD])
        at_corners()
        peg();
}


// ── Top Cover ─────────────────────────────────────────────────────────────────
// Sits on top of the uppermost tray. Peg holes on underside only.
module top_cover() {
    difference() {
        cube([TW, TH, COVER_T]);
        at_corners()
            translate([0, 0, -0.1])
            peg_hole(COVER_T);
    }
}


// ── Bottom Cover ──────────────────────────────────────────────────────────────
// Base plate. Peg holes on top face receive pegs from the first tray.
// Flat underside — add rubber feet in slicer or glue silicone pads.
module bottom_cover() {
    difference() {
        cube([TW, TH, COVER_T]);
        at_corners()
            translate([0, 0, COVER_T - BASE_T])
            peg_hole(BASE_T + 1);
    }
}


// ── Render ────────────────────────────────────────────────────────────────────
// Uncomment one at a time to export STLs

slab_tray();

// Lay out all parts flat for reference:
// slab_tray();
// translate([TW + 20, 0, 0]) slab_tray();
// translate([0, TH + 20, 0]) top_cover();
// translate([TW + 20, TH + 20, 0]) bottom_cover();
