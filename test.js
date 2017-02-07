var D = document;

rand = function(n){
	return 0|(Math.random()*n);
};

D.title = 'banana line';

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
var ctx = c.getContext('2d');

var w = ctx.width = c.width = window.innerWidth;
var h = ctx.height = c.height = window.innerHeight;

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

var r="rgba(";
var c1 = r+"0,0,0,1)", c2 = r+"0,0,0,.1)", c3 = r+"254,147,88,1)", c4 = r+"94,88,254,1)", c5 = r+"254,229,88,1)";		

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

	function drawBackground(timer) {
		// background
		ctx.globalCompositeOperation="source-over";
		var lingrad = ctx.createLinearGradient(0,0,0,h);
		lingrad.addColorStop(0, '#000');
		lingrad.addColorStop(1, '#115');
		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,w,h);
	}
				
	function drawLines(timer) {
		// stroke
		ctx.globalCompositeOperation="source-over";
		ctx.lineCap="round";
		ctx.lineWidth=2;
		var gradient=ctx.createLinearGradient(0,0,w,0);
		gradient.addColorStop("0","magenta");
		gradient.addColorStop("0.5","blue");
		gradient.addColorStop("1.0","red");
		ctx.strokeStyle=gradient;		
		
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
					// snap to intersection point
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
