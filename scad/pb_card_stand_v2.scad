// pb_card_stand_v2.scad — PrimeBind Single Card Display Stand
//
// L-shaped body: compact flat base + tall tilted back wall, single polygon extrusion.
// Base bottom and wall bottom both at Z=0 — completely flat on the bed. ✓
// Front face tilted at same angle as the wall (TILT degrees).
// Card groove at base-wall inner junction holds up to 5 sleeved cards.
// PrimeBind SVG logo debossed into the angled base front face.
// Peg (right side) + socket (left side) let stands snap together side by side.
//
// Print: Matte PLA | flat on bed | no supports needed
// Minitest: 50% scale in Creality Print — verify groove before full print

// ── Card + sleeve ─────────────────────────────────────────────────────────────
CARD_W     = 63.0;
SLEEVE_ADD = 3.6;
SLEEVE_T   = 1.2;
SLOT_W     = CARD_W + SLEEVE_ADD + 0.4;    // 67mm

// ── Stand geometry ────────────────────────────────────────────────────────────
TILT       = 10;
BASE_W     = SLOT_W + 8;       // 75mm (4mm wall each side)
BASE_D     = 22;               // front-to-back depth of base
BASE_H     = 16;               // base slab height
WALL_T     = 6;                // back wall thickness (slimmed down)
WALL_H     = 95;               // back wall total height from Z=0
LEAN       = WALL_H * sin(TILT);

// ── Card grooves ──────────────────────────────────────────────────────────────
GROOVE_T   = SLEEVE_T + 0.4;              // 1.6mm per card slot
GROOVE_H   = 10;
WALL_SIDE  = (BASE_W - SLOT_W) / 2;       // 4mm
NUM_CARDS  = 5;
RIB_T      = 0.4;
RIB_H      = 3;                            // short rib height from groove floor
GROOVE_T_TOTAL = NUM_CARDS * GROOVE_T + (NUM_CARDS - 1) * RIB_T;  // 9.6mm

// ── Logo ─────────────────────────────────────────────────────────────────────
// SVG artboard: 1122.52 × 793.70 px = 297 × 210mm at 96dpi.
// OpenSCAD imports in mm, so path coords are scaled by 0.2646 (= 297/1122.52).
// Content centroid in OpenSCAD mm: (346.48 × 0.2646, 221.64 × 0.2646) = (91.65, 58.67).
LOGO_SCALE = 0.08;
LOGO_DEPTH = 1.0;
LOGO_CX    = 0;                // fine-tune X on base face
LOGO_CZ    = 4;                // fine-tune Z on base face

echo("──────────────────────────────────────");
echo("Width:", BASE_W, "mm | Depth:", BASE_D, "mm | Wall:", WALL_T, "mm thick");
echo("Height:", WALL_H * cos(TILT), "mm");
echo("Groove total:", GROOVE_T_TOTAL, "mm | Cards:", NUM_CARDS);
echo("──────────────────────────────────────");


// ── Logo profile — centered at 2D origin ─────────────────────────────────────
module logo_profile() {
    // Translate by the DPI-corrected content centroid so the logo is at (0,0).
    // SVG Y is flipped (0=top in SVG, 0=bottom in OpenSCAD).
    // Content centroid in OpenSCAD 2D: X=346.48×0.2646=91.65, Y=(793.70-221.64)×0.2646=151.36.
    translate([-91.65, -151.36])
        import("primebindlogo.svg");
}


module card_stand() {
    difference() {
        // ── L-shaped body ─────────────────────────────────────────────────
        rotate([90, 0, 90])
        linear_extrude(BASE_W)
        polygon([
            [0,                          0                  ],  // A front-bottom
            [BASE_D,                     0                  ],  // B rear-bottom
            [BASE_D + LEAN,              WALL_H * cos(TILT) ],  // C wall top-outer
            [BASE_D - WALL_T + LEAN,     WALL_H * cos(TILT) ],  // D wall top-inner
            [BASE_D - WALL_T,            BASE_H             ],  // E inner junction
            [BASE_H * tan(TILT),         BASE_H             ]   // F front-top (tilted)
        ]);

        // ── Card grooves ──────────────────────────────────────────────────────
        // Wide shallow cut: open zone across all 5 positions (top GROOVE_H-RIB_H).
        translate([WALL_SIDE,
                   BASE_D - WALL_T - GROOVE_T_TOTAL,
                   BASE_H - (GROOVE_H - RIB_H)])
            cube([SLOT_W, GROOVE_T_TOTAL + 0.1, GROOVE_H - RIB_H + 0.1]);
        // Narrow deep cuts: 5 channels with 4 short ribs at the bottom.
        for (i = [0:NUM_CARDS-1]) {
            translate([WALL_SIDE,
                       BASE_D - WALL_T - GROOVE_T_TOTAL + i * (GROOVE_T + RIB_T),
                       BASE_H - GROOVE_H])
                cube([SLOT_W, GROOVE_T + 0.1, GROOVE_H + 0.1]);
        }

        // logo deboss removed — add back when ready
    }
}


card_stand();
