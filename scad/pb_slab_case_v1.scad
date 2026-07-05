// pb_slab_case_v1.scad — PrimeBind PSA Slab Case (Piano-Hinge Rod)
//
// Book-style carrying case for 4 PSA slab trays.
// 6 pieces total (front cover, 4 trays, back cover) share a single
// 4mm aluminum rod threaded through interleaved barrel knuckles on the spine.
// Open the case flat → each tray swings like a page on the rod.
// Magnets on the right edge latch the case shut.
//
// Print:    Matte PLA | flat on bed | no supports
// Hardware: 1× 4mm aluminum rod, cut to 295mm
//           4× 12mm × 3mm neodymium disc magnets (2 N-pole, 2 S-pole)
//
// Print order:
//   1. case_tray(1) at 33% minitest → verify pocket spring-grip + knuckle
//   2. case_front_cover() at 33% → verify knuckle alignment with tray
//   3. Full prints: front cover, tray 1-4, back cover
//   Thread rod through all knuckles before final assembly


// ── Slab dimensions (PSA standard, modern trading cards) ─────────────────────
SLAB_W = 81.0;    // 3.19″ — holder width
SLAB_H = 136.5;   // 5.38″ — holder height
SLAB_T = 6.35;    // 0.25″ — holder thickness

// ── Pocket fit ────────────────────────────────────────────────────────────────
// X: 0.4mm undersize total (0.2mm per side) → spring grip holds slab snug
// Y: 0.5mm oversize total → easy drop-in from above
// Z: exact slab thickness → slab sits flush, tray above acts as lid
FIT_W  = SLAB_W - 0.4;   // 80.6mm
FIT_H  = SLAB_H + 0.5;   // 137.0mm
FIT_D  = SLAB_T;          // 6.35mm
ENTRY_C = 1.5;            // chamfer at pocket opening to guide past spring zone

// ── Layout ────────────────────────────────────────────────────────────────────
COLS = 2;
ROWS = 2;

// ── Tray structure ────────────────────────────────────────────────────────────
SPINE_W = 16.0;   // spine rail width (X) — knuckles live here
WALL_O  = 4.0;    // outer walls (right, top, bottom)
WALL_I  = 3.0;    // divider between adjacent pockets
BASE_T  = 2.5;    // tray floor thickness
PUSH_D  = 18.0;   // thumb-push hole diameter (centered in each pocket floor)

// ── Derived tray dimensions ───────────────────────────────────────────────────
TW  = SPINE_W + WALL_O + FIT_W*COLS + WALL_I*(COLS-1) + WALL_O;  // ~188mm
TH  = WALL_O + FIT_H*ROWS + WALL_I*(ROWS-1) + WALL_O;            // ~285mm
TD  = BASE_T + FIT_D;                                              // 8.85mm
PKX = SPINE_W + WALL_O;  // X origin of first pocket column


// ── Barrel hinge ──────────────────────────────────────────────────────────────
// Pieces are ordered: 0=front cover, 1-4=trays (n=tray number), 5=back cover
// Each piece gets one knuckle per cluster, positioned at its sequence slot.
// Adjacent knuckles interleave when the case is closed; rod threads through all.

ROD_D        = 4.0;    // 4mm aluminum rod
KNUCKLE_OD   = 8.0;    // outer barrel diameter (fits within TD=8.85mm)
KNUCKLE_ID   = 4.4;    // bore: 4mm rod + 0.2mm clearance per side
KNUCKLE_L    = 14.0;   // knuckle length along Y (spine height axis)
KNUCKLE_GAP  = 2.0;    // clear gap between adjacent knuckles when closed
KNUCKLE_STEP = KNUCKLE_L + KNUCKLE_GAP;   // 16mm per sequence slot

N_TRAYS  = 4;
N_PIECES = N_TRAYS + 2;   // 6 total

// Two knuckle clusters along the spine height
// Each cluster runs CLUSTER_SPAN=96mm, placed near top and bottom of spine
CLUSTER_SPAN = N_PIECES * KNUCKLE_STEP;    // 6 × 16 = 96mm
CLUSTER_1_Y  = 20.0;                       // top cluster Y-start
CLUSTER_2_Y  = TH - 20.0 - CLUSTER_SPAN;  // bottom cluster Y-start (~169mm)

// Knuckle center position on spine face:
//   X: 1.5mm inside spine body for anchor strength; remainder protrudes left
//   Z: mid-height of tray/cover for consistent rod center across all pieces
KX = -(KNUCKLE_OD / 2 - 1.5);   // = -2.5mm
KZ = TD / 2;                     // = 4.425mm


