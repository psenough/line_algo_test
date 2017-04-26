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
//if (!gl) {
    //alert('Unable to initialize WebGL. Your browser may not support it.');
//	return;
//}
// Set clear color to black, fully opaque
gl.clearColor(0.0, 1.0, 0.0, 0.0);
// Enable depth testing
gl.enable(gl.DEPTH_TEST);
// Near things obscure far things
gl.depthFunc(gl.LEQUAL);
// Clear the color as well as the depth buffer.
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//var ctx = c.getContext('2d');

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

b.onload = function() {
	drawCanvas();
}

//
// init general variables
//

//var r="rgba(";
//var c1 = r+"0,0,0,1)", c2 = r+"0,0,0,.1)", c3 = r+"254,147,88,1)", c4 = r+"94,88,254,1)", c5 = r+"254,229,88,1)";		

//
// init dom side text
//

var elem = D.createElement("div");
var S = elem.style;
S.background = "#fff";
S.position = "absolute";
//elem.style.top = "45%";
//elem.style.left = "0";
//elem.style.width = "100%";
S.height = "100px";
S.lineHeight = elem.style.height;
//elem.style.marginTop = "-20px";
S.letterSpacing = "-3px";
S.textAlign = "center";
S.fontSize = "60px";
S.border = "solid #49b249";//"solid #fe9358";
S.borderWidth = "5px 0";
//elem.style.textTransform = "lowercase";
//elem.style.color = "#333";
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
		
	var d = new Date();
	var n = d.getTime();

	let shaderProgram = initShader();
	
	function drawBackground(timer) {
		// background
		/*ctx.globalCompositeOperation="source-over";
		var lingrad = ctx.createLinearGradient(0,0,0,h);
		lingrad.addColorStop(0, '#000');
		lingrad.addColorStop(1, '#115');
		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,w,h);*/
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
				
	function drawLines(timer) {
		// stroke
		/*ctx.globalCompositeOperation="source-over";
		ctx.lineCap="round";
		ctx.lineWidth=2;
		var gradient=ctx.createLinearGradient(0,0,w,0);
		gradient.addColorStop("0","magenta");
		gradient.addColorStop("0.5","blue");
		gradient.addColorStop("1.0","red");
		ctx.strokeStyle=gradient;*/
		
		let verts = [];
		//let alphas = [];
		
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
					
				// spawn new lines within a certain probability
				/*if ((ref['visible']) && (Math.random()<0.04)) {
					var thissize = lines.length;
					if (thissize < maxlines) {
						lines[thissize] = [];
						lines[thissize][0] ={
						'x': thisx,
						'y': thisy,
						'direction': ref['direction']+ref['curve']*2,
						'curve': -lines[i][0]['curve'] ,
						'step': ref['step'],
						'visible': true };
					}
				}*/
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
				
				// was invisible, now it's visible, lets start drawing the line
				/*if ((prev == false) && (lines[i][j]['visible'])) {
					// flash lines white when the timer equals the index
					//if ((timer % lines[i].length) == i) {
					//	ctx.strokeStyle="rgba(255,255,255,1.0)";
					//} else {
					//	ctx.strokeStyle=gradient;
					//}
					// start line
					//ctx.beginPath();
					//ctx.moveTo(thisx, thisy);
					//verts = [];
					verts[verts.length] = thisx/w-0.5;
					verts[verts.length] = thisy/h-0.5;
					verts[verts.length] = 0.0;
					verts[verts.length] = 0.5;
					alphas[alphas.length] = 1.0;
					
					prev = true;
				// was already visible and still is, lets keep drawing the line
				} else if ((prev == true) && (lines[i][j]['visible'])) {
					//ctx.lineTo(thisx, thisy);
					verts[verts.length] = thisx/w-0.5;
					verts[verts.length] = thisy/h-0.5;
					verts[verts.length] = 0.0;
					verts[verts.length] = 0.5;
					alphas[alphas.length] = 1.0;
					
				// was already visible and now it's not, lets stop drawing at this segment of the line
				} else if ((prev == true) && (!lines[i][j]['visible'])) {
					//ctx.closePath();
					//ctx.stroke();
					verts[verts.length] = (thisx/w-0.5)*2;
					verts[verts.length] = (thisy/h-0.5)*2;
					verts[verts.length] = 0.0;
					verts[verts.length] = 0.5;
					alphas[alphas.length] = 0.0;
					prev = false;
				}*/
				
				//drawVertsOnly(shaderProgram, verts);
			}
			// make sure it's closed when it's ended
			if (prev == true) {
				//ctx.closePath();
				//ctx.stroke();
				
			}
		}
		
		drawVertsOnly(shaderProgram, verts);
		//console.log(verts);
		//console.log(verts.length/3);
		
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
//let sAlpha;

function initShader() {

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

	gl.useProgram(shaderProgram);
	
	sVerts = gl.getAttribLocation(shaderProgram, "verts");
	gl.enableVertexAttribArray(sVerts);
	
	//sAlpha = gl.getAttribLocation(shaderProgram, "alpha");
	//gl.enableVertexAttribArray(sAlpha);
	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);

	return shaderProgram;	 
}

function drawVertsOnly(shaderProgram, vertices, alphas) {
	
	var vert_div = 4;
	
	gl.useProgram(shaderProgram);
	
	var vb_verts = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vb_verts);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(sVerts, vert_div, gl.FLOAT, false, 0, 0);
	 	 
	/*var vb_alpha = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vb_alpha);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(alphas), gl.STATIC_DRAW);
	gl.vertexAttribPointer(sAlpha, 1, gl.FLOAT, false, 0, 0);*/

	gl.drawArrays(gl.LINES, 0, vertices.length/vert_div);
	
}
