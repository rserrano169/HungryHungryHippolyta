(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  }



  var Coord = HHH.Coord = function (i, j) {
    this.i = i;
    this.j = j;
  };

  Coord.prototype.equals = function (coord2) {
    return (this.i == coord2.i) && (this.j == coord2.j);
  };



  var Board = HHH.Board = function (dimension, templateNum) {
    this.dim = dimension;
    this.temp = templateNum;
  };

})();
