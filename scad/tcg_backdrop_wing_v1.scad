// PrimeBind TCG Backdrop — Wing System V1
//
// Completes the 3-panel trapezoidal backdrop:
//   Center panel (v3) + Left wing + Right wing = trapezoid from above
//   Wings angle back at 30° from center panel plane
//
// --- PIECES -------------------------------------------------------------------
//   1. wing_right.stl       → set RENDER = "wing_right"        [black, mirror for left]
//   2. connector_right.stl  → set RENDER = "connector_right"   [white — 2 per joint, 4 total]
//   3. base_wing.stl        → set RENDER = "base_wing"         [black — 1 per wing]
//   4. base_junction.stl    → set RENDER = "base_junction"     [white — 1 per side, locks bases at 30°]
//
// --- ASSEMBLY -----------------------------------------------------------------
//   1. Slide base_junction bracket over center base right edge (slot A grips the plate)
//   2. Slide wing base inner edge into slot B of bracket — angle is now locked at 30°
//   3. Stand center panel in center base, wing panels in wing bases
//   4. Slide 2 corner connectors down from above over each center-to-wing panel joint
//   5. Mirror wing_right + connector_right STLs in slicer for left side

$fn = 48;

// ─── SHARED PANEL PARAMS (match tcg_backdrop_v3.scad) ────────────────────────
panel_w   = 320;
panel_h   = 300;
panel_t   = 8;    // thinner — decorative, no structural load (matches center panel)
r_panel   = 8;

// ─── WING PARAMS ──────────────────────────────────────────────────────────────
wing_angle  = 30;    // degrees each wing opens back from center panel
wing_w      = 320;   // wing width — same as center panel

// ─── CONNECTOR PARAMS ─────────────────────────────────────────────────────────
conn_h    = 60;                   // connector height — use 2 per joint (top + bottom)
slot_dep  = 10;                   // panel edge insertion depth (>panel_t=8, snug for thin panels)
slot_w    = panel_t + 0.3;       // 8.3mm — tight fit for 8mm panels (0.15mm each side)
conn_wall = 10;                   // connector arm thickness
conn_arm  = slot_dep + conn_wall; // total arm length = 20mm

// ─── WING BASE PARAMS ─────────────────────────────────────────────────────────
wbase_plate_h = 15;
wbase_ridge_h = 20;           // must exceed panel_t=15 to fully capture panel
wbase_ridge_d = slot_w + 12;  // 6mm wall each side of slot
wbase_d       = 300;          // matches center base depth
wbase_r       = 8;

// ─── BASE CHANNEL (full-width groove — matches center base design) ────────────
ch_d   = 12;              // channel depth — panel sinks 12mm
ch_w   = panel_t + 0.3;  // 8.3mm — 0.15mm clearance per side (snug for thin panels)
ch_yc  = 13.0;           // channel Y center — tuned so wing bumper outer faces match center bumper faces in world space (within 0.06mm)
bump_h = 8;              // bumper wall height above plate surface
bump_t = 2;              // bumper wall thickness in Y — 2mm compensates for 30° viewing angle (appears same as center base 3mm)

// ─── WING PANEL EDGE MAGNETS (inner edge — mate with center panel right edge) ─
wmag_r   = 1.5;              // matches center panel pmag_r
wmag_dep = 3.0;
wmag_y1  = panel_h * 0.22;  // 66mm — aligns with center pmag_y1
wmag_y2  = panel_h * 0.50;  // 150mm — center height
wmag_y3  = panel_h * 0.78;  // 234mm — aligns with center pmag_y3

// ─── BASE CONNECTION (center base snap tab → wing base inner socket) ──────────
emag_r   = 1.5;
emag_dep = 3.0;
emag_ya  = 10;
emag_yb  = 40;
emag_yc  = 100;
emag_yd  = 220;
etab_l   = 6;
etab_h   = 4;
etab_d   = 15;
etab_gap = 0.3;

// ─── RENDER ───────────────────────────────────────────────────────────────────
RENDER = "preview_both";
// Options: "wing_right" | "wing_left" | "connector_right" | "connector_left"
//          "base_wing" | "base_junction" | "top_bracket_right" | "top_bracket_left"
//          "preview_both" — panel + baseboard side by side

// =============================================================================
// WING PANEL
// Plain rectangular panel — same height as center panel (panel_h), no logo.
// Print flat on bed — stand upright for use, same orientation as center panel.
// =============================================================================

