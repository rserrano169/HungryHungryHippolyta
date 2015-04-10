(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  }

//* --- BOARD --- *//

  var Board = HHH.Board = function (dimension, templateNum) {
    this.dim = dimension;
    this.temp = templateNum;
    this.hippolyta = new HHH.Hippolyta(this);
  };

//* --- COORDINATE --- *//

  var Coord = HHH.Coord = function (i, j) {
    this.i = i;
    this.j = j;
  };

  Coord.prototype.plus = function (coord2, dim) {
    return new Coord(
      (this.i + coord2.i + dim) % dim,
      (this.j + coord2.j + dim) % dim
    );
  };

  Coord.prototype.horizontalOpposite = function (dim) {
    return new Coord(this.i, dim - 1 - this.j);
  };

//* --- HIPPOLYTA --- *//

  var Hippolyta = HHH.Hippolyta = function (board) {
    this.board = board;
    if (this.board.temp === 1) {
      this.pos = new Coord(18, 12);
    };
    this.dir = "STAY";
  };

  Hippolyta.DIRECTIONS = {
    "UP": new Coord(-1, 0),
    "RIGHT": new Coord(0, 1),
    "DOWN": new Coord(1, 0),
    "LEFT": new Coord(0, -1),
    "STAY": new Coord(0, 0)
  };

  Hippolyta.prototype.move = function () {
    this.pos = this.pos.plus(Hippolyta.DIRECTIONS[this.dir], this.board.dim);
  }

  Hippolyta.prototype.nextPos = function (dir) {
    if (typeof dir === 'undefined') {
      dir = this.dir;
    };

    if (
      this.board.temp === 1 &&
      this.pos.i === 11 &&
      (this.pos.j === 0 || this.pos.j === 24)
      ) {
        return(
          this
          .pos
          .horizontalOpposite(this.board.dim)
          .plus(Hippolyta.DIRECTIONS[dir], this.board.dim)
        );
    } else {
      return this.pos.plus(Hippolyta.DIRECTIONS[dir], this.board.dim);
    };
  };

  Hippolyta.prototype.jQueryPos = function () {
    return this.pos.i * this.board.dim + this.pos.j;
  };

  Hippolyta.prototype.nextjQueryPos = function (dir) {
    if (typeof dir === 'undefined') {
      dir = this.dir;
    };

    return this.nextPos(dir).i * this.board.dim + this.nextPos(dir).j
  };
})();
