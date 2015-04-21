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

  Coord.prototype.equals = function (coord2) {
    return (this.i == coord2.i && this.j == coord2.j);
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

  Coord.prototype.$liPos = function (boardTempNum) {
    if (boardTempNum === 1) {
      return this.i * 25 + this.j;
    };
  };

  Coord.prototype.isNorthOf = function (windowCoord1) {
    for (var j = 1; windowCoord1.j - j >= 0; j++) {
      var xCoordNeg = windowCoord1.i - j,
          xCoordPos = windowCoord1.i + j,
          yCoord = windowCoord1.j - j;

      if (this.j == yCoord && (this.i <= xCoordPos && this.i >= xCoordNeg)) {
        return true;
      };
    }

    return false;
  };

  Coord.prototype.isEastOf = function (windowCoord1) {
    var windowDim = $(window).height() >= $(window).width() ?
      $(window).height() :
      $(window).width()
    ;

    for (var i = 1; windowCoord1.i + i <= windowDim; i++) {
      var yCoordNeg = windowCoord1.j - i,
          yCoordPos = windowCoord1.j + i,
          xCoord = windowCoord1.i + i;

      if (this.i == xCoord && (this.j <= yCoordPos && this.j >= yCoordNeg)) {
        return true;
      };
    }

    return false;
  };

  Coord.prototype.isSouthOf = function (windowCoord1) {
    var windowDim = $(window).height() >= $(window).width() ?
      $(window).height() :
      $(window).width()
    ;

    for (var j = 1; windowCoord1.j + j <= windowDim; j++) {
      var xCoordNeg = windowCoord1.i - j,
          xCoordPos = windowCoord1.i + j,
          yCoord = windowCoord1.j + j;

      if (this.j == yCoord && (this.i <= xCoordPos && this.i >= xCoordNeg)) {
        return true;
      };
    }

    return false;
  };

  Coord.prototype.isWestOf = function (windowCoord1) {
    for (var i = 1; windowCoord1.i - i >= 0; i++) {
      var yCoordNeg = windowCoord1.j - i,
          yCoordPos = windowCoord1.j + i,
          xCoord = windowCoord1.i - i;

      if (this.i == xCoord && (this.j <= yCoordPos && this.j >= yCoordNeg)) {
        return true;
      };
    }

    return false;
  };

//* --- HIPPOLYTA --- *//

  var Hippolyta = HHH.Hippolyta = function (board) {
    this.board = board;
    if (this.board.temp === 1) {
      this.coord = new Coord(18, 12);
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
    this.coord = this.coord.plus(Hippolyta.DIRECTIONS[this.dir], this.board.dim);
  }

  Hippolyta.prototype.nextCoord = function (dir) {
    if (typeof dir === 'undefined') {
      dir = this.dir;
    };

    if (
      this.board.temp === 1 &&
      this.coord.i === 11 &&
      (this.coord.j === 0 || this.coord.j === 24)
      ) {
        return(
          this
          .coord
          .horizontalOpposite(this.board.dim)
          .plus(Hippolyta.DIRECTIONS[dir], this.board.dim)
        );
    } else {
        return this.coord.plus(Hippolyta.DIRECTIONS[dir], this.board.dim);
    };
  };

  Hippolyta.prototype.$liPos = function () {
    return this.coord.$liPos(this.board.temp);
  };

  Hippolyta.prototype.next$liPos = function (dir) {
    if (typeof dir === 'undefined') {
      dir = this.dir;
    };

    return this.nextCoord(dir).i * this.board.dim + this.nextCoord(dir).j
  };
})();
