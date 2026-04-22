"use strict";

import shaderSourceScreenFillingTriangle from '../shaders/vertex/screen_filling_triangle.glsl?raw';
import shaderSourceHeader                from '../shaders/fragment/0_header.glsl?raw';
import shaderSourcePrecision             from '../shaders/fragment/1_precision.glsl?raw';
import shaderSourceConstants             from '../shaders/fragment/2_constants.glsl?raw';
import shaderSourceData                  from '../shaders/fragment/3_data.glsl?raw';

import shaderSourceGeometrySphere        from '../shaders/fragment/geometry_sphere.glsl?raw';
import shaderSourceGeometryPlane         from '../shaders/fragment/geometry_plane.glsl?raw';
import shaderSourceGeometryTriangle      from '../shaders/fragment/geometry_triangle.glsl?raw';
import shaderSourceGeometryScene         from '../shaders/fragment/geometry_scene.glsl?raw';

import shaderSourceToneMapping           from '../shaders/fragment/tone_mapping.glsl?raw';
import shaderSourceRayTracing            from '../shaders/fragment/ray_tracing.glsl?raw';

import shaderSourceVertexTransformVectors from '../shaders/vertex/transform_vectors.glsl?raw';
import shaderSourceFragmentTransformVectors from '../shaders/fragment/transform_vectors.glsl?raw';

import shaderSourceVertexLowRes from '../shaders/vertex/low_res.glsl?raw';
import shaderSourceFragmentLowRes from '../shaders/fragment/low_res.glsl?raw';

import shaderSourceVertexSensorMapReduce from '../shaders/vertex/sensor_map_reduce.glsl?raw';
import shaderSourceFragmentSensorMapReduce from '../shaders/fragment/sensor_map_reduce.glsl?raw';

import { computeSceneData } from './utils/scene';
import { loadShader, loadProgram, loadDataTexture } from './utils/gl';
import { scalar, vec4, mat4 } from './utils/math';
import { SCENE } from '../data/scene.js';
import { ATTRIBUTES } from '../data/attributes.js';
import { COLLISION_BOXES, isPointInBox } from '../data/collisionBoxes.js';
import { ROOM_RANGES } from '../data/roomRanges.js';

let PIXEL_SCALE = 4;
let MIN_PIXEL_SCALE = 16;

main();

function toggleResolution(appContext)
{
    PIXEL_SCALE += 1;
    if (MIN_PIXEL_SCALE < PIXEL_SCALE)
    {
        PIXEL_SCALE = 1;
    }
    onResize(appContext);
}

function setShouldRenderNode(appContext, path, shouldRender)
{
    let node = SCENE.root;
    for (const nodeName of path)
    {
        node = node.children.find((x) => x.name === nodeName);
    }
    const indices = appContext.objects
        .filter((x) => x.parent === node)
        .map((x) => appContext.objects.findIndex((y) => y === x));
    for (const i of indices)
    {
        appContext.renderObject[i] = shouldRender;
    }
}

// #region Load GPU Programs

function loadProgramRaytracing(gl, attributeNamesScalar, attributeNamesVector)
{
    const shaderVertex = loadShader(gl, gl.VERTEX_SHADER, shaderSourceScreenFillingTriangle);

    if (shaderVertex === null)
    {
        document.body.append(":') Failed to load shaderScreenFillingTriangle");
        return;
    }

    const shaderFragment = loadShader(gl, gl.FRAGMENT_SHADER, [
        shaderSourceHeader,
        shaderSourcePrecision,
        shaderSourceConstants,
        attributeNamesScalar.map((x, i) => `#define ATTRIBUTE_${x.toUpperCase()} ${i}\n`).join(''),
        attributeNamesVector.map((x, i) => `#define ATTRIBUTE_${x.toUpperCase()} ${i}\n`).join(''),
        shaderSourceData,
        shaderSourceGeometrySphere,
        shaderSourceGeometryPlane,
        shaderSourceGeometryTriangle,
        shaderSourceGeometryScene,
        shaderSourceToneMapping,
        shaderSourceRayTracing,
    ].join("\n"));

    if (shaderFragment === null)
    {
        document.body.append(":') Failed to load shaderRayTracing");
        return;
    }

    return loadProgram(gl, shaderVertex, shaderFragment);
}

function loadProgramTransformVectors(gl)
{
    const shaderVertex = loadShader(gl, gl.VERTEX_SHADER, shaderSourceVertexTransformVectors);

    if (shaderVertex === null)
    {
        document.body.append(":') Failed to load vertex shader for [transform_vectors]");
        return;
    }

    const shaderFragment = loadShader(gl, gl.FRAGMENT_SHADER, [
        shaderSourceHeader,
        shaderSourcePrecision,
        shaderSourceFragmentTransformVectors,
    ].join("\n"));

    if (shaderFragment === null)
    {
        document.body.append(":') Failed to load fragment shader for [transform_vectors]");
        return;
    }

    return loadProgram(gl, shaderVertex, shaderFragment);
}

