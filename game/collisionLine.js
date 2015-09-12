"use strict";
var checkCollisionLine = function (line, objectList) {
	var closest = false;	// Jag tror inte closest alltid är en boolean... det förklarar en del
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
			var result = circleCollision(line, object);
			// Vi har en enklare koll här, för jag fattar fan inte koden...
			if (result) {
				hitObject = object;
			}
		}
	}

	return hitObject;
};

var circleCollision = function (line, circle) {
	// Code from http://stackoverflow.com/a/1084899/249871
	var d = new ploxfight.Vector(line.end.x - line.start.x, line.end.y - line.start.y);
	var f = new ploxfight.Vector(line.start.x - circle.x, line.start.y - circle.y);

	var a = d.dot(d);
	var b = 2 * f.dot(d);
	var c = f.dot(f) - circle.radius * circle.radius;

	var discriminant = b * b - 4 * a * c;
	if (discriminant < 0) {
		// no intersection
		return false;
	} else {
		// ray didn't totally miss sphere,
		// so there is a solution to
		// the equation.

		discriminant = Math.sqrt(discriminant);

		// either solution may be on or off the ray so need to test both
		// t1 is always the smaller value, because BOTH discriminant and
		// a are nonnegative.
		var t1 = (-b - discriminant) / (2 * a);
		var t2 = (-b + discriminant) / (2 * a);

		// 3x HIT cases:
		//          -o->             --|-->  |            |  --|->
		// Impale(t1 hit,t2 hit), Poke(t1 hit,t2>1), ExitWound(t1<0, t2 hit),

		// 3x MISS cases:
		//       ->  o                     o ->              | -> |
		// FallShort (t1>1,t2>1), Past (t1<0,t2<0), CompletelyInside(t1<0, t2>1)

		if (t1 >= 0 && t1 <= 1) {
			// t1 is the intersection, and it's closer than t2
			// (since t1 uses -b - discriminant)
			// Impale, Poke
			return true;
		}

		// here t1 didn't intersect so we are either started
		// inside the sphere or completely past it
		if (t2 >= 0 && t2 <= 1) {
			// ExitWound
			return true;
		}

		// no intn: FallShort, Past, CompletelyInside
		return false;
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
