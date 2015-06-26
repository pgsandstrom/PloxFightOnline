(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};

	ploxfight.getFist = function (dude) {
		var xForce = Math.sin(dude.degree);
		var yForce = Math.cos(dude.degree);

		var fist = {
			type: "fist",
			groupId: dude.id,
			degree: dude.degree,
			x: dude.x,
			y: dude.y,
			shape: ploxfight.shape.SQUARE,
			shapeWidth: 10,
			shapeHeight: dude.shapeHeight,
			pushability: 0,
			fistProgress: ploxfight.FIST_TIME
		};

		// move to front of character:
		ploxfight.performMove(fist, xForce, yForce, dude.shapeHeight);

		// shift slightly to the right::
		var rightDegree = dude.degree - Math.PI / 2;
		var xForceRight = Math.sin(rightDegree);
		var yForceRight = Math.cos(rightDegree);
		ploxfight.performMove(fist, xForceRight, yForceRight, 10);

		return fist;
	};

	ploxfight.getBullet = function (dude) {
		var bullet = new Bullet(dude);
		return bullet;
	};

	var bulletIdGenerator = 0;

	var Bullet = function Bullet(dude) {
		this.type = "bullet";
		this.id = bulletIdGenerator++;
		this.groupId = dude.id;
		this.degree = dude.degree;
		this.start = ploxfight.getPoint(dude.x, dude.y);
		this.shape = ploxfight.shape.LINE;
		this.speed = 30;
		this.active = true;
		this.age = 0;

		this.fixInitPosition(dude);
	};

	Bullet.prototype.fixInitPosition = function (dude) {
		var xForce = Math.sin(dude.degree);
		var yForce = Math.cos(dude.degree);

		// move to front of character:
		ploxfight.performMove(this.start, xForce, yForce, dude.shapeHeight / 2);

		// shift slightly to the right:
		var rightDegree = dude.degree - Math.PI / 2;
		var xForceRight = Math.sin(rightDegree);
		var yForceRight = Math.cos(rightDegree);
		ploxfight.performMove(this.start, xForceRight, yForceRight, 10);

		var xForce = Math.sin(this.degree);
		var yForce = Math.cos(this.degree);

		this.end = ploxfight.getNewPosition(this.start.x, this.start.y, xForce, yForce, this.speed);
	};

	/**
	 * @returns {boolean} if the bullet is old enough to be deleted
	 */
	Bullet.prototype.update = function () {
		var xForce = Math.sin(this.degree);
		var yForce = Math.cos(this.degree);

		ploxfight.performMove(this.start, xForce, yForce, this.speed);
		this.end = ploxfight.getNewPosition(this.start.x, this.start.y, xForce, yForce, this.speed);

		this.age++;
		return this.age >= ploxfight.BULLET_LIFETIME;
	}

})();
