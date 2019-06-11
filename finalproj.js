/*
 * Changing active object and shader
 */
function changeActiveMesh(sel) {
    var id = parseInt(sel.value, 10);
    currentMesh = meshes[id];
    currentTransform = meshTransforms[id];
}

function changeActiveShader(sel) {
    var id = parseInt(sel.value, 10);
    currentProgram = shaderPrograms[id];

    $("[class$='-panel']").css("display", "none");

    switch ( id ) {

        case 0: // Blinn-Phong
            $(".blinn-phong-panel").css("display", "");
            break;

        case 1: // Microfacet
            $(".microfacet-panel").css("display", "");
            break;
    }
}

function changeResolution(sel) {
    var id = parseInt(sel.value, 10);

    var width = 0, height = 0;
    switch ( id ) {
        case 0:
            width = 640; height = 360; break;

        case 1:
            width = 800; height = 450; break;

        case 2:
            width = 960; height = 540; break;

        default:
            alert("Unknown resolution!");
    }

    if ( width > 0 ) {
        var canvas = $("#canvas0")[0];
        
        canvas.width = width; 
        canvas.height = height;

        gl.viewportWidth = width;
        gl.viewportHeight = height;
    }
}


/*
 * Slider bar handlers
 */
function changeAnimatedState(ifAnimated) {
    animated = ifAnimated;
    $("#sliderBar").prop("disabled", !animated);
}

function updateSlider(sliderAmount) {
    $("#sliderAmount").html(sliderAmount*10);
    rotSpeed = sliderAmount*10.0;
}

function changeShowLightState(ifShow) {
    draw_light = ifShow;
}

function changeBumpTexState(ifBump) {
    if (ifBump)
        bumpOn = 1.0;
    else
        bumpOn = 0.0;
}

function changeAnimatedLightState(ifAnimated) {
    animated_light = ifAnimated;
    $("#sliderBarLight").prop("disabled", !animated_light);
}

function updateSliderLight(sliderAmount) {
    var value = sliderAmount*10.0;
    $("#sliderAmountLight").html(value);
    rotSpeed_light = value;
}

function updateSlider_LightPower(sliderAmount) {
    var value = sliderAmount/2.0;
    $("#sliderAmount_LightPower").html(value);
    lightPower = value;
}
function updateSlider_BackLightAngle(sliderAmount) {
    var value = (sliderAmount - 45.0) * 2.0;
    $("#sliderAmount_BackLightAngle").html(value + "°");
    rotY_backLight = value * 3.14159256 / 180.0;
}

function updateSlider_BackLightProp(sliderAmount) {
    var value = sliderAmount/20.0;
    $("#sliderAmount_BackLightProp").html(value);
    backLightProp = value;
}

function updateSlider_Ambient(sliderAmount) {
    var value = sliderAmount/100.0;
    $("#sliderAmount_Ambient").html(value);
    ambientIntensity = value;
}

function updateSlider_Distortion(sliderAmount) {
    var value = sliderAmount/50.0;
    $("#sliderAmount_Distortion").html(value);
    subDistortion = value;
}

function updateSlider_Power(sliderAmount) {
    var value = sliderAmount/10.0;
    $("#sliderAmount_Power").html(value);
    subPower = value;
}

function updateSlider_Scale(sliderAmount) {
    var value = sliderAmount/10.0;
    $("#sliderAmount_Scale").html(value);
    subScale = value;
}

function updateSlider_PhongExp(sliderAmount) {
    var value = sliderAmount*5;
    $("#sliderAmount_PhongExp").html(value);

    gl.useProgram(shaderPrograms[0]);
    gl.uniform1f(shaderPrograms[0].exponentUniform, value);
}

function updateSlider_BlinnPhongExp(sliderAmount) {
    var value = sliderAmount*5;
    $("#sliderAmount_BlinnPhongExp").html(value);

    gl.useProgram(shaderPrograms[0]);
    gl.uniform1f(shaderPrograms[0].exponentUniform, value);
}

function updateSlider_MicrofacetIOR(sliderAmount) {
    var value = sliderAmount/10.0;
    $("#sliderAmount_MicrofacetIOR").html(value);

    gl.useProgram(shaderPrograms[1]);
    gl.uniform1f(shaderPrograms[1].iorUniform, value);
}

function updateSlider_MicrofacetBeta(sliderAmount) {
    var value = sliderAmount/100.0;
    $("#sliderAmount_MicrofacetBeta").html(value);

    gl.useProgram(shaderPrograms[1]);
    gl.uniform1f(shaderPrograms[1].betaUniform, value);
}

/*
 * Page-load handler
 */
$(function() {
    var colorPalette = [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["##d03a3a","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
    ];

    $("#diffuseColorPicker").spectrum({
        color: "#e06666",
        showPaletteOnly: true,
        togglePaletteOnly: true,
        hideAfterPaletteSelect: true,
        palette: colorPalette,
        change: function(color) {
            var color_ = color.toRgb();
            $("#diffuseColorText").html(color.toHexString());
            diffuseColor = [color_.r/255.0, color_.g/255.0, color_.b/255.0];
        }
    });

    $("#interiorColorPicker").spectrum({
        color: "#e06666",
        showPaletteOnly: true,
        togglePaletteOnly: true,
        hideAfterPaletteSelect: true,
        palette: colorPalette,
        change: function(color) {
            var color_ = color.toRgb();
            $("#interiorColorText").html(color.toHexString());
            interiorColor = [color_.r/255.0, color_.g/255.0, color_.b/255.0];
        }
    });

    $("#lightColorPicker").spectrum({
        color: "#ffffff",
        showPaletteOnly: true,
        togglePaletteOnly: true,
        hideAfterPaletteSelect: true,
        palette: colorPalette,
        change: function(color) {
            var color_ = color.toRgb();
            $("#lightColorText").html(color.toHexString());
            lightColor = [color_.r/255.0, color_.g/255.0, color_.b/255.0];
        }
    });

    $("#backLightColorPicker").spectrum({
        color: "#e69138",
        showPaletteOnly: true,
        togglePaletteOnly: true,
        hideAfterPaletteSelect: true,
        palette: colorPalette,
        change: function(color) {
            var color_ = color.toRgb();
            $("#backLightColorText").html(color.toHexString());
            backLightColor = [color_.r/255.0, color_.g/255.0, color_.b/255.0];
        }
    });

    webGLStart();
});
