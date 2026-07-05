// PrimeBind Cap — Josef name inlay (WHITE filament)
// Import alongside cap_josef_black.stl in Creality Print as multicolor

binder_w   = 264.7;
fit_gap    = 2.0;
side_wall  = 12.0;
inner_w    = binder_w + fit_gap;
outer_w    = inner_w + 2*side_wall;
cap_h      = 45;

name_text  = "Josef";
name_size  = 22;
name_font  = "Bunken Tech Sans Pro ExBd:style=Italic";
name_depth = 1.5;

$fn = 32;

translate([outer_w/2 - 0.2, name_depth, cap_h/2 - 4])
    rotate([90, 0, 0])
        linear_extrude(height = name_depth)
            text(name_text, size = name_size, font = name_font,
                 halign = "center", valign = "center");
