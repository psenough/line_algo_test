var D = document;

rand = function(n){
	return 0|(Math.random()*n);
};

D.title = 'webgl lines';

PI = Math.PI;
si = Math.sin;
M = Math.max;
N = Math.min;
Q = Math.sqrt;

var b = D.body;
var Ms = b.style;
Ms.margin='0px';
var blackcolor = Ms.background = "#000";
Ms.overflow = 'hidden';
b.innerHTML = '';
var c = D.createElement('canvas');
b.appendChild(c);
c.style.background = "transparent";

var gl = null;
gl = c.getContext('webgl', { alpha: false }) || c.getContext('experimental-webgl', { alpha: false });

gl.clearColor(0.0, 1.0, 0.0, 0.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.BLEND);


var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;

gl.viewport(0, 0, c.width, c.height);

//
// request animation frame, from random place on the internet
//

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = M(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var texture0;


b.onload = function() {
	texture0 = loadImageAndCreateTextureInfo('gfx/star.jpg');
	drawCanvas();
	//shaderProgramQuad = initShaderProgramQuad();
	//drawQuadOnScreen();
}

var elem = D.createElement("div");
var S = elem.style;
S.background = "#fff";
S.position = "absolute";
S.height = "100px";
S.lineHeight = elem.style.height;
S.letterSpacing = "-3px";
S.textAlign = "center";
S.fontSize = "60px";
S.border = "solid #49b249";//"solid #fe9358";
S.borderWidth = "5px 0";
S.fontFamily = "Helvetica";
b.appendChild(elem);

function distance(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

// http://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
function lineIntersect(x1,y1,x2,y2,x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
	//x = parseFloat(x.toFixed(7));
	//y = parseFloat(y.toFixed(7));
	
	//TODO: sometimes the point outside of segment comparison tests fails, when testing against a very long straight line
	
    //console.log(x + ' ' + y);
	if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return {'x':x, 'y':y};
}

var maxlines = 350;
var maxactivelines = 16;

var lines = [];
/*
lines[0] = [];
lines[0][0] = { 'x': 300.0, 'y': 400.0, 'direction': Math.PI*0.33, 'curve': Math.PI*0.05, 'step': 6.0, 'visible': true };

lines[1] = [];
lines[1][0] = { 'x': 100.0, 'y': 100.0, 'direction': 0.0, 'curve': Math.PI*0.025, 'step': 6.0, 'visible': true };

lines[2] = [];
lines[2][0] = { 'x': 500.0, 'y': 500.0, 'direction':  Math.PI, 'curve': Math.PI*0.015, 'step': 6.0, 'visible': true };

lines[3] = [];
lines[3][0] = { 'x': 800.0, 'y': 800.0, 'direction':  Math.PI*1.2, 'curve': -Math.PI*0.015, 'step': 6.0, 'visible': true };

lines[4] = [];
lines[4][0] = { 'x': 500.0, 'y': 500.0, 'direction':  -Math.PI, 'curve': -Math.PI*0.015, 'step': 6.0, 'visible': true };
*/
/*
var nbars = 3;
var wbar = w/(nbars+1);
for (var i=0; i<nbars; i++) {
	lines[i] = [];
	lines[i][0] = { 'x': (i+1)*wbar, 'y': 0.0, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };
	lines[i][1] = { 'x': (i+1)*wbar+1.0, 'y': h, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };
}
*/
var nlines = 12;
var ang = (Math.PI*2) / 12.0;
for (var j=0; j<nlines; j++) {
	lines[lines.length] = [];
	lines[lines.length-1][0] = { 'x': w*.5+Math.sin(ang*j), 'y': h*.5+Math.cos(ang*j), 'direction':  ang*j, 'curve': ang*Math.PI*0.015, 'step': 6.0, 'visible': true };
}

var nlines = 8;
var ang = (Math.PI*2) / 12.0;
for (var j=0; j<nlines; j++) {
	lines[lines.length] = [];
	lines[lines.length-1][0] = { 'x': 1.0, 'y': j*(h/nlines), 'direction':  Math.PI*0.5, 'curve': ang*Math.PI*0.015*Math.random()*2, 'step': 6.0, 'visible': true };
}

var nlines = 8;
var ang = (Math.PI*2) / 12.0;
for (j=0; j<nlines; j++) {
	lines[lines.length] = [];
	lines[lines.length-1][0] = { 'x': w-1.0, 'y': j*(h/nlines), 'direction':  -Math.PI*0.5, 'curve': -ang*Math.PI*0.015*Math.random()*2, 'step': 6.0, 'visible': true };
}

function drawCanvas() {
	
	console.log('draw canvas');
		
	var d = new Date();
	var n = d.getTime();

	myBuffer = createFramebuffer(gl, gl.canvas.width, gl.canvas.height);
	shaderProgramLines = initShaderProgramLines();
	//initQuadBuffer();
	shaderProgramQuad = initShaderProgramQuad();
	
	function drawBackground(timer) {		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
				
	function drawLines(timer) {
		
		let verts = [];
		
		var activelinecount = 0;
		
		// draw lines
		for (let i=0; i<lines.length; i++) 
		{
			// add next line segment
			let ref = lines[i][lines[i].length-1];
			
			// stop adding lines if it's already out of bounds
			if (!((ref['x'] <= 0) || (ref['x'] >= w) || (ref['y'] <= 0) || (ref['y'] >= h)) && (activelinecount < maxactivelines))
			{
				activelinecount++;
				
				// calculate next line step
				// TODO: fix this to calculate position based on timer and not frames
				let thisx = ref['x'] + Math.sin(ref['direction'])*ref['step'];
				let thisy = ref['y'] + Math.cos(ref['direction'])*ref['step'];
				
				// test if this new line segment will cross any previous lines existing
				let intersect = false;
				for (let k=0; k<lines.length && intersect == false; k++) 
				{
					for (let p=0; p<lines[k].length-1; p++) 
					{
						let r1 = lines[k][p];
						
						// dont bother checking intersection of two invisible lines
						if (!r1['visible']) continue;
						
						let r2 = lines[k][p+1];
						
						let li = lineIntersect(r1['x'],r1['y'],r2['x'],r2['y'],ref['x'],ref['y'],thisx,thisy);
						if (li != false) {
							//console.log(lines[4]);
							intersect = li;
							break;
						}
					}
				}
				
				// calculate visibility switch
				// default same as previous segment
				let visible = ref['visible'];
				if (intersect != false) {
					//console.log(thisx + ' ' + thisy + ' ' + intersect['x'] + ' ' + intersect['y']);
					// snap to line intersection point
					// snap the previous point if moving from visible to invisible
					// snap the new point if its becoming visible
					if (visible) {
						ref['x'] = intersect['x'];
						ref['y'] = intersect['y'];
					} else {
						thisx = intersect['x'];
						thisy = intersect['y'];
					}
					
					// chance it doesn't switch invisibility despite intersecting something
					//if (Math.random()<0.2) {
						// as you were
					//} else {
						// toggle on and offf
						visible = !ref['visible'];
					//}
				}
				
				lines[i][lines[i].length] = {
					'x': thisx,
					'y': thisy,
					'direction': ref['direction']+ref['curve'],
					'curve': lines[i][0]['curve']*Math.sin(timer*0.005) + Math.sin(timer*0.005)*0.0001,
					'step': ref['step'],
					'visible': visible };
					//'visible': (Math.random()<0.10)?(ref['visible']):(!ref['visible']) };
				
			}

			// plot whole line
			let prev = false;
			for (let j=0; j<lines[i].length-1; j++) {

				let thisx = lines[i][j]['x'];
				let thisy = lines[i][j]['y'];
							
				if ((lines[i][j]['visible']) && (lines[i][j+1]['visible'])) {
					verts[verts.length] = lines[i][j]['x']/w-0.5;
					verts[verts.length] = lines[i][j]['y']/h-0.5;
					verts[verts.length] = 0.0;
					verts[verts.length] = 0.5;
					
					verts[verts.length] = lines[i][j+1]['x']/w-0.5;
					verts[verts.length] = lines[i][j+1]['y']/h-0.5;
					verts[verts.length] = 0.0;
					verts[verts.length] = 0.5;
				}
				
			}
			
		}
		
		//drawLinesOnScreen(verts);
		drawLinesOnQuad(verts);
		drawQuadOnScreen(myBuffer.texture);
		//drawQuadOnScreen(texture0.texture);
	}
	
	function drawThis() {
		
		let d2 = new Date();
		let n2 = d2.getTime();
		let timer = n2-n;
		
		drawBackground(timer);
		drawLines(timer);				
		
	}
	
	(loop = function() {
		requestAnimationFrame(loop);
		//drawQuadOnScreen(texture0.texture);
		
		drawThis();
	})();

}


function spliceline(lineid) {
	if (lineid in lines) {
		//console.log(lines[lineid].length);
		lines[lineid] = lines[lineid].splice(0, 1);
		//console.log(lines[lineid].length);
	}	
}


// was going to be used for secret part, abandoned
document.onkeydown = checkKeycode;

function checkKeycode(e) {
	var keycode;
	if (window.event) keycode = window.event.keyCode;
		else if (e) keycode = e.which;
	//console.log(keycode);
	if (keycode == 83) {
		for (var j=0; j<16; j++) {
			spliceline(j);
		}
	}
}

let sVerts;
var shaderProgramLines;
var shaderProgramQuad;

function initShaderProgramLines() {

	var vertCode =
		'attribute vec4 verts;' +
		//'attribute highp float alpha;' +
		//'varying highp float f_alpha;' +
		'void main(void) {' +
		   'gl_Position = vec4(verts[0], verts[1], verts[2], verts[3]);' +
		//   'f_alpha = alpha;' + 
		'}';

	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, vertCode);
	gl.compileShader(vertShader);
	if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
		console.log('ERROR compiling vert shader!', gl.getShaderInfoLog(vertShader));
		return;
	}

	var fragCode =
		//'varying highp float f_alpha;' +
		'void main(void) {' +
		   'gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);' +
		'}';

	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, fragCode);
	gl.compileShader(fragShader);
	if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
		console.log('ERROR compiling frag shader!', gl.getShaderInfoLog(fragShader));
		return;
	}

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertShader);
	gl.attachShader(shaderProgram, fragShader);
	gl.linkProgram(shaderProgram);
	
	sVerts = gl.getAttribLocation(shaderProgram, "verts");
	
	return shaderProgram;	 
}

