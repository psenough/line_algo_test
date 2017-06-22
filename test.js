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

var floodfills = 0;
var floodfills_per_lines_ratio = 50;

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
		for (var i=0; i< lines.length; i++) {
			if (lines[i].length > 1) countgrownlines++;
		}
		
		//console.log('lines count: ' + lines.length + ' ffplr: ' + floodfills_per_lines_ratio + ' countgrownlines: ' + countgrownlines);
		if ((floodfills*floodfills_per_lines_ratio < countgrownlines) && (countgrownlines > floodfills_per_lines_ratio)) {
			
			drawLinesOnQuadWithBackground(verts, floodfillBuffer.texture);
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
				console.log('trying something');
				var next = findNextIntersect(polygon_indexes);
				if (next == false) {
					done = true;
				} else {
					polygon_indexes[polygon_indexes.length] = next;
					if (polygon_indexes[0] == next) done = true;
				}
				if (polygon_indexes.length > 10) done = true;
			}
			console.log('done trying');
			console.log(polygon_indexes);
			
			loop = undefined;
			return;
			
			//TODO: retest this
			
			//TODO: draw it on top of the existing floodfillbuffer with a different floodfills index

			
			floodfills++;
			
			//drawQuadOnScreen(myBuffer.texture, floodfillBuffer.texture);
			
		} else {

			drawLinesOnQuad(verts);
			//drawQuadOnScreen(myBuffer.texture, myBuffer.texture);

		}
		
		//drawLinesOnQuad(verts);
		drawQuadOnScreen(floodfillBuffer.texture,myBuffer.texture);
		
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
				console.log('previous: ' + previous);
				
				// prevent backtracking
				if (options[i] == previous) continue;
				
				let l1 = intersects[options[i]]['line1'];
				let s1 = intersects[options[i]]['segment1'];
				let lf = intersects[first]['line1'];
				let sf = intersects[first]['segment1'];
				
				// stay closest possible to point of origin
				if (best == undefined) {
					best_value = calcDistance( lines[l1][s1]['x'], lines[l1][s1]['y'], lines[lf][sf]['x'], lines[lf][sf]['y'] );
					best_index = i;
				} else {
					let test_value = calcDistance( lines[l1][s1]['x'], lines[l1][s1]['y'], lines[lf][sf]['x'], lines[lf][sf]['y'] );
					if (test_value < best_value) {
						best_value = test_value;
						best_index = i;
					}
				}
	
			}
			
			best = options[best_index];

		}
		
		
		
		
		//TODO: walk in direction of segment until next intersection
		//TODO: on intersection get list of all possible ways (exclude backtrack, exclude invisible lines), save segment and direction
		//TODO: calculate absolute distance between the next step in that direction and the absolute starting point of the polygon
		//TODO: pick the min of the list
		
		
		
		/*
		//TODO: change this, it can't be just from same line, they could be from same line and be invisible in between
		// get list of intersections on same line that are not same as ours
		let list = [];
		for (let i=0; i<intersects.length; i++) {
			if ((intersects[i]['line1'] == startline) && (intersects[i]['segment1'] != startsegm)) {
				list[list.length] = { 'line': intersects[i]['line1'], 'segment':  intersects[i]['segment1'], 'index': i };
			} else if ((intersects[i]['line2'] == startline) && (intersects[i]['segment2'] != startsegm)) {
				list[list.length] = { 'line': intersects[i]['line2'], 'segment':  intersects[i]['segment2'], 'index': i };
			}
		}
		console.log(list);
		let best = false;
		for (let j=0; j<list.length; j++) {
			let segm_dist = Math.abs(list[j]['segment'] - startsegm);
			if (j == 0) {
				best = { 'index': list[j]['index'], 'dir': calcDir(startline, startsegm, list[j]['line'], list[j]['segment']), 'segm_dist': segm_dist};
			} else {
				//TODO: choose next best intersection segment farther away (to get larger polygon) - choosing closest possible for now, to avoid crossover issues
				//TODO: look for polygon closure somehow (guess we need to keep reference to starting intersect and look for that line again)
				//TODO: avoid overcrossing the starting line
				//TODO: ensure we are always turning right by calculating calcdir from x y coordinates using inter['dir']
				
				// closest possible for now, to avoid crossover issues
				if (segm_dist < best['segm_dist']) best = { 'index': list[j]['index'], 'dir': calcDir(startline, startsegm, list[j]['line'], list[j]['segment']), 'segm_dist': segm_dist };	
			}
		}*/
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
							console.log( (segm+1) + ' is invisible');
						}
					} else {
						console.log( (segm+1) + ' is undefined');
					}
					// check going down
					if (line[segm-1] != undefined) {
						if (line[segm-1]['visible'] == true) {
							options[options.length] = findPrevIntersectInLine(inter['line1'], segm);
						} else {
							console.log( (segm-1) + ' is invisible');
						}
					} else {
						console.log( (segm-1) + ' is undefined');
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
							console.log( (segm+1) + ' is invisible');
						}
					} else {
						console.log( (segm+1) + ' is undefined');
					}
					// check going down
					if (line[segm-1] != undefined) {
						if (line[segm-1]['visible'] == true) {
							options[options.length] = findPrevIntersectInLine(inter['line2'], segm);
						} else {
							console.log( (segm-1) + ' is invisible');
						}
					} else {
						console.log( (segm-1) + ' is undefined');
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
	
	/*function calcDir(l1, s1, l2, s2) {
		
		//TODO: test if this dot product is correctly calculated and giving expected direction information (always turn clockwise)
		
		console.log( l1 + ' ' + s1 + ' ' + l2 + ' ' + s2);
		console.log(lines);
		
		let u1 = lines[l1][s1-1] || lines[l1][s1];
		let u2 = lines[l1][s1+1] || lines[l1][s1];
		
		let v1 = lines[l2][s2-1] || lines[l2][s2];
		let v2 = lines[l2][s2+1] || lines[l2][s2];
		
		let dp = (u1['x'] - u2['x']) * (v1['x'] - v2['x']) + (u1['y'] - u2['y']) * (v1['y'] - v2['y']);
		console.log(dp);

		return (dp>0)?1:0;
	}*/
	
	/*function doFloodFill(stdlib, foreign, heap) {
		'use asm';
		var w = foreign.w | 0,
			h = foreign.h | 0,
			bound = foreign.bound | 0,
			i = 0;
		
		var color_index = 1;

		//todo: repeat n max times until we get a non white pixel to floodfill
		
		var pos = (stdlib.Math.random()*w*0.75 + w*0.25 + w*(stdlib.Math.random()*0.5*h + 0.25*h)) | 0;
		
		floodfillFromPos(pos, bound);

		//color_index++;
		
		//floodfillFromPos(1000000, bound);
		
		//for (i = 0; i < w*h; i++) {
		//	var index = (i * 4) | 0;
		//	if (heap[index] == 255) {
		//		floodfillFromPos(i, bound, 0);
		//		color_index++;
		//		if (color_index == 254) return;
		//	}
		//}
		
		//todo: convert a supposedly better version: http://www.adammil.net/blog/v126_A_More_Efficient_Flood_Fill.html
		
		function floodfillFromPos(pos, stopper) {
			var pos=pos|0;
			var stopper=stopper|0;
			//if (level > 5) return;
			if (heap[pos] != stopper) {
				floodfillLine(pos, stopper);
				if (pos+w < w*h) {
					floodfillFromPos((pos+w)|0, stopper|0);
				}
			}			
		}
		
		function floodfillLine(pos, stopper) {
			var j = 0, index = 0;
			var pos=pos|0;
			var stopper=stopper|0;
			var min = (stdlib.Math.floor(pos/w) * w)|0;
			//console.log('min:' + min);
			for (j = pos; j > min; j--) {
				index = (j * 4) | 0;
				if (heap[index] != stopper) {
					heap[index] = color_index;
				} else {
					break;
				} 
			}
			var max = (stdlib.Math.ceil(pos/w) * w)|0;
			//console.log('max:' + max);
			for (j = pos; j < max; j++) {
				index = (j * 4) | 0;
				if (heap[index] != stopper) {
					heap[index] = color_index;
				} else {
					return j|0;
				} 
			}
		}
		
	}*/
	
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

function drawLinesOnQuadWithBackground(vertices, texture) {
	
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
