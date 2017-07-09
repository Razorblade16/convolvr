(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*  static collision detection worker */

"use strict";

var distance2d = function (a, b) {

	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[2] - b[2], 2));
},
    distance2dCompare = function (a, b, n) {
	// more efficient version of distance2d()

	return Math.pow(a[0] - b[0], 2) + Math.pow(a[2] - b[2], 2) < n * n;
},
    distance3dCompare = function (a, b, n) {
	// ..faster than using Math.sqrt()

	return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2) < n * n;
};

var observer = {
	position: [0, 0, 0],
	prevPos: [0, 0, 0],
	velocity: [0, 0, 0],
	vrHeight: 0
},
    voxelList = [],
    voxels = [];

self.update = function () {

	var distance = 0,
	    objPos = [],
	    position = observer.position,
	    innerBox = [false, false],
	    velocity = observer.velocity,
	    vrHeight = observer.vrHeight,
	    closeToVenue = false,
	    collision = false,
	    cKey = "",
	    yPos = 0,
	    size = 50000,
	    obj = null,
	    ent = null,
	    structure = null,
	    bounds = [0, 0],
	    voxel = null,
	    delta = [0, 0],
	    oPos = [],
	    speed = 0,
	    e = 0,
	    i = 0,
	    v = 0;

	for (i = 0; i < voxelList.length; i++) {

		obj = voxelList[i];

		if (!!obj && distance2dCompare(position, obj.position, 2500000)) {
			// do collisions on voxels & structures... just walls at first..

			if (obj.loaded == undefined) {

				obj.loaded = true;
				self.postMessage("{\"command\": \"load entities\", \"data\":{\"coords\":\"" + obj.cell[0] + "." + obj.cell[1] + "." + obj.cell[2] + "\"}}");
			}

			if (distance2dCompare(position, obj.position, 900000)) {

				var alt = obj.altitude || 0;
				yPos = obj.position[1];

				if (distance2dCompare(position, obj.position, 528000)) {

					if (position[1] > yPos - 300000 + vrHeight && position[1] < yPos + 452000 + vrHeight) {

						collision = true;
						self.postMessage("{\"command\": \"platform collision\", \"data\":{\"type\":\"top\", \"position\":[" + obj.position[0] + "," + yPos + "," + obj.position[2] + "] }}");
					}

					if (!!obj.entities && obj.entities.length > 0) {

						e = obj.entities.length - 1;

						while (e >= 0) {

							ent = obj.entities[e];

							if (!!!ent || !!!ent.components) {
								console.warn("Problem with entity! ", e, ent);continue;
							}

							if (distance3dCompare(position, ent.position, (ent.boundingRadius || 100000) + 10000)) {

								ent.components.map(function (entComp) {

									if (distance3dCompare(position, entComp.position, entComp.boundingRadius || 28000)) {

										collision = true;

										if (!!entComp.props.floor) {

											self.postMessage(JSON.stringify({ command: "floor collision", data: {
													position: entComp.position,
													floorData: entComp.props.floor
												} }));
										} else {

											self.postMessage(JSON.stringify({ command: "entity-user collision", data: { position: entComp.position } }));
										}
									}
								});
							}

							e--;
						}
					}
				}
			}
		}
	}

	if (!collision) {
		observer.prevPos = [observer.position[0], observer.position[1], observer.position[2]];
	}

	self.postMessage("{\"command\": \"update\"}");
	self.updateLoop = setTimeout(function () {
		self.update();
	}, 15);
};

self.onmessage = function (event) {

	var message = JSON.parse(event.data),
	    data = message.data,
	    user = observer,
	    voxel = null,
	    toRemove = null,
	    items = [],
	    entities = [],
	    c = 0,
	    p = 0;

	if (message.command == "update") {
		// user.prevPos = [user.position[0], user.position[1], user.position[2]];
		user.position = data.position;
		user.velocity = data.velocity;
		user.vrHeight = data.vrHeight
		//self.postMessage(JSON.stringify(self.observer));
		;
	} else if (message.command == "add voxels") {

		voxelList = voxelList.concat(data);

		data.map(function (v) {
			voxels[v.cell.join(".")] = v;
		});
	} else if (message.command == "remove voxels") {

		p = data.length - 1;

		while (p >= 0) {

			toRemove = data[p];
			c = voxelList.length - 1;

			while (c >= 0) {

				voxel = voxelList[c];

				if (voxel != null && voxel.cell[0] == toRemove.cell[0] && voxel.cell[1] == toRemove.cell[1] && voxel.cell[2] == toRemove.cell[2]) {

					voxelList.splice(c, 1);
					voxels[voxel.cell.join(".")] = null;
				}

				c--;
			}

			p--;
		}
	} else if (message.command == "add entity") {

		entities = voxels[data.coords.join(".")].entities;

		!!entities && voxels[data.coords.join("x")].entities.push(data.entity);
	} else if (message.command == "remove entity") {

		entities = voxels[data.coords.join(".")].entities;

		if (entities != null) {

			c = entities.length - 1;

			while (c >= 0) {

				if (entities[c].id == data.entityId) {

					voxels[data.coords.join(".")].entities.splice(c, 1);
					c = -1;
				}

				c--;
			}
		}
	} else if (message.command == "update entity") {

		entities = voxels[data.coords.join(".")].entities;

		if (entities != null) {

			c = entities.length - 1;

			while (c >= 0) {

				if (entities[c].id == data.entityId) {

					entities[c] = data.entity;
					c = -1;
				}

				c--;
			}
		}
	} else if (message.command == "clear") {

		voxels = [];
	} else if (message.command == "start") {

		self.update();
	} else if (message.command == "stop") {

		self.stop();
	} else if (message.command == "log") {

		if (data == "") {
			self.postMessage("{\"command\":\"log\",\"data\":[" + user.position[0] + "," + user.position[1] + "," + user.position[2] + "]}");
			self.postMessage("{\"command\":\"log\",\"data\":" + JSON.stringify(voxels) + "}");
		}
	}
};

