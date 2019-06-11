/* 
 * Initializing GL object
 */
var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if ( !gl ) alert("Could not initialise WebGL, sorry :-(");

    gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, validateNoneOfTheArgsAreUndefined);
}


/*
 * Initializing object geometries
 */
var meshes, meshTransforms;
var currentMesh, currentTransform;
function initMesh() {
    // Load object meshes
    meshes = [
        new OBJ.Mesh(bunny_mesh_str),
        new OBJ.Mesh(monkey_mesh_str),
        new OBJ.Mesh(hand_mesh_str),
    ];
    OBJ.initMeshBuffers(gl, meshes[0]);
    OBJ.initMeshBuffers(gl, meshes[1]);
    OBJ.initMeshBuffers(gl, meshes[2]);

    currentMesh = meshes[0];

    meshTransforms = [mat4.create(), mat4.create(), mat4.create()];

    // Set per-object transforms to make them better fitting the viewport

    mat4.identity(meshTransforms[0]);
    mat4.translate(meshTransforms[0], [0.5, 0, 0]);

    mat4.identity(meshTransforms[1]);
    mat4.scale(meshTransforms[1], [1.3, 1.3, 1.3]);
    mat4.translate(meshTransforms[1], [0, 0.65, 0]);
    mat4.rotateX(meshTransforms[1], -1.5708);

    mat4.identity(meshTransforms[2]);
    mat4.rotateY(meshTransforms[2], 3.14159);
    mat4.translate(meshTransforms[2], [1.5, 0.5, 0.5]);

    currentTransform = meshTransforms[0];
}


/*
 * Initializing shaders 
 */
var shaderPrograms;
var currentProgram;
var lightProgram;
function createShader(vs_id, fs_id) {
    var shaderProg = createShaderProg(vs_id, fs_id);

    shaderProg.vertexPositionAttribute = gl.getAttribLocation(shaderProg, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProg.vertexPositionAttribute);
    shaderProg.vertexNormalAttribute = gl.getAttribLocation(shaderProg, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProg.vertexNormalAttribute);        

    shaderProg.pMatrixUniform = gl.getUniformLocation(shaderProg, "uPMatrix");
    shaderProg.mvMatrixUniform = gl.getUniformLocation(shaderProg, "uMVMatrix");
    shaderProg.nMatrixUniform = gl.getUniformLocation(shaderProg, "uNMatrix");
    shaderProg.lightPosUniform = gl.getUniformLocation(shaderProg, "uLightPos");
    shaderProg.lightColorUniform = gl.getUniformLocation(shaderProg, "uLightColor");
    shaderProg.lightPowerUniform = gl.getUniformLocation(shaderProg, "uLightPower");
    shaderProg.backLightPosUniform = gl.getUniformLocation(shaderProg, "uBackLightPos");
    shaderProg.backLightColorUniform = gl.getUniformLocation(shaderProg, "uBackLightColor");
    shaderProg.backLightPropUniform = gl.getUniformLocation(shaderProg, "uBackLightProp");
    shaderProg.kdUniform = gl.getUniformLocation(shaderProg, "uDiffuseColor");
    shaderProg.interiorUniform = gl.getUniformLocation(shaderProg, "uInteriorColor");
    shaderProg.ambientUniform = gl.getUniformLocation(shaderProg, "uAmbient");
    shaderProg.subDistortionUniform = gl.getUniformLocation(shaderProg, "uDistortion");
    shaderProg.subPowerUniform = gl.getUniformLocation(shaderProg, "uPower");
    shaderProg.subScaleUniform = gl.getUniformLocation(shaderProg, "uScale");
    shaderProg.bumpOnUniform = gl.getUniformLocation(shaderProg, "uBumpOn");

    return shaderProg;
}

function initShaders() {
    shaderPrograms = [
        createShader("shader-vs", "shader-fs3-2"),
        createShader("shader-vs", "shader-fs4"),
    ];
    currentProgram = shaderPrograms[0];

    //
    // Declaring shading model specific uniform variables
    //

    // Blinn-Phong shading
    shaderPrograms[0].exponentUniform = gl.getUniformLocation(shaderPrograms[0], "uExponent");
    gl.useProgram(shaderPrograms[0]);
    gl.uniform1f(shaderPrograms[0].exponentUniform, 50.0);

    // Microfacet shading
    shaderPrograms[1].iorUniform = gl.getUniformLocation(shaderPrograms[1], "uIOR");
    shaderPrograms[1].betaUniform = gl.getUniformLocation(shaderPrograms[1], "uBeta");
    gl.useProgram(shaderPrograms[1]);
    gl.uniform1f(shaderPrograms[1].iorUniform, 5.0);
    gl.uniform1f(shaderPrograms[1].betaUniform, 0.2);

    // Initializing light source drawing shader
    lightProgram = createShaderProg("shader-vs-light", "shader-fs-light");
    lightProgram.vertexPositionAttribute = gl.getAttribLocation(lightProgram, "aVertexPosition");
    gl.enableVertexAttribArray(lightProgram.vertexPositionAttribute);
    lightProgram.pMatrixUniform = gl.getUniformLocation(lightProgram, "uPMatrix");
}


