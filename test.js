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

gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.BLEND);


var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;

gl.viewport(0, 0, w, h);

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

var colors = [];

function newColor() {
	var color = "rgba("+rand(255)+","+rand(255)+","+rand(255)+",1.0)";
	
	var alreadyused = false;
	for (var i=0; i<colors.length; i++) {
		if (colors[i] == color) alreadyused = true;
	}
	
	if (alreadyused) color = newColor();
	
	return color;
}

function increaseColors() {
	colors.push(newColor());
}

function drawCanvas() {
	
//	console.log('draw canvas');
	
	/*var canvas = document.createElement('canvas');
	var ctx    = canvas.getContext('2d');
	
	canvas.width = ctx.width = w;
	canvas.height = ctx.height = h;*/
	
	var d = new Date();
	var n = d.getTime();

	myBuffer = createFramebuffer(gl, gl.canvas.width, gl.canvas.height);
	shaderProgramLines = initShaderProgramLines();
	//initQuadBuffer();
	shaderProgramQuad = initShaderProgramQuad();
	
	function drawBackground(timer) {		
		/*ctx.globalCompositeOperation="source-over";
		ctx.fillStyle = "rgba(255,255,255,1.0)";
		ctx.fillRect(0,0,w,h);*/
		
		gl.bindFramebuffer( gl.FRAMEBUFFER, myBuffer.buffer );
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
				
	function drawLines(timer) {
		
		let verts = [];
		
		var activelinecount = 0;
		
		// stroke
		/*ctx.globalCompositeOperation="source-over";
		ctx.lineCap="round";
		ctx.lineWidth=2;
		ctx.strokeStyle = "rgba(0,0,0,1.0)";*/
		
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

			// plot whole line (webgl)
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
			
			// plot whole line (software canvas)
			/*let prev = false;
			for (let j=0; j<lines[i].length; j++) {

				let thisx = lines[i][j]['x'];
				let thisy = lines[i][j]['y'];
				
				// was invisible, now it's visible, lets start drawing the line
				if ((prev == false) && (lines[i][j]['visible'])) {
					// flash lines white when the timer equals the index
					//if ((timer % lines[i].length) == i) {
					//	ctx.strokeStyle="rgba(255,255,255,1.0)";
					//} else {
					//	ctx.strokeStyle=gradient;
					//}
					// start line
					ctx.beginPath();
					ctx.moveTo(thisx, thisy);
					prev = true;
				// was already visible and still is, lets keep drawing the line
				} else if ((prev == true) && (lines[i][j]['visible'])) {
					ctx.lineTo(thisx, thisy);
				// was already visible and now it's not, lets stop drawing at this segment of the line
				} else if ((prev == true) && (!lines[i][j]['visible'])) {
					//ctx.closePath();
					ctx.stroke();
					prev = false;
				}
			}
			// make sure it's closed when it's ended
			if (prev == true) {
				//ctx.closePath();
				ctx.stroke();
			}*/
			
		}
		
		//drawLinesOnScreen(verts);
		drawLinesOnQuad(verts);
		//ctx.width = w;
		//ctx.height = h;
		//ctx.drawImage( myBuffer.texture, 0, 0 );
		//var image = ctx.getImageData(0,0,w,h);
		//var data = image.data;

		
		//for (var i=0; i<w*5; i = i+4) {
		//	image[i] = 100;
		//}
		/*
		//image.data = data;
		//var result = floodfill(image.data,5,5,{r:255,g:255,b:0,a:255},1,w,h);
		//ctx.putImageData(image,0,0);
		var idata = ctx.getImageData(0,0,w,h);
    	var data = idata.data;
		//doEffect({}, { w: w, h: h, timer: timer }, data);
		// assumes background.r is 255 and dividing_pixels.r is 0
    	doFloodFill({}, { w: w, h: h }, data);
    	
		idata.data = data;
    	ctx.putImageData(idata,0,0);
		
		ctx.fillStyle = "rgba(0,255,255,1.0)";
		ctx.fillRect(200,200,200,200);
		
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
 
		// let's assume all images are not a power of 2
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
 
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
	*/
	
		// get webgl texture data (to save as html5 image)
		// http://stackoverflow.com/questions/8191083/can-one-easily-create-an-html-image-element-from-a-webgl-texture-object
		gl.bindFramebuffer(gl.FRAMEBUFFER, myBuffer.buffer);
		var data = new Uint8Array(w * h * 4);
		gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		//console.log(data[0]);
		
		// manipulate the data by software
		/*for(x = 0; (x | 0) < w; x++) {
			for(y = 0; (y | 0) < h; y++) {
				i = (h*x+y)*4;
				data[i] = 255-(Math.sin(timer/1000+Math.sin((timer*(x+h*Math.sin(timer/1000)+h)>>x)*Math.PI/10000)+Math.cos(timer*(y+w)/10000))*64<<3+104);
				data[(i | 0) + 1] = Math.sin(y)*20+20;
				data[(i | 0) + 2] = Math.sin(y+timer/1000)*20+20;
			}
    	}*/
		doFloodFill(window, { w: w, h: h, bound: 0 }, data);
		
		// create texture with the data
		/*var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		// let's assume all images are not a power of 2
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, tex);*/
		gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data));
	
		// draw on screen
		//drawQuadOnScreen(tex);
		drawQuadOnScreen(myBuffer.texture);
		//drawQuadOnScreen(texture0.texture);
	}
	
	/*function doEffect(stdlib, foreign, heap) {
		'use asm';
		var w = foreign.w | 0,
			h = foreign.h | 0,
			timer = foreign.timer,
			i = 0, x = 0, y = 0;
		
		
		for(x = 0; (x | 0) < w; x++) {
			for(y = 0; (y | 0) < h; y++) {
				i = (h*x+y)*4;
				heap[i] = 255-(Math.sin(timer/1000+Math.sin((timer*(x+h*Math.sin(timer/1000)+h)>>x)*Math.PI/10000)+Math.cos(timer*(y+w)/10000))*64<<3+104);
				heap[(i | 0) + 1] = Math.sin(y)*20+20;
				heap[(i | 0) + 2] = Math.sin(y+timer/1000)*20+20;
			}
    	}
	}*/
	
	function doFloodFill(stdlib, foreign, heap) {
		'use asm';
		var w = foreign.w | 0,
			h = foreign.h | 0,
			bound = foreign.bound | 0,
			i = 0;
		
		var color_index = 1;
		
		
		floodfillFromPos(10000, bound);
		
		/*for (i = 0; i < w*h; i++) {
			var index = (i * 4) | 0;
			if (heap[index] == 255) {
				floodfillFromPos(i, bound, 0);
				color_index++;
				if (color_index == 254) return;
			}
		}*/
		
		function floodfillFromPos(pos, stopper) {
			//if (level > 5) return;
			floodfillLine(pos, stopper);
			//floodfillLeft(pos, stopper);
			//floodfillRight(pos, stopper);
			if (pos+w < w*h) {
				floodfillFromPos(pos+w, stopper);
			}
		}
		
		function floodfillLine(pos, stopper) {
			var j = 0, index = 0;
			var max = stdlib.Math.ceil(pos/w) * w;
			console.log('max:' + max);
			for (j = pos; j < max; j++) {
				index = (j * 4) | 0;
				if (heap[index] != stopper) {
					heap[index] = color_index;
				} else {
					break;
				} 
			}
			var min = stdlib.Math.floor(pos/w) * w;
			console.log('min:' + min);
			for (j = pos; j > min; j--) {
				index = (j * 4) | 0;
				if (heap[index] != stopper) {
					heap[index] = color_index;
				} else {
					break;
				} 
			}
		}
		
		function floodfillRight(pos, stopper) {
			var j = 0, index = 0;
			var max = stdlib.Math.ceil(pos/w) * w;
			for (j = pos; j < max; j++, index += 4 ) {
				//var index = (j * 4) | 0;
				if (heap[index] != stopper) {
					heap[index] = color_index;
				} else {
					return;
				} 
			}
		}
		
		function floodfillLeft(pos, stopper) {
			var j = 0, index = 0;
			var min = stdlib.Math.floor(pos/w) * w;
			for (j = pos; j > min; j--, index -= 4) {
				//var index = (j * 4) | 0;
				if (heap[index] != stopper) {
					heap[index] = color_index;
				} else {
					return;
				} 
			}
		}
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
var resolutionLocation2;

function initShaderProgramQuad() {

	var vertCode =
		'attribute vec2 a_position;' +
		'attribute vec2 a_texCoord;' +
		'uniform vec2 u_resolution;' +
		//'varying vec2 v_resolution;' +
		'varying vec2 v_texCoord;' +
		'void main() {' +
		'vec2 zeroToOne = a_position;' + // / u_resolution;' +
		'vec2 zeroToTwo = zeroToOne * 2.0;' +
		'vec2 clipSpace = zeroToTwo - 1.0;' +
		'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +
		//'gl_Position = vec4(a_position[0], a_position[1], 0, 1);' +
		//'v_resolution = u_resolution;' +
		'v_texCoord = a_texCoord;' +
		'}';

	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, vertCode);
	gl.compileShader(vertShader);
	if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
		console.log('ERROR compiling vert shader!', gl.getShaderInfoLog(vertShader));
		return;
	}

	//reference for possible 2d raycasting solution http://stackoverflow.com/questions/34708021/how-to-implement-2d-raycasting-light-effect-in-glsl
	
	var fragCode =
		'precision mediump float;' +
		'uniform sampler2D u_texture;' +
		'varying vec2 v_resolution;' +
		'varying vec2 v_texCoord;' +
		'float rand(vec2 co){' +
		'return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);' +
		'}' +
		'void main() {' +
		'vec4 color0 = texture2D(u_texture, v_texCoord);' +
		'gl_FragColor = color0;' +
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

	// look up where the vertex data needs to go.
	positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
	texcoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");

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
	
	resolutionLocation2 = gl.getUniformLocation(shaderProgram, "v_resolution");
	
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
	gl.uniform2f(resolutionLocation2, gl.canvas.width, gl.canvas.height);	
	gl.uniform1i(textureLocation, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function createFramebuffer(gl, width, height) {
	
	var buffer = gl.createFramebuffer();
	//bind framebuffer to texture
	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
	buffer.width = width;
    buffer.height = height;

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

var floodfill = (function() {

	//Copyright(c) Max Irwin - 2011, 2015, 2016
	//MIT License

	function floodfill(data,x,y,fillcolor,tolerance,width,height) {

		var length = data.length;
		var Q = [];
		var i = (x+y*width)*4;
		var e = i, w = i, me, mw, w2 = width*4;

		var targetcolor = [data[i],data[i+1],data[i+2],data[i+3]];

		if(!pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) { return false; }
		Q.push(i);
		while(Q.length) {
			i = Q.pop();
			if(pixelCompareAndSet(i,targetcolor,fillcolor,data,length,tolerance)) {
				e = i;
				w = i;
				mw = parseInt(i/w2)*w2; //left bound
				me = mw+w2;             //right bound
				while(mw<w && mw<(w-=4) && pixelCompareAndSet(w,targetcolor,fillcolor,data,length,tolerance)); //go left until edge hit
				while(me>e && me>(e+=4) && pixelCompareAndSet(e,targetcolor,fillcolor,data,length,tolerance)); //go right until edge hit
				for(var j=w;j<e;j+=4) {
					if(j-w2>=0     && pixelCompare(j-w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j-w2); //queue y-1
					if(j+w2<length && pixelCompare(j+w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j+w2); //queue y+1
				}
			}
		}
		return data;
	};

	function pixelCompare(i,targetcolor,fillcolor,data,length,tolerance) {
		if (i<0||i>=length) return false; //out of bounds
		if (data[i+3]===0 && fillcolor.a>0) return true;  //surface is invisible and fill is visible

		if (
			Math.abs(targetcolor[3] - fillcolor.a)<=tolerance &&
			Math.abs(targetcolor[0] - fillcolor.r)<=tolerance &&
			Math.abs(targetcolor[1] - fillcolor.g)<=tolerance &&
			Math.abs(targetcolor[2] - fillcolor.b)<=tolerance
		) return false; //target is same as fill

		if (
			(targetcolor[3] === data[i+3]) &&
			(targetcolor[0] === data[i]  ) &&
			(targetcolor[1] === data[i+1]) &&
			(targetcolor[2] === data[i+2])
		) return true; //target matches surface

		if (
			Math.abs(targetcolor[3] - data[i+3])<=(255-tolerance) &&
			Math.abs(targetcolor[0] - data[i]  )<=tolerance &&
			Math.abs(targetcolor[1] - data[i+1])<=tolerance &&
			Math.abs(targetcolor[2] - data[i+2])<=tolerance
		) return true; //target to surface within tolerance

		return false; //no match
	};

	function pixelCompareAndSet(i,targetcolor,fillcolor,data,length,tolerance) {
		if(pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) {
			//fill the color
			data[i]   = fillcolor.r;
			data[i+1] = fillcolor.g;
			data[i+2] = fillcolor.b;
			data[i+3] = fillcolor.a;
			return true;
		}
		return false;
	};

	function fillUint8ClampedArray(data,x,y,color,tolerance,width,height) {
		if (!data instanceof Uint8ClampedArray) throw new Error("data must be an instance of Uint8ClampedArray");
		if (isNaN(width)  || width<1)  throw new Error("argument 'width' must be a positive integer");
		if (isNaN(height) || height<1) throw new Error("argument 'height' must be a positive integer");
		if (isNaN(x) || x<0) throw new Error("argument 'x' must be a positive integer");
		if (isNaN(y) || y<0) throw new Error("argument 'y' must be a positive integer");
		if (width*height*4!==data.length) throw new Error("width and height do not fit Uint8ClampedArray dimensions");

		var xi = Math.floor(x);
		var yi = Math.floor(y);

		if (xi!==x) console.warn("x truncated from",x,"to",xi);
		if (yi!==y) console.warn("y truncated from",y,"to",yi);

		//Maximum tolerance of 254, Default to 0
		tolerance = (!isNaN(tolerance)) ? Math.min(Math.abs(Math.round(tolerance)),254) : 0;

		return floodfill(data,xi,yi,color,tolerance,width,height);
	};

	var getComputedColor = function(c) {
		var temp = document.createElement("div");
		var color = {r:0,g:0,b:0,a:0};
		temp.style.color = c;
		temp.style.display = "none";
		document.body.appendChild(temp);
		//Use native window.getComputedStyle to parse any CSS color pattern
		var style = window.getComputedStyle(temp,null).color;
		document.body.removeChild(temp);

		var recol = /([\.\d]+)/g;
		var vals  = style.match(recol);
		if (vals && vals.length>2) {
			//Coerce the string value into an rgba object
			color.r = parseInt(vals[0])||0;
			color.g = parseInt(vals[1])||0;
			color.b = parseInt(vals[2])||0;
			color.a = Math.round((parseFloat(vals[3])||1.0)*255);
		}
		return color;
	};

	function fillContext(x,y,tolerance,left,top,right,bottom) {
		var ctx  = this;
		
		//Gets the rgba color from the context fillStyle
		var color = getComputedColor(this.fillStyle);

		//Defaults and type checks for image boundaries
		left     = (isNaN(left)) ? 0 : left;
		top      = (isNaN(top)) ? 0 : top;
		right    = (!isNaN(right)&&right) ? Math.min(Math.abs(right),ctx.canvas.width) : ctx.canvas.width;
		bottom   = (!isNaN(bottom)&&bottom) ? Math.min(Math.abs(bottom),ctx.canvas.height) : ctx.canvas.height;

		var image = ctx.getImageData(left,top,right,bottom);
		
		var data = image.data;
		var width = image.width;
		var height = image.height;
		
		if(width>0 && height>0) {
			fillUint8ClampedArray(data,x,y,color,tolerance,width,height);
			ctx.putImageData(image,left,top);
		}
	};

	if (typeof CanvasRenderingContext2D != 'undefined') {
		CanvasRenderingContext2D.prototype.fillFlood = fillContext;
	};

	return fillUint8ClampedArray;

})();