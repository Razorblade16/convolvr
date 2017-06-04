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
    entities = [],
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

	for (i = 0; i < voxels.length; i++) {

		obj = voxels[i];

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

					if (position[1] > yPos - 160000 + vrHeight && position[1] < yPos + 470000 + vrHeight) {

						collision = true;
						self.postMessage("{\"command\": \"platform collision\", \"data\":{\"type\":\"top\", \"position\":[" + obj.position[0] + "," + yPos + "," + obj.position[2] + "] }}");
					}

					if (!!obj.entities && obj.entities.length > 0) {

						e = obj.entities.length - 1;

						while (e >= 0) {

							ent = obj.entities[e];

							if (distance3dCompare(position, ent.position, (ent.boundingRadius || 20000) + 10000)) {

								collision = true;
								self.postMessage(JSON.stringify({ command: "entity-user collision", data: { position: ent.position } }));
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
	    c = 0,
	    p = 0,
	    items = [],
	    platform = null,
	    toRemove = null;

	if (message.command == "update") {
		// user.prevPos = [user.position[0], user.position[1], user.position[2]];
		user.position = data.position;
		user.velocity = data.velocity;
		user.vrHeight = data.vrHeight
		//self.postMessage(JSON.stringify(self.observer));
		;
	} else if (message.command == "add voxels") {

		voxels = voxels.concat(data);
	} else if (message.command == "remove voxels") {

		p = data.length - 1;
		while (p >= 0) {
			toRemove = data[p];
			c = voxels.length - 1;
			while (c >= 0) {
				platform = voxels[c];
				if (platform != null) {
					if (platform.cell[0] == toRemove.cell[0] && platform.cell[1] == toRemove.cell[1] && platform.cell[2] == toRemove.cell[2]) {
						voxels.splice(c, 1);
					}
				}
				c--;
			}
			p--;
		}
	} else if (message.command == "add entity") {

		entities = voxels[data.coords.join(".")].entities;

		if (entities != null) {

			voxels[data.coords.join("x")].entities.push(data.entity);
		}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Db2RlL3NyYy9naXRodWIuY29tL1NwYWNlSGV4YWdvbi9jb252b2x2ci9jbGllbnQvc3JjL2pzL3dvcmtlcnMvc3RhdGljLWNvbGxpc2lvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDRUEsSUFBSSxVQUFVLEdBQUcsVUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFNOztBQUV6QixRQUFPLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsQ0FBRSxDQUFBO0NBRTVFO0lBQ0QsaUJBQWlCLEdBQUcsVUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBTTs7O0FBRWxDLFFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUMsQ0FBRSxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsR0FBSSxDQUFDLEdBQUMsQ0FBQyxBQUFDLENBQUE7Q0FFcEU7SUFDRCxpQkFBaUIsR0FBRyxVQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFNOzs7QUFFbEMsUUFBTyxBQUFDLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQyxDQUFD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QU0sQ0FBQyxHQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQzNFO0VBRUQ7Q0FDRCxDQUFDOztBQUVGLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWTs7QUFFdkIsYUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtDQUU3QixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qICBzdGF0aWMgY29sbGlzaW9uIGRldGVjdGlvbiB3b3JrZXIgKi9cclxuXHJcbmxldCBkaXN0YW5jZTJkID0gKCBhLCBiICkgPT4ge1xyXG5cclxuICAgIHJldHVybiBNYXRoLnNxcnQoIE1hdGgucG93KCAoYVswXS1iWzBdKSwgMiApICsgTWF0aC5wb3coIChhWzJdLWJbMl0pLCAyICkgKVxyXG5cclxuICB9LFxyXG4gIGRpc3RhbmNlMmRDb21wYXJlID0gKCBhLCBiLCBuICkgPT4geyAvLyBtb3JlIGVmZmljaWVudCB2ZXJzaW9uIG9mIGRpc3RhbmNlMmQoKVxyXG5cclxuXHQgIHJldHVybiBNYXRoLnBvdyggKGFbMF0tYlswXSksIDIgKStNYXRoLnBvdyggKGFbMl0tYlsyXSksIDIgKSA8IChuKm4pXHJcblxyXG4gIH0sXHJcbiAgZGlzdGFuY2UzZENvbXBhcmUgPSAoIGEsIGIsIG4gKSA9PiB7IC8vIC4uZmFzdGVyIHRoYW4gdXNpbmcgTWF0aC5zcXJ0KClcclxuXHJcblx0ICByZXR1cm4gKE1hdGgucG93KCAoYVswXS1iWzBdKSwgMiApICsgTWF0aC5wb3coIChhWzFdLWJbMV0pLCAyICkgKyBNYXRoLnBvdyggKGFbMl0tYlsyXSksIDIgKSkgPCAobipuKVxyXG5cclxuICB9XHJcblxyXG5sZXQgb2JzZXJ2ZXIgPSB7XHJcblx0XHRwb3NpdGlvbjogWzAsIDAsIDBdLFxyXG5cdFx0cHJldlBvczogWzAsIDAsIDBdLFxyXG5cdFx0dmVsb2NpdHk6IFswLCAwLCAwXSxcclxuXHRcdHZySGVpZ2h0OiAwXHJcblx0fSxcclxuXHRlbnRpdGllcyA9IFtdLFxyXG5cdHZveGVscyA9IFtdXHJcblxyXG5zZWxmLnVwZGF0ZSA9ICggKSA9PiB7XHJcblxyXG5cdHZhciBkaXN0YW5jZSA9IDAsXHJcblx0XHRvYmpQb3MgPSBbXSxcclxuXHRcdHBvc2l0aW9uID0gb2JzZXJ2ZXIucG9zaXRpb24sXHJcblx0XHRpbm5lckJveCA9IFtmYWxzZSwgZmFsc2VdLFxyXG5cdFx0dmVsb2NpdHkgPSBvYnNlcnZlci52ZWxvY2l0eSxcclxuXHRcdHZySGVpZ2h0ID0gb2JzZXJ2ZXIudnJIZWlnaHQsXHJcblx0XHRjbG9zZVRvVmVudWUgPSAgZmFsc2UsXHJcblx0XHRjb2xsaXNpb24gPSBmYWxzZSxcclxuXHRcdGNLZXkgPSBcIlwiLFxyXG5cdFx0eVBvcyA9IDAsXHJcblx0XHRzaXplID0gNTAwMDAsXHJcblx0XHRvYmogPSBudWxsLFxyXG5cdFx0ZW50ID0gbnVsbCxcclxuXHRcdHN0cnVjdHVyZSA9IG51bGwsXHJcblx0XHRib3VuZHMgPSBbMCwgMF0sXHJcblx0XHR2b3hlbCA9IG51bGwsXHJcblx0XHRkZWx0YSA9IFswLCAwXSxcclxuXHRcdG9Qb3MgPSBbXSxcclxuXHRcdHNwZWVkID0gMCxcclxuXHRcdGUgPSAwLFxyXG5cdFx0aSA9IDAsXHJcblx0XHR2ID0gMFxyXG5cclxuXHRcdGZvciAoIGkgPSAwOyBpIDwgdm94ZWxzLmxlbmd0aDsgaSArKyApIHtcclxuXHJcblx0XHRcdG9iaiA9IHZveGVsc1tpXTtcclxuXHJcblx0XHRcdGlmICggISFvYmogICYmIGRpc3RhbmNlMmRDb21wYXJlKCBwb3NpdGlvbiwgb2JqLnBvc2l0aW9uLCAyNTAwMDAwICkgKSB7IFx0Ly8gZG8gY29sbGlzaW9ucyBvbiB2b3hlbHMgJiBzdHJ1Y3R1cmVzLi4uIGp1c3Qgd2FsbHMgYXQgZmlyc3QuLlxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKG9iai5sb2FkZWQgPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHRvYmoubG9hZGVkID0gdHJ1ZVxyXG5cdFx0XHRcdFx0c2VsZi5wb3N0TWVzc2FnZSgne1wiY29tbWFuZFwiOiBcImxvYWQgZW50aXRpZXNcIiwgXCJkYXRhXCI6e1wiY29vcmRzXCI6XCInK29iai5jZWxsWzBdKycuJytvYmouY2VsbFsxXSsnLicrb2JqLmNlbGxbMl0rJ1wifX0nKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoIGRpc3RhbmNlMmRDb21wYXJlKCBwb3NpdGlvbiwgb2JqLnBvc2l0aW9uLCA5MDAwMDAgKSApIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0bGV0IGFsdCA9IG9iai5hbHRpdHVkZSB8fCAwXHJcblx0XHRcdFx0XHRcdHlQb3MgPSBvYmoucG9zaXRpb25bMV1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoIGRpc3RhbmNlMmRDb21wYXJlKCBwb3NpdGlvbiwgb2JqLnBvc2l0aW9uLCA1MjgwMDAgKSApIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKCBwb3NpdGlvblsxXSA+IHlQb3MgLSAxNjAwMDAgKyB2ckhlaWdodCAgJiYgcG9zaXRpb25bMV0gPCB5UG9zICsgNDcwMDAwICsgdnJIZWlnaHQgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRjb2xsaXNpb24gPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRzZWxmLnBvc3RNZXNzYWdlKCd7XCJjb21tYW5kXCI6IFwicGxhdGZvcm0gY29sbGlzaW9uXCIsIFwiZGF0YVwiOntcInR5cGVcIjpcInRvcFwiLCBcInBvc2l0aW9uXCI6WycgKyBvYmoucG9zaXRpb25bMF0gKyAnLCcgKyAoeVBvcyApICsgJywnICsgb2JqLnBvc2l0aW9uWzJdICsgJ10gfX0nKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZiAoICEhb2JqLmVudGl0aWVzICYmIG9iai5lbnRpdGllcy5sZW5ndGggPiAwICkge1xyXG5cclxuXHRcdFx0XHRcdFx0ZSA9IG9iai5lbnRpdGllcy5sZW5ndGggLSAxXHJcblxyXG5cdFx0XHRcdFx0XHR3aGlsZSAoIGUgPj0gMCApIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0ZW50ID0gb2JqLmVudGl0aWVzWyBlIF1cclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCBkaXN0YW5jZTNkQ29tcGFyZSggcG9zaXRpb24sIGVudC5wb3NpdGlvbiwgKGVudC5ib3VuZGluZ1JhZGl1c3x8MjAwMDApKzEwMDAwKSApIHsgXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Y29sbGlzaW9uID0gdHJ1ZVxyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZi5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIHtjb21tYW5kOiBcImVudGl0eS11c2VyIGNvbGxpc2lvblwiLCBkYXRhOnsgcG9zaXRpb246IGVudC5wb3NpdGlvbiB9fSApIClcclxuXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRlIC0tXHJcblxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblxyXG5cdFx0XHQgfVxyXG5cclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0aWYgKCAhY29sbGlzaW9uKSB7XHJcblx0XHRvYnNlcnZlci5wcmV2UG9zID0gW29ic2VydmVyLnBvc2l0aW9uWzBdLCBvYnNlcnZlci5wb3NpdGlvblsxXSwgb2JzZXJ2ZXIucG9zaXRpb25bMl1dO1xyXG5cdH1cclxuXHJcblx0c2VsZi5wb3N0TWVzc2FnZSgne1wiY29tbWFuZFwiOiBcInVwZGF0ZVwifScpO1xyXG5cdHNlbGYudXBkYXRlTG9vcCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0c2VsZi51cGRhdGUoKTtcclxuXHR9LCAxNSk7XHJcbn1cclxuXHJcbnNlbGYub25tZXNzYWdlID0gZnVuY3Rpb24gKCBldmVudCApIHsgXHJcblxyXG5cdHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKSxcclxuXHRcdFx0ZGF0YSA9IG1lc3NhZ2UuZGF0YSxcclxuXHRcdFx0dXNlciA9IG9ic2VydmVyLFxyXG5cdFx0XHRjID0gMCxcclxuXHRcdFx0cCA9IDAsXHJcblx0XHRcdGl0ZW1zID0gW10sXHJcblx0XHRcdHBsYXRmb3JtID0gbnVsbCxcclxuXHRcdFx0dG9SZW1vdmUgPSBudWxsXHJcblxyXG5cdGlmICggbWVzc2FnZS5jb21tYW5kID09IFwidXBkYXRlXCIgKSB7XHJcblx0XHQvLyB1c2VyLnByZXZQb3MgPSBbdXNlci5wb3NpdGlvblswXSwgdXNlci5wb3NpdGlvblsxXSwgdXNlci5wb3NpdGlvblsyXV07XHJcblx0XHR1c2VyLnBvc2l0aW9uID0gZGF0YS5wb3NpdGlvblxyXG5cdFx0dXNlci52ZWxvY2l0eSA9IGRhdGEudmVsb2NpdHlcclxuXHRcdHVzZXIudnJIZWlnaHQgPSBkYXRhLnZySGVpZ2h0XHJcblx0XHQvL3NlbGYucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoc2VsZi5vYnNlcnZlcikpO1xyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcImFkZCB2b3hlbHNcIiApIHtcclxuXHJcblx0XHR2b3hlbHMgPSB2b3hlbHMuY29uY2F0KGRhdGEpO1xyXG5cclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJyZW1vdmUgdm94ZWxzXCIgKSB7XHJcblxyXG5cdFx0cCA9IGRhdGEubGVuZ3RoIC0xO1xyXG5cdFx0d2hpbGUgKCBwID49IDAgKSB7XHJcblx0XHRcdHRvUmVtb3ZlID0gZGF0YVtwXTtcclxuXHRcdFx0YyA9IHZveGVscy5sZW5ndGgtMTtcclxuXHRcdFx0d2hpbGUgKCBjID49IDAgKSB7XHJcblx0XHRcdFx0cGxhdGZvcm0gPSB2b3hlbHNbY107XHJcblx0XHRcdFx0aWYgKHBsYXRmb3JtICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdGlmIChwbGF0Zm9ybS5jZWxsWzBdID09IHRvUmVtb3ZlLmNlbGxbMF0gJiYgcGxhdGZvcm0uY2VsbFsxXSA9PSB0b1JlbW92ZS5jZWxsWzFdICAmJiBwbGF0Zm9ybS5jZWxsWzJdID09IHRvUmVtb3ZlLmNlbGxbMl0pIHtcclxuXHRcdFx0XHRcdFx0dm94ZWxzLnNwbGljZShjLCAxKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Yy0tO1xyXG5cdFx0XHR9XHJcblx0XHRcdHAgLS07XHJcblx0XHR9XHJcblxyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcImFkZCBlbnRpdHlcIiApIHtcclxuXHJcbiAgICBlbnRpdGllcyA9IHZveGVsc1tkYXRhLmNvb3Jkcy5qb2luKFwiLlwiKV0uZW50aXRpZXNcclxuXHJcbiAgICBpZiAoZW50aXRpZXMgIT0gbnVsbCkge1xyXG5cclxuICAgICAgdm94ZWxzW2RhdGEuY29vcmRzLmpvaW4oXCJ4XCIpXS5lbnRpdGllcy5wdXNoKGRhdGEuZW50aXR5KVxyXG5cclxuICAgIH1cclxuXHJcbiAgfSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwicmVtb3ZlIGVudGl0eVwiICkge1xyXG5cclxuICAgIGVudGl0aWVzID0gdm94ZWxzW2RhdGEuY29vcmRzLmpvaW4oXCIuXCIpXS5lbnRpdGllc1xyXG5cclxuICAgIGlmIChlbnRpdGllcyAhPSBudWxsKSB7XHJcblxyXG4gICAgICBjID0gZW50aXRpZXMubGVuZ3RoLTFcclxuXHJcbiAgXHRcdHdoaWxlICggYyA+PSAwICkge1xyXG5cclxuICBcdFx0XHRpZiAoZW50aXRpZXNbY10uaWQgPT0gZGF0YS5lbnRpdHlJZCkge1xyXG5cclxuICBcdFx0XHRcdHZveGVsc1tkYXRhLmNvb3Jkcy5qb2luKFwiLlwiKV0uZW50aXRpZXMuc3BsaWNlKGMsIDEpXHJcbiAgICAgICAgICBjID0gLTFcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICBcdFx0XHRjLS1cclxuXHJcbiAgXHRcdH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcImNsZWFyXCIgKSB7XHJcblxyXG5cdFx0dm94ZWxzID0gW11cclxuXHJcblx0fSBlbHNlIGlmICggbWVzc2FnZS5jb21tYW5kID09IFwic3RhcnRcIiApIHtcclxuXHJcblx0XHRzZWxmLnVwZGF0ZSgpXHJcblxyXG5cdH0gZWxzZSBpZiAoIG1lc3NhZ2UuY29tbWFuZCA9PSBcInN0b3BcIiApIHtcclxuXHJcblx0XHRzZWxmLnN0b3AoKVxyXG5cclxuXHR9IGVsc2UgaWYgKCBtZXNzYWdlLmNvbW1hbmQgPT0gXCJsb2dcIiApIHtcclxuXHJcblx0XHRpZiAoZGF0YSA9PSBcIlwiKSB7XHJcblx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoJ3tcImNvbW1hbmRcIjpcImxvZ1wiLFwiZGF0YVwiOlsnICsgdXNlci5wb3NpdGlvblswXSArICcsJyArIHVzZXIucG9zaXRpb25bMV0gKyAnLCcgKyB1c2VyLnBvc2l0aW9uWzJdICsgJ119Jyk7XHJcblx0XHRcdHNlbGYucG9zdE1lc3NhZ2UoJ3tcImNvbW1hbmRcIjpcImxvZ1wiLFwiZGF0YVwiOicgKyBKU09OLnN0cmluZ2lmeSh2b3hlbHMpKyAnfScpO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcbn07XHJcblxyXG5zZWxmLnN0b3AgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdGNsZWFyVGltZW91dChzZWxmLnVwZGF0ZUxvb3ApXHJcblxyXG59XHJcbiJdfQ==
