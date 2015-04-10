(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  }

  var View = HHH.View = function ($el) {
    this.$el = $el;
    this.board = new HHH.Board(25, 1);
    this.setupBoard(this.board.temp);
    this.board.hippolyta.nextDir = "STAY";
    this.minutes = 5;
    this.timeLimit = this.minutes * 60 * 1000 / View.TIMER_INTERVAL;
    this.isTimerStarted = false;
    this.run = setInterval(
      this.step.bind(this),
      View.STEP_MILLISECONDS
    );

    $(window).on("keydown", this.handleKeyEvent.bind(this));
  };

  View.KEYS = {
    38: "UP",
    39: "RIGHT",
    40: "DOWN",
    37: "LEFT",
    80: "STAY"      // "P" button to pause game
  };
  View.STEP_MILLISECONDS = 200;
  View.TIMER_INTERVAL = 100

  View.prototype.handleKeyEvent = function (event) {
    if (View.KEYS[event.keyCode]) {
      event.preventDefault();

      if(this.isTimerStarted === false) {
        this.timer = setInterval(this.tick.bind(this), View.TIMER_INTERVAL);
        this.isTimerStarted = true;
      };
      
      this.board.hippolyta.nextDir = View.KEYS[event.keyCode];
    };
  };

  View.prototype.tick = function () {
    console.log(this.timeLimit -= 1);
  };

  View.prototype.isValidMove = function (dir) {
    if (typeof dir === 'undefined') {
      dir = this.board.hippolyta.dir;
    };
    return (
      this.$nextTile(dir).children().hasClass("dot") ||
      this.$nextTile(dir).children().hasClass("portal") ||
      this.$nextTile(dir).children().hasClass("") ||
      this.$nextTile(dir).children().hasClass("hippolyta")
    );
  };

  View.prototype.isPassingThroughPortal = function (templateNum) {
    if (templateNum === 1) {
      return (
        this.board.hippolyta.pos === this.board.portalLeftPosition - 1 ||
        this.board.hippolyta.pos === this.board.portalRightPosition - 1
      );
    };
  };

  View.prototype.$nextTile = function (dir) {
    if (typeof dir === 'undefined') {
      dir = this.board.hippolyta.dir;
    };
    return this.$li.eq(this.board.hippolyta.nextjQueryPos(dir));
  };

  View.prototype.$currentTile = function () {
    return this.$li.eq(this.board.hippolyta.jQueryPos());
  };

  View.prototype.step = function () {
    if (this.isValidMove(this.board.hippolyta.nextDir)) {
      this.board.hippolyta.dir = this.board.hippolyta.nextDir;
    };

    if (this.isValidMove()) {
      this.render();
    };

    if (this.$li.children().filter(".dot").length === 0) {
      alert("You Win!");
      window.location.reload();
    }
  };

  View.prototype.render = function () {
    if (this.$currentTile().children().hasClass("portal-left")) {
      this.$currentTile().html('<div class="portal portal-left"></div>');
      this.$currentTile().append('<div class="portal portal-left-overlay"></div>');
    } else if (this.$currentTile().children().hasClass("portal-right")) {
      this.$currentTile().html('<div class="portal portal-right"></div>');
      this.$currentTile().append('<div class="portal portal-right-overlay"></div>');
    } else {
      this.$currentTile().html('<div class=""></div>');
    }

    this.board.hippolyta.move();

    if (this.$currentTile().children().hasClass("portal-left")) {
      this.$currentTile().html('<div class="portal portal-left"></div>');
      this.$currentTile().append('<div class="portal portal-left-overlay"></div>');
      this.$currentTile().append('<div class="portal portal-left-pass-through"></div>');
    } else if (this.$currentTile().children().hasClass("portal-right")) {
      this.$currentTile().html('<div class="portal portal-right"></div>');
      this.$currentTile().append('<div class="portal portal-right-overlay"></div>');
      this.$currentTile().append('<div class="portal portal-right-pass-through"></div>');
    } else {
      this.$currentTile().html('<div class="hippolyta"></div>');
    };
  };

  View.prototype.setupBoard = function () {
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

    if (this.board.temp === 1) {

      //* --- OUTER WALL POSITIONS --- *//

      var outerWallNWPositions = [
        1,    // always top left corner
        14,   // just 14
        145,  // 6th row * dim(=25) - 5 spaces from the right
        320,  // 13 * dim - 5
        376,  // 16 * dim + 1 spaces from the left
        497,  // 20 * dim - 3
        501,  // 20 * dim + 1
        585,  // 23 * dim + 10
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
        591   // 23 * dim + 16
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
        616   // 24 * dim + 16
      ];
      var outerWallSEPositions = [
        89,   // 3 * dim + 14
        150,  // 6 * dim
        256,  // 10 * dim + 6
        381,  // 15 * dim + 6
        500,  // 20 * dim
        504,  // 20 * dim + 4
        610,  // 24 * dim + 10
        615,  // 24 * dim + 15
        625   // dim * dim -> always bottom right corner
      ];
      var outerWallHorizontalRanges = [
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
        [602, 609],   // 16
        [612, 614],   // 17
        [617, 624]    // 18
      ];
      var outerWallVerticalPositions = [
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

      //* --- INNER WALL POSITIONS --- *//

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
      var innerWallTeeUpPositions = [];
      var innerWallTeeDownPositions = [138, 388, 488];
      var innerWallTeeLeftPositions = [193, 543];
      var innerWallTeeRightPositions = [183, 533];
      var innerWallNWPositions = [445];
      var innerWallNEPositions = [431];
      var innerWallSWPositions = [568];
      var innerWallSEPositions = [558];

      //* --- INNER BLOCK POSITIONS --- *//

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
      var innerBlockHorizontalPositions = [
      54, 55, 59, 67, 71, 72,
      79, 80, 84, 92, 96, 97,
      236, 240,
      336, 340
      ];
      var innerBlockVerticalPositions = [
      260, 285, 310,
      262, 287, 312,
      264, 289, 314,
      266, 291, 316
      ];

      //* --- PORTAL POSITIONS --- *//

      this.board.portalLeftPosition = 276,
      this.board.portalRightPosition = 300;

      //* --- DOT POSITIONS --- *//

      var dotPositionRanges = [
      [27, 36], [40, 49],                                           // row 1
      [52, 52], [57, 57], [61, 61], [65, 65], [69, 69], [74, 74],   // row 2
      [77, 77], [82, 82], [86, 86], [90, 90], [94, 94], [99, 99],   // row 3
      [102, 124],                                                   // row 4
      [132, 132], [134, 134], [142, 142], [144, 144],               // row 5
      [157, 157], [159, 162], [164, 167], [169, 169],               // row 6
      [182, 182], [187, 187], [189, 189], [194, 194],               // row 7
      [207, 207], [209, 217], [219, 219],                           // row 8
      [232, 232], [234, 234], [238, 238], [242, 242], [244, 244],   // row 9
      [257, 257], [259, 259], [263, 263], [267, 267], [269, 269],   // row 10
      [276, 284], [288, 288], [292, 300],                           // row 11
      [307, 307], [309, 309], [313, 313], [317, 317], [319, 319],   // row 12
      [332, 332], [334, 334], [338, 338], [342, 342], [344, 344],   // row 13
      [357, 357], [359, 367], [369, 369],                           // row 14
      [382, 382], [384, 384], [392, 392], [394, 394],               // row 15
      [402, 412], [414, 424],                                       // row 16
      [427, 427], [432, 432], [437, 437], [439, 439], [444, 444], [449, 449],   // row 17
      [452, 455], [457, 462], [464, 469], [471, 474],               // row 18
      [480, 480], [482, 482], [484, 484], [492, 492], [494, 494], [496, 496],   // row 19
      [505, 505], [507, 507], [509, 512], [514, 517], [519, 519], [521, 521],   // row 20
      [527, 532], [537, 537], [539, 539], [544, 549],               // row 21
      [552, 552], [559, 562], [564, 567], [574, 574],               // row 22
      [577, 584], [587, 589], [592, 599]                            // row 23
      ];

      //* --- POWERUP POSITIONS --- *//

      var powerUpPositions = [];
    };

    //* --- OUTER WALLS RENDER --- *//

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
    outerWallHorizontalRanges.forEach( function (range) {
      for (var i = range[0]; i <= range[1]; i++) {
        that.$li.eq(i - 1).html('<div class="outer-wall-horizontal"></div>');
      }
    })
    outerWallVerticalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-vertical"></div>');
    })

    //* --- INNER WALLS RENDER --- *//

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

    //* --- INNER BLOCKS RENDER --- *//

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
    innerBlockHorizontalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-horizontal"></div>');
    })
    innerBlockVerticalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-vertical"></div>');
    })

    //* --- PORTALS RENDER --- *//

    this.$li.eq(this.board.portalLeftPosition - 1)
      .append('<div class="portal portal-left"></div>');
    this.$li.eq(this.board.portalLeftPosition - 1)
      .append('<div class="portal portal-left-overlay"></div>');

    this.$li.eq(this.board.portalRightPosition - 1)
      .append('<div class="portal portal-right"></div>');
    this.$li.eq(this.board.portalRightPosition - 1)
      .append('<div class="portal portal-right-overlay"></div>');

    //* --- DOTS RENDER --- *//

    dotPositionRanges.forEach( function (range) {
      for (var i = range[0]; i <= range[1]; i++) {
        that.$li.eq(i - 1).append('<div class="dot"></div>');
      }
    })

    this.render();
  };
})();
