// PrimeBind Influencer Case — Named Cap: KIKE
// Two-color multi-material print for K2 Plus CFS.
// Cap body prints in BLACK (Filament 1), name fill prints in WHITE (Filament 2).
// Both STLs share the same coordinate origin — load together in OrcaSlicer as
// one object with two parts for automatic alignment.
//
// ─── FONT NOTE ───────────────────────────────────────────────────────────────
//   Uses Bunken Tech Sans Pro ExtraBold Italic — PrimeBind brand font.
//   Font file: primebindfont.ttf (in this directory).
//   Install: double-click primebindfont.ttf → Install Font
//   Restart OpenSCAD. Verify: Help → Font List → search "Bunken Tech Sans Pro".
//
// ─── EXPORT WORKFLOW ─────────────────────────────────────────────────────────
//   STL 1 (black cap):  comment out name_fill() at bottom → Export as STL
//                       → save as pb_cap_kike_black.stl
//   STL 2 (white fill): comment out cap_named() at bottom → Export as STL
//                       → save as pb_cap_kike_white.stl
//
// ─── ORCASLICER MULTI-COLOR WORKFLOW ────────────────────────────────────────
//   1. File → New Project
//   2. Import pb_cap_kike_black.stl  (DO NOT rotate — open bottom must face bed)
//   3. Right-click cap → Add Part → select pb_cap_kike_white.stl
//   4. In Objects list: select the white part → set Filament = 2 (white)
//   5. Slice — K2 Plus CFS auto-switches filament for the letter layers

// ─── SHARED DIMS (must match pb_influencer_magnet.scad exactly) ──────────────
binder_w   = 260;
binder_d   = 34;
fit_gap    = 2.0;
face_wall  = 3.0;
side_wall  = 9.0;
inner_w    = binder_w + fit_gap;          // 262
inner_d    = binder_d + fit_gap;          // 36
outer_w    = inner_w + 2*side_wall;       // 280
outer_d    = inner_d + 2*face_wall;       // 42
cap_h      = 45;
r_edge     = 8.0;

// ─── MAGNETS ─────────────────────────────────────────────────────────────────
mag_r       = 4.2;
mag_dep     = 3.2;
mag_y_front = 10;
mag_y_back  = outer_d - 10;   // 32

// ─── NAME ────────────────────────────────────────────────────────────────────
name_text   = "KIKE";
text_font   = "Bunken Tech Sans Pro ExBd:style=ExtraBold Italic";
text_size   = 24;
text_depth  = 2.0;            // depth of pocket AND thickness of fill piece
text_x      = outer_w / 2;   // centered left-right on front face
text_z      = cap_h / 2 - 3.5;

$fn = 32;

// ─── ROUNDED BOX HELPER ──────────────────────────────────────────────────────
module rrect_flat_bottom(x, y, z, r) {
    hull() {
        cube([x, y, 0.01]);
        for (xi = [r, x-r]) for (yi = [r, y-r])
            translate([xi, yi, z-r]) sphere(r=r, $fn=16);
    }
}

// ─── NAME POCKET ─────────────────────────────────────────────────────────────
// Cuts 2mm into the front face (Y=0 side). The 0.1 overcut ensures clean mesh.
module name_pocket() {
    translate([text_x, text_depth + 0.1, text_z])
        rotate([90, 0, 0])
            linear_extrude(height = text_depth + 0.1)
                text(name_text, size=text_size, font=text_font,
                     halign="center", valign="center");
}

// ─── NAME FILL (white part — same coordinates as pocket) ─────────────────────
// Sits at Y=0..text_depth — exactly fills the pocket, flush with exterior face.
// This is Filament 2 (white) in OrcaSlicer.
module name_fill() {
    color("white")
    translate([text_x, text_depth, text_z])
        rotate([90, 0, 0])
            linear_extrude(height = text_depth)
                text(name_text, size=text_size, font=text_font,
                     halign="center", valign="center");
}

// ─── CAP BODY (black) ────────────────────────────────────────────────────────
module cap_named() {
    difference() {
        rrect_flat_bottom(outer_w, outer_d, cap_h, r_edge);

        // interior cavity
        translate([side_wall, face_wall, 0])
            cube([inner_w, inner_d, cap_h - face_wall]);

        // magnet pockets — start at Z=0 so cap bottom stays flat on bed
        for (mx = [side_wall/2, outer_w - side_wall/2])
            for (my = [mag_y_front, mag_y_back])
                translate([mx, my, 0])
                    cylinder(r=mag_r, h=mag_dep);

        // name pocket on front face
        name_pocket();
    }
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
// Preview: both parts assembled (shows final look).
// To export black STL: comment out name_fill()
// To export white STL: comment out cap_named()
color("dimgray") cap_named();
name_fill();
