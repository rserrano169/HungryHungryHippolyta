(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  }

  var View = HHH.View = function ($el) {
    this.$el = $el;

    this.board = new HHH.Board(25, 1);
    this.setupGrid(this.board.temp);
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
      var outerWallNWPositions = [
        1,    // always top left corner
        144,  // 6th row * dim(=25) - 6 spaces from the right
        319,  // 13 * dim - 6
        376   // 16 * dim + 1 spaces from the left
      ];
      var outerWallNEPositions = [
        25,   // dim -> always top right corner
        131,  // 5 * dim + 6
        306,  // 12 * dim + 6
        400   // 16 * dim
      ];
      var outerWallSWPositions = [
        126,  // 5 * dim + 1
        269,  // 11 * dim - 6
        394,  // 16 * dim - 6
        601   // (dim - 1) * dim + 1 -> always bottom left corner
      ];
      var outerWallSEPositions = [
        150,  // 6 * dim
        256,  // 10 * dim + 6
        381,  // 15 * dim + 6
        625   // dim * dim -> always bottom right corner
      ];
      var outerWallVerticalRanges = [
        [2, 24],      // 1
        [127, 130],   // 2
        [145, 149],   // 3
        [251, 255],   // 4
        [270, 275],   // 5
        [301, 305],   // 6
        [320, 325],   // 7
        [377, 380],   // 8
        [395, 399],   // 9
        [602, 624]    // 10
      ];
      var outerWallHorizontalPositions = [
        26, 51, 76, 101,                        // continuous wall 1
        50, 75, 100, 125,                       // continuous wall 2
        156, 181, 206, 231,                     // continuous wall 3
        169, 194, 219, 244,                     // continuous wall 4
        331, 356,                               // continuous wall 5
        344, 369,                               // continuous wall 6
        401, 426, 451, 476, 501, 526, 551, 576, // continuous wall 7
        425, 450, 475, 500, 525, 550, 575, 600  // continuous wall 8
      ];
    };

    that = this;
    outerWallNWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-NW"></div>');
    })

    outerWallNEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-NE"></div>');
    })

    outerWallSWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-SW"></div>');
    })

    outerWallSEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-SE"></div>');
    })

    outerWallVerticalRanges.forEach( function (range) {
      for (var i = range[0]; i <= range[1]; i++) {
        that.$li.eq(i - 1).html('<div class="outer-vertical-wall"></div>');
      }
    })

    outerWallHorizontalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-horizontal-wall"></div>');
    })


    var innerBlockNWPositions = [

    ];
    var innerBlockNEPositions = [

    ];
    var innerBlockSWPositions = [

    ];
    var innerBlockSEPositions = [

    ];
    var innerBlockVerticalPositions = [

    ];
    var innerBlockHorizontalPositions = [

    ];


    var innerWallTopPositions = [

    ];
    var innerWallBottomPositions = [

    ];
    var innerWallLeftPositions = [

    ];
    var innerWallRightPositions = [

    ];
    var innerWallVerticalPositions = [

    ];
    var innerWallHorizontalPositions = [

    ];
  };



})();
