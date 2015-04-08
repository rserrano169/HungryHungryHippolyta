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
        14,   // just 14
        145,  // 6th row * dim(=25) - 5 spaces from the right
        320,  // 13 * dim - 5
        376,  // 16 * dim + 1 spaces from the left
        497,  // 20 * dim - 3
        501,  // 20 * dim + 1
        584,  // 23 * dim + 9
        590   // 23 * dim + 15
      ];
      var outerWallNEPositions = [
        25,   // dim -> always top right corner
        12,   //
        131,  // 5 * dim + 6
        306,  // 12 * dim + 6
        400,  // 16 * dim
        479,  // 19 * dim + 4
        525,  // 21 * dim
        586,  // 23 * dim + 11
        592   // 23 * dim + 17
      ];
      var outerWallSWPositions = [
        87,   // 3 * dim + 12
        126,  // 5 * dim + 1
        270,  // 11 * dim - 5
        395,  // 16 * dim - 5
        476,  // 19 * dim + 1
        522,  // 21 * dim - 3
        601,  // (dim - 1) * dim + 1 -> always bottom left corner
        611,  // 24 * dim + 11
        617   // 24 * dim + 17
      ];
      var outerWallSEPositions = [
        89,   // 3 * dim + 14
        150,  // 6 * dim
        256,  // 10 * dim + 6
        381,  // 15 * dim + 6
        500,  // 20 * dim
        504,  // 20 * dim + 4
        609,  // 24 * dim + 9
        615,  // 24 * dim + 15
        625   // dim * dim -> always bottom right corner
      ];
      var outerWallVerticalRanges = [
        [2, 11],      // 1
        [15, 24],     // 2
        [88, 88],     // 3
        [127, 130],   // 4
        [146, 149],   // 5
        [251, 255],   // 6
        [271, 275],   // 7
        [301, 305],   // 8
        [321, 325],   // 9
        [377, 380],   // 10
        [396, 399],   // 11
        [477, 478],   // 12
        [498, 499],   // 13
        [502, 503],   // 14
        [523, 524],   // 15
        [585, 585],   // 16
        [591, 591],   // 17
        [602, 608],   // 18
        [612, 614],   // 19
        [618, 624]    // 20
      ];
      var outerWallHorizontalPositions = [
        26, 51, 76, 101,      // wall 1
        37, 62,               // wall 2
        39, 64,               // wall 3
        50, 75, 100, 125,     // wall 4
        156, 181, 206, 231,   // wall 5
        170, 195, 220, 245,   // wall 6
        331, 356,             // wall 7
        345, 370,             // wall 8
        401, 426, 451,        // wall 9
        526, 551, 576,        // wall 10
        425, 450, 475,        // wall 11
        550, 575, 600         // wall 12
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
