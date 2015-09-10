"use strict";
var checkCollisionLine = function (line, objectList) {
	var closest = false;
	var hitObject;
	for (var i = 0; i < objectList.length; i++) {
		var object = objectList[i];

		if (!ploxfight.collisionChecks(line, object)) {
			continue;
		}

		if (object.shape === ploxfight.shape.SQUARE) {
			var result = getSquareCollisionPlace(line, object);
			if (result !== false && (closest === false || result < closest)) {
				closest = result;
				hitObject = object;
			}
		} else if (object.shape === ploxfight.shape.CIRCLE) {
			circleCollision(line, object);
		}
	}

	return hitObject;
};

var circleCollision = function (line, circle) {

	//var leftNormal = line.rotate(Math.PI * -0.5);
	//TODO: jag tror även vi måste kolla när vi roterar den 90 grader åt andra hållet också.
	//TODO: Det går att rotera snyggare också... fixa allt sånt här!
	var leftNormal = new ploxfight.Vector(line.end.x - line.start.x, line.end.y - line.start.y, Math.PI * -0.5);

	//calculating line's perpendicular distance to ball
	var c1_circle = new ploxfight.Vector(circle.x - line.start.x, circle.y - line.start.y);
	c1_circle.project(leftNormal);
	var length = c1_circle.len();

	if (length <= circle.radius) {
		//console.log("plox with the circle");
	}
};

var getSquareCollisionPlace = function (line, square) {
	var lines = ploxfight.getSquareLines(square);
	var closest = false;
	for (var i = 0; i < lines.length; i++) {
		var otherLine = lines[i];
		var distance = linesIntersect(line, otherLine);
		if (distance !== false && (closest === false || distance < closest)) {
			closest = distance;
		}
	}
	return closest;
};

//var linesIntersect = function (a, b, c, d) {
//	var CmP = ploxfight.getPoint(c.x - c.x, c.y - c.y);
//	var r = ploxfight.getPoint(b.x - a.x, b.y - a.y);
//	var s = ploxfight.getPoint(d.x - c.x, d.y - c.y);


var linesIntersect = function (line1, line2) {
	var CmP = ploxfight.getPoint(line2.start.x - line1.start.x, line2.start.y - line1.start.y);
	var r = ploxfight.getPoint(line1.end.x - line1.start.x, line1.end.y - line1.start.y);
	var s = ploxfight.getPoint(line2.end.x - line2.start.x, line2.end.y - line2.start.y);

	var CmPxr = CmP.x * r.y - CmP.y * r.x;
	var CmPxs = CmP.x * s.y - CmP.y * s.x;
	var rxs = r.x * s.y - r.y * s.x;

	if (CmPxr === 0) {
		// Lines are collinear, and so intersect if they have any overlap
		//return ((C.x - A.x < 0) != (C.x - B.x < 0)) || ((C.y - A.y < 0) != (C.y - B.y < 0));
		//just return false... pretend it was a miss :)
		return false;
	}

	if (rxs === 0) {
		return false; // Lines are parallel.
	}

	var rxsr = 1 / rxs;
	var t = CmPxs * rxsr;
	var u = CmPxr * rxsr;

	if ((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)) {
		//return distance from start of line1:
		var distance = ploxfight.getDistance(line1.start.x, line1.start.y, line1.end.x, line1.end.y);
		return distance * t;
	} else {
		return false;
	}
};

exports.checkCollisionLine = checkCollisionLine;

//test:
//var line1 = new ploxfight.Line(ploxfight.getPoint(0, 0), ploxfight.getPoint(4, 4));
//var line2 = new ploxfight.Line(ploxfight.getPoint(4, 0), ploxfight.getPoint(1, 3));
//var distance = linesIntersect(line1, line2);
//console.log("DISTNACE: " + distance);
