(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  };

  var Template = HHH.Template = function (tempNum) {
    this.tempNum = tempNum;
    this.noOverlayWallPositions;
    this.overlayWallPositions;
    this.rangesOfWallPositions;
    this.portalPositions;
    this.dotPositionRanges;
    this.powerupPositions;

    if (this.tempNum === 1) {
      this.noOverlayWallPositions = {
        "outer-wall-NW": [
          1,    // always top left corner
          14,   // just 14
          145,  // 6th row * dim(=25) - 5 spaces from the right
          320,  // 13 * dim - 5
          376,  // 16 * dim + 1 spaces from the left
          497,  // 20 * dim - 3
          501,  // 20 * dim + 1
          585,  // 23 * dim + 10
          590   // 23 * dim + 15
        ],
        "outer-wall-NE": [
          25,   // dim -> always top right corner
          12,   //
          131,  // 5 * dim + 6
          306,  // 12 * dim + 6
          400,  // 16 * dim
          479,  // 19 * dim + 4
          525,  // 21 * dim
          586,  // 23 * dim + 11
          591   // 23 * dim + 16
        ],
        "outer-wall-SW": [
          87,   // 3 * dim + 12
          126,  // 5 * dim + 1
          270,  // 11 * dim - 5
          395,  // 16 * dim - 5
          476,  // 19 * dim + 1
          522,  // 21 * dim - 3
          601,  // (dim - 1) * dim + 1 -> always bottom left corner
          611,  // 24 * dim + 11
          616   // 24 * dim + 16
        ],
        "outer-wall-SE": [
          89,   // 3 * dim + 14
          150,  // 6 * dim
          256,  // 10 * dim + 6
          381,  // 15 * dim + 6
          500,  // 20 * dim
          504,  // 20 * dim + 4
          610,  // 24 * dim + 10
          615,  // 24 * dim + 15
          625   // dim * dim -> always bottom right corner
        ],
        "outer-wall-vertical": [
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
        ],
        "inner-wall-top": [
          133, 143, 308, 318, 483, 493
        ],
        "inner-wall-bottom": [
          188, 258, 268, 383, 393, 438, 506, 520, 563
        ],
        "inner-wall-left": [
          135, 190, 385, 428, 433, 440, 485, 540, 553
        ],
        "inner-wall-right": [
          141, 186, 391, 436, 443, 448, 491, 536, 573
        ],
        "inner-wall-vertical": [
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
        ],
        "inner-wall-horizontal": [
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
        ],
        "inner-block-NW": [
          53, 58, 66, 70, 235, 239
        ],
        "inner-block-NE": [
          56, 60, 68, 73, 237, 241
        ],
        "inner-block-SW": [
          78, 83, 91, 95, 335, 339
        ],
        "inner-block-SE": [
          81, 85, 93, 98, 337, 341
        ],
        "inner-block-horizontal": [
          54, 55, 59, 67, 71, 72,
          79, 80, 84, 92, 96, 97,
          236, 240,
          336, 340
        ],
        "inner-block-vertical": [
          260, 285, 310,
          262, 287, 312,
          264, 289, 314,
          266, 291, 316
        ],
      };

      this.overlayWallPositions = {
        "inner-wall-tee-up": [],
        "inner-wall-tee-down": [138, 388, 488],
        "inner-wall-tee-left": [193, 543],
        "inner-wall-tee-right": [183, 533],
        "inner-wall-NW": [445],
        "inner-wall-NE": [431],
        "inner-wall-SW": [568],
        "inner-wall-SE": [558],
      };

      this.rangesOfWallPositions = {
        "outer-wall-horizontal": [
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
        ],
      };

      this.portalPositions = {
        "portal-left": 276,
        "portal-right": 300,
      }

      this.dotPositionRanges = [
        [28, 36], [40, 48],                                           // row 1
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
        [578, 584], [587, 589], [592, 598]                            // row 23
      ];

      this.powerupPositions = [27, 49, 577, 599];
    };
  };
})();