function loadProgramLowRes(gl)
{
    const shaderVertex = loadShader(gl, gl.VERTEX_SHADER, shaderSourceVertexLowRes);

    if (shaderVertex === null)
    {
        document.body.append(":') Failed to load vertex shader for [low_res]");
        return;
    }

    const shaderFragment = loadShader(gl, gl.FRAGMENT_SHADER, [
        shaderSourceHeader,
        shaderSourcePrecision,
        shaderSourceFragmentLowRes,
    ].join("\n"));

    if (shaderFragment === null)
    {
        document.body.append(":') Failed to load fragment shader for [low_res]");
        return;
    }

    return loadProgram(gl, shaderVertex, shaderFragment);
}

function loadProgramSensorMapReduce(gl)
{
    const shaderVertex = loadShader(gl, gl.VERTEX_SHADER, shaderSourceVertexSensorMapReduce);

    if (shaderVertex === null)
    {
        document.body.append(":') Failed to load vertex shader for [sensor_map_reduce]");
        return;
    }

    const shaderFragment = loadShader(gl, gl.FRAGMENT_SHADER, [
        shaderSourceHeader,
        shaderSourcePrecision,
        shaderSourceFragmentSensorMapReduce,
    ].join("\n"));

    if (shaderFragment === null)
    {
        document.body.append(":') Failed to load fragment shader for [sensor_map_reduce]");
        return;
    }

    return loadProgram(gl, shaderVertex, shaderFragment);
}

// #endregion

function main()
{
    const sceneData = computeSceneData();

    //

    // console.log('---');
    // console.log(sceneData.objectCount);
    // console.log(sceneData.scalars);
    // console.log(sceneData.scalars.attributeNames);
    // console.log(sceneData.scalars.objectAttributeMasks);
    // console.log(sceneData.scalars.objectAttributePointerLists);
    // console.log(sceneData.scalars.objectAttributePointers);
    // console.log(sceneData.scalars.objectAttributeValues);
    // console.log('');

    // console.log(sceneData.vectors);
    // console.log(sceneData.vectors.attributeNames);
    // console.log(sceneData.vectors.objectAttributeMasks);
    // console.log(sceneData.vectors.objectAttributePointerLists);
    // console.log(sceneData.vectors.objectAttributePointers);
    // console.log(sceneData.vectors.objectAttributeValues);
    // console.log('');

    // console.log(sceneData.vectorsMutable);
    // console.log(sceneData.vectorsMutable.attributeNames);
    // console.log(sceneData.vectorsMutable.objectAttributeMasks);
    // console.log(sceneData.vectorsMutable.objectAttributePointerLists);
    // console.log(sceneData.vectorsMutable.objectAttributePointers);
    // console.log(sceneData.vectorsMutable.objectAttributeValues);
    // console.log('');

    //

    const canvas = document.createElement('canvas');

    const gl = canvas.getContext('webgl2', {
        antialias: false,
        powerPreference: 'high-performance',
    });

    if (gl === null)
    {
        document.body.append(":')");
        return;
    }

    if (!gl.getExtension('EXT_color_buffer_float')) {
        document.body.append(":') EXT_color_buffer_float is not supported");
        return;
    }

    loadDataTexture(
        gl, gl.TEXTURE0,
        gl.R8UI, gl.RED_INTEGER, gl.UNSIGNED_BYTE,
        [
            ...sceneData.scalars.objectAttributeMasks,
            ...sceneData.scalars.objectAttributePointerLists,
            ...sceneData.scalars.objectAttributePointers,
        ]
    );
    loadDataTexture(
        gl, gl.TEXTURE1,
        gl.R32F, gl.RED, gl.FLOAT,
        sceneData.scalars.objectAttributeValues
    );

    loadDataTexture(
        gl, gl.TEXTURE2,
        gl.R8UI, gl.RED_INTEGER, gl.UNSIGNED_BYTE,
        [
            ...sceneData.vectors.objectAttributeMasks,
            ...sceneData.vectors.objectAttributePointerLists,
            ...sceneData.vectors.objectAttributePointers,
        ]
    );
    loadDataTexture(
        gl, gl.TEXTURE3,
        gl.RGBA32F, gl.RGBA, gl.FLOAT,
        sceneData.vectors.objectAttributeValues
    );
    
    loadDataTexture(
        gl, gl.TEXTURE4,
        gl.R8UI, gl.RED_INTEGER, gl.UNSIGNED_BYTE,
        [
            ...sceneData.vectorsMutable.objectAttributeMasks,
            ...sceneData.vectorsMutable.objectAttributePointerLists,
            ...sceneData.vectorsMutable.objectAttributePointers,
        ]
    );
    const textureObjectAttributeValuesMutable = loadDataTexture(
        gl, gl.TEXTURE5,
        gl.RGBA32F, gl.RGBA, gl.FLOAT,
        sceneData.vectorsMutable.objectAttributeValues
    );

    // transforms

    const framebufferValuesVectorMutable = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferValuesVectorMutable);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureObjectAttributeValuesMutable, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    {
        document.body.append(":') Framebuffer for [framebufferValuesVectorMutable] not complete");
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //

    const lowResOutputTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, lowResOutputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, canvas.width / 2, canvas.height / 2, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const pipeOutputTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE8);
    gl.bindTexture(gl.TEXTURE_2D, pipeOutputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, canvas.width / 2, canvas.height / 2, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const lowResFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, lowResFrameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lowResOutputTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, pipeOutputTexture, 0);
    gl.drawBuffers([
        gl.COLOR_ATTACHMENT0,
        gl.COLOR_ATTACHMENT1,
    ]);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    {
        document.body.append(":') Framebuffer for [lowResFrameBuffer] not complete");
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //

    const programRaytracing = loadProgramRaytracing(
        gl,
        sceneData.scalars.attributeNames,
        sceneData.vectors.attributeNames
    );

    if (programRaytracing === null)
    {
        document.body.append(":') Failed to load program [raytracing]");
        return;
    }

    gl.useProgram(programRaytracing);

    gl.uniform1i(gl.getUniformLocation(programRaytracing, 'uObjectCount'), sceneData.objectCount);
    gl.uniform1i(gl.getUniformLocation(programRaytracing, 'uLightCount'), sceneData.lightCount);
    gl.uniform1i(gl.getUniformLocation(programRaytracing, 'uTextureDataPointersScalar'), 0);
    gl.uniform1i(gl.getUniformLocation(programRaytracing, 'uTextureDataValuesScalar'), 1);
    gl.uniform1i(gl.getUniformLocation(programRaytracing, 'uTextureDataPointersVector'), 2);
    gl.uniform1i(gl.getUniformLocation(programRaytracing, 'uTextureDataValuesVector'), 3);
    gl.uniform1i(gl.getUniformLocation(programRaytracing, 'uTextureDataPointersVectorMutable'), 4);
    gl.uniform1i(gl.getUniformLocation(programRaytracing, 'uTextureDataValuesVectorMutable'), 5);

    //

    const programTransformVectors = loadProgramTransformVectors(gl);

    if (programTransformVectors === null)
    {
        document.body.append(":') Failed to load program [transform_vectors]");
        return;
    }

    gl.useProgram(programTransformVectors);

    gl.uniform1i(gl.getUniformLocation(programTransformVectors, 'uVectorCount'), sceneData.vectorsMutable.objectAttributeValues.length);
    gl.uniform1i(gl.getUniformLocation(programTransformVectors, 'uTextureDataValuesVector'), 3);
    gl.uniform1i(gl.getUniformLocation(programTransformVectors, 'uTextureTransformMatrices'), 7);

    //

    const programLowRes = loadProgramLowRes(gl);

    if (programLowRes === null)
    {
        document.body.append(":') Failed to load program [low_res]");
        return;
    }

    gl.useProgram(programLowRes);

    gl.uniform1i(gl.getUniformLocation(programLowRes, 'uTextureOutput'), 6);

    //

    const programSensorMapReduce = loadProgramSensorMapReduce(gl);

    if (programSensorMapReduce === null)
    {
        document.body.append(":') Failed to load program [sensor_map_reduce]");
        return;
    }

    //

    const camera = SCENE.root.children.find((x) => x.name === "Camera");

    const WebGLAppContext = {
        canvas: canvas,
        gl: gl,
        programs: {
            raytracing: programRaytracing,
            transformVectors: programTransformVectors,
            lowRes: programLowRes,
            sensorMapReduce: programSensorMapReduce
        },
        framebuffers: {
            framebufferValuesVectorMutable: framebufferValuesVectorMutable,
            lowResFrameBuffer: lowResFrameBuffer,
        },
        textures: {
            lowResOutputTexture: lowResOutputTexture,
            pipeOutputTexture: pipeOutputTexture,
        },
        mutableVectorsCount: sceneData.vectorsMutable.objectAttributeValues.length,
        camera: {
            position: camera.transform.translation[3],
            velocity: [0, 0, 0, 0],
            acceleration: [0, 0, 0, 0],
            azimuthalAngle: 1.65 * Math.PI,
            polarAngle: -1.5,
        },
        actions: {
            left: 0,
            right: 0,
            forward: 0,
            backward: 0,
            jump: 0,
            interact: 0,
        },
        timestampLastFrame: 0,
        totalFrameCount: 0,
        totalFrameCountLastSecond: 0,
        frameCountLastSecond: 0,
        secondAccumulator: 0,
        movingCamera: false,
        cursorPositionLastTime: [0, 0],
        progress: {
            puzzle1Condition1: false,
            puzzle1Condition2: false,
            puzzle1Condition3: false,
            shadowJumpUnlocked: false,
        },
        data: {
            objects: sceneData.objects,
            vectors: sceneData.vectors.objectAttributeValues,
            transformsPerObjectAttributeUniformSize: sceneData.transformsPerObjectAttributeUniformSize,
        },
        objects: sceneData.objects,
        objectCount: sceneData.objectCount,
        lookingAtObjectID: -1,
        renderObject: Array(64).fill(1),
        signalReceived: false,
        rangeToRenderLights: ROOM_RANGES[0].rangeToRenderLights,
        rangeToRender: ROOM_RANGES[0].rangeToRender,
        gpuMapReduceSearchRange: [10, 11],
    };
    // console.log(sceneData.objects);

    // initLevel
    setShouldRenderNode(WebGLAppContext, ["Camera", "Held Torch"], 0);
    setShouldRenderNode(WebGLAppContext, ["Torch E"], 1);
    // initLevel (end)

    window.addEventListener('mousedown', (event) =>
    {
        WebGLAppContext.movingCamera = true;
        WebGLAppContext.cursorPositionLastTime = [event.pageX, event.pageY];
    });

    window.addEventListener('mouseup', (event) =>
    {
        WebGLAppContext.movingCamera = false;
    });

    window.addEventListener('mousemove', (event) =>
    {
        if (!WebGLAppContext.movingCamera)
        {
            return;
        }

        const sensibility = [canvas.width / canvas.height, 1]; // hope whoever is playing this does so in portrait
        WebGLAppContext.camera.azimuthalAngle -= sensibility[0] * (event.pageX - WebGLAppContext.cursorPositionLastTime[0]) / canvas.width;
        WebGLAppContext.camera.azimuthalAngle = scalar.mod(WebGLAppContext.camera.azimuthalAngle, 2 * Math.PI);
        WebGLAppContext.camera.polarAngle += sensibility[1] * (event.pageY - WebGLAppContext.cursorPositionLastTime[1]) / canvas.height;

        WebGLAppContext.camera.polarAngle = scalar.clamp(
            WebGLAppContext.camera.polarAngle,
            -Math.round(Math.PI / 2.0 * 100.0) / 100.0,
            +Math.round(Math.PI / 2.0 * 100.0) / 100.0
        );

        WebGLAppContext.cursorPositionLastTime = [event.pageX, event.pageY];
    });

    window.addEventListener('keydown', (event) =>
    {
        if (event.repeat)
        {
            return;
        }

        switch (event.code)
        {
            case 'KeyW':
                WebGLAppContext.actions.forward = 1;
                break;
            case 'KeyA':
                WebGLAppContext.actions.left = 1;
                break;
            case 'KeyS':
                WebGLAppContext.actions.backward = 1;
                break;
            case 'KeyD':
                WebGLAppContext.actions.right = 1;
                break;
            case 'Space':
                WebGLAppContext.actions.jump = 1;
                break;
            case 'KeyP':
                toggleResolution(WebGLAppContext);
                break;
            case 'KeyO':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                document.documentElement.requestFullscreen();
                break;
        }
    });

    window.addEventListener('keyup', (event) =>
    {
        if (event.repeat)
        {
            return;
        }

        switch (event.code)
        {
            case 'KeyW':
                WebGLAppContext.actions.forward = 0;
                break;
            case 'KeyA':
                WebGLAppContext.actions.left = 0;
                break;
            case 'KeyS':
                WebGLAppContext.actions.backward = 0;
                break;
            case 'KeyD':
                WebGLAppContext.actions.right = 0;
                break;
            case 'Space':
                WebGLAppContext.actions.jump = 0;
                break;
            case 'KeyE':
                WebGLAppContext.actions.interact = 1;
                break;
        }
    });

    window.addEventListener('resize', () =>
    {
        onResize(WebGLAppContext);
    });

    onResize(WebGLAppContext);

    document.body.append(canvas);

    render(WebGLAppContext);

    // const audioCtx = new AudioContext();
    // audioCtx.resume();

    // playSong(audioCtx);

    requestAnimationFrame((timestamp) => gameloop(WebGLAppContext, timestamp));
}