function drawLinesOnScreen(vertices) {
	
	var vert_div = 4;
	
	gl.useProgram(shaderProgramLines);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	gl.enableVertexAttribArray(sVerts);
	
	var vb_verts = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vb_verts);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(sVerts, vert_div, gl.FLOAT, false, 0, 0);
	
	gl.drawArrays(gl.LINES, 0, vertices.length/vert_div);
	
}


function drawLinesOnQuad(vertices) {
	
	var vert_div = 4;
	
	gl.useProgram(shaderProgramLines);
	//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	//gl.activeTexture(gl.TEXTURE0);
	//gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
	
	gl.enableVertexAttribArray(sVerts);
	
	var vb_verts = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vb_verts);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(sVerts, vert_div, gl.FLOAT, false, 0, 0);

	//gl.bindFramebuffer(gl.FRAMEBUFFER, myBuffer.buffer);
    //gl.activeTexture(gl.TEXTURE0);
	//gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);

	gl.bindFramebuffer(gl.FRAMEBUFFER, myBuffer.buffer);
	//gl.activeTexture(gl.TEXTURE0);
	//gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
	
	gl.drawArrays(gl.LINES, 0, vertices.length/vert_div);
	
	//gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	/*gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
    gl.generateMipmap(gl.TEXTURE_2D);*/
    gl.bindTexture(gl.TEXTURE_2D, null);
		
}
/*
function initQuadBuffer() {
	quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVerts), gl.STATIC_DRAW);
	//myBuffer = createFramebuffer(gl, 1024*1024);
}*/

