// PrimeBind TCG Content Backdrop — V2: Rarity Sort Foot
//
// PANEL:  Identical to V1 — no changes whatsoever.
// FOOT:   Same outer dimensions as V1 (50.6mm deep, 320mm wide, same jaw heights).
//         ONLY change: 4 equal card slots → 5 rarity-proportioned card notches.
//
// Think open laptop: panel = screen (stands up), foot = base (lies flat).
// Card-shaped notches are cut into the front face of the foot base.
// Cards slot in as they're pulled — C notch is widest, HIT is narrowest.
//
//   Notch widths (X):  C=76mm  U=62mm  RH=49mm  R=49mm  HIT=49mm
//   All notch depths, heights, and lip geometry: identical to V1 slot geometry
//
// ─── EXPORT ───────────────────────────────────────────────────────────────────
//   1. tcg_backdrop_panel.stl       → backdrop_panel()     [unchanged from V1]
//   2. tcg_backdrop_logo.stl        → backdrop_logo_fill() [unchanged from V1]
//   3. tcg_backdrop_foot_v2.stl     → backdrop_foot()      [5 rarity notches]
//   4. tcg_peg_base.stl             → pokemon_peg_base()   [unchanged from V1]

// ─── PANEL (unchanged) ────────────────────────────────────────────────────────
panel_w   = 320;
panel_h   = 250;
panel_t   = 14;
r_panel   = 8;

// ─── LOGO (unchanged) ────────────────────────────────────────────────────────
logo_scale = 0.85;
logo_depth = 2.0;
logo_tx    = panel_w/2 + 305;
logo_ty    = panel_h/2 + 255;

// ─── PEG RING (unchanged) ────────────────────────────────────────────────────
peg_dia    = 8.4;
peg_dep    = 12;
peg_ring_r = 100;

// ─── INTERLOCK (unchanged) ───────────────────────────────────────────────────
tab_w   = 8;
tab_h   = 28;
tab_z0  = 2;
tab_gap = 0.4;

// ─── FOOT GEOMETRY (all identical to V1) ─────────────────────────────────────
foot_wall_t  = 9;
foot_gap     = panel_t + 0.6;   // 14.6mm
foot_grip_h  = 20;
foot_base_h  = 8;
foot_stand_d = 18;              // card notch area depth — unchanged
foot_stand_h = 25;              // card notch opening height — unchanged
slot_z_start = 10;              // notch floor Z — unchanged
back_jaw_h   = 60;
foot_lip_d   = 4;               // front lip depth at base of each notch
foot_lip_h   = 10;              // front lip catch height

front_jaw_y  = foot_stand_d;                           // 18mm
back_jaw_y   = foot_stand_d + foot_wall_t + foot_gap;  // 41.6mm
foot_total_d = foot_stand_d + foot_wall_t + foot_gap + foot_wall_t; // 50.6mm

// ─── RARITY NOTCH WIDTHS (V2 only change) ────────────────────────────────────
// Left → right: C (most common, widest) to HIT (rarest, card-width)
// Width reflects expected cards per pack: C=6, U=3, RH=1, R=~1, HIT=<1
rarity_w   = [76, 62, 49, 49, 49];   // C, U, RH, R, HIT
rarity_sep = 7;                        // wall thickness between notches

// Center the 5 notches within panel_w
rarity_total = rarity_w[0]+rarity_w[1]+rarity_w[2]+rarity_w[3]+rarity_w[4]
             + 4 * rarity_sep;
rarity_x0 = (panel_w - rarity_total) / 2;   // left margin ≈ 3.5mm

// ─── SYMBOL EMBOSS ───────────────────────────────────────────────────────────
sym_dep = 0.8;

// ─── PEG BASE (unchanged) ────────────────────────────────────────────────────
peg_base_r   = 18;
peg_base_h   = 4;
peg_male_h   = 13;
peg_male_dia = peg_dia - 0.4;

$fn = 48;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function rarity_x(i) = rarity_x0
    + (i > 0 ? rarity_w[0] + rarity_sep : 0)
    + (i > 1 ? rarity_w[1] + rarity_sep : 0)
    + (i > 2 ? rarity_w[2] + rarity_sep : 0)
    + (i > 3 ? rarity_w[3] + rarity_sep : 0);

function rarity_cx(i) = rarity_x(i) + rarity_w[i] / 2;

module star_2d(r_out, r_in) {
    polygon([for (i = [0:9])
        let(a = i * 36 - 90, r = (i % 2 == 0) ? r_out : r_in)
        [r * cos(a), r * sin(a)]]);
}

// ════════════════════════════════════════════════════════════════════════════
// LOGO — identical to V1
// ════════════════════════════════════════════════════════════════════════════

module logo_profile() {
    translate([-1122.52/2, -793.70/2]) import("primebindlogo.svg");
}

module logo_pocket() {
    translate([logo_tx, logo_ty, panel_t - logo_depth])
        scale([logo_scale, logo_scale, 1])
            linear_extrude(height = logo_depth + 1) logo_profile();
}

module backdrop_logo_fill() {
    color("white")
    translate([logo_tx, logo_ty, panel_t - logo_depth])
        scale([logo_scale, logo_scale, 1])
            linear_extrude(height = logo_depth) logo_profile();
}