function gameloop(appContext, timestamp)
{
    // #region Frame Statistics

    const deltatime = (timestamp - appContext.timestampLastFrame) / 1000.0;
    appContext.timestampLastFrame = timestamp;

    appContext.secondAccumulator += deltatime;
    if (1.0 < appContext.secondAccumulator)
    {
        appContext.frameCountLastSecond = appContext.totalFrameCount - appContext.totalFrameCountLastSecond;
        appContext.totalFrameCountLastSecond = appContext.totalFrameCount;
        appContext.secondAccumulator -= 1.0;
    }
    appContext.totalFrameCount++;

    // #endregion

    const fbRes = [
        Math.ceil(appContext.canvas.width / PIXEL_SCALE),
        Math.ceil(appContext.canvas.height / PIXEL_SCALE),
    ];
    document.querySelector('.fps').innerHTML = [
        `FPS: ${appContext.frameCountLastSecond}`,
        // `Primitive Count: ${appContext.objectCount}`,
        `Resolution Scale: 1/${PIXEL_SCALE} (${fbRes[0]}x${fbRes[1]})`,
        // `Looking at Object ID: ${appContext.lookingAtObjectID}`,
        // `Signal Received: ${appContext.signalReceived}`,
        // `Puzzle 1 Condition 1: ${appContext.progress.puzzle1Condition1}`,
        // `Puzzle 1 Condition 2: ${appContext.progress.puzzle1Condition2}`,
        // `Puzzle 1 Condition 3: ${appContext.progress.puzzle1Condition3}`,
        ``,
        `CONTROLS`,
        `[O] Toggle Full Screen`,
        `[P] Toggle Resolution Scale`,
        `[WASD] Move`,
        `[Space] Jump`,
        `[E] Interact`,
    ].join('<br>');

    if (0 <= appContext.lookingAtObjectID)
    {
        const observedObjectParent = appContext.objects[appContext.lookingAtObjectID].parent;

        let showTextBox = false;

        if (observedObjectParent.name !== "Root")
        {
            const observedPos = observedObjectParent.transform.translation[3];
            const observerPos = appContext.camera.position;
            const distsq = vec4.lengthSquared(vec4.difference(observedPos, observerPos));

            if (distsq <= 2.0 ** 2.0)
            {
                if (observedObjectParent.name === "Room 1 Hint")
                {
                    document.querySelector('.textbox').innerHTML =
                        `"The light that can be seen but cannot be reached<br>hides the door that cannot be knocked on."`;
                    showTextBox = true;
                }
                else if (observedObjectParent.name === "Room 2 Hint 1")
                {
                    document.querySelector('.textbox').innerHTML =
                        `"Beware the magic funnel mirror.<br>If it catches you looking at it, it will pull you."`;
                    showTextBox = true;
                }
                else if (observedObjectParent.name === "Room 2 Hint 2")
                {
                    appContext.shadowJumpUnlocked = true;
                    document.querySelector('.textbox').innerHTML =
                        `"This is the end of the game.<br>You now have infinite jumping to get out of here.<br>Be sure to exit this room backwards.<br>Thank you for playing. Until next time!"`;
                    showTextBox = true;
                }
                else if (observedObjectParent.name === "Torch E")
                {
                    document.querySelector('.textbox').innerHTML =
                        `Perhaps I should hold onto this torch.`;
                    showTextBox = true;

                    if (appContext.actions.interact)
                    {
                        setShouldRenderNode(appContext, ["Camera", "Held Torch"], 1);
                        setShouldRenderNode(appContext, ["Torch E"], 0);
                    }
                }
                else if (observedObjectParent.name === "Torch W")
                {
                    document.querySelector('.textbox').innerHTML =
                        `Perhaps I should hold onto this torch... It's stuck.`;
                    showTextBox = true;
                }
            }
        }

        document.querySelector('.textbox').style.display = showTextBox ? 'block' : 'none';

        if (appContext.lookingAtObjectID == 61 || appContext.lookingAtObjectID == 62)
        {
            appContext.camera.position[0] = 1.5;
            appContext.camera.position[1] = 3.5;
            appContext.camera.position[2] = -15.95 + 1.0;
        }
    }

    appContext.actions.interact = 0;

    // physics

    const camera = appContext.camera;

    const forward = vec4.normalized([
        Math.cos(camera.azimuthalAngle),
        0,
        Math.sin(camera.azimuthalAngle),
        0,
    ]);
    const strengthActionForward = appContext.actions.forward - appContext.actions.backward;

    const right = vec4.normalized([
        Math.cos(camera.azimuthalAngle + Math.PI / 2),
        0,
        Math.sin(camera.azimuthalAngle + Math.PI / 2),
        0,
    ]);
    const strengthActionRight = appContext.actions.right - appContext.actions.left;
    

    const impulseDirection = vec4.sum(vec4.scaled(forward, strengthActionForward), vec4.scaled(right, strengthActionRight));
    
    // integration

    const PLAYER_HEIGHT = 1.75;
    const GRAVITY_ACCELERATION = -9.81;

    appContext.camera.acceleration[1] = 0.0;

    // preprocess position
    if (appContext.camera.position[1] <= (0.0 + PLAYER_HEIGHT))
    {
        appContext.camera.position[1] = (0.0 + PLAYER_HEIGHT);
        appContext.camera.velocity[1] = 0.0;
    }
    else
    {
        appContext.camera.acceleration[1] += GRAVITY_ACCELERATION;
    }

    const shadowJumpUnlocked = appContext.shadowJumpUnlocked;
    
    if (shadowJumpUnlocked || appContext.camera.position[1] === (0.0 + PLAYER_HEIGHT))
    {
        if (appContext.actions.jump &&
            (!shadowJumpUnlocked || (GRAVITY_ACCELERATION <= appContext.camera.velocity[1] && appContext.camera.velocity[1] <= 0.0)))
        {
            appContext.actions.jump = 0;
            appContext.camera.velocity[1] += -GRAVITY_ACCELERATION * 0.6;
        }
    }

    appContext.camera.velocity[1] += appContext.camera.acceleration[1] * deltatime;
    appContext.camera.position[1] += appContext.camera.velocity[1] * deltatime;

    // integration (end)

    if (!impulseDirection.every((x) => x === 0))
    {
        const impulseMagnitude = 4.0;
        const impulse = vec4.scaled(vec4.normalized(impulseDirection), impulseMagnitude);

        const oldPosition = appContext.camera.position;
        const newPosition = vec4.sum(appContext.camera.position, vec4.scaled(impulse, deltatime));

        if (isPointInBox(newPosition, COLLISION_BOXES[0])) // 0: Room 1 Container
        {
            appContext.rangeToRenderLights = ROOM_RANGES[0].rangeToRenderLights;
            appContext.rangeToRender = ROOM_RANGES[0].rangeToRender;
            appContext.gpuMapReduceSearchRange = [10, 11];

            // entering magic corner
            if (!isPointInBox(oldPosition, COLLISION_BOXES[1]) && isPointInBox(newPosition, COLLISION_BOXES[1]))
            {
                appContext.progress.puzzle1Condition1 = true;
                appContext.progress.puzzle1Condition3 = 0.0 < appContext.signalReceived;
            }

            // exiting magic corner
            if (isPointInBox(oldPosition, COLLISION_BOXES[1]) && !isPointInBox(newPosition, COLLISION_BOXES[1]))
            {
                appContext.progress.puzzle1Condition1 = false;
            }
    
            if (!isPointInBox(newPosition, COLLISION_BOXES[2]))
            {
                appContext.camera.position = newPosition;
            }
        }
        else if (isPointInBox(newPosition, COLLISION_BOXES[4])) // 4: Room 2 Container
        {
            appContext.rangeToRenderLights = ROOM_RANGES[1].rangeToRenderLights;
            appContext.rangeToRender = ROOM_RANGES[1].rangeToRender;
            appContext.gpuMapReduceSearchRange = [60, 63];

            if (!isPointInBox(newPosition, COLLISION_BOXES[5])) // 5: Room 2 Ditch
            {
                appContext.camera.position = newPosition;
            }
        }

        const allPuzzle1 =
            appContext.progress.puzzle1Condition1 &&
            appContext.progress.puzzle1Condition2 &&
            appContext.progress.puzzle1Condition3;

        if (allPuzzle1 && isPointInBox(newPosition, COLLISION_BOXES[3]))
        {
            appContext.camera.position = newPosition;
        }

        
    }

    if (appContext.progress.puzzle1Condition1)
    {
        const doorAntiNormal = [0.0, 0.0, -1.0, 0.0];
        appContext.progress.puzzle1Condition2 = Math.cos(Math.PI / 6.0) <= vec4.dot(doorAntiNormal, forward);
    }

    // graphics

    render(appContext);

    requestAnimationFrame((timestamp) => gameloop(appContext, timestamp));
}