//var quad;
var quadVerts = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
var myBuffer;// = createFramebuffer(gl, 1024*1024);

var positionLocation;
var texcoordLocation;
var matrixLocation;
var positionBuffer;
var texcoordBuffer;
var resolutionLocation;
var textureLocation;

function initShaderProgramQuad() {

	var vertCode =
		'attribute vec2 a_position;' +
		'attribute vec2 a_texCoord;' +
		'uniform vec2 u_resolution;' +
		'varying vec2 v_texCoord;' +
		'void main() {' +
		'vec2 zeroToOne = a_position;' + // / u_resolution;' +
		'vec2 zeroToTwo = zeroToOne * 2.0;' +
		'vec2 clipSpace = zeroToTwo - 1.0;' +
		'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +
		//'gl_Position = vec4(a_position[0], a_position[1], 0, 1);' +
		'v_texCoord = a_texCoord;' +
		'}';

	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, vertCode);
	gl.compileShader(vertShader);
	if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
		console.log('ERROR compiling vert shader!', gl.getShaderInfoLog(vertShader));
		return;
	}

	var fragCode =
		'precision mediump float;' +
		'uniform sampler2D u_texture;' +
		'varying vec2 v_texCoord;' +
		'void main() {' +
		'vec4 color0 = texture2D(u_texture, v_texCoord);' +
		'gl_FragColor = color0;' +
		//'gl_FragColor = vec4(1.0,0.0,0.0,0.5);' + //color0;' +
		'}';

	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, fragCode);
	gl.compileShader(fragShader);
	if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
		console.log('ERROR compiling frag shader!', gl.getShaderInfoLog(fragShader));
		return;
	}

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertShader);
	gl.attachShader(shaderProgram, fragShader);
	gl.linkProgram(shaderProgram);

	/*a_position = gl.getAttribLocation(shaderProgram, "a_position");
	a_texCoord = gl.getAttribLocation(shaderProgram, "a_texCoord");
	u_resolution = gl.getUniformLocation(someProgram, "u_resolution");
	u_image0 = gl.getUniformLocation(someProgram, "u_image0");*/
	
	// look up where the vertex data needs to go.
	positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
	texcoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");

	// lookup uniforms
	//matrixLocation = gl.getUniformLocation(shaderProgram, "u_matrix");
	//textureLocation = gl.getUniformLocation(shaderProgram, "u_texture");

	// Create a buffer.
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Put a unit quad in the buffer
	var positions = [
	0, 0,
	0, 1,
	1, 0,
	1, 0,
	0, 1,
	1, 1]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Create a buffer for texture coords
	texcoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

	// Put texcoords in the buffer
	var texcoords = [
	0, 0,
	0, 1,
	1, 0,
	1, 0,
	0, 1,
	1, 1]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

	resolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
	
	textureLocation = gl.getUniformLocation(shaderProgram, "u_texture");

	return shaderProgram;	 
}

