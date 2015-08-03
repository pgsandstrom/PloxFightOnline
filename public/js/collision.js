(function () {
	var ploxfight = window.ploxfight = window.ploxfight || {};


	ploxfight.getDistance = function (x1, y1, x2, y2) {
		var xDiff = Math.abs(x1 - x2);
		var yDiff = Math.abs(y1 - y2);
		return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
	};

// Collision logic taken from here: http://jsfiddle.net/ARTsinn/FpEZf/
// If the link is dead, just check fullCollisionStuffExample.js

	var response = new Response();

	var checkCollisions = function (object1, object2) {

		if (!ploxfight.collisionChecks(object1, object2)) {
			return;
		}

		response.clear();
		var collision;
		if (object1.shape === ploxfight.shape.SQUARE && object2.shape === ploxfight.shape.SQUARE) {
			var polygon1 = squareToPolygon(object1);
			var polygon2 = squareToPolygon(object2);
			collision = testPolygonPolygon(polygon1, polygon2, response);
		} else if (object1.shape === ploxfight.shape.SQUARE && object2.shape === ploxfight.shape.CIRCLE) {
			var polygon1 = squareToPolygon(object1);
			var circle2 = circleToCircle(object2);
			collision = testPolygonCircle(polygon1, circle2, response);
		} else if (object1.shape === ploxfight.shape.CIRCLE && object2.shape === ploxfight.shape.SQUARE) {
			var circle1 = circleToCircle(object1);
			var polygon2 = squareToPolygon(object2);
			collision = testCirclePolygon(circle1, polygon2, response);
		} else {
			//circle to circle
			var circle1 = circleToCircle(object1);
			var circle2 = circleToCircle(object2);
			collision = testCircleCircle(circle1, circle2, response);
		}

		if (collision) {
			if (object1.type === "fist" && object2.type === "dude") {
				handlePunch(object2, object1);
			} else if (object1.type === "dude" && object2.type === "fist") {
				handlePunch(object1, object2);
			} else {
				handleCollision(object1, object2);
			}
		}
	};

	ploxfight.collisionChecks = function (object1, object2) {
		//checks:
		if (object1.shape === undefined || object2.shape === undefined) {
			throw Error("fuuuu");
		}

		if (object1.groupId !== undefined && object1.groupId === object2.groupId) {
			return false;
		} else {
			return true;
		}
	};

	var handlePunch = function (dude, fist) {
		dude.tumbleProgress = ploxfight.TUMBLE_TIME;
		dude.degree = fist.degree;
	};

	var handleCollision = function (object1, object2) {
		var object1ratio;
		var object2ratio;

		if (object1.pushability === 0) {
			if (object2.pushability === 0) {
				object1ratio = 0.5;
				object2ratio = 0.5;
			} else {
				object1ratio = 0;
				object2ratio = 1;
			}
		} else if (object2.pushability === 0) {
			object1ratio = 1;
			object2ratio = 0;
		} else {
			object1ratio = object1.pushability / (object1.pushability + object2.pushability);
			object2ratio = 1 - object1ratio;
		}

		object1.x -= response.overlapV.x * object1ratio;
		object1.y -= response.overlapV.y * object1ratio;
		object2.x += response.overlapV.x * object2ratio;
		object2.y += response.overlapV.y * object2ratio;
	};

	var squareToPolygon = function (square) {
		// I don't know why I need to double vector size here...
		var vectors = ploxfight.getSquareVectors(square, true);
		return new ploxfight.Polygon(new ploxfight.Vector(square.x, square.y), vectors);
	};

	var circleToCircle = function (circle) {
		return new ploxfight.Circle(new ploxfight.Vector(circle.x, circle.y), circle.radius);
	};

	/**
	 * Check if a polygon and a circle intersect.
	 *
	 * @param {Polygon} polygon The polygon.
	 * @param {Circle} circle The circle.
	 * @param {ploxfight.Response} response Response object (optional) that will be populated if
	 *   they interset.
	 * @return {boolean} true if they intersect, false if they don't.
	 */
	var testPolygonCircle = function (polygon, circle, response) {
		var circlePos = T_VECTORS.pop().copy(circle.pos).sub(polygon.pos);
		var radius = circle.radius;
		var radius2 = radius * radius;
		var points = polygon.points;
		var len = points.length;
		var edge = T_VECTORS.pop();
		var point = T_VECTORS.pop();

		// For each edge in the polygon
		for (var i = 0; i < len; i++) {
			var next = (i === len - 1) ? 0 : i + 1;
			var prev = (i === 0) ? len - 1 : i - 1;
			var overlap = 0;
			var overlapN = null;

			// Get the edge
			edge.copy(polygon.edges[i]);

			// Calculate the center of the cirble relative to the starting point of the edge
			point.copy(circlePos).sub(points[i]);

			// If the distance between the center of the circle and the point
			// is bigger than the radius, the polygon is definitely not fully in
			// the circle.
			if (response && point.len2() > radius2) {
				response.aInB = false;
			}

			// Calculate which Vornoi region the center of the circle is in.
			var region = vornoiRegion(edge, point);
			if (region === LEFT_VORNOI_REGION) {

				// Need to make sure we're in the RIGHT_VORNOI_REGION of the previous edge.
				edge.copy(polygon.edges[prev]);

				// Calculate the center of the circle relative the starting point of the previous edge
				var point2 = T_VECTORS.pop().copy(circlePos).sub(points[prev]);

				region = vornoiRegion(edge, point2);
				if (region === RIGHT_VORNOI_REGION) {

					// It's in the region we want.  Check if the circle intersects the point.
					var dist = point.len();
					if (dist > radius) {
						// No intersection
						T_VECTORS.push(circlePos);
						T_VECTORS.push(edge);
						T_VECTORS.push(point);
						T_VECTORS.push(point2);
						return false;
					} else if (response) {
						// It intersects, calculate the overlap
						response.bInA = false;
						overlapN = point.normalize();
						overlap = radius - dist;
					}
				}
				T_VECTORS.push(point2);
			} else if (region === RIGHT_VORNOI_REGION) {

				// Need to make sure we're in the left region on the next edge
				edge.copy(polygon.edges[next]);

				// Calculate the center of the circle relative to the starting point of the next edge
				point.copy(circlePos).sub(points[next]);

				region = vornoiRegion(edge, point);
				if (region === LEFT_VORNOI_REGION) {

					// It's in the region we want.  Check if the circle intersects the point.
					var dist = point.len();
					if (dist > radius) {
						// No intersection
						T_VECTORS.push(circlePos);
						T_VECTORS.push(edge);
						T_VECTORS.push(point);
						return false;
					} else if (response) {
						// It intersects, calculate the overlap
						response.bInA = false;
						overlapN = point.normalize();
						overlap = radius - dist;
					}
				}
				// MIDDLE_VORNOI_REGION
			} else {

				// Need to check if the circle is intersecting the edge,
				// Change the edge into its "edge normal".
				var normal = edge.perp().normalize();

				// Find the perpendicular distance between the center of the
				// circle and the edge.
				var dist = point.dot(normal);
				var distAbs = Math.abs(dist);

				// If the circle is on the outside of the edge, there is no intersection
				if (dist > 0 && distAbs > radius) {
					T_VECTORS.push(circlePos);
					T_VECTORS.push(normal);
					T_VECTORS.push(point);
					return false;
				} else if (response) {
					// It intersects, calculate the overlap.
					overlapN = normal;
					overlap = radius - dist;
					// If the center of the circle is on the outside of the edge, or part of the
					// circle is on the outside, the circle is not fully inside the polygon.
					if (dist >= 0 || overlap < 2 * radius) {
						response.bInA = false;
					}
				}
			}

			// If this is the smallest overlap we've seen, keep it.
			// (overlapN may be null if the circle was in the wrong Vornoi region)
			if (overlapN && response && Math.abs(overlap) < Math.abs(response.overlap)) {
				response.overlap = overlap;
				response.overlapN.copy(overlapN);
			}
		}

		// Calculate the final overlap vector - based on the smallest overlap.
		if (response) {
			response.a = polygon;
			response.b = circle;
			response.overlapV.copy(response.overlapN).scale(response.overlap);
		}

		T_VECTORS.push(circlePos);
		T_VECTORS.push(edge);
		T_VECTORS.push(point);
		return true;
	};


	/**
	 * Check if a circle and a polygon intersect.
	 *
	 * NOTE: This runs slightly slower than polygonCircle as it just
	 * runs polygonCircle and reverses everything at the end.
	 *
	 * @param {Circle} circle The circle.
	 * @param {Polygon} polygon The polygon.
	 * @param {ploxfight.Response} response Response object (optional) that will be populated if
	 *   they interset.
	 * @return {boolean} true if they intersect, false if they don't.
	 */
	var testCirclePolygon = function (circle, polygon, response) {
		var result = testPolygonCircle(polygon, circle, response);
		if (result && response) {
			// Swap A and B in the response.
			var a = response.a;
			var aInB = response.aInB;
			response.overlapN.reverse();
			response.overlapV.reverse();
			response.a = response.b;
			response.b = a;
			response.aInB = response.bInA;
			response.bInA = aInB;
		}
		return result;
	};

	/**
	 * Calculates which Vornoi region a point is on a line segment.
	 * It is assumed that both the line and the point are relative to (0, 0)
	 *
	 *             |       (0)      |
	 *      (-1)  [0]--------------[1]  (1)
	 *             |       (0)      |
	 *
	 * @param {Vector} line The line segment.
	 * @param {Vector} point The point.
	 * @return {number} LEFT_VORNOI_REGION (-1) if it is the left region,
	 *          MIDDLE_VORNOI_REGION (0) if it is the middle region,
	 *          RIGHT_VORNOI_REGION (1) if it is the right region.
	 */
	var vornoiRegion = function (line, point) {
		var len2 = line.len2();
		var dp = point.dot(line);

		if (dp < 0) return LEFT_VORNOI_REGION;
		if (dp > len2) return RIGHT_VORNOI_REGION;
		return MIDDLE_VORNOI_REGION;
	};


	/**
	 * @const
	 */
	var LEFT_VORNOI_REGION = -1;

	/**
	 * @const
	 */
	var MIDDLE_VORNOI_REGION = 0;

	/**
	 * @const
	 */
	var RIGHT_VORNOI_REGION = 1;

	/**
	 * Check if two circles intersect.
	 *
	 * @param {Circle} a The first circle.
	 * @param {Circle} b The second circle.
	 * @param {ploxfight.Response=} response Response object (optional) that will be populated if
	 *   the circles intersect.
	 * @return {boolean} true if the circles intersect, false if they don't.
	 */
	var testCircleCircle = function (a, b, response) {
		var differenceV = T_VECTORS.pop().copy(b.pos).sub(a.pos);
		var totalRadius = a.radius + b.radius;
		var totalRadiusSq = totalRadius * totalRadius;
		var distanceSq = differenceV.len2();

		if (distanceSq > totalRadiusSq) {
			// They do not intersect
			T_VECTORS.push(differenceV);
			return false;
		}

		// They intersect. If we're calculating a response, calculate the overlap.
		if (response) {
			var dist = Math.sqrt(distanceSq);
			response.a = a;
			response.b = b;
			response.overlap = totalRadius - dist;
			response.overlapN.copy(differenceV.normalize());
			response.overlapV.copy(differenceV).scale(response.overlap);
			response.aInB = a.radius <= b.radius && dist <= b.radius - a.radius;
			response.bInA = b.radius <= a.radius && dist <= a.radius - b.radius;
		}

		T_VECTORS.push(differenceV);
		return true;
	};

	/**
	 * Checks whether two convex, clockwise polygons intersect.
	 *
	 * @param {Polygon} a The first polygon.
	 * @param {Polygon} b The second polygon.
	 * @param {ploxfight.Response} response Response object (optional) that will be populated if
	 *   they interset.
	 * @return {boolean} true if they intersect, false if they don't.
	 */
	var testPolygonPolygon = function (a, b, response) {
		var aPoints = a.points;
		var aLen = aPoints.length;
		var bPoints = b.points;
		var bLen = bPoints.length;

		// If any of the edge normals of A is a separating axis, no intersection.
		while (aLen--) {
			if (isSeparatingAxis(a.pos, b.pos, aPoints, bPoints, a.normals[aLen], response)) return false;
		}

		// If any of the edge normals of B is a separating axis, no intersection.
		while (bLen--) {
			if (isSeparatingAxis(a.pos, b.pos, aPoints, bPoints, b.normals[bLen], response)) return false;
		}

		// Since none of the edge normals of A or B are a separating axis, there is an intersection
		// and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
		// final overlap vector.
		if (response) {
			response.a = a;
			response.b = b;
			response.overlapV.copy(response.overlapN).scale(response.overlap);
		}
		return true;
	};

	var isSeparatingAxis = function (aPos, bPos, aPoints, bPoints, axis, response) {
		var rangeA = T_ARRAYS.pop();
		var rangeB = T_ARRAYS.pop();

		// Get the magnitude of the offset between the two polygons
		var offsetV = T_VECTORS.pop().copy(bPos).sub(aPos);
		var projectedOffset = offsetV.dot(axis);

		// Project the polygons onto the axis.
		flattenPointsOn(aPoints, axis, rangeA);
		flattenPointsOn(bPoints, axis, rangeB);

		// Move B's range to its position relative to A.
		rangeB[0] += projectedOffset;
		rangeB[1] += projectedOffset;

		// Check if there is a gap. If there is, this is a separating axis and we can stop
		if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
			T_VECTORS.push(offsetV);
			T_ARRAYS.push(rangeA);
			T_ARRAYS.push(rangeB);
			return true;
		}

		// If we're calculating a response, calculate the overlap.
		if (response) {
			var overlap = 0;
			// A starts further left than B
			if (rangeA[0] < rangeB[0]) {
				response.aInB = false;
				// A ends before B does. We have to pull A out of B
				if (rangeA[1] < rangeB[1]) {
					overlap = rangeA[1] - rangeB[0];
					response.bInA = false;
					// B is fully inside A.  Pick the shortest way out.
				} else {
					var option1 = rangeA[1] - rangeB[0];
					var option2 = rangeB[1] - rangeA[0];
					overlap = option1 < option2 ? option1 : -option2;
				}
				// B starts further left than A
			} else {
				response.bInA = false;
				// B ends before A ends. We have to push A out of B
				if (rangeA[1] > rangeB[1]) {
					overlap = rangeA[0] - rangeB[1];
					response.aInB = false;
					// A is fully inside B.  Pick the shortest way out.
				} else {
					var option1 = rangeA[1] - rangeB[0];
					var option2 = rangeB[1] - rangeA[0];
					overlap = option1 < option2 ? option1 : -option2;
				}
			}

			// If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
			var absOverlap = Math.abs(overlap);
			if (absOverlap < response.overlap) {
				response.overlap = absOverlap;
				response.overlapN.copy(axis);
				if (overlap < 0) {
					response.overlapN.reverse();
				}
			}
		}

		T_VECTORS.push(offsetV);
		T_ARRAYS.push(rangeA);
		T_ARRAYS.push(rangeB);
		return false;
	};

	var flattenPointsOn = function (points, normal, result) {
		var min = Number.MAX_VALUE;
		var max = -Number.MAX_VALUE;
		var i = points.length;
		while (i--) {
			// Get the magnitude of the projection of the point onto the normal
			var temp = points[i];
			var dot = temp.dot(normal);
			if (dot < min) min = dot;
			if (dot > max) max = dot;
		}
		result[0] = min;
		result[1] = max;
	};

	/**
	 * Pool of Vectors used in calculations.
	 *
	 * @type {Array}
	 */
	var T_VECTORS = [];
	for (var i = 0; i < 10; i++) {
		T_VECTORS.push(new ploxfight.Vector());
	}

	/**
	 * Pool of Arrays used in calculations.
	 *
	 * @type {Array}
	 */
	var T_ARRAYS = [];
	for (var i = 0; i < 5; i++) {
		T_ARRAYS.push([]);
	}

	ploxfight.getSquareVectors = function (object, doubleSize) {
		// Possible optimization: Merge getSquareCorners and getSquareVectors
		var squareCorners = ploxfight.getSquareCorners(object);
		var result = [];
		for (var y = 0; y < squareCorners.length; y++) {
			var corner = squareCorners[y];
			if (doubleSize) {
				result.push(new ploxfight.Vector(corner.x - object.x, corner.y - object.y));
			} else {
				result.push(new ploxfight.Vector(corner.x, corner.y));
			}
		}
		return result;
	};

	ploxfight.getSquareCorners = function (object) {
		var degree = -object.degree;	// WARNING: I use minus here and I'm not sure why it is needed...

		var TLx_pre = -object.shapeWidth / 2;
		var TLy_pre = -object.shapeHeight / 2;
		var TLx = object.x + ploxfight.rotateX(TLx_pre, TLy_pre, degree);
		var TLy = object.y + ploxfight.rotateY(TLx_pre, TLy_pre, degree);

		var TRx_pre = object.shapeWidth / 2;
		var TRy_pre = -object.shapeHeight / 2;
		var TRx = object.x + ploxfight.rotateX(TRx_pre, TRy_pre, degree);
		var TRy = object.y + ploxfight.rotateY(TRx_pre, TRy_pre, degree);

		var BLx_pre = -object.shapeWidth / 2;
		var BLy_pre = object.shapeHeight / 2;
		var BLx = object.x + ploxfight.rotateX(BLx_pre, BLy_pre, degree);
		var BLy = object.y + ploxfight.rotateY(BLx_pre, BLy_pre, degree);

		var BRx_pre = object.shapeWidth / 2;
		var BRy_pre = object.shapeHeight / 2;
		var BRx = object.x + ploxfight.rotateX(BRx_pre, BRy_pre, degree);
		var BRy = object.y + ploxfight.rotateY(BRx_pre, BRy_pre, degree);

		return [
			{
				x: TLx,
				y: TLy
			},
			{
				x: TRx,
				y: TRy
			},
			{
				x: BRx,
				y: BRy
			},
			{
				x: BLx,
				y: BLy
			}
		];

	};

	ploxfight.getSquareLines = function (square) {
		var squareCorners = ploxfight.getSquareCorners(square);

		var result = [];
		for (var y = 0; y < squareCorners.length; y++) {
			var first;
			if (y === 0) {
				first = squareCorners[squareCorners.length - 1];
			} else {
				first = squareCorners[y - 1];
			}
			var second = squareCorners[y];
			result.push(new ploxfight.Line(first, second));
		}
		return result;
	};

	ploxfight.rotateX = function (x, y, degree) {
		return x * Math.cos(degree) - y * Math.sin(degree);
	};

	ploxfight.rotateY = function (x, y, degree) {
		return x * Math.sin(degree) + y * Math.cos(degree);
	};

})();