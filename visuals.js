// create map from state string to color string
var stateColorMap = {
  "latent": "peachpuff", 
  "asymptomatic": "lightsalmon",
  "infected": "coral", 
  "susceptible": "lightsteelblue",
  "recovered":"mediumpurple",
  "dead": "black"
  }

// map for WebGL purposes, when changing colors need to also change fragment shader
var stateColorMapGL = { infected: 1, susceptible: 0, recovered: 2, dead: 3, asymptomatic: 4 , latent: 5};

class Visual {
  constructor(id, height, width) {
    this.id = id;
    this.height = height;
    this.width = width;
    this.stateColorMapGL = { infected: 1, susceptible: 0, recovered: 2,dead: 3, asymptomatic: 4, latent: 5 };
    this.init();
  }

  init() {
    //initialize canvas with webgl context

    this.box = document.getElementById(this.id);
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.border = '1px solid #eee'
    this.canvas.style.borderRadius = '5px'
    this.canvas.style.background = "white";
    this.box.appendChild(this.canvas);
    this.gl = this.canvas.getContext("webgl");

    
    if (!this.gl) {
      throw new Error("This browser does not support WebGL");
    }
    // create vertex and fragment shaders for particles
    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER); // create new vertex shader
    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER); // create new fragment shader
    // positions in 2D field
    var vertCode = `
            attribute vec2 position;
            void main() {
             gl_Position = vec4(position, 0, 1);
            }
        `;
    // associates color based on covidState
    var fragCode = `
            uniform int color;    
            void main() {
                if (color == 0) {
                    gl_FragColor = vec4(0.69, 0.768, 0.87, 1);
                }
                if (color == 1) {
                    gl_FragColor = vec4(1, 0.5, 0.313, 1);
                }
                if (color == 2) {
                    gl_FragColor = vec4(0.576, 0.439, 0.858, 1);
                }
                if (color == 3) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0 , 1);
                }
                if (color == 4) {
                  gl_FragColor = vec4(1.0, 0.627, 0.478 , 1);
                }
                if (color == 5) {
                  gl_FragColor = vec4(1.0, 0.85, 0.725 , 1);
                }
            }
        `;

    this.gl.shaderSource(vertexShader, vertCode);
    this.gl.compileShader(vertexShader);

    this.gl.shaderSource(fragmentShader, fragCode);
    this.gl.compileShader(fragmentShader);

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);

 

    this.posBuffer = this.gl.createBuffer();

    return this;
  }

  update(data) {
    var numPoints = 30;
    this.vertexData = [];
    for (let i = 0, l = data.length; i < l; i++) {
      const d = data[i];
      this.drawCircle(d.radius, d.pos, numPoints, d.covidState);
    }
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.vertexData),
      this.gl.DYNAMIC_DRAW
    );
    const positionLocation = this.gl.getAttribLocation(
      this.program,
      `position`
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    const colorLoc = this.gl.getUniformLocation(this.program, `color`);

    for (let i = 0, l = data.length; i < l; i++) {
      const stateLabel = data[i].covidState;

      const color = stateColorMapGL[stateLabel];
      this.gl.uniform1i(colorLoc, color);
      this.gl.drawArrays(
        this.gl.TRIANGLE_STRIP,
        numPoints * 2 * i,
        numPoints * 2
      );
    }
  }

  drawCircle(unconvertedR, unconvertedPos, numPoints, covidState) {
    var radius = (unconvertedR / this.canvas.width) * 2;
    var pos = [
      (unconvertedPos[0] / this.canvas.width) * 2 - 1,
      (unconvertedPos[1] / this.canvas.height) * 2 - 1,
    ];
    var widthToHeight = this.canvas.width / this.canvas.height;
    var interval = ((2 * Math.PI) / numPoints) * (1 + 1 / numPoints);
    for (var j = 0.0; j < numPoints; j += 1) {
      // var vert1 = [Math.cos(j*interval) * radius + pos[0], Math.sin(j*interval) * radius * widthToHeight + pos[1]];
      // var vert2 = [pos[0], pos[1]];

      var vert1 = [
        Math.cos(j * interval) * radius + pos[0],
        Math.sin(j * interval) * radius * widthToHeight + pos[1],
      ];
      var vert2 = [pos[0], pos[1]];

      this.vertexData.push(Math.cos(j * interval) * radius + pos[0]);
      this.vertexData.push(
        Math.sin(j * interval) * radius * widthToHeight + pos[1]
      );
      this.vertexData.push(pos[0]);
      this.vertexData.push(pos[1]);
    }
  }
}

