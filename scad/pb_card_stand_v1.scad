// pb_card_stand_v1.scad — PrimeBind Single Card Display Stand
//
// Holds one sleeved raw Pokemon card at a 12° backward tilt.
// Logo emboss panel on the front face, bottom center — drop SVG in slicer.
// Compact footprint, prints flat with no supports.
//
// Fits: standard poly sleeve over 63mm card (~67mm sleeved width)
// Print: Matte PLA | flat on bed | no supports needed
// Minitest: 50% scale in Creality Print — check slot fits sleeved card snug

// ── Card + sleeve ─────────────────────────────────────────────────────────────
CARD_W     = 63.0;   // raw Pokemon card width
SLEEVE_ADD = 3.6;    // total sleeve adds ~1.8mm per side in width
SLEEVE_T   = 1.2;    // card + sleeve total thickness (with clearance)

// ── Slot ──────────────────────────────────────────────────────────────────────
SLOT_W     = CARD_W + SLEEVE_ADD + 0.4;   // 67mm — snug in standard sleeve
SLOT_DEPTH = 14.0;   // how far the card sits down into the stand
SLOT_T     = SLEEVE_T + 0.2;              // slot front-to-back (1.4mm)

// ── Stand geometry ────────────────────────────────────────────────────────────
TILT      = 12;     // degrees the card leans back from vertical
COL_THICK = 4.0;    // front column wall thickness
WALL      = 3.5;    // side wall either side of slot
LEDGE     = 9.0;    // column height below slot (front face / logo area)
COL_H     = SLOT_DEPTH + LEDGE;    // total column height = 23mm
FACE_W    = SLOT_W + WALL * 2;     // stand width = ~74mm
BASE_T    = 3.5;    // base plate thickness
BASE_D    = 40.0;   // base plate depth (front-to-back)
FOOT_T    = 3.0;    // rear foot wall thickness
FOOT_H    = 7.0;    // rear foot height above base surface

// ── Logo emboss ───────────────────────────────────────────────────────────────
// Sunken 0.8mm panel on the front face — import PrimeBind logo SVG in slicer
LOGO_W     = 30.0;
LOGO_H     = 5.5;
LOGO_Z     = 2.5;   // distance from bottom of column
LOGO_DEPTH = 0.8;

echo("─────────────────────────────────");
echo("Stand width:", FACE_W, "mm  depth:", BASE_D, "mm");
echo("Column height:", COL_H, "mm  tilt:", TILT, "°");
echo("Slot:", SLOT_W, "×", SLOT_T, "×", SLOT_DEPTH, "mm");
echo("─────────────────────────────────");


module card_stand() {
    // ── Base plate ────────────────────────────────────────────────────────────
    cube([FACE_W, BASE_D, BASE_T]);

    // ── Rear foot ─────────────────────────────────────────────────────────────
    // Raised ledge at back edge — balances card weight, cleans up the silhouette
    translate([0, BASE_D - FOOT_T, 0])
        cube([FACE_W, FOOT_T, BASE_T + FOOT_H]);

    // ── Front column ──────────────────────────────────────────────────────────
    // Pivots backward TILT° around its bottom front edge (at Y=0, Z=BASE_T).
    // Card drops into the slot at the top; leans back at the tilt angle.
    translate([0, 0, BASE_T])
    rotate([-TILT, 0, 0])
    difference() {
        cube([FACE_W, COL_THICK, COL_H]);

        // Card slot — open at top, card slides straight down into it
        translate([WALL, -0.1, COL_H - SLOT_DEPTH])
            cube([SLOT_W, SLOT_T + 0.1, SLOT_DEPTH + 0.1]);

        // Logo emboss — sunken into front face, centered, near bottom
        translate([FACE_W/2 - LOGO_W/2, COL_THICK - LOGO_DEPTH, LOGO_Z])
            cube([LOGO_W, LOGO_DEPTH + 0.1, LOGO_H]);
    }
}


card_stand();