// ── Magnetic latch ────────────────────────────────────────────────────────────
// Pockets on the right edge (X=TW face) of front and back covers.
// Press-fit 12mm × 3mm disc magnets. Alternate N/S between covers.
MAGNET_D   = 12.0;
MAGNET_H   = 3.0;
MAGNET_TOL = 0.3;   // pocket oversize so magnet presses in snug
LATCH_Y1   = 30.0;  // magnet center from Y=0 edge
LATCH_Y2   = TH - 30.0;


// ── Cover ─────────────────────────────────────────────────────────────────────
COVER_T    = TD;     // same Z-thickness as tray → rod center identical
LIP_H      = 6.0;   // raised lip height (surrounds tray stack when closed)
LIP_T      = 3.0;   // lip wall thickness


echo("─────────────────────────────────────────────");
echo("Tray footprint:", TW, "×", TH, "mm  depth:", TD, "mm");
echo("Stack closed (4 trays + 2 covers):", TD * N_PIECES, "mm");
echo("Cluster 1 Y:", CLUSTER_1_Y, "→", CLUSTER_1_Y + CLUSTER_SPAN, "mm");
echo("Cluster 2 Y:", CLUSTER_2_Y, "→", CLUSTER_2_Y + CLUSTER_SPAN, "mm");
echo("Rod: 4mm aluminum, cut to", TH + 10, "mm");
echo("─────────────────────────────────────────────");


// ── Pocket cut ────────────────────────────────────────────────────────────────
// Spring-grip pocket: undersized in X, chamfered opening, thumb-push hole.
module pocket_cut() {
    // Main pocket volume
    translate([0, 0, BASE_T])
        cube([FIT_W, FIT_H, FIT_D + 0.1]);

    // Entry chamfer — slab slides through this wider funnel on the way in,
    // then snaps into the undersized spring-grip zone below
    translate([0, 0, BASE_T + FIT_D - ENTRY_C])
        hull() {
            cube([FIT_W, FIT_H, 0.01]);
            translate([-ENTRY_C, -ENTRY_C, ENTRY_C])
                cube([FIT_W + ENTRY_C*2, FIT_H + ENTRY_C*2, 0.01]);
        }

    // Thumb-push hole through floor — center of pocket, push slab up to release
    translate([FIT_W/2, FIT_H/2, -0.1])
        cylinder(h=BASE_T + 0.2, d=PUSH_D, $fn=36);
}


// ── Barrel knuckle ────────────────────────────────────────────────────────────
// Add to any piece module (union). Piece n=0 is front cover, 1-4 are trays,
// n=5 is back cover. Each piece gets one knuckle per cluster.
// All pieces share the same KX/KZ so the rod center is collinear.
module barrel_knuckle(n) {
    for (ky = [CLUSTER_1_Y + n * KNUCKLE_STEP,
               CLUSTER_2_Y + n * KNUCKLE_STEP]) {
        translate([KX, ky, KZ])
            rotate([-90, 0, 0])   // cylinder axis → +Y direction
            difference() {
                cylinder(h=KNUCKLE_L, d=KNUCKLE_OD, $fn=48);
                // bore through entire knuckle length
                translate([0, 0, -0.1])
                    cylinder(h=KNUCKLE_L + 0.2, d=KNUCKLE_ID, $fn=48);
            }
    }
}


// ── Magnet pockets ────────────────────────────────────────────────────────────
// Cuts pockets into the right edge (X=TW face) at LATCH_Y1 and LATCH_Y2.
// z_center: pocket center in Z (TD/2 for all pieces).
module magnet_pockets(z_center) {
    for (y = [LATCH_Y1, LATCH_Y2])
        translate([TW + 0.1, y, z_center])
            rotate([0, -90, 0])   // cylinder enters from right face, going -X
            cylinder(h = MAGNET_H + MAGNET_TOL + 0.2,
                     d = MAGNET_D + MAGNET_TOL, $fn=48);
}