module wing_panel() {
    miter_ext = panel_t * tan(wing_angle);  // ≈ 4.62mm — lip depth at camera face
    difference() {
        union() {
            hull() {
                for (xi = [r_panel, wing_w - r_panel])
                    for (yi = [r_panel, panel_h - r_panel])
                        translate([xi, yi, 0]) cylinder(r = r_panel, h = panel_t);
            }
            // inner edge lip — extends camera face inward to X_world=320, covering the junction gap
            // triangular prism: back face at X=0, front face spans X=-miter_ext..0
            hull() {
                translate([0,          r_panel, 0       ]) cube([0.01, panel_h - 2*r_panel, 0.01]);
                translate([0,          r_panel, panel_t ]) cube([0.01, panel_h - 2*r_panel, 0.01]);
                translate([-miter_ext, r_panel, panel_t ]) cube([0.01, panel_h - 2*r_panel, 0.01]);
            }
        }
        // inner edge magnet pockets — drilled from inner face (-X), mate with center panel right edge magnets
        for (my = [wmag_y1, wmag_y2, wmag_y3])
            translate([-0.01, my, panel_t / 2])
                rotate([0, 90, 0])
                    cylinder(r = wmag_r, h = wmag_dep + 0.01);
    }
}

// =============================================================================
// CORNER CONNECTOR
// Wedge with two panel slots meeting at wing_angle.
// Slides down from above over both panel edges at the joint.
// Right-side: center panel to the left, wing angles upper-right.
// Left-side:  mirror — ang = -wing_angle.
// =============================================================================

module corner_connector(side = "right") {
    ang = (side == "right") ? wing_angle : -wing_angle;

    difference() {
        // wedge body — hull of two rectangular arms at wing_angle to each other
        linear_extrude(height = conn_h)
            hull() {
                square([conn_arm, conn_wall]);               // arm A: +X (center panel side)
                rotate(ang) square([conn_arm, conn_wall]);   // arm B: at wing_angle (wing side)
            }

        // slot A — center panel right edge (8mm thick, same as wing)
        translate([-0.01, (conn_wall - slot_w) / 2, -0.01])
            cube([slot_dep + 0.01, slot_w, conn_h + 0.02]);

        // slot B — wing inner edge enters at far end of arm B, goes inward toward origin
        rotate([0, 0, ang])
            translate([conn_arm - slot_dep - 0.01, (conn_wall - slot_w) / 2, -0.01])
                cube([slot_dep + 0.01, slot_w, conn_h + 0.02]);
    }
}

// =============================================================================
// TOP BRACKET
// Caps the panel junction at the very top of the backdrop.
// Same two-slot wedge geometry as corner_connector but:
//   — shorter total height (40mm vs 60mm)
//   — solid 5mm cap above the slots (gives a clean finished look at the top)
//
// Slide from above; bracket seats when panel top edges enter both slots.
// The 5mm cap sits proud of the panel tops and visually closes the joint.
// Print 1 per side (2 total). Mirror in slicer for left side.
// =============================================================================

module top_bracket(side = "right") {
    ang    = (side == "right") ? wing_angle : -wing_angle;
    tb_h   = 40;              // total height (Z)
    tb_cap = 5;               // solid cap above slot openings
    sl_h   = tb_h - tb_cap;  // slot open height = 35mm

    difference() {
        linear_extrude(height = tb_h)
            hull() {
                square([conn_arm, conn_wall]);
                rotate(ang) square([conn_arm, conn_wall]);
            }

        // slot A — center panel right edge
        translate([-0.01, (conn_wall - slot_w) / 2, -0.01])
            cube([slot_dep + 0.01, slot_w, sl_h + 0.01]);

        // slot B — wing panel inner edge
        rotate([0, 0, ang])
            translate([conn_arm - slot_dep - 0.01, (conn_wall - slot_w) / 2, -0.01])
                cube([slot_dep + 0.01, slot_w, sl_h + 0.01]);
    }
}

// =============================================================================
// WING BASE
// Same thin-plate + raised spine design as center base (v3), sized for wing_w.
// User places this at 30° from center base — no mechanical connection needed.
// =============================================================================

module wing_base() {
    // Trapezoidal footprint — inner edge cut at wing_angle so it mates flush
    // with center base end face in world coordinates.
    // Local coords: X = along wing width, Y = depth (inner→outer)
    // Inner front corner: (0, 0)
    // Outer front corner: (wing_w, 0)
    // Outer back corner:  (wing_w, wbase_d)
    // Inner back corner:  (shear, wbase_d)  where shear = wbase_d * tan(wing_angle)
    shear = wbase_d * tan(wing_angle);  // ≈ 173mm for 300mm depth at 30°