function drawQuadOnScreen(texture) {
	
	//console.log('drawing quads');
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	var vertices = quadVerts;
	gl.useProgram(shaderProgramQuad);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);	
	gl.uniform1i(textureLocation, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function createFramebuffer(gl, width, height) {
	
	var buffer = gl.createFramebuffer();
	//bind framebuffer to texture
	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
	buffer.width = 512;
    buffer.height = 512;

	var texture = gl.createTexture();
	//set properties for the texture
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	//gl.generateMipmap(gl.TEXTURE_2D);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	
	// clean up back to defaults after binding stuff
	gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return {
	  texture: texture,
	  buffer: buffer,
	  renderbuffer, renderbuffer
	};
}


// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
function loadImageAndCreateTextureInfo(url) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
 
  // let's assume all images are not a power of 2
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
 
  var textureInfo = {
    width: 1,   // we don't know the size until it loads
    height: 1,
    texture: tex,
  };
  var img = new Image();
  console.log('loading');
  img.addEventListener('load', function() {
	//console.log('load=?!');
    textureInfo.width = img.width;
    textureInfo.height = img.height;
 
    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	
	//console.log('done loading');
	//drawCanvas();
  });
  img.src = url;
 
  return textureInfo;
}
/* 
var textureInfos = [
  loadImageAndCreateTextureInfo('gfx/star.jpg'),
  loadImageAndCreateTextureInfo('gfx/leaves.jpg'),
  loadImageAndCreateTextureInfo('gfx/keyboard.jpg'),
];*/