// ── Case Tray ─────────────────────────────────────────────────────────────────
// Holds 4 PSA slabs in a 2×2 spring-grip layout.
// Barrel knuckles on the spine edge hang on the hinge rod.
// Trays are NOT interchangeable — each n must stay in its hinge position.
// Print separate STLs: case_tray(1), case_tray(2), case_tray(3), case_tray(4)
module case_tray(n) {
    difference() {
        cube([TW, TH, TD]);

        // slab pockets
        for (c = [0:COLS-1], r = [0:ROWS-1])
            translate([PKX + c*(FIT_W + WALL_I),
                       WALL_O + r*(FIT_H + WALL_I),
                       0])
                pocket_cut();

        // spine flip-grip channel — shallow slot on spine face, between clusters
        // lets you hook a finger tip to swing the tray open; sits at Y mid-spine
        // (Y≈128–156mm, safely between cluster 1 end ≈116mm and cluster 2 start ≈169mm)
        translate([-0.1, TH/2 - 14, TD - 1.5])
            cube([SPINE_W * 0.55 + 0.1, 28, 1.6]);
    }

    // barrel knuckles protrude from spine face to the left
    barrel_knuckle(n);
}


// ── Front Cover (piece 0) ─────────────────────────────────────────────────────
// Outer face when case is closed. Logo emboss panel (0.8mm sunken rectangle)
// is sized to drop a PrimeBind SVG logo onto this face in your slicer.
// Raised lip on 3 sides (right, top, bottom) frames the tray stack.
module case_front_cover() {
    difference() {
        union() {
            // base plate
            cube([TW, TH, COVER_T]);

            // raised lip on right, top, and bottom edges — spine side left open
            // Right edge lip
            translate([TW - LIP_T, 0, COVER_T])
                cube([LIP_T, TH, LIP_H]);
            // Top edge lip
            translate([SPINE_W, TH - LIP_T, COVER_T])
                cube([TW - SPINE_W, LIP_T, LIP_H]);
            // Bottom edge lip
            translate([SPINE_W, 0, COVER_T])
                cube([TW - SPINE_W, LIP_T, LIP_H]);
        }

        // logo emboss panel (sunken 0.8mm into outer face)
        // Face is at Z=COVER_T. Panel cut from Z=COVER_T-0.8 inward.
        translate([SPINE_W + 10, TH * 0.28, COVER_T - 0.8])
            cube([TW - SPINE_W - 20, TH * 0.44, 0.9]);

        // magnet pockets
        magnet_pockets(COVER_T / 2);
    }

    // piece 0 on the hinge
    barrel_knuckle(0);
}


// ── Back Cover (piece 5) ──────────────────────────────────────────────────────
// Inner-facing plate (outer face is the back of the closed case).
// Flat outer face — silicone bumpers or rubber feet can be glued here.
// Raised lip on 3 sides mirrors the front cover; together they enclose the stack.
module case_back_cover() {
    difference() {
        union() {
            cube([TW, TH, COVER_T]);

            // Right edge lip
            translate([TW - LIP_T, 0, COVER_T])
                cube([LIP_T, TH, LIP_H]);
            // Top edge lip
            translate([SPINE_W, TH - LIP_T, COVER_T])
                cube([TW - SPINE_W, LIP_T, LIP_H]);
            // Bottom edge lip
            translate([SPINE_W, 0, COVER_T])
                cube([TW - SPINE_W, LIP_T, LIP_H]);
        }

        // magnet pockets (opposing polarity to front cover)
        magnet_pockets(COVER_T / 2);
    }

    // piece 5 (last in sequence) on the hinge
    barrel_knuckle(N_PIECES - 1);
}


// ── Render ────────────────────────────────────────────────────────────────────
// Export each piece as its own STL. Change the active line and re-render.
//
// Tray numbers matter — n=1 through n=4 must be printed separately and
// assembled in sequence (n=1 next to front cover, n=4 next to back cover).
//
// Full print list:
//   case_front_cover()   → STL: pb_case_front.stl
//   case_tray(1)         → STL: pb_case_tray_1.stl
//   case_tray(2)         → STL: pb_case_tray_2.stl
//   case_tray(3)         → STL: pb_case_tray_3.stl
//   case_tray(4)         → STL: pb_case_tray_4.stl
//   case_back_cover()    → STL: pb_case_back.stl

// All pieces flat for overview (uncomment one at a time to export individual STLs):
case_front_cover();
for (n = [1:N_TRAYS]) translate([0, n * (TH + 15), 0]) case_tray(n);
translate([0, (N_TRAYS + 1) * (TH + 15), 0]) case_back_cover();

// To export a single STL, comment the block above and uncomment ONE line below:
// case_front_cover();
// case_tray(1);
// case_tray(2);
// case_tray(3);
// case_tray(4);
// case_back_cover();
