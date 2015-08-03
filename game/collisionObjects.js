"use strict";
var Vector = function (x, y, degree) {
	if (degree === undefined) {
		this.x = x || 0;
		this.y = y || x || 0;
		//this.degree = 0;
	} else {
		this.x = ploxfight.rotateX(x, y, degree);
		this.y = ploxfight.rotateY(x, y, degree);
		//this.degree = degree;
	}

};
ploxfight.Vector = Vector;


/**
 * Copy the values of another Vector into this one.
 *
 * @param {Vector} other The other Vector.
 * @return {Vector} This for chaining.
 */
Vector.prototype.copy = function (other) {
	this.x = other.x;
	this.y = other.y;
	return this;
};


/**
 * Rotate this vector by 90 degrees
 *
 * @return {Vector} This for chaining.
 */
Vector.prototype.perp = function () {
	var x = this.x;
	this.x = this.y;
	this.y = -x;
	return this;
};


/**
 * Reverse this vector.
 *
 * @return {Vector} This for chaining.
 */
Vector.prototype.reverse = function () {
	this.x = -this.x;
	this.y = -this.y;
	return this;
};


/**
 * Normalize (make unit length) this vector.
 *
 * @return {Vector} This for chaining.
 */
Vector.prototype.normalize = function () {
	var len = this.len();
	if (len > 0) {
		this.x = this.x / len;
		this.y = this.y / len;
	}
	return this;
};

/**
 * Add another vector to this one.
 *
 * @param {Vector} other The other Vector.
 * @return {Vector} This for chaining.
 */
Vector.prototype.add = function (other) {
	this.x += other.x;
	this.y += other.y;
	return this;
};


/**
 * Subtract another vector from this one.
 *
 * @param {Vector} other The other Vector.
 * @return {Vector} This for chaiing.
 */
Vector.prototype.sub = function (other) {
	this.x -= other.x;
	this.y -= other.y;
	return this;
};


/**
 * Scale this vector.
 *
 * @param {Number} x The scaling factor in the x direction.
 * @param {Number} y The scaling factor in the y direction. If this
 *   is not specified, the x scaling factor will be used.
 * @return {Vector} This for chaining.
 */
Vector.prototype.scale = function (x, y) {
	this.x *= x;
	this.y *= y || x;
	return this;
};


/**
 * Project this vector on to another vector.
 *
 * @param {Vector} other The vector to project onto.
 * @return {Vector} This for chaining.
 */
Vector.prototype.project = function (other) {
	var amt = this.dot(other) / other.len2();
	this.x = amt * other.x;
	this.y = amt * other.y;
	return this;
};


/**
 * Project this vector onto a vector of unit length.
 *
 * @param {Vector} other The unit vector to project onto.
 * @return {Vector} This for chaining.
 */
Vector.prototype.projectN = function (other) {
	var amt = this.dot(other);
	this.x = amt * other.x;
	this.y = amt * other.y;
	return this;
};


/**
 * Reflect this vector on an arbitrary axis.
 *
 * @param {Vector} axis The vector representing the axis.
 * @return {Vector} This for chaining.
 */
Vector.prototype.reflect = function (axis) {
	var x = this.x;
	var y = this.y;

	this.project(axis).scale(2);
	this.x -= x;
	this.y -= y;
	return this;
};


/**
 * Reflect this vector on an arbitrary axis (represented by a unit vector)
 *
 * @param {Vector} axis The unit vector representing the axis.
 * @return {Vector} This for chaining.
 */
Vector.prototype.reflectN = function (axis) {
	var x = this.x;
	var y = this.y;

	this.projectN(axis).scale(2);
	this.x -= x;
	this.y -= y;
	return this;
};


/**
 * Get the dot product of this vector against another.
 *
 * @param {Vector}  other The vector to dot this one against.
 * @return {number} The dot product.
 */
Vector.prototype.dot = function (other) {
	return this.x * other.x + this.y * other.y;
};


/**
 * Get the length^2 of this vector.
 *
 * @return {number} The length^2 of this vector.
 */
Vector.prototype.len2 = function () {
	return this.dot(this);
};


/**
 * Get the length of this vector.
 *
 * @return {number} The length of this vector.
 */
Vector.prototype.len = function () {
	return Math.sqrt(this.len2());
};

var Circle = function (pos, radius) {
	this.pos = pos || new Vector();
	this.radius = radius || 0;
};
ploxfight.Circle = Circle;


var Polygon = function (pos, points) {
	this.pos = pos || new Vector();
	this.points = points || [];
	this.recalc();
};
ploxfight.Polygon = Polygon;


/**
 * Recalculate the edges and normals of the polygon.  This
 * MUST be called if the points array is modified at all and
 * the edges or normals are to be accessed.
 */
Polygon.prototype.recalc = function () {
	var points = this.points;
	var len = points.length;
	this.edges = [];
	this.normals = [];
	for (var i = 0; i < len; i++) {
		var p1 = points[i];
		var p2 = i < len - 1 ? points[i + 1] : points[0];
		var e = new Vector().copy(p2).sub(p1);
		var n = new Vector().copy(e).perp().normalize();
		this.edges.push(e);
		this.normals.push(n);
	}
};

var newResponse = function() {
	return new Response();
};

var Response = function () {
	this.a = null;
	this.b = null;
	this.overlapN = new Vector(); // Unit vector in the direction of overlap
	this.overlapV = new Vector(); // Subtract this from a's position to extract it from b
	this.clear();
};

/**
 * Set some values of the response back to their defaults.  Call this between tests if
 * you are going to reuse a single Response object for multiple intersection tests (recommented)
 *
 * @return {Response} This for chaining
 */
Response.prototype.clear = function () {
	this.aInB = true; // Is a fully inside b?
	this.bInA = true; // Is b fully inside a?
	this.overlap = Number.MAX_VALUE; // Amount of overlap (magnitude of overlapV). Can be 0 (if a and b are touching)
	return this;
};

var Line = function (start, end) {
	this.start = start;
	this.end = end;
};
ploxfight.Line = Line;

ploxfight.getPoint = function (x, y) {
	return {
		x: x,
		y: y
	}
};

exports.newResponse = newResponse;