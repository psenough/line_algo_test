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
	//texture0 = loadImageAndCreateTextureInfo('gfx/star.jpg');
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

var maxlines = 200;
var maxactivelines = 20;

var lines = [];
var intersects = [];

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

lines[lines.length] = [];
lines[lines.length-1][0] = { 'x': 0.0, 'y': 0.0, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };
lines[lines.length-1][1] = { 'x': w, 'y': 0.0, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };

lines[lines.length] = [];
lines[lines.length-1][0] = { 'x': 0.0, 'y': 0.0, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };
lines[lines.length-1][1] = { 'x': 0.0, 'y': h, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };

lines[lines.length] = [];
lines[lines.length-1][0] = { 'x': w, 'y': 0.0, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };
lines[lines.length-1][1] = { 'x': w, 'y': h, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };

lines[lines.length] = [];
lines[lines.length-1][0] = { 'x': 0.0, 'y': h, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };
lines[lines.length-1][1] = { 'x': w, 'y': h, 'direction': 0, 'curve': 0, 'step': 0.0, 'visible': true };

intersects.push({'line1': 0, 'segment1': 0, 'line2': 1, 'segment2': 0});
intersects.push({'line1': 0, 'segment1': 1, 'line2': 2, 'segment2': 0});
intersects.push({'line1': 1, 'segment1': 1, 'line2': 3, 'segment2': 0});
intersects.push({'line1': 2, 'segment1': 1, 'line2': 3, 'segment2': 1});

/*
//TODO: missing intersects
var nlines = 12;
var ang = (Math.PI*2) / 12.0;
for (var j=0; j<nlines; j++) {
	lines[lines.length] = [];
	lines[lines.length-1][0] = { 'x': w*.5+Math.sin(ang*j), 'y': h*.5+Math.cos(ang*j), 'direction':  ang*j, 'curve': ang*Math.PI*0.015, 'step': 6.0, 'visible': true };
}*/

var nlines = 8;
var ang = (Math.PI*2) / 12.0;
for (var j=0; j<nlines; j++) {
	lines[lines.length] = [];
	lines[lines.length-1][0] = { 'x': 1.0, 'y': j*(h/nlines), 'direction':  Math.PI*0.5, 'curve': ang*Math.PI*0.015*Math.random()*2, 'step': 6.0, 'visible': true };
	intersects.push({'line1': 1, 'segment1': 0, 'line2': lines.length-1, 'segment2': 0});
}

var nlines = 8;
var ang = (Math.PI*2) / 12.0;
for (j=0; j<nlines; j++) {
	lines[lines.length] = [];
	lines[lines.length-1][0] = { 'x': w-1.0, 'y': j*(h/nlines), 'direction':  -Math.PI*0.5, 'curve': -ang*Math.PI*0.015*Math.random()*2, 'step': 6.0, 'visible': true };
	intersects.push({'line1': 2, 'segment1': 0, 'line2': lines.length-1, 'segment2': 0});
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

var floodfills = 1;
var floodfills_per_lines_ratio = 25;

let loop = undefined;

function drawCanvas() {
	
//	console.log('draw canvas');
	
	/*var canvas = document.createElement('canvas');
	var ctx    = canvas.getContext('2d');
	
	canvas.width = ctx.width = w;
	canvas.height = ctx.height = h;*/
	
	let d = new Date();
	let n = d.getTime();
	
	let prevtime = n;

	myBuffer = createFramebuffer(gl, gl.canvas.width, gl.canvas.height);
	floodfillBuffer = createFramebuffer(gl, gl.canvas.width, gl.canvas.height);
	shaderProgramLines = initShaderProgramLines();
	//initQuadBuffer();
	shaderProgramQuad = initShaderProgramQuad();
	
	function drawBackground(timer, delta) {		
		/*ctx.globalCompositeOperation="source-over";
		ctx.fillStyle = "rgba(255,255,255,1.0)";
		ctx.fillRect(0,0,w,h);*/
		
		gl.bindFramebuffer( gl.FRAMEBUFFER, myBuffer.buffer );
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
				
	function drawLines(timer, delta) {
		
		let verts = [];
		
		let activelinecount = 0;
		
		// stroke
		/*ctx.globalCompositeOperation="source-over";
		ctx.lineCap="round";
		ctx.lineWidth=2;
		ctx.strokeStyle = "rgba(0,0,0,1.0)";*/
		
		// update lines
		for (let i=0; i<lines.length; i++) 
		{
			// add next line segment
			let ref = lines[i][lines[i].length-1];
			
			// stop adding line segments if it's already out of bounds
			if (!((ref['x'] <= 0) || (ref['x'] >= w) || (ref['y'] <= 0) || (ref['y'] >= h)) && (activelinecount < maxactivelines))
			{
				activelinecount++;
				
				// calculate next line step
				let thisx = ref['x'] + Math.sin(ref['direction'])*(ref['step']*delta);
				let thisy = ref['y'] + Math.cos(ref['direction'])*(ref['step']*delta);
				
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
							
							// keep track of existing intersects
							intersects.push({'line1': k, 'segment1': p, 'line2': i, 'segment2': lines[i].length});
							
							// no need to keep searching
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
				if ((ref['visible']) && (Math.random()<0.04)) {
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
				}
				
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
			
		}
	
		//console.log(lines);
		//TODO: optimize this to count globally and not recount per frame
		let countgrownlines = 0;
		for (let i=0; i< lines.length; i++) {
			if (lines[i].length > 1) countgrownlines++;
		}
		
		//console.log('lines count: ' + lines.length + ' ffplr: ' + floodfills_per_lines_ratio + ' countgrownlines: ' + countgrownlines);
		if ((floodfills*floodfills_per_lines_ratio < countgrownlines) && (countgrownlines > floodfills_per_lines_ratio)) {
			
			//drawLinesOnQuadWithBackground(verts, floodfillBuffer.texture);
			/*
			//drawLinesOnQuad(verts);
			
			// get webgl texture data
			gl.bindFramebuffer(gl.FRAMEBUFFER, myBuffer.buffer);
			var data = new Uint8Array(w * h * 4);
			gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			
			// do floodfill on data with asm.js algo
			doFloodFill(window, { w: w, h: h, bound: 0 }, data);
			
			// save the data to a texture
			gl.bindTexture(gl.TEXTURE_2D, floodfillBuffer.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data));
			*/
			
			// calculate a new polygon on the intersections
			let polygon_indexes = [];
			polygon_indexes[0] = rand(intersects.length);
			var done = false;
			while (!done) {
				//console.log('trying something');
				var next = findNextIntersect(polygon_indexes);
				if (next == false) {
					done = true;
				} else {
					if (next == undefined) {
						console.log('reached a dead end by some reason!');
						done = true;
						continue;
					}
					polygon_indexes[polygon_indexes.length] = next;
					if (polygon_indexes[0] == next) done = true;
				}
				if (polygon_indexes.length > 35) done = true;
			}
			console.log('got polygon');
			console.log(polygon_indexes);
			
			// now all we need to do it to arrange the data to draw it
			
			// get a list of all the vert positions of the lines between each intersection points of our polygon
			let pverts = [];
			//let xadd = 0.0;
			//let yadd = 0.0;
			for (let j=0; j<polygon_indexes.length-1; j++) {
				
				let l1 = intersects[polygon_indexes[j]]['line1'];
				let s1 = intersects[polygon_indexes[j]]['segment1'];
				let l2 = intersects[polygon_indexes[j]]['line2'];
				let s2 = intersects[polygon_indexes[j]]['segment2'];
				
				let pl1 = intersects[polygon_indexes[j+1]]['line1'];
				let ps1 = intersects[polygon_indexes[j+1]]['segment1'];
				let pl2 = intersects[polygon_indexes[j+1]]['line2'];
				let ps2 = intersects[polygon_indexes[j+1]]['segment2'];
				
				let dump = figureOutDirection(l1,s1,l2,s2,pl1,ps1,pl2,ps2);
				
				let dpos = dump['start'];
				while (dpos != dump['end']) {
					
					if  (lines[dump['line']][dpos] == undefined) {
						console.log('WTF!');
						console.log(dump);
						console.log(lines);
						
						setTimeout(function() { loop = undefined }, 100);
						return;
					}
					let x = lines[dump['line']][dpos]['x']/w-0.5;
					let y = lines[dump['line']][dpos]['y']/h-0.5;
					pverts[pverts.length] = x*2.0;
					pverts[pverts.length] = y*2.0;
					//pverts[pverts.length] = 0.0;
					//pverts[pverts.length] = 1.0;
				
					dpos += dump['step'];
				}
				
			}
			
			// first point is center of polygon (the center of the TRIANGLE_FAN)
			//pverts[0] = xadd/polygon_indexes.length;
			//pverts[1] = yadd/polygon_indexes.length;
			
			console.log('trying to draw');
			console.log(pverts);
			
			// get order of triangles
			let tris = earcut(pverts);
			console.log('tris list');
			console.log(tris);
			
			// arrange final list of vertices
			let pvertsfinal = [];
			for (let k=0; k<tris.length; k++) {
				pvertsfinal[pvertsfinal.length] = pverts[(tris[k])*2];
				pvertsfinal[pvertsfinal.length] = pverts[(tris[k]*2)+1];
				pvertsfinal[pvertsfinal.length] = 0.0;
				pvertsfinal[pvertsfinal.length] = 1.0;
			}
			
			console.log('final list of polygon verts (triangulated)');
			console.log(pvertsfinal);
			
			drawPolygonOnQuadWithBackground(pvertsfinal, floodfillBuffer.texture, floodfills);
			
			floodfills++;
			
			drawQuadOnScreen(floodfillBuffer.texture, myBuffer.texture);
			//setTimeout(function() { loop = undefined }, 200);
//			loop = undefined;
			//return;
			
			//drawQuadOnScreen(myBuffer.texture, floodfillBuffer.texture);
			
		} else {

			drawLinesOnQuad(verts);
			//drawQuadOnScreen(myBuffer.texture, myBuffer.texture);

		}
		
		//drawLinesOnQuad(verts);
		drawQuadOnScreen(floodfillBuffer.texture, myBuffer.texture);
		
	}
	
	function findNextIntersect(polygon) {
		
		console.log('polygon:');
		console.log(polygon);
		
		let first, previous, latest, best;
		
		latest = polygon[polygon.length-1];
		if (!latest) return false;
		if (intersects[latest] == undefined) return false;
		
		var options = getTravelOptions(intersects[latest]);
		if (options.length == 0) return false;
		
		if (polygon.length == 1) {
			
			console.log('first step');
			best = options[rand(options.length)];	
			
		} else {
			
			first = polygon[0];
			previous = polygon[polygon.length-2];
			
			if (!first) return false;
			if (!previous) return false;
			
			if (intersects[first] == undefined) return false;
			if (intersects[previous] == undefined) return false;
			
			let best_value = undefined;
			let best_index = undefined;
			
			for (let i=0; i<options.length; i++) {
				
				console.log('testing option ' + i + ': ' + options[i]);
				
				// prevent backtracking
				if (options[i] == previous) {
					console.log('previous is also ' + previous + ' :: preventing backtracking');
					continue;
				}
				if (options[i] == undefined) {
					console.log('undefined options, skipping');
					continue;
				}
				
				let l1 = intersects[options[i]]['line1'];
				let s1 = intersects[options[i]]['segment1'];
				let lf = intersects[first]['line1'];
				let sf = intersects[first]['segment1'];
				
				// stay closest possible to point of origin
				if (best_value == undefined) {
					best_value = calcDistance( lines[l1][s1]['x'], lines[l1][s1]['y'], lines[lf][sf]['x'], lines[lf][sf]['y'] );
					best_index = i;
				} else {
					let test_value = calcDistance( lines[l1][s1]['x'], lines[l1][s1]['y'], lines[lf][sf]['x'], lines[lf][sf]['y'] );
					if (test_value < best_value) {
						best_value = test_value;
						best_index = i;
					}
				}
				
				console.log('best so far: ' + best_value + ' from ' + best_index);
	
			}
			
			best = options[best_index];

		}
		
		return best;
	}
	
	//TODO: test which one is faster, don't think it really costs much CPU eitherway, could also not use sqrt, don't need _exact_ distance, just a comparative measurement
	function calcDistance(x1,y1,x2,y2) {
		//return Math.hypot(x2-x1, y2-y1);
		return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
	}
	
	function getTravelOptions(inter) {
		
		let options = [];
		console.log('intersection object:');
		console.log(inter);
		if ((inter['line1'] != undefined) && (inter['segment1'] != undefined)) {
			let line = lines[inter['line1']];
			if (line != undefined) {
				let segm = inter['segment1'];
				if (line[segm] != undefined) {
					// check going up
					if (line[segm+1] != undefined) {
						if (line[segm+1]['visible'] == true) {
							options[options.length] = findNextIntersectInLine(inter['line1'], segm);
						} else {
							console.log( (segm+1) + ' is invisible, not looking for an intersection');
						}
					} else {
						console.log( (segm+1) + ' is undefined, can\'t look it up');
					}
					// check going down
					if (line[segm-1] != undefined) {
						if (line[segm-1]['visible'] == true) {
							options[options.length] = findPrevIntersectInLine(inter['line1'], segm);
						} else {
							console.log( (segm-1) + ' is invisible, not looking for an intersection');
						}
					} else {
						console.log( (segm-1) + ' is undefined, can\'t look it up');
					}
				}
			}
		}
		
		if ((inter['line2'] != undefined) && (inter['segment2'] != undefined)) {
			let line = lines[inter['line2']];
			if (line != undefined) {
				let segm = inter['segment2'];
				if (line[segm] != undefined) {
					// check going up
					if (line[segm+1] != undefined) {
						if (line[segm+1]['visible'] == true) {
							options[options.length] = findNextIntersectInLine(inter['line2'], segm);
						} else {
							console.log( (segm+1) + ' is invisible, not looking for an intersection');
						}
					} else {
						console.log( (segm+1) + ' is undefined, can\'t look it up');
					}
					// check going down
					if (line[segm-1] != undefined) {
						if (line[segm-1]['visible'] == true) {
							options[options.length] = findPrevIntersectInLine(inter['line2'], segm);
						} else {
							console.log( (segm-1) + ' is invisible, not looking for an intersection');
						}
					} else {
						console.log( (segm-1) + ' is undefined, can\'t look it up');
					}
				}
			}
		}
		console.log('these are our travel options:');
		console.log(options);
		
		return options;
	}
	
	function findNextIntersectInLine(startline, startsegm) {
		var closest = undefined;
		var index = undefined;
		console.log('finding next intersect of ' + startline + ' ' + startsegm);
		for (let i=0; i<intersects.length; i++) {
			if ((intersects[i]['line1'] == startline) && (intersects[i]['segment1'] != startsegm) && (intersects[i]['segment1'] > startsegm)) {
				if (closest == undefined) {
					closest = Math.abs(intersects[i]['segment1'] - startsegm);
					index = i;
				} else {
					var test = Math.abs(intersects[i]['segment1'] - startsegm);
					if (test < closest) {
						closest = test;
						index = i;
					}
				}
			} else if ((intersects[i]['line2'] == startline) && (intersects[i]['segment2'] != startsegm) && (intersects[i]['segment2'] > startsegm)) {
				if (closest == undefined) {
					closest = Math.abs(intersects[i]['segment2'] - startsegm);
					index = i;
				} else {
					var test = Math.abs(intersects[i]['segment2'] - startsegm);
					if (test < closest) {
						closest = test;
						index = i;
					}
				}
			}
		}
		console.log('found: ' + index);
		return index;
	}
	
	function findPrevIntersectInLine(startline, startsegm) {
		var closest = undefined;
		var index = undefined;
		console.log('finding prev intersect of ' + startline + ' ' + startsegm);
		for (let i=0; i<intersects.length; i++) {
			if ((intersects[i]['line1'] == startline) && (intersects[i]['segment1'] != startsegm) && (intersects[i]['segment1'] < startsegm)) {
				if (closest == undefined) {
					closest = Math.abs(intersects[i]['segment1'] - startsegm);
					index = i;
				} else {
					var test = Math.abs(intersects[i]['segment1'] - startsegm);
					if (test < closest) {
						closest = test;
						index = i;
					}
				}
			} else if ((intersects[i]['line2'] == startline) && (intersects[i]['segment2'] != startsegm) && (intersects[i]['segment2'] < startsegm)) {
				if (closest == undefined) {
					closest = Math.abs(intersects[i]['segment2'] - startsegm);
					index = i;
				} else {
					var test = Math.abs(intersects[i]['segment2'] - startsegm);
					if (test < closest) {
						closest = test;
						index = i;
					}
				}
			}
		}
		console.log('found: ' + index);
		return index;
	}
	
	function figureOutDirection(l1,s1,l2,s2,pl1,ps1,pl2,ps2) {
		let obj = { 'start': 0,
					'end': 0,
					'line': 0,
					'step': 0 };
					
		if (l1 == pl1) {
			obj['line'] = l1;
			obj['start'] = s1;
			obj['end'] = ps1;
		} else if (l1 == pl2) {
			obj['line'] = l1;
			obj['start'] = s1;
			obj['end'] = ps2;
		} else if (l2 == pl1) {
			obj['line'] = l2;
			obj['start'] = s2;
			obj['end'] = ps1;
		} else if (l2 == pl2) {
			obj['line'] = l2;
			obj['start'] = s2;
			obj['end'] = ps2;
		}
				
		if (obj['start'] < obj['end']) obj['step'] = 1;
		 else obj['step'] = -1;
		 
		 return obj;
	}

	function drawThis() {
		let d2 = new Date();
		let n2 = d2.getTime();
		let timer = n2-n;
		let delta = (n2-prevtime)/30;
		prevtime = n2;
		
		drawBackground(timer, delta);
		drawLines(timer, delta);
	}
	
	(loop = function() {
		if (loop != undefined) {
			requestAnimationFrame(loop);
			//drawQuadOnScreen(texture0.texture);
			drawThis();
		}
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
	//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
	gl.enableVertexAttribArray(sVerts);
	var vb_verts = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vb_verts);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(sVerts, vert_div, gl.FLOAT, false, 0, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, myBuffer.buffer);
	gl.drawArrays(gl.LINES, 0, vertices.length/vert_div);
	
	// clean up
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);		
}

/*function drawLinesOnQuadWithBackground(vertices, texture) {
	
	//draw bg texture
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	var vertices = quadVerts;
	gl.useProgram(shaderProgramQuad);
	gl.bindFramebuffer(gl.FRAMEBUFFER, myBuffer.buffer);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);	
	gl.uniform2f(resolutionLocation2, gl.canvas.width, gl.canvas.height);	
	gl.uniform1i(textureLocation1, 0);
	gl.uniform1i(textureLocation2, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);

	
	// draw lines
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
	
	gl.uniform1i(textureLocation, 0);
	
	gl.drawArrays(gl.LINES, 0, vertices.length/vert_div);
	
	//gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
    gl.bindTexture(gl.TEXTURE_2D, null);

}*/


function drawPolygonOnQuadWithBackground(vertices, texture, colorindex) {
	
	//draw bg texture
	gl.bindTexture(gl.TEXTURE_2D, texture);
	//gl.activeTexture(gl.TEXTURE0);
	//gl.bindTexture(gl.TEXTURE_2D, texture);
	//gl.activeTexture(gl.TEXTURE1);
	//gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.useProgram(shaderProgramQuad);
	gl.bindFramebuffer(gl.FRAMEBUFFER, floodfillBuffer.buffer);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);	
	gl.uniform2f(resolutionLocation2, gl.canvas.width, gl.canvas.height);	
	gl.uniform1i(textureLocation1, 0);
	gl.uniform1i(textureLocation2, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);

	
	// draw lines
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

	gl.bindFramebuffer(gl.FRAMEBUFFER, floodfillBuffer.buffer);
	//gl.activeTexture(gl.TEXTURE0);
	//gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
	
	gl.uniform1i(textureLocation, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length/vert_div);
	
	//gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	/*gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, myBuffer.texture);
    gl.generateMipmap(gl.TEXTURE_2D);*/
    gl.bindTexture(gl.TEXTURE_2D, null);

		
}

//var quad;
var quadVerts = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
var myBuffer;
var floodfillBuffer;

var positionLocation;
var texcoordLocation;
var matrixLocation;
var positionBuffer;
var texcoordBuffer;
var textureLocation; // used seperately
var textureLocation1;
var textureLocation2;
var resolutionLocation;
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
		'uniform sampler2D u_texture1;' +
		'uniform sampler2D u_texture2;' +
		'varying vec2 v_resolution;' +
		'varying vec2 v_texCoord;' +
		'float rand(vec2 co){' +
		'return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);' +
		'}' +
		'void main() {' +
		'vec4 color0 = mix(texture2D(u_texture1, v_texCoord), texture2D(u_texture2, v_texCoord),0.5);' +
		//'color0 += texture2D(u_texture2, v_texCoord);' +
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
	
	textureLocation1 = gl.getUniformLocation(shaderProgram, "u_texture1");
	textureLocation2 = gl.getUniformLocation(shaderProgram, "u_texture2");
	
	return shaderProgram;	 
}

function drawQuadOnScreen(texture1, texture2) {
	
	//console.log('drawing quads');
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	
	//var vertices = quadVerts;
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
	gl.uniform1i(textureLocation1, 0);
	gl.uniform1i(textureLocation2, 1);
	
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


















// taken from https://github.com/mapbox/earcut/blob/master/src/earcut.js

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode) return triangles;

    var minX, minY, maxX, maxY, x, y, size;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and size are later used to transform coords into integers for z-order calculation
        size = Math.max(maxX - minX, maxY - minY);
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, size);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) return null;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, size, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && size) indexCurve(ear, minX, minY, size);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (size ? isEarHashed(ear, minX, minY, size) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, size, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(ear, triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, size, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, size);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, size) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, size),
        maxZ = zOrder(maxTX, maxTY, minX, minY, size);

    // first look for points inside the triangle in increasing z-order
    var p = ear.nextZ;

    while (p && p.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.nextZ;
    }

    // then look for points in decreasing z-order
    p = ear.prevZ;

    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return p;
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, size);
                earcutLinked(c, triangles, dim, minX, minY, size);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m.prev; // hole touches outer segment; pick lower endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m.next;

    while (p !== stop) {
        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && locallyInside(p, hole)) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    }

    return m;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, size) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, size);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }
            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and size of the data bounding box
function zOrder(x, y, minX, minY, size) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) / size;
    y = 32767 * (y - minY) / size;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
           locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    if ((equals(p1, q1) && equals(p2, q2)) ||
        (equals(p1, q2) && equals(p2, q1))) return true;
    return area(p1, q1, p2) > 0 !== area(p1, q1, q2) > 0 &&
           area(p2, q2, p1) > 0 !== area(p2, q2, q1) > 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertice index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};