self.stop = function () {

	clearTimeout(self.updateLoop);
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL29wZW5zL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkM6L0NvZGUvc3JjL2dpdGh1Yi5jb20vY29udm9sdnIvY29udm9sdnIvY2xpZW50L3NyYy9qcy93b3JrZXJzL3N0YXRpYy1jb2xsaXNpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0VBLElBQUksVUFBVSxHQUFHLFVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBTTs7QUFFekIsUUFBTyxJQUFJLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFFLENBQUUsQ0FBQTtDQUU1RTtJQUNELGlCQUFpQixHQUFHLFVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQU07OztBQUVsQyxRQUFPLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFFLEdBQUksQ0FBQyxHQUFDLENBQUMsQUFBQyxDQUFBO0NBRXRFO0lBQ0QsaUJBQWlCLEdBQUcsVUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBTTs7O0FBRWxDLFFBQU8sQUFBQyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFD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LElBQUksTUFBTSxFQUFHOztBQUV2QyxNQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7RUFFWCxNQUFNLElBQUssT0FBTyxDQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUc7O0FBRXRDLE1BQUksSUFBSSxJQUFJLEVBQUUsRUFBRTtBQUNmLE9BQUksQ0FBQyxXQUFXLENBQUMsaUNBQTJCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMxSCxPQUFJLENBQUMsV0FBVyxDQUFDLGdDQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUUsR0FBRyxDQUFDLENBQUM7R0FDM0U7RUFFRDtDQUNELENBQUM7O0FBRUYsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFNOztBQUVqQixhQUFZLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFBO0NBRS9CLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogIHN0YXRpYyBjb2xsaXNpb24gZGV0ZWN0aW9uIHdvcmtlciAqL1xyXG5cclxubGV0IGRpc3RhbmNlMmQgPSAoIGEsIGIgKSA9PiB7XHJcblxyXG4gICAgcmV0dXJuIE1hdGguc3FydCggTWF0aC5wb3coIChhWzBdLWJbMF0pLCAyICkgKyBNYXRoLnBvdyggKGFbMl0tYlsyXSksIDIgKSApXHJcblxyXG4gIH0sXHJcbiAgZGlzdGFuY2UyZENvbXBhcmUgPSAoIGEsIGIsIG4gKSA9PiB7IC8vIG1vcmUgZWZmaWNpZW50IHZlcnNpb24gb2YgZGlzdGFuY2UyZCgpXHJcblxyXG5cdCAgcmV0dXJuIE1hdGgucG93KCAoYVswXS1iWzBdKSwgMiApICsgTWF0aC5wb3coIChhWzJdLWJbMl0pLCAyICkgPCAobipuKVxyXG5cclxuICB9LFxyXG4gIGRpc3RhbmNlM2RDb21wYXJlID0gKCBhLCBiLCBuICkgPT4geyAvLyAuLmZhc3RlciB0aGFuIHVzaW5nIE1hdGguc3FydCgpXHJcblxyXG5cdCAgcmV0dXJuIChNYXRoLnBvdyggKGFbMF0tYlswXSksIDIgKSArIE1hdGgucG93KCAoYVsxXS1iWzFdKSwgMiApICsgTWF0aC5wb3coIChhWzJdLWJbMl0pLCAyICkgKSA8IChuKm4pXHJcblxyXG4gIH1cclxuXHJcbmxldCBvYnNlcnZlciA9IHtcclxuXHRcdHBvc2l0aW9uOiBbMCwgMCwgMF0sXHJcblx0XHRwcmV2UG9zOiBbMCwgMCwgMF0sXHJcblx0XHR2ZWxvY2l0eTogWzAsIDAsIDBdLFxyXG5cdFx0dnJIZWlnaHQ6IDBcclxuXHR9LFxyXG5cdHZveGVsTGlzdCA9IFtdLFxyXG5cdHZveGVscyA9IFtdXHJcblxyXG5zZWxmLnVwZGF0ZSA9ICggKSA9PiB7XHJcblxyXG5cdHZhciBkaXN0YW5jZSA9IDAsXHJcblx0XHRvYmpQb3MgPSBbXSxcclxuXHRcdHBvc2l0aW9uID0gb2JzZXJ2ZXIucG9zaXRpb24sXHJcblx0XHRpbm5lckJveCA9IFtmYWxzZSwgZmFsc2VdLFxyXG5cdFx0dmVsb2NpdHkgPSBvYnNlcnZlci52ZWxvY2l0eSxcclxuXHRcdHZySGVpZ2h0ID0gb2JzZXJ2ZXIudnJIZWlnaHQsXHJcblx0XHRjbG9zZVRvVmVudWUgPSAgZmFsc2UsXHJcblx0XHRjb2xsaXNpb24gPSBmYWxzZSxcclxuXHRcdGNLZXkgPSBcIlwiLFxyXG5cdFx0eVBvcyA9IDAsXHJcblx0XHRzaXplID0gNTAwMDAsXHJcblx0XHRvYmogPSBudWxsLFxyXG5cdFx0ZW50ID0gbnVsbCxcclxuXHRcdHN0cnVjdHVyZSA9IG51bGwsXHJcblx0XHRib3VuZHMgPSBbMCwgMF0sXHJcblx0XHR2b3hlbCA9IG51bGwsXHJcblx0XHRkZWx0YSA9IFswLCAwXSxcclxuXHRcdG9Qb3MgPSBbXSxcclxuXHRcdHNwZWVkID0gMCxcclxuXHRcdGUgPSAwLFxyXG5cdFx0aSA9IDAsXHJcblx0XHR2ID0gMFxyXG5cclxuXHRmb3IgKCBpID0gMDsgaSA8IHZveGVsTGlzdC5sZW5ndGg7IGkgKysgKSB7XHJcblxyXG5cdFx0b2JqID0gdm94ZWxMaXN0WyBpIF1cclxuXHJcblx0XHRpZiAoICEhb2JqICAmJiBkaXN0YW5jZTJkQ29tcGFyZSggcG9zaXRpb24sIG9iai5wb3NpdGlvbiwgMjUwMDAwMCApICkgeyBcdC8vIGRvIGNvbGxpc2lvbnMgb24gdm94ZWxzICYgc3RydWN0dXJlcy4uLiBqdXN0IHdhbGxzIGF0IGZpcnN0Li5cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRpZiAoIG9iai5sb2FkZWQgPT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG9iai5sb2FkZWQgPSB0cnVlXHJcblx0XHRcdFx0c2VsZi5wb3N0TWVzc2FnZSgne1wiY29tbWFuZFwiOiBcImxvYWQgZW50aXRpZXNcIiwgXCJkYXRhXCI6e1wiY29vcmRzXCI6XCInK29iai5jZWxsWzBdKycuJytvYmouY2VsbFsxXSsnLicrb2JqLmNlbGxbMl0rJ1wifX0nKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICggZGlzdGFuY2UyZENvbXBhcmUoIHBvc2l0aW9uLCBvYmoucG9zaXRpb24sIDkwMDAwMCApICkge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0bGV0IGFsdCA9IG9iai5hbHRpdHVkZSB8fCAwXHJcblx0XHRcdFx0XHR5UG9zID0gb2JqLnBvc2l0aW9uWzFdXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKCBkaXN0YW5jZTJkQ29tcGFyZSggcG9zaXRpb24sIG9iai5wb3NpdGlvbiwgNTI4MDAwICkgKSB7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKCBwb3NpdGlvblsxXSA+IHlQb3MgLSAzMDAwMDAgKyB2ckhlaWdodCAgJiYgcG9zaXRpb25bMV0gPCB5UG9zICsgNDUyMDAwICsgdnJIZWlnaHQgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRjb2xsaXNpb24gPSB0cnVlXHJcblx0XHRcdFx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoJ3tcImNvbW1hbmRcIjogXCJwbGF0Zm9ybSBjb2xsaXNpb25cIiwgXCJkYXRhXCI6e1widHlwZVwiOlwidG9wXCIsIFwicG9zaXRpb25cIjpbJyArIG9iai5wb3NpdGlvblswXSArICcsJyArICh5UG9zICkgKyAnLCcgKyBvYmoucG9zaXRpb25bMl0gKyAnXSB9fScpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKCAhIW9iai5lbnRpdGllcyAmJiBvYmouZW50aXRpZXMubGVuZ3RoID4gMCApIHtcclxuXHJcblx0XHRcdFx0XHRcdGUgPSBvYmouZW50aXRpZXMubGVuZ3RoIC0gMVxyXG5cclxuXHRcdFx0XHRcdFx0d2hpbGUgKCBlID49IDAgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGVudCA9IG9iai5lbnRpdGllc1sgZSBdXHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICggISEhIGVudCB8fCAhISFlbnQuY29tcG9uZW50cyApIHsgY29uc29sZS53YXJuKFwiUHJvYmxlbSB3aXRoIGVudGl0eSEgXCIsZSAsZW50KTsgY29udGludWUgfVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIGRpc3RhbmNlM2RDb21wYXJlKCBwb3NpdGlvbiwgZW50LnBvc2l0aW9uLCAoZW50LmJvdW5kaW5nUmFkaXVzfHwxMDAwMDApKzEwMDAwKSApIHsgXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0ZW50LmNvbXBvbmVudHMubWFwKCBlbnRDb21wID0+IHtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmICggZGlzdGFuY2UzZENvbXBhcmUoIHBvc2l0aW9uLCBlbnRDb21wLnBvc2l0aW9uLCBlbnRDb21wLmJvdW5kaW5nUmFkaXVzIHx8IDI4MDAwKSApIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29sbGlzaW9uID0gdHJ1ZVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoICEhIGVudENvbXAucHJvcHMuZmxvb3IgKSB7IFxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCB7Y29tbWFuZDogXCJmbG9vciBjb2xsaXNpb25cIiwgZGF0YTogeyBcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zaXRpb246IGVudENvbXAucG9zaXRpb24sIFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbG9vckRhdGE6IGVudENvbXAucHJvcHMuZmxvb3JcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH19KSlcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzZWxmLnBvc3RNZXNzYWdlKCBKU09OLnN0cmluZ2lmeSgge2NvbW1hbmQ6IFwiZW50aXR5LXVzZXIgY29sbGlzaW9uXCIsIGRhdGE6eyBwb3NpdGlvbjogZW50Q29tcC5wb3NpdGlvbiB9fSApIClcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0ZSAtLVxyXG5cclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0aWYgKCAhY29sbGlzaW9uICkge1xyXG5cdFx0b2JzZXJ2ZXIucHJldlBvcyA9IFsgb2JzZXJ2ZXIucG9zaXRpb25bMF0sIG9ic2VydmVyLnBvc2l0aW9uWzFdLCBvYnNlcnZlci5wb3NpdGlvblsyXSBdXHJcblx0fVxyXG5cclxuXHRzZWxmLnBvc3RNZXNzYWdlKCd7XCJjb21tYW5kXCI6IFwidXBkYXRlXCJ9Jyk7XHJcblx0c2VsZi51cGRhdGVMb29wID0gc2V0VGltZW91dCggKCkgPT4ge1xyXG5cdFx0c2VsZi51cGRhdGUoKTtcclxuXHR9LCAxNSk7XHJcbn1cclxuXHJcbnNlbGYub25tZXNzYWdlID0gZnVuY3Rpb24gKCBldmVudCApIHsgXHJcblxyXG5cdHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZSggZXZlbnQuZGF0YSApLFxyXG5cdFx0ZGF0YSA9IG1lc3NhZ2UuZGF0YSxcclxuXHRcdHVzZXIgPSBvYnNlcnZlcixcclxuXHRcdHZveGVsID0gbnVsbCxcclxuXHRcdHRvUmVtb3ZlID0gbnVsbCxcclxuXHRcdGl0ZW1zID0gW10sXHJcblx0XHRlbnRpdGllcyA9IFtdLFxyXG5cdFx0YyA9IDAsXHJcblx0XHRwID0gMFxyXG5cdFx0XHJcblx0aWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJ1cGRhdGVcIiApIHtcclxuXHRcdC8vIHVzZXIucHJldlBvcyA9IFt1c2VyLnBvc2l0aW9uWzBdLCB1c2VyLnBvc2l0aW9uWzFdLCB1c2VyLnBvc2l0aW9uWzJdXTtcclxuXHRcdHVzZXIucG9zaXRpb24gPSBkYXRhLnBvc2l0aW9uXHJcblx0XHR1c2VyLnZlbG9jaXR5ID0gZGF0YS52ZWxvY2l0eVxyXG5cdFx0dXNlci52ckhlaWdodCA9IGRhdGEudnJIZWlnaHRcclxuXHRcdC8vc2VsZi5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShzZWxmLm9ic2VydmVyKSk7XHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwiYWRkIHZveGVsc1wiICkge1xyXG5cclxuXHRcdHZveGVsTGlzdCA9IHZveGVsTGlzdC5jb25jYXQoZGF0YSlcclxuXHJcblx0XHRkYXRhLm1hcCggdiA9PiB7XHJcblx0XHRcdHZveGVsc1sgdi5jZWxsLmpvaW4oXCIuXCIpIF0gPSB2XHJcblx0XHR9KVxyXG5cclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJyZW1vdmUgdm94ZWxzXCIgKSB7XHJcblxyXG5cdFx0cCA9IGRhdGEubGVuZ3RoIC0xXHJcblxyXG5cdFx0d2hpbGUgKCBwID49IDAgKSB7XHJcblxyXG5cdFx0XHR0b1JlbW92ZSA9IGRhdGFbcF1cclxuXHRcdFx0YyA9IHZveGVsTGlzdC5sZW5ndGgtMVxyXG5cclxuXHRcdFx0d2hpbGUgKCBjID49IDAgKSB7XHJcblxyXG5cdFx0XHRcdHZveGVsID0gdm94ZWxMaXN0WyBjIF1cclxuXHJcblx0XHRcdFx0aWYgKCB2b3hlbCAhPSBudWxsICYmIHZveGVsLmNlbGxbMF0gPT0gdG9SZW1vdmUuY2VsbFswXSAmJiB2b3hlbC5jZWxsWzFdID09IHRvUmVtb3ZlLmNlbGxbMV0gICYmIHZveGVsLmNlbGxbMl0gPT0gdG9SZW1vdmUuY2VsbFsyXSApIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0dm94ZWxMaXN0LnNwbGljZSggYywgMSApXHJcblx0XHRcdFx0XHR2b3hlbHNbIHZveGVsLmNlbGwuam9pbihcIi5cIildID0gbnVsbFxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Yy0tXHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwIC0tXHJcblxyXG5cdFx0fVxyXG5cclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJhZGQgZW50aXR5XCIgKSB7XHJcblxyXG4gICAgZW50aXRpZXMgPSB2b3hlbHNbZGF0YS5jb29yZHMuam9pbihcIi5cIildLmVudGl0aWVzXHJcblxyXG4gICAgISEgZW50aXRpZXMgJiYgdm94ZWxzW2RhdGEuY29vcmRzLmpvaW4oXCJ4XCIpXS5lbnRpdGllcy5wdXNoKCBkYXRhLmVudGl0eSApXHJcblxyXG4gIH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcInJlbW92ZSBlbnRpdHlcIiApIHtcclxuXHJcbiAgICBcdGVudGl0aWVzID0gdm94ZWxzWyBkYXRhLmNvb3Jkcy5qb2luKFwiLlwiKSBdLmVudGl0aWVzXHJcblxyXG5cdFx0aWYgKCBlbnRpdGllcyAhPSBudWxsICkge1xyXG5cclxuXHRcdFx0YyA9IGVudGl0aWVzLmxlbmd0aC0xXHJcblxyXG5cdFx0XHR3aGlsZSAoIGMgPj0gMCApIHtcclxuXHJcblx0XHRcdFx0aWYgKCBlbnRpdGllc1tjXS5pZCA9PSBkYXRhLmVudGl0eUlkICkge1xyXG5cclxuXHRcdFx0XHRcdHZveGVsc1sgZGF0YS5jb29yZHMuam9pbihcIi5cIikgXS5lbnRpdGllcy5zcGxpY2UoYywgMSlcclxuXHRcdFx0XHRcdGMgPSAtMVxyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGMtLVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwidXBkYXRlIGVudGl0eVwiICkge1xyXG5cclxuXHRcdGVudGl0aWVzID0gdm94ZWxzWyBkYXRhLmNvb3Jkcy5qb2luKFwiLlwiKSBdLmVudGl0aWVzXHJcblxyXG5cdFx0aWYgKCBlbnRpdGllcyAhPSBudWxsICkge1xyXG5cclxuXHRcdFx0YyA9IGVudGl0aWVzLmxlbmd0aC0xXHJcblxyXG5cdFx0XHR3aGlsZSAoIGMgPj0gMCApIHtcclxuXHJcblx0XHRcdFx0aWYgKGVudGl0aWVzWyBjIF0uaWQgPT0gZGF0YS5lbnRpdHlJZCkge1xyXG5cclxuXHRcdFx0XHRcdGVudGl0aWVzWyBjIF0gPSBkYXRhLmVudGl0eVxyXG5cdFx0XHRcdFx0YyA9IC0xXHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Yy0tXHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJjbGVhclwiICkge1xyXG5cclxuXHRcdHZveGVscyA9IFtdXHJcblxyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcInN0YXJ0XCIgKSB7XHJcblxyXG5cdFx0c2VsZi51cGRhdGUoKVxyXG5cclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJzdG9wXCIgKSB7XHJcblxyXG5cdFx0c2VsZi5zdG9wKClcclxuXHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwibG9nXCIgKSB7XHJcblxyXG5cdFx0aWYgKGRhdGEgPT0gXCJcIikge1xyXG5cdFx0XHRzZWxmLnBvc3RNZXNzYWdlKCd7XCJjb21tYW5kXCI6XCJsb2dcIixcImRhdGFcIjpbJyArIHVzZXIucG9zaXRpb25bMF0gKyAnLCcgKyB1c2VyLnBvc2l0aW9uWzFdICsgJywnICsgdXNlci5wb3NpdGlvblsyXSArICddfScpO1xyXG5cdFx0XHRzZWxmLnBvc3RNZXNzYWdlKCd7XCJjb21tYW5kXCI6XCJsb2dcIixcImRhdGFcIjonICsgSlNPTi5zdHJpbmdpZnkodm94ZWxzKSsgJ30nKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG59O1xyXG5cclxuc2VsZi5zdG9wID0gKCkgPT4ge1xyXG5cclxuXHRjbGVhclRpbWVvdXQoIHNlbGYudXBkYXRlTG9vcCApXHJcblxyXG59XHJcbiJdfQ==
