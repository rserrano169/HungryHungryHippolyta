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
    var that = this,
        html = "";

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
        that.$li.eq(i - 1).html('<div class="outer-wall-vertical"></div>');
      }
    })

    outerWallHorizontalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-horizontal"></div>');
    })




    var innerBlockNWPositions = [
      53, 58, 66, 70, 235, 239
    ];
    var innerBlockNEPositions = [
      56, 60, 68, 73, 237, 241
    ];
    var innerBlockSWPositions = [
      78, 83, 91, 95, 335, 339
    ];
    var innerBlockSEPositions = [
      81, 85, 93, 98, 337, 341
    ];
    var innerBlockVerticalPositions = [
      54, 55, 59, 67, 71, 72,
      79, 80, 84, 92, 96, 97,
      236, 240,
      336, 340
    ];
    var innerBlockHorizontalPositions = [
      260, 285, 310,
      262, 287, 312,
      264, 289, 314,
      266, 291, 316
    ];

    innerBlockNWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-NW"></div>');
    })

    innerBlockNEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-NE"></div>');
    })

    innerBlockSWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-SW"></div>');
    })

    innerBlockSEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-SE"></div>');
    })

    innerBlockVerticalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-vertical"></div>');
    })

    innerBlockHorizontalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-horizontal"></div>');
    })



    var innerWallTopPositions = [
      133, 143, 308, 318, 483, 493
    ];
    var innerWallBottomPositions = [
      188, 258, 268, 383, 393, 438, 506, 520, 563
    ];
    var innerWallLeftPositions = [
      135, 190, 385, 428, 433, 440, 485, 540, 553
    ];
    var innerWallRightPositions = [
      141, 186, 391, 436, 443, 448, 491, 536, 573
    ];
    var innerWallVerticalPositions = [
      158,
      163,                  // wall 1
      168,                  // wall 2
      208, 233,             // wall 3
      218, 243,             // wall 4
      333, 358,             // wall 5
      343, 368,             // wall 6
      413,                  // wall 7
      456, 481,             // wall 8
      470, 495,             // wall 9
      508,                  // wall 10
      513, 538,             // wall 11
      518                   // wall 12
    ];
    var innerWallHorizontalPositions = [
      136, 137,             // wall 1
      139, 140,             // wall 2
      184, 185,             // wall 3
      191, 192,             // wall 4
      386, 387,             // wall 5
      389, 390,             // wall 6
      429, 430,             // wall 7
      434, 435,             // wall 8
      441, 442,             // wall 9
      446, 447,             // wall 10
      486, 487,             // wall 11
      489, 490,             // wall 12
      534, 535,             // wall 13
      541, 542,             // wall 14
      554, 555, 556, 557,   // wall 15
      569, 570, 571, 572    // wall 16
    ];
    var innerWallTeeUpPositions = [

    ];
    var innerWallTeeDownPositions = [
      138, 388, 488
    ];
    var innerWallTeeLeftPositions = [
      193, 543
    ];
    var innerWallTeeRightPositions = [
      183, 533
    ];
    var innerWallNWPositions = [
      445
    ];
    var innerWallNEPositions = [
      431
    ];
    var innerWallSWPositions = [
      568
    ];
    var innerWallSEPositions = [
      558
    ];

    innerWallTopPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-top"></div>');
    })

    innerWallBottomPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-bottom"></div>');
    })

    innerWallLeftPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-left"></div>');
    })

    innerWallRightPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-right"></div>');
    })

    innerWallVerticalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-vertical"></div>');
    })

    innerWallHorizontalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-horizontal"></div>');
    })

    innerWallTeeUpPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-tee-up"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-tee-up-overlay"></div>');
    })

    innerWallTeeDownPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-tee-down"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-tee-down-overlay"></div>');
    })

    innerWallTeeLeftPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-tee-left"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-tee-left-overlay"></div>');
    })

    innerWallTeeRightPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-tee-right"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-tee-right-overlay"></div>');
    })

    innerWallNWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-NW"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-NW-overlay"></div>');
    })

    innerWallNEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-NE"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-NE-overlay"></div>');
    })

    innerWallSWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-SW"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-SW-overlay"></div>');
    })

    innerWallSEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-SE"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-SE-overlay"></div>');
    })
  };



})();