function render(appContext)
{
    const gl = appContext.gl;
    const canvas = appContext.canvas;

    gl.bindFramebuffer(gl.FRAMEBUFFER, appContext.framebuffers.framebufferValuesVectorMutable);
    gl.viewport(0, 0, appContext.mutableVectorsCount, 1);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(appContext.programs.transformVectors);

    ////

    // update camera transform
    const camera = appContext.camera;

    const forward = vec4.normalized([
        Math.cos(camera.polarAngle) * Math.cos(camera.azimuthalAngle),
        Math.sin(camera.polarAngle),
        Math.cos(camera.polarAngle) * Math.sin(camera.azimuthalAngle),
        0,
    ]);
    const up = [0, 1, 0, 0];
    const viewMatrix = mat4.lookAt(camera.position, vec4.sum(camera.position, forward), up);

    gl.uniformMatrix4fv(
        gl.getUniformLocation(appContext.programs.transformVectors, 'uViewMatrix'),
        false,
        new Float32Array(viewMatrix.flat())
    );

    
    const camRotHack = mat4.transposed(viewMatrix);
    camRotHack[0][3] = 0.0;
    camRotHack[1][3] = 0.0;
    camRotHack[2][3] = 0.0;
    // console.log(viewMatrix[3]);
    // console.log([
    //     -viewMatrix[3][0],
    //     -viewMatrix[3][1],
    //     -viewMatrix[3][2],
    //     1.0,
    // ]);
    // console.log(camera.position);

    const cameraNode = SCENE.root.children.find((x) => x.name === "Camera");
    cameraNode.transform.translation = mat4.translation(camera.position);
    cameraNode.transform.rotation = camRotHack;
    // cameraNode.transform.translation = mat4.translation([
    //     -viewMatrix[3][0],
    //     -viewMatrix[3][1],
    //     -viewMatrix[3][2],
    //     1.0,
    // ]);

    ////
    const transformsPerObject = appContext.data.objects.map((x) => {
        let transformSequence = [x.transform];

        let node = x.parent;
        while (node !== SCENE.root)
        {
            transformSequence = [node.transform, ...transformSequence];
            node = node.parent;
        }

        return transformSequence;
    });
    // console.log('SCENE TREE TRANSFORMS', transformsPerObject);

    const height = Math.max(...transformsPerObject.map((x) => x.length));
    const transformsPerObjectUniformSize = transformsPerObject.map(x => {
        while (x.length < height)
        {
            x.push({
                translation: mat4.identity(),
                rotation: mat4.identity(),
            });
        }
        return x;
    });

    const geometricAttributes = ATTRIBUTES.filter((x) => x.mutable).map((x) => x.name);

    const transformsPerObjectAttributeUniformSize = transformsPerObjectUniformSize
        .map((transformSequence, objectID) => {
            return Object.keys(appContext.data.objects[objectID])
                .filter((k) => geometricAttributes.some((x) => x === k))
                .map((attributeName) => ({
                    objectID: objectID,
                    attributeID: ATTRIBUTES.findIndex((x) => x.name === attributeName),
                    transformSequence: transformSequence,
                }));
        })
        .flat()
        .sort((a, b) => a.objectID - b.objectID === 0 ? a.attributeID - b.attributeID : a.objectID - b.objectID);
    ////

    const transformMatrices = transformsPerObjectAttributeUniformSize
        .map((x) => x.transformSequence.reduce((acc, m) =>
            mat4.product(acc, mat4.product(m.translation, m.rotation)),
            mat4.identity()
        ));
    loadDataTexture(
        gl, gl.TEXTURE7,
        gl.RGBA32F, gl.RGBA, gl.FLOAT,
        transformMatrices.flat()
    );

    gl.drawArrays(gl.POINTS, 0, appContext.mutableVectorsCount);

    //

    gl.bindFramebuffer(gl.FRAMEBUFFER, appContext.framebuffers.lowResFrameBuffer);
    gl.viewport(0, 0, canvas.width / PIXEL_SCALE, canvas.height / PIXEL_SCALE);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(appContext.programs.raytracing);

    const vfovDeg = 45;
    const vfovRad = vfovDeg * Math.PI / 180;
    const w = canvas.width / PIXEL_SCALE;
    const h = canvas.height / PIXEL_SCALE;
    const pixelToRayMatrix = mat4.pixelToRay([w, h], vfovRad);
    
    gl.uniform1uiv(
        gl.getUniformLocation(appContext.programs.raytracing, 'uRenderObject'),
        new Uint32Array(appContext.renderObject)
    );
    gl.uniform1iv(
        gl.getUniformLocation(appContext.programs.raytracing, 'uRangeToRenderLights'),
        new Int32Array(appContext.rangeToRenderLights)
    );
    gl.uniform1iv(
        gl.getUniformLocation(appContext.programs.raytracing, 'uRangeToRender'),
        new Int32Array(appContext.rangeToRender)
    );
    gl.uniformMatrix3fv(
        gl.getUniformLocation(appContext.programs.raytracing, 'uPixelToRayTransform'),
        false,
        new Float32Array(pixelToRayMatrix.flat()),
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const pixelData = new Float32Array(4);
    const px = Math.floor(canvas.width / PIXEL_SCALE / 2);
    const py = Math.floor(canvas.height / PIXEL_SCALE / 2);
    gl.readBuffer(gl.COLOR_ATTACHMENT1);
    gl.readPixels(px, py, 1, 1, gl.RGBA, gl.FLOAT, pixelData);
    appContext.lookingAtObjectID = pixelData[0];

    // sensor


    const sensorMapReduceOutputTexture0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE9);
    gl.bindTexture(gl.TEXTURE_2D, sensorMapReduceOutputTexture0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, canvas.width / PIXEL_SCALE / 2, canvas.height / PIXEL_SCALE / 2, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const sensorMapReduceOutputTexture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE10);
    gl.bindTexture(gl.TEXTURE_2D, sensorMapReduceOutputTexture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, canvas.width / PIXEL_SCALE / 2, canvas.height / PIXEL_SCALE / 2, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


    const sensorMapReduceFrameBuffer0 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, sensorMapReduceFrameBuffer0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sensorMapReduceOutputTexture0, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    {
        document.body.append(":') Framebuffer for [sensorMapReduceFrameBuffer0] not complete");
        return;
    }

    const sensorMapReduceFrameBuffer1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, sensorMapReduceFrameBuffer1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sensorMapReduceOutputTexture1, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    {
        document.body.append(":') Framebuffer for [sensorMapReduceFrameBuffer1] not complete");
        return;
    }

    let currentWidth = Math.ceil(canvas.width / PIXEL_SCALE / 2);
    let currentHeight = Math.ceil(canvas.height / PIXEL_SCALE / 2);

    gl.bindTexture(gl.TEXTURE_2D, sensorMapReduceOutputTexture0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, currentWidth, currentHeight, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, sensorMapReduceFrameBuffer0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sensorMapReduceOutputTexture0, 0);

    gl.viewport(0, 0, currentWidth, currentHeight);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(appContext.programs.sensorMapReduce);
    gl.uniform1iv(
        gl.getUniformLocation(appContext.programs.sensorMapReduce, 'uSearchRange'),
        new Int32Array(appContext.gpuMapReduceSearchRange)
    );
    // console.log(appContext.gpuMapReduceSearchRange);
    gl.uniform1i(gl.getUniformLocation(appContext.programs.sensorMapReduce, 'uTextureInput'), 8);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const nIter = Math.ceil(Math.log2(Math.max(canvas.width / PIXEL_SCALE, canvas.height / PIXEL_SCALE)));
    //console.log(nIter);

    for (let iter = 1; iter < nIter; iter++)
    {
        currentWidth = Math.ceil(currentWidth / 2);
        currentHeight = Math.ceil(currentHeight / 2);
        
        if (iter % 2 == 0)
        {
            gl.activeTexture(gl.TEXTURE9);
            gl.bindTexture(gl.TEXTURE_2D, sensorMapReduceOutputTexture0);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, currentWidth, currentHeight, 0, gl.RGBA, gl.FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                
            gl.bindFramebuffer(gl.FRAMEBUFFER, sensorMapReduceFrameBuffer0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sensorMapReduceOutputTexture0, 0);

            gl.viewport(0, 0, currentWidth, currentHeight);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(appContext.programs.sensorMapReduce);
            gl.uniform1i(gl.getUniformLocation(appContext.programs.sensorMapReduce, 'uTextureInput'), 10);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        else if (iter % 2 == 1)
        {
            gl.activeTexture(gl.TEXTURE10);
            gl.bindTexture(gl.TEXTURE_2D, sensorMapReduceOutputTexture1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, currentWidth, currentHeight, 0, gl.RGBA, gl.FLOAT, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, sensorMapReduceFrameBuffer1);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sensorMapReduceOutputTexture1, 0);

            gl.viewport(0, 0, currentWidth, currentHeight);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(appContext.programs.sensorMapReduce);
            gl.uniform1i(gl.getUniformLocation(appContext.programs.sensorMapReduce, 'uTextureInput'), 9);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
    }

    if (nIter % 2 == 0)
    {
        const pixelData = new Float32Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixelData);
        appContext.signalReceived = pixelData[1];
    }
    else if (nIter % 2 == 1)
    {
        const pixelData = new Float32Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixelData);
        appContext.signalReceived = pixelData[1];
    }

    //

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(appContext.programs.lowRes);
    gl.uniform1i(gl.getUniformLocation(appContext.programs.lowRes, 'uTextureOutput'), 6);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    //
}

function onResize(appContext)
{
    const gl = appContext.gl;
    const canvas = appContext.canvas;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;

    gl.bindTexture(gl.TEXTURE_2D, appContext.textures.lowResOutputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, canvas.width / PIXEL_SCALE, canvas.height / PIXEL_SCALE, 0, gl.RGBA, gl.FLOAT, null);
    gl.bindTexture(gl.TEXTURE_2D, appContext.textures.pipeOutputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, canvas.width / PIXEL_SCALE, canvas.height / PIXEL_SCALE, 0, gl.RGBA, gl.FLOAT, null);

}
