(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  }

  var View = HHH.View = function ($el) {
    this.$el = $el;

    this.board = new HHH.Board(25, 1);
    this.setupGrid(this.board.temp);
    // this.step
  };

  View.prototype.setupGrid = function (temp) {
    var html = "";

    for (var i = 0; i < this.board.dim; i++) {
      html += '<ul class="group">';

      for (var j = 0; j < this.board.dim; j++) {
        html += '<li></li>';
      }
    }

    html += '</ul>';

    this.$el.html(html);
    this.$li = this.$el.find("li");

    if (temp === 1) {
      var outerWallNWPos = [
        1,    // always top left corner
        144,  // 6th row * dim(=25) - 6 spaces from the right
        319,  // 13 * dim - 6
        376   // 16 * dim + 1 spaces from the left
      ]
      var outerWallNEPos = [
        25,   // dim -> always top right corner
        131,  // 5 * dim + 6
        306,  // 12 * dim + 6
        400   // 16 * dim
      ]
      var outerWallSWPos = [
        126,  // 5 * dim + 1
        269,  // 11 * dim - 6
        394,  // 16 * dim - 6
        601   // (dim - 1) * dim + 1 -> always bottom left corner
      ]
      var outerWallSEPos = [
        150,  // 6 * dim
        256,  // 10 * dim + 6
        381,  // 15 * dim + 6
        625   // dim * dim -> always bottom right corner
      ]
    };

    that = this;
    outerWallNWPos.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-NW"></div>');
    })

    outerWallNEPos.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-NE"></div>');
    })

    outerWallSWPos.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-SW"></div>');
    })

    outerWallSEPos.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-SE"></div>');
    })
  };



})();