// ════════════════════════════════════════════════════════════════════════════
// PANEL — identical to V1
// ════════════════════════════════════════════════════════════════════════════

module panel_body() {
    hull() {
        for (xi = [r_panel, panel_w - r_panel])
            for (yi = [r_panel, panel_h - r_panel])
                translate([xi, yi, 0]) cylinder(r=r_panel, h=panel_t);
    }
}

module backdrop_panel() {
    difference() {
        union() {
            panel_body();
            translate([panel_w, panel_h/2 - tab_h/2, tab_z0])
                cube([tab_w, tab_h, panel_t - 2*tab_z0]);
        }
        translate([-0.01, panel_h/2 - tab_h/2 - tab_gap/2, tab_z0 - tab_gap/2])
            cube([tab_w + 0.01, tab_h + tab_gap, panel_t - 2*tab_z0 + tab_gap]);
        logo_pocket();
        for (a = [0 : 45 : 315]) {
            px = logo_tx + peg_ring_r * cos(a);
            py = logo_ty + peg_ring_r * sin(a);
            translate([px, py, panel_t - peg_dep])
                cylinder(d=peg_dia, h=peg_dep + 1);
        }
    }
}

// ════════════════════════════════════════════════════════════════════════════
// RARITY SYMBOLS — carved into front lip face of each notch
// Slot lip face: Y=0, Z=0..slot_z_start+foot_lip_h (= 0..20mm solid)
// Symbol centered at Z = slot_z_start + foot_lip_h/2 = 15mm
// ════════════════════════════════════════════════════════════════════════════

sym_cz = slot_z_start + foot_lip_h / 2;   // = 15mm, always below card, always visible

module sym_C() {
    // ◯ open ring — common, utilitarian
    translate([rarity_cx(0), -0.1, sym_cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    difference() { circle(r=5.5); circle(r=3.5); }
}

module sym_U() {
    // ◇ open diamond — uncommon
    translate([rarity_cx(1), -0.1, sym_cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    rotate([0, 0, 45])
    difference() { square(10, center=true); square(6, center=true); }
}

module sym_RH() {
    // ☆ open star — reverse holo, foil but not a hit
    translate([rarity_cx(2), -0.1, sym_cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1)
    difference() {
        star_2d(6, 2.6);
        scale([0.56, 0.56]) star_2d(6, 2.6);
    }
}

module sym_R() {
    // ★ filled star — rare
    translate([rarity_cx(3), -0.1, sym_cz]) rotate([90, 0, 0])
    linear_extrude(sym_dep + 0.1) star_2d(6, 2.6);
}

module sym_HIT() {
    // ★★★ triple star — the event
    for (dx = [-10, 0, 10]) {
        translate([rarity_cx(4) + dx, -0.1, sym_cz]) rotate([90, 0, 0])
        linear_extrude(sym_dep + 0.1) star_2d(4.5, 2.0);
    }
}

// ════════════════════════════════════════════════════════════════════════════
// FOOT — same outer dims as V1, rarity notches replace 4 equal card slots
// ════════════════════════════════════════════════════════════════════════════

module backdrop_foot() {
    difference() {
        union() {
            // Base plate — full foot depth (unchanged)
            cube([panel_w, foot_total_d, foot_base_h]);
            // Card notch area — front face, same height as V1
            cube([panel_w, foot_stand_d, slot_z_start + foot_stand_h]);
            // Front grip jaw (unchanged)
            translate([0, front_jaw_y, 0])
                cube([panel_w, foot_wall_t, foot_grip_h]);
            // Back jaw — counterweight (unchanged)
            translate([0, back_jaw_y, 0])
                cube([panel_w, foot_wall_t, back_jaw_h]);
        }

        // ── 5 RARITY NOTCH CUTS ───────────────────────────────────────────────
        // Geometry identical to V1 slot cuts — only widths change.
        // C is widest (6 cards/pack), HIT is card-width (rare pull).
        for (i = [0:4]) {
            sx = rarity_x(i);
            sw = rarity_w[i];

            // Main notch cut — behind the front lip
            translate([sx, foot_lip_d, slot_z_start])
                cube([sw, foot_stand_d - foot_lip_d + 0.01, foot_stand_h + 1]);

            // Trim front lip above foot_lip_h — short catch nub only
            translate([sx, -0.01, slot_z_start + foot_lip_h])
                cube([sw, foot_lip_d + 0.01, foot_stand_h - foot_lip_h + 1]);
        }

        // ── RARITY SYMBOLS on front lip face ─────────────────────────────────
        sym_C();
        sym_U();
        sym_RH();
        sym_R();
        sym_HIT();
    }
}

// ════════════════════════════════════════════════════════════════════════════
// POKEMON PEG BASE — identical to V1
// ════════════════════════════════════════════════════════════════════════════

module pokemon_peg_base() {
    cylinder(r=peg_base_r, h=peg_base_h);
    translate([0, 0, peg_base_h])
        cylinder(d=peg_male_dia, h=peg_male_h);
}

// ════════════════════════════════════════════════════════════════════════════
// RENDER PREVIEW
// ════════════════════════════════════════════════════════════════════════════

backdrop_panel();
backdrop_logo_fill();

translate([0, -(foot_total_d + 25), 0])
    backdrop_foot();

translate([panel_w + 30, 0, 0])
    pokemon_peg_base();