/*
 * Initializing buffers
 */
var lightPositionBuffer;
function initBuffers() {
    lightPositionBuffer = gl.createBuffer();
}


/*
 * Main rendering code 
 */

// Basic rendering parameters
var mvMatrix = mat4.create();                   // Model-view matrix for the main object
var pMatrix = mat4.create();                    // Projection matrix

// Lighting control
var lightMatrix = mat4.create();                // Model-view matrix for the point light source
var lightPos = vec3.create();                   // Camera-space position of the light source
var lightPower = 5.0;                           // "Power" of the light source
var lightColor = [1.0, 1.0, 1.0];
var backLightPos = vec3.create();
var backLightColor = [0.8984375, 0.56640625, 0.21875];
var backLightProp = 0.5;
var bumpOn = 0.0;

// Common parameters for shading models
var diffuseColor = [0.875, 0.4, 0.4];    // Diffuse color
var interiorColor = [0.875, 0.4, 0.4];
var ambientIntensity = 0.1;                     // Ambient
var subDistortion = 0.5;
var subPower = 1.0;
var subScale = 1.0;

// Animation related variables
var rotY = 0.0;                                 // object rotation
var rotY_light = 0.0;                           // light position rotation
var rotY_backLight = 0.0;

function setUniforms(prog) {
    gl.uniformMatrix4fv(prog.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(prog.mvMatrixUniform, false, mvMatrix);

    var nMatrix = mat4.transpose(mat4.inverse(mvMatrix));
    gl.uniformMatrix4fv(prog.nMatrixUniform, false, nMatrix);

    gl.uniform3fv(prog.lightPosUniform, lightPos);
    gl.uniform1f(prog.lightPowerUniform, lightPower);
    gl.uniform3fv(prog.lightColorUniform, lightColor);
    gl.uniform3fv(prog.backLightPosUniform, backLightPos);
    gl.uniform3fv(prog.backLightColorUniform, backLightColor);
    gl.uniform1f(prog.backLightPropUniform, backLightProp);
    gl.uniform3fv(prog.kdUniform, diffuseColor);
    gl.uniform3fv(prog.interiorUniform, interiorColor);
    gl.uniform1f(prog.ambientUniform, ambientIntensity);
    gl.uniform1f(prog.subDistortionUniform, subDistortion);
    gl.uniform1f(prog.subPowerUniform, subPower);
    gl.uniform1f(prog.subScaleUniform, subScale);
    gl.uniform1f(prog.bumpOnUniform, bumpOn);
}

var draw_light = false;
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(35, gl.viewportWidth/gl.viewportHeight, 0.1, 1000.0, pMatrix);

    mat4.identity(lightMatrix);
    mat4.translate(lightMatrix, [0.0, -1.0, -7.0]);
    mat4.rotateX(lightMatrix, 0.3);
    mat4.rotateY(lightMatrix, rotY_light);

    lightPos.set([0.0, 2.5, 3.0]);
    backLightPos.set([-3.0 * Math.sin(rotY_backLight), 1.0, -3.0 * Math.cos(rotY_backLight)]);
    mat4.multiplyVec3(lightMatrix, lightPos);
    mat4.multiplyVec3(lightMatrix, backLightPos);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, -1.0, -7.0]);
    mat4.rotateX(mvMatrix, 0.3);
    mat4.rotateY(mvMatrix, rotY);
    mat4.multiply(mvMatrix, currentTransform);

    gl.useProgram(currentProgram);
    setUniforms(currentProgram);   

    gl.bindBuffer(gl.ARRAY_BUFFER, currentMesh.vertexBuffer);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, currentMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, currentMesh.normalBuffer);
    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, currentMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, currentMesh.indexBuffer);
    gl.drawElements(gl.TRIANGLES, currentMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    if ( draw_light ) {
        gl.useProgram(lightProgram);
        gl.uniformMatrix4fv(lightProgram.pMatrixUniform, false, pMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, lightPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(lightPos), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(lightProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, 1);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(backLightPos), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(lightProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

var lastTime = 0;
var rotSpeed = 60, rotSpeed_light = 60;
var animated = false, animated_light = false;
function tick() {
    requestAnimationFrame(tick);

    var timeNow = new Date().getTime();
    if ( lastTime != 0 ) {
      var elapsed = timeNow - lastTime;
      if ( animated )
        rotY += rotSpeed*0.0175*elapsed/1000.0;
      if ( animated_light )
        rotY_light += rotSpeed_light*0.0175*elapsed/1000.0;
    }
    lastTime = timeNow;        

    drawScene();
}

function webGLStart() {
    var canvas = $("#canvas0")[0];

    initGL(canvas);
    initMesh();
    initShaders();
    initBuffers();

    gl.clearColor(0.125, 0.125, 0.125, 1.0);
    gl.enable(gl.DEPTH_TEST);

    currentProgram = shaderPrograms[0];
    tick();
}
