import * as twgl from "./twgl-full.module.js";

console.log("hello i am underwater")

const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl2")

canvas.width = document.documentElement.clientWidth - 100
canvas.height = document.documentElement.clientHeight - 200


const vertexShaderPromise = fetch("./main.vert").then(
    (response) => {
        return response.text().then( (text) => {
            return text;
        })
    }
)

const fragmentShaderPromise = fetch("./main.frag").then(
    (response) => {
        return response.text().then( (text) => {
            return text;
        })
    }
)

console.log(twgl.isWebGL2(gl))
Promise.all([vertexShaderPromise, fragmentShaderPromise]).then((shadersText) => {
    console.log(shadersText)
    
    const programInfo = twgl.createProgramInfo(gl, shadersText)


    const arrays = {
        //Two triangles make a quad
        a_position: { numComponents: 2, data: [
            -1, -1,
            -1, 1,
            1, -1,

            1, -1,
            1, 1,
            -1, 1,
        ] },
    }

    const buffers = twgl.createBufferInfoFromArrays(gl, arrays)

    let numPoints = 10

    document.getElementById("numPoints").addEventListener("input", (e) => {
        //console.log("fff")
        //console.log(e)
        //console.log(e.target.value)
        numPoints = parseInt(e.target.value)

    })

    const uniforms = {
        u_time: 0,
        u_resolution: [canvas.clientWidth, canvas.clientHeight],
        u_numPoints: numPoints
    }

    const draw = (time) => {
        uniforms.u_numPoints = numPoints
        gl.useProgram(programInfo.program)
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight)
        //console.log(canvas.clientHeight)
        twgl.setBuffersAndAttributes(gl, programInfo, buffers)

        const timeInSeconds = time * 0.001;
        //console.log(timeInSeconds)
        uniforms.u_time = timeInSeconds

        twgl.setUniforms(programInfo, uniforms)
        twgl.drawBufferInfo(gl, buffers, gl.TRIANGLES, 6)

        requestAnimationFrame(draw)
    }
    
    requestAnimationFrame(draw)
})