// PrimeBind Toploader Lean Stand
// Case sits in an angled groove and leans back 15° — window faces viewer
// Gravity seats the case deeper into the groove — self-stabilizing

$fn = 64;

// ─── CASE REFERENCE ────────────────────────────────────────────
case_w = 92.0;
case_d = 10.0;
r_case = 4.0;

// ─── STAND PARAMS ──────────────────────────────────────────────
lean    = 15;       // degrees from vertical — case leans backward
base_w  = 108.0;   // oval width (8mm each side of case)
base_d  = 60.0;    // oval depth — deeper = more stable
base_h  = 15.0;    // stand height
g_depth = 6.2;     // groove depth along lean axis (6mm vertical — clears 7mm window start)

cut_l = case_w + 0.4;   // 92.4mm — 0.2mm clearance per side
cut_w = case_d + 0.4;   // 10.4mm

// ─── GROOVE PROFILE ────────────────────────────────────────────
module groove_shape(h) {
    hull() {
        for (xi = [r_case, cut_l - r_case])
            for (yi = [r_case, cut_w - r_case])
                translate([xi, yi, 0]) cylinder(r=r_case, h=h, $fn=32);
    }
}

// ─── STAND ─────────────────────────────────────────────────────
module stand() {
    difference() {
        // oval base centered at origin
        scale([base_w / base_d, 1, 1])
            cylinder(r = base_d / 2, h = base_h);

        // angled groove — rotate around X tilts groove toward back (+Y)
        // case inserted at 15° lean slots in and gravity holds it
        translate([0, 0, base_h])
            rotate([lean, 0, 0])
                translate([-cut_l/2, -cut_w/2, -g_depth])
                    groove_shape(g_depth + 1);
    }
}

color("white") stand();