    difference() {
        union() {
            hull() {
                translate([0,             0,             0]) cube([0.01, 0.01, wbase_plate_h]);            // inner front — sharp corner (maps to X=320 world, no center-base overlap)
                translate([wing_w - wbase_r, wbase_r,    0]) cylinder(r=wbase_r, h=wbase_plate_h);        // outer front
                translate([wing_w - wbase_r, wbase_d - wbase_r, 0]) cylinder(r=wbase_r, h=wbase_plate_h); // outer back
                translate([shear,         wbase_d,       0]) cube([0.01, 0.01, wbase_plate_h]);            // inner back — sharp corner
            }
            // bumpers — full width, inner ends mitered to meet center base bumpers flush
            difference() {
                union() {
                    translate([-0.01, ch_yc - ch_w/2 - bump_t, wbase_plate_h])
                        cube([wing_w + 0.02, bump_t, bump_h]);
                    translate([-0.01, ch_yc + ch_w/2, wbase_plate_h])
                        cube([wing_w + 0.02, bump_t, bump_h]);
                }
                // inner end miter — removes X_local < Y_local*tan(wing_angle), aligning with inner diagonal
                translate([0, 0, wbase_plate_h - 0.01])
                    rotate([0, 0, -wing_angle])
                        translate([-(wing_w + 1), 0, 0])
                            cube([wing_w + 1, wing_w + 1, bump_h + 0.02]);
            }
        }
        // Full-width channel — extends through bumper walls for full 16mm effective grip
        // Hull trims the channel to the trapezoidal footprint at inner corner (a few mm at X≈0)
        translate([-0.01, ch_yc - ch_w/2, wbase_plate_h - ch_d])
            cube([wing_w + 0.02, ch_w, ch_d + bump_h + 0.01]);
        // inner end magnet pockets
        for (by = [emag_ya, emag_yb, emag_yc, emag_yd])
            translate([-0.01, by, wbase_plate_h / 2])
                rotate([0, 90, 0])
                    cylinder(r = emag_r, h = emag_dep + 0.01);
    }
}

// =============================================================================
// BASE JUNCTION BRACKET
// Locks center base and wing base at exactly 30°.
// Sits on the table at the junction point.
// Slot A grips center base right edge; slot B grips wing base inner edge.
// Assembly: slide slot A over center base edge, then press wing base into slot B.
// Print 1 per side (2 total). Mirror in slicer for left side.
// =============================================================================

module base_junction(side = "right") {
    ang   = (side == "right") ? wing_angle : -wing_angle;
    bs_w  = wbase_plate_h + 0.4;   // 8.4mm — clears 8mm plate height in Z
    bs_d  = 15;                     // plate edge inserts 15mm
    bwall = 12;                     // arm thickness
    barm  = bs_d + bwall;           // 27mm arm length
    bh    = bwall * 2;              // 24mm bracket height — generous walls above/below slot
    bz    = (bh - bs_w) / 2;       // slot centered in bracket height: (24-8.4)/2 = 7.8mm

    difference() {
        // bracket body — wedge of two arms at wing_angle
        linear_extrude(height = bh)
            hull() {
                square([barm, bwall]);
                rotate(ang) square([barm, bwall]);
            }

        // slot A: center base right edge slides in from X=0, gripped top+bottom in Z
        // slot spans full arm width in Y (base plate passes through in Y)
        translate([-0.01, -0.01, bz])
            cube([bs_d + 0.01, bwall + 0.02, bs_w]);

        // slot B: wing base inner edge at wing_angle — same geometry, rotated
        rotate([0, 0, ang])
            translate([barm - bs_d - 0.01, -0.01, bz])
                cube([bs_d + 0.01, bwall + 0.02, bs_w]);
    }
}

// =============================================================================
// RENDER
// =============================================================================

if (RENDER == "wing_right") {
    color("gold") wing_panel();

} else if (RENDER == "wing_left") {
    color("gold") mirror([1, 0, 0]) wing_panel();

} else if (RENDER == "connector_right") {
    color("white") corner_connector("right");

} else if (RENDER == "connector_left") {
    color("white") corner_connector("left");

} else if (RENDER == "base_wing") {
    color("white") wing_base();

} else if (RENDER == "base_junction") {
    color("white") base_junction("right");

} else if (RENDER == "top_bracket_right") {
    color("white") top_bracket("right");

} else if (RENDER == "top_bracket_left") {
    color("white") top_bracket("left");

} else if (RENDER == "preview_both") {
    // right side
    color("Goldenrod") wing_panel();
    translate([0, -(wbase_d + 20), 0]) color("DimGray") wing_base();
    // left side (mirrored)
    mirror([1, 0, 0]) color("Goldenrod") wing_panel();
    translate([0, -(wbase_d + 20), 0]) mirror([1, 0, 0]) color("DimGray") wing_base();
}
