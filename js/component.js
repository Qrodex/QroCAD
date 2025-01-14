/**
 * WebCAD5 - A Javascript/HTML5 CAD software
 * 
 * Copyright (C) 2012, Giuseppe Leone <joebew42@gmail.com>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

// Enumerate all available types of component
var COMPONENT_TYPES = {
	POINT: 1,
	LINE: 2,
	CIRCLE: 3,
	RECTANGLE: 4,
	ARC: 5,
	MEASURE: 6,
	LABEL: 7,
	SHAPE: 8, // TODO
	PICTURE: 9
};

/**
 * Abstract class Component used to derive
 * all other concrete item classes
 */
function Component() {
	this.active = true;
	this.type = 0;
	this.color = "#ffffff";
	this.radius = 1;
}

Component.prototype.setActive = function (active) {
	this.active = active;
};

Component.prototype.isActive = function () {
	return this.active;
};

/**
 * Picture component class
 * Inherits from Component
 * @param x
 * @param y
 * @param basedURL
 * @param color
 * @param radius
 */
function Picture(x, y, basedURL, color, radius) {
	Component.call(this)

	this.color = color || "#ffffff";
	this.radius = radius || 1;
	this.type = COMPONENT_TYPES.PICTURE;
	this.x = 0;
	this.y = 0;
	this.pictureSource = ''
	if (x != undefined && y != undefined && basedURL != undefined) {
		this.x = x;
		this.y = y;
		this.pictureSource = basedURL
	}
}
Picture.prototype = new Component();
Picture.prototype.constructor = Picture;

/**
 * Point component class
 * Inherits from Component
 * @param x
 * @param y
 * @param color
 * @param radius
 */
function Point(x, y, color, radius) {
	Component.call(this);

	this.radius = 5;
	this.type = COMPONENT_TYPES.POINT;
	this.x = 0;
	this.y = 0;
	this.color = color || "#ffffff";
	this.radius = radius || 1;

	if (x != undefined && y != undefined) {
		this.x = x;
		this.y = y;
	}
}
Point.prototype = new Component();
Point.prototype.constructor = Point;

/**
 * Line component class
 * Inherits from Component
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param color
 * @param radius
 */
function Line(x1, y1, x2, y2, color, radius) {
	Component.call(this);

	this.type = COMPONENT_TYPES.LINE;
	this.x1 = 0;
	this.y1 = 0;
	this.x2 = 0;
	this.y2 = 0;
	this.color = color || "#ffffff";
	this.radius = radius || 1;

	if (x1 != undefined
		&& y1 != undefined
		&& x2 != undefined
		&& y2 != undefined) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
}
Line.prototype = new Component();
Line.prototype.constructor = Line;

/**
 * Circle component class
 * Inherits from Line
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param color
 * @param radius
 */
function Circle(x1, y1, x2, y2, color, radius) {
	Line.call(this, x1, y1, x2, y2);

	this.color = color || "#ffffff";
	this.radius = radius || 1;
	this.type = COMPONENT_TYPES.CIRCLE;
}
Circle.prototype = new Line();
Circle.prototype.constructor = Circle;

/**
 * Rectangle component class
 * Inherits from Line
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param color
 * @param radius
 */
function Rectangle(x1, y1, x2, y2, color, radius) {
	Line.call(this, x1, y1, x2, y2);

	this.color = color || "#ffffff";
	this.radius = radius || 1;
	this.type = COMPONENT_TYPES.RECTANGLE;
}
Rectangle.prototype = new Line();
Rectangle.prototype.constructor = Rectangle;

/**
 * Measure component class
 * Inherits from Line
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param color
 * @param radius
 */
function Measure(x1, y1, x2, y2, color, radius) {
	Line.call(this, x1, y1, x2, y2);

	this.color = color || "#ffff33";
	this.radius = radius || 1;
	this.type = COMPONENT_TYPES.MEASURE;
}
Measure.prototype = new Line();
Measure.prototype.constructor = Measure;

/**
 * Measure component class
 * Inherits from Point
 * @param x
 * @param y
 * @param text
 * @param color
 * @param radius
 */
function Label(x, y, text, color, radius) {
	Point.call(this, x, y);

	this.color = color || "#eeeeee";
	this.radius = radius || 1;
	this.type = COMPONENT_TYPES.LABEL;
	this.text = text;
}
Label.prototype = new Point();
Label.prototype.constructor = Label;

/**
* Circle component class
* Inherits from Component
* @param x1
* @param y1
* @param x2
* @param y2
* @param x3
* @param y3
* @param color
* @param radius
*/
function Arc(x1, y1, x2, y2, x3, y3, color, radius) {
	Component.call(this);

	this.type = COMPONENT_TYPES.ARC;
	this.x1 = 0;
	this.y1 = 0;
	this.x2 = 0;
	this.y2 = 0;
	this.x3 = 0;
	this.y3 = 0;
	this.color = color || "#eeeeee";
	this.radius = radius || 2;

	if (x1 != undefined
		&& y1 != undefined
		&& x2 != undefined
		&& y2 != undefined
		&& x3 != undefined
		&& y3 != undefined) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.x3 = x3;
		this.y3 = y3;
	}
}
Arc.prototype = new Component();
Arc.prototype.constructor = Arc;

/**
 * Shape component class
 * Inherits from Component
 * @param x
 * @param y
 * @param color
 * @param radius
 */
function Shape(x, y, color, radius) {
	Component.call(this);

	this.type = COMPONENT_TYPES.SHAPE;
	this.x = 0;
	this.y = 0;
	this.color = color || "#eeeeee";
	this.radius = radius || 2;
	this.components = new Array();

	if (x != undefined && y != undefined) {
		this.x = x;
		this.y = y;
	}
}
Shape.prototype = new Component();
Shape.prototype.constructor = Shape;

/**
 * Add a component to a shape
 * @param component
 */
Shape.prototype.addComponent = function (component) {
	this.components.push(component);
};