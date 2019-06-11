A simple Sub-Surface Scattering demo in WebGL.
(c) 2019 Madison Huang

[INSTALLATION]

Simply unzip this folder and open the HTML file.

[OPTIONS]

Top Menu
    Object Menu: Drop-down to choose a 3D model.
    Resolution Menu: Drop-down to resize the canvas.
    Animated Object: Check to rotate the model. The slider determines speed.

Light Source Parameters
    Light Color: Select color of primary, high-angle light source.
    Backlight Color: Select color of secondary, low-angle light source.
    Light Power: The intensity of the primary light source.
    Backlight Angle: The relative rotational angle of the secondary light.
	By default, both lights are 180 degrees apart.
    Backlight Proportion: The proportion of light power the secondary light
	emits. By default, this is half the primary light's power.
    Draw light source: Check to draw the lights as points (self-explanatory).
    Animated light: Check to rotate the lights. The slider determines speed.

Shading Parameters
    Shader Menu: Drop-down to choose a fragment shader.
    Diffuse Color: The main, surface level color of the object.
    Interior Color: The inside "undertone" color of the object, visible
	when light shines on it from behind.
    Ambient, Distortion, Power, Scale: SSS shader parameters to play with.
    Bumpy texture: Check to render a random pseudo-bumpmap texture.
	Essentially just white noise on the normal buffer.
    Shading Parameter Panel: Per-shader options for specular reflection.


[CREDITS]

Suzanne model created by Blender Foundation.
Hand model by Jeremy E. Grayson under CC Attribution.
https://sketchfab.com/3d-models/low-poly-human-hands-all-quads-027173f5759f473b9dfeee724ea0f7f6