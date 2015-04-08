(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  };

  var View = HHH.View = function ($el) {
    this.$el = $el;

    this.board = new HHH.Board(20);
    this.setupGrid();
    // this.step
  };

  View.prototype.setupGrid = function () {
    var html = "";

    for (var i = 0; i < this.board.dim; i++) {
      html += '<ul class="group">';

      for (var j = 0; j < this.board.dim; j++) {
        html += '<li></li>';
      }
    }

    html += '</ul>';

    this.$el.html(html);
  };

});
