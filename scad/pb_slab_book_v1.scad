// pb_slab_book_v1.scad — PrimeBind PSA Slab Book
//
// Stack of 2×2 slab trays bound by Chicago screw posts on a spine rail.
// Opens like a book — 8 slabs visible at once when laid flat.
//
// Components:
//   slab_tray()    — one "page", holds 4 PSA slabs in spring-grip pockets
//   top_cover()    — front cover, logo emboss panel
//   bottom_cover() — back cover, flat
//
// Hardware: 2× Chicago screw posts, 6mm shaft diameter
//           Stack posts or use longer posts to match tray count.
//           Available at craft/office stores or Amazon.
//
// Print:    Matte PLA | flat on bed | no supports | 2+ perimeter walls
// Minitest: scale to 33% in Creality Print before committing full tray
//
// MEASURE YOUR SLABS before printing — PSA dimensions vary by card size.
// Update SLAB_W / SLAB_H / SLAB_T below.

// ── Slab dimensions ──────────────────────────────────────────────────────────
// PSA standard holder (modern trading cards — 3.19″ × 5.38″ × 0.25″)
SLAB_W = 81.0;    // 3.19″ — holder width
SLAB_H = 136.5;   // 5.38″ — holder height
SLAB_T = 6.35;    // 0.25″ — holder thickness

// ── Pocket fit ───────────────────────────────────────────────────────────────
// Width:  undersize by 0.4mm total (0.2mm per side) → spring grip in X
// Height: oversize by 0.5mm total → easy drop-in insertion
// Depth:  exact slab thickness → slab sits flush, tray above acts as lid
FIT_W = SLAB_W - 0.4;   // 80.6mm
FIT_H = SLAB_H + 0.5;   // 137.0mm
FIT_D = SLAB_T;          // 6.35mm

ENTRY_C = 1.5;   // chamfer at pocket opening to guide slab past spring zone

// ── Layout ───────────────────────────────────────────────────────────────────
COLS = 2;
ROWS = 2;

// ── Structure ─────────────────────────────────────────────────────────────────
SPINE_W  = 16.0;   // spine rail — post holes centered here
WALL_O   = 4.0;    // outer walls (right, top, bottom edges)
WALL_I   = 3.0;    // wall between adjacent pockets
BASE_T   = 2.5;    // tray floor — thick enough to resist flex
COVER_T  = 5.0;    // cover plate thickness

// ── Binding posts ─────────────────────────────────────────────────────────────
POST_HOLE_D = 7.0;    // 6mm Chicago screw shaft + 0.5mm clearance per side
POST_INSET  = 30.0;   // distance from top/bottom tray edge to post hole center

// ── Thumb-push holes ──────────────────────────────────────────────────────────
PUSH_D = 18.0;    // hole in pocket floor; push slab up from below to release

// ── Derived dimensions ────────────────────────────────────────────────────────
TW = SPINE_W + WALL_O + FIT_W*COLS + WALL_I*(COLS-1) + WALL_O;
TH = WALL_O  + FIT_H*ROWS + WALL_I*(ROWS-1) + WALL_O;
TD = BASE_T  + FIT_D;

// X origin of first pocket column (right of spine)
PKX = SPINE_W + WALL_O;

echo("─────────────────────────────────");
echo("Tray footprint:", TW, "×", TH, "mm");
echo("Tray depth:", TD, "mm");
echo("Pocket fit W:", FIT_W, "H:", FIT_H, "D:", FIT_D);
echo("─────────────────────────────────");


// ── Helpers ───────────────────────────────────────────────────────────────────

module post_holes(depth) {
    for (y = [POST_INSET, TH - POST_INSET])
        translate([SPINE_W/2, y, -0.1])
            cylinder(h=depth + 0.2, d=POST_HOLE_D, $fn=36);
}

module pocket_cut() {
    // Main pocket volume — spring walls grip slab in X
    translate([0, 0, BASE_T])
        cube([FIT_W, FIT_H, FIT_D + 0.1]);

    // Entry chamfer at top opening — wider funnel that narrows to FIT_W
    // Slab slides through chamfer zone, then gripped by interference walls below
    translate([0, 0, BASE_T + FIT_D - ENTRY_C])
        hull() {
            cube([FIT_W, FIT_H, 0.01]);
            translate([-ENTRY_C, -ENTRY_C, ENTRY_C])
                cube([FIT_W + ENTRY_C*2, FIT_H + ENTRY_C*2, 0.01]);
        }

    // Thumb-push hole through floor — center of pocket
    translate([FIT_W/2, FIT_H/2, -0.1])
        cylinder(h=BASE_T + 0.2, d=PUSH_D, $fn=36);
}


// ── Slab Tray ─────────────────────────────────────────────────────────────────
module slab_tray() {
    difference() {
        cube([TW, TH, TD]);

        // pockets — 2 columns × 2 rows
        for (c = [0:COLS-1], r = [0:ROWS-1])
            translate([
                PKX + c*(FIT_W + WALL_I),
                WALL_O + r*(FIT_H + WALL_I),
                0
            ])
            pocket_cut();

        // binding post holes through spine rail
        post_holes(TD);

        // spine slot: shallow channel on spine face for finger grip when flipping
        translate([-0.1, TH/2 - 12, TD - 1.2])
            cube([SPINE_W * 0.6 + 0.1, 24, 1.3]);
    }
}


// ── Top Cover ─────────────────────────────────────────────────────────────────
// Front cover when book is closed (faces outward).
// Logo emboss panel: a 0.8mm sunken rectangle — drop PrimeBind logo SVG here.
module top_cover() {
    difference() {
        cube([TW, TH, COVER_T]);

        post_holes(COVER_T);

        // Logo emboss panel (right of spine, centered vertically)
        translate([SPINE_W + 8, TH * 0.3, COVER_T - 0.8])
            cube([TW - SPINE_W - 16, TH * 0.4, 0.9]);
    }
}


// ── Bottom Cover ──────────────────────────────────────────────────────────────
module bottom_cover() {
    difference() {
        cube([TW, TH, COVER_T]);
        post_holes(COVER_T);
    }
}


// ── Render ────────────────────────────────────────────────────────────────────
// Uncomment one part at a time → export STL → print

slab_tray();

// translate([TW + 20, 0, 0]) top_cover();
// translate([TW*2 + 40, 0, 0]) bottom_cover();

// All parts flat for overview:
// slab_tray();
// translate([0, TH + 15, 0]) slab_tray();   // second page
// translate([TW + 20, 0, 0]) top_cover();
// translate([TW + 20, TH + 15, 0]) bottom_cover();
