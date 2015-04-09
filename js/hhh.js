(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  }

//* --- COORDINATE --- *//

  var Coord = HHH.Coord = function (i, j) {
    this.i = i;
    this.j = j;
  };

  Coord.prototype.equals = function (coord2) {
    return (this.i == coord2.i) && (this.j == coord2.j);
  };

  Coord.prototype.plus = function (coord2) {
    return new Coord(this.i + coord2.i, this.j + coord2.j);
  };

//* --- BOARD --- *//

  var Board = HHH.Board = function (dimension, templateNum, lives) {
    this.dim = dimension;
    this.temp = templateNum;
    this.hippolyta = new HHH.Hippolyta(this, lives);
  };

//* --- HIPPOLYTA --- *//

  var Hippolyta = HHH.Hippolyta = function (board, lives) {
    this.board = board;
    if (this.board.temp === 1) {
      this.pos = new Coord(18, 12);
    };
    this.isMoving = false;
    this.dir = "STAY";
    this.lives = lives;
  };

  Hippolyta.DIRECTIONS = {
    "UP": new Coord(-1, 0),
    "RIGHT": new Coord(0, 1),
    "DOWN": new Coord(1, 0),
    "LEFT": new Coord(0, -1),
    "STAY": new Coord(0, 0)
  };

  Hippolyta.prototype.move = function (dir) {
    this.pos = this.pos.plus(Hippolyta.DIRECTIONS[dir]);
    return this.pos
  }

  Hippolyta.prototype.nextPos = function () {
    return this.pos.plus(Hippolyta.DIRECTIONS[this.dir]);
  };

  Hippolyta.prototype.jQueryPos = function () {
    return this.pos.i * this.board.dim + this.pos.j;
  };

  Hippolyta.prototype.nextjQueryPos = function () {
    return this.nextPos().i * this.board.dim + this.nextPos().j
  };
})();
