(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  };

  var currentLocalStorageVersion = "1";
  if (localStorage.version !== currentLocalStorageVersion) {
    localStorage.clear();
    localStorage.version = currentLocalStorageVersion;
  };

  if (typeof localStorage.scores === "undefined") {
      localStorage.scores = JSON.stringify([
        { name: 'GOOD', number: 2500 },
        { name: 'BAD', number: 1800 },
        { name: 'UGLY', number: 1338 }
      ]);
  };
  var scores = JSON.parse(localStorage.scores);

  var View = HHH.View = function ($el) {
    this.$el = $el;
    this.board = new HHH.Board(View.BOARD_TEMPLATE_NUMBER, View.BOARD_SIZE);
    this.timeLimit = View.TIME_LIMIT_MINUTES * 60 * 1000 / View.TIMER_INTERVAL;
    this.isGameStarted = false;
    this.board.hippolyta.nextDir = "STAY";
    this.board.hippolyta.prevHorDir = "LEFT";
    this.imageRenderNum = 0;
    this.isLoading = false;
    this.areInstructionsShowing = false;
    this.setupBoard();
    this.renderInstructions();
    this.renderLoading();
    this.numOfDots = this.$li.children().filter(".dot").length;
    this.numOfCurrentPowerups = this.$li.children().filter(".powerup").length;
    this.stepNum = 1;
    this.isPressing = false;
    this.BFSindex = 0;
    this.BFSsequence = [];
  };

  View.BOARD_TEMPLATE_NUMBER = 1;
    if (View.BOARD_TEMPLATE_NUMBER === 1) {
      View.BOARD_SIZE = 25;
    };

  View.TIME_LIMIT_MINUTES = 5;

  View.TIMER_INTERVAL = 100;

  View.MOVEMENT_SLOWNESS = 70;

  View.KEYS = {
    38: "UP",
    39: "RIGHT",
    40: "DOWN",
    37: "LEFT",
    80: "STAY"  // "P" button to stop Hippolyta from moving
  };

  View.HIPPOLYTA_IMG_DIRS = [
    "closed-left",
    "closed-up-left",
    "closed-up-right",
    "closed-right",
    "closed-down-right",
    "closed-down-left",
    "open-left",
    "open-up-left",
    "open-up-right",
    "open-right",
    "open-down-right",
    "open-down-left"
  ];

  View.NUM_OF_IMGS_TO_RENDER = View.HIPPOLYTA_IMG_DIRS.length;

  View.LOAD_IMAGES_RENDER_SPEED = 70;

  View.prototype.renderInstructions = function () {
    this.$el.prepend(
      "<div id='instructions-modal'>" +
        "<div id='instructions-modal-content'>" +
          "<div id='instructions-modal-header' " +
              "class='instructions-modal-instruction'>" +
            "Instructions:" +
          "</div>" +
          "<div class='instructions-modal-instruction'>" +
            "Use the ARROW KEYS to move, " +
            "or CLICK / TOUCH where you want to go!" +
          "</div>" +
          "<div class='instructions-modal-instruction'>" +
            "The game and timer start when you start moving. " +
            "The game ends when you run out of time, or eat all the dots. " +
            "Eat the large dots for a speed boost!" +
          "</div>" +
          "<div class='instructions-modal-instruction'>" +
            "When you're ready to begin, then just hit \"Enter\", " +
            "\"Return\", or click \"Start Game!!!\"" +
          "</div>" +
          "<div id='instructions-modal-start-game'>" +
            "Start Game!!!" +
          "</div>" +
        "</div>" +
      "<div>"
    );

    this.areInstructionsShowing = true;
  };

  View.prototype.step = function () {
    if (this.hasEatenPowerup()) {
      this.boostSpeed();
    };

    if (this.isSpeedBoosted()) {
      this.increaseSlowness();
    };

    if (this.stepNum === 1) {
        this.setNextDirWithBFS(); // if applicable

        if (this.isNextDirValid()) {
          this.setPrevHorDir();
          this.changeDirection();
        };

        this.stepNum = 2;
    } else if (this.stepNum === 2) {
        if(this.isValidMove()) {
          this.renderMouthOpen();
        };

        this.stepNum = 3;
    } else if (this.stepNum === 3) {
        if (this.isValidMove()) {
          this.renderHippolyta();
        };

        this.stepNum = 1;
    };

    if (this.isLost()) {
      clearInterval(this.timer);
      clearInterval(this.run);
      this.renderYouLose();
    };

    if (this.isWon()) {
      clearInterval(this.timer);
      clearInterval(this.run);
      this.recordScore();
      this.renderYouWin();
    };
  };

  View.prototype.hasEatenPowerup = function () {
    if (this.numOfCurrentPowerups > this.numOfPowerups()) {
      this.numOfCurrentPowerups = this.numOfPowerups();
      return true;
    };

    return false;
  };

  View.prototype.numOfPowerups = function () {
    return this.$li.children().filter(".powerup").length;
  };

  View.prototype.boostSpeed = function () {
    View.MOVEMENT_SLOWNESS /= 4;
    clearInterval(this.run);

    this.run = setInterval(this.step.bind(this), View.MOVEMENT_SLOWNESS);
  };

  View.prototype.isSpeedBoosted = function () {
    return View.MOVEMENT_SLOWNESS < 70.0;
  };

  View.prototype.increaseSlowness = function () {
    View.MOVEMENT_SLOWNESS += .2;
    clearInterval(this.run);

    this.run = setInterval(this.step.bind(this), View.MOVEMENT_SLOWNESS);
  };

  View.prototype.renderMouthOpen = function () {
    if (this.isMovingToOrFromPortal()) {
        this.renderMovingToPortal();
    } else if (
      this.board.hippolyta.dir === "STAY" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-left.png" class="hippolyta-mouth-closed-left" alt="">');
    } else if (
      this.board.hippolyta.dir === "STAY" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-right.png" class="hippolyta-mouth-closed-right" alt="">');
    } else if (
      this.board.hippolyta.dir === "UP" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-open-up-left.png" class="hippolyta-mouth-open-up-left" alt="">');
    } else if (
      this.board.hippolyta.dir === "UP" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-open-up-right.png" class="hippolyta-mouth-open-up-right" alt="">');
    } else if (
      this.board.hippolyta.dir === "DOWN" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-open-down-left.png" class="hippolyta-mouth-open-down-left" alt="">');
    } else if (
      this.board.hippolyta.dir === "DOWN" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-open-down-right.png" class="hippolyta-mouth-open-down-right" alt="">');
    } else if (this.board.hippolyta.dir === "LEFT") {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-open-left.png" class="hippolyta-mouth-open-left" alt="">');
    } else if (this.board.hippolyta.dir === "RIGHT") {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-open-right.png" class="hippolyta-mouth-open-right" alt="">');
    };
  };

  View.prototype.isNextDirValid = function () {
    return this.isValidMove(this.board.hippolyta.nextDir);
  };

  View.prototype.setPrevHorDir = function () {
    if (
      this.board.hippolyta.nextDir !== this.board.hippolyta.dir &&
      (this.board.hippolyta.dir === "RIGHT" || this.board.hippolyta.dir === "LEFT")
    ) {
        this.board.hippolyta.prevHorDir = this.board.hippolyta.dir;
    };
  };

  View.prototype.changeDirection = function () {
    return this.board.hippolyta.dir = this.board.hippolyta.nextDir;
  };

  View.prototype.isValidMove = function (dir, $tile) {
    if (typeof dir === 'undefined') {
      dir = this.board.hippolyta.dir;
    };

    if (typeof $tile === 'undefined') {
      $tile = this.$nextTile(dir);
    };

    return (
      $tile.children().hasClass("dot") ||
      $tile.children().hasClass("powerup") ||
      $tile.children().hasClass("portal") ||
      $tile.children().hasClass("") ||
      $tile.find("#hippolyta").length > 0
    );
  };

  View.prototype.$nextTile = function (dir) {
    if (typeof dir === 'undefined') {
      dir = this.board.hippolyta.dir;
    };

    return this.$li.eq(this.board.hippolyta.next$liPos(dir));
  };

  View.prototype.renderHippolyta = function () {
    this.renderMovingFrom();
    this.board.hippolyta.move();
    this.renderMovingTo();
  };

  View.prototype.renderMovingFrom = function () {
    if (this.isMovingToOrFromPortal()) {
        this.renderMovingFromPortal();
    } else {
        this.$currentTile().html('<div class=""></div>');
    };
  };

  View.prototype.renderMovingTo = function () {
    if (this.isMovingToOrFromPortal()) {
        this.renderMovingToPortal();
    } else if (
      this.board.hippolyta.dir === "STAY" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-left.png" class="hippolyta-mouth-closed-left" alt="">');
    } else if (
      this.board.hippolyta.dir === "STAY" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-right.png" class="hippolyta-mouth-closed-right" alt="">');
    } else if (
      this.board.hippolyta.dir === "UP" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-up-left.png" class="hippolyta-mouth-closed-up-left" alt="">');
    } else if (
      this.board.hippolyta.dir === "UP" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-up-right.png" class="hippolyta-mouth-closed-up-right" alt="">');
    } else if (
      this.board.hippolyta.dir === "DOWN" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-down-left.png" class="hippolyta-mouth-closed-down-left" alt="">');
    } else if (
      this.board.hippolyta.dir === "DOWN" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-down-right.png" class="hippolyta-mouth-closed-down-right" alt="">');
    } else if (this.board.hippolyta.dir === "LEFT") {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-left.png" class="hippolyta-mouth-closed-left" alt="">');
    } else if (this.board.hippolyta.dir === "RIGHT") {
        this.$currentTile().html('<div id="hippolyta"></div>')
          .append('<img src="images/hippolyta-mouth-closed-right.png" class="hippolyta-mouth-closed-right" alt="">');
    };
  };

  View.prototype.isMovingToOrFromPortal = function () {
    if (this.$currentTile().children().hasClass("portal")) {
      return true;
    };

    return false;
  };

  View.prototype.renderMovingFromPortal = function () {
    if (this.$currentTile().children().hasClass("portal-left")) {
        this.$currentTile()
          .html('<div class="portal portal-left"></div>')
          .append('<div class="portal portal-left-overlay"></div>');
    } else if (this.$currentTile().children().hasClass("portal-right")) {
        this.$currentTile()
          .html('<div class="portal portal-right"></div>')
          .append('<div class="portal portal-right-overlay"></div>');
    };
  };

  View.prototype.renderMovingToPortal = function () {
    if (this.$currentTile().children().hasClass("portal-left")) {
        this.$currentTile()
          .html('<div id="hippolyta" class="portal portal-left"></div>')
          .append('<div class="portal portal-left-overlay"></div>')
          .append('<div class="portal portal-left-pass-through"></div>');
    } else if (this.$currentTile().children().hasClass("portal-right")) {
        this.$currentTile()
          .html('<div id="hippolyta" class="portal portal-right"></div>')
          .append('<div class="portal portal-right-overlay"></div>')
          .append('<div class="portal portal-right-pass-through"></div>');
    };
  };

  View.prototype.$currentTile = function () {
    return this.$li.eq(this.board.hippolyta.$liPos());
  };

  View.prototype.handleKeyDownEvent = function (event) {
    if (View.KEYS[event.keyCode]) {
      event.preventDefault();
      if (!this.isPressing) {
        this.startGame();
        this.stepNum = 1;
        this.board.hippolyta.nextDir = View.KEYS[event.keyCode];
        this.isPressing = true;
      };
    };

    if (event.keyCode === 13 && $("#play-again")) {
      event.preventDefault();
      $("#play-again").mousedown();
      $("#play-again").touchstart();
    };
  };

  View.prototype.handleKeyUpEvent = function (event) {
    this.isPressing = false;
  };

  View.prototype.handleClickEvent = function (event) {
    // event.preventDefault();
    this.startGame()
    this.stepNum = 1;
    this.createBFSsequence(event);
    if (this.BFSsequence.length <= 0) {
      this.setNextDirNESWonClick(event);
    };
  };

  View.prototype.setNextDirWithBFS = function () {
    if (this.BFSsequence) {
      if (this.BFSsequence[this.BFSindex] - this.board.hippolyta.$liPos() === -25) {
          this.board.hippolyta.nextDir = "UP";
      } else if (this.BFSsequence[this.BFSindex] - this.board.hippolyta.$liPos() === 1) {
          this.board.hippolyta.nextDir = "RIGHT";
      } else if (this.BFSsequence[this.BFSindex] - this.board.hippolyta.$liPos() === 25) {
          this.board.hippolyta.nextDir = "DOWN";
      } else if (this.BFSsequence[this.BFSindex] - this.board.hippolyta.$liPos() === -1) {
          this.board.hippolyta.nextDir = "LEFT";
      };
    };

    this.BFSindex++;
  };

  View.prototype.createBFSsequence = function (event) {
    if ($(event.target).is("li")) {
        var $clickedTile = $(event.target);
    } else {
        var $clickedTile = $(event.target).parent();
    };

    var directions = [-25, 1, 25, -1],
        clicked$liPos = this.$li.index($clickedTile),
        checked$liPositions = [],
        tilesToCheck = [$clickedTile],
        $checking = tilesToCheck.shift(),
        childToParent = {},
        that = this;

    while ($checking && $checking.find("#hippolyta").length === 0) {
      directions.forEach( function (dir) {
        var checking$liPos = that.$li.index($checking),
        next$liPos = checking$liPos + dir;
        $adjTile = that.$li.eq(next$liPos);
        if (
          that.isValidMove('undefined', $adjTile) &&
          checked$liPositions.indexOf(next$liPos) === -1
        ) {
            childToParent[next$liPos] = checking$liPos;
            tilesToCheck.push($adjTile);
        };
      })

      checked$liPositions.push(this.$li.index($checking));
      $checking = tilesToCheck.shift();
    };

    var $foundHippolytaTile = $checking,
        child$liPos = this.$li.index($foundHippolytaTile),
        posSequence = [];
    while (posSequence.indexOf(clicked$liPos) === -1 && child$liPos > 0) {
      child$liPos = childToParent[child$liPos];
      posSequence.push(child$liPos);
    }
    if (!this.isValidMove('undefined', $clickedTile)) {
      posSequence.pop();
    };

    this.BFSindex = 0;
    this.BFSsequence = posSequence;
  };

  View.prototype.setNextDirNESWonClick = function (event) {
    var clickWindowCoord = new HHH.Coord(
      event.pageX,
      event.pageY
    );
    var hippolytaCenterWindowCoord = new HHH.Coord(
      Math.floor($("#hippolyta").offset().left + $("#hippolyta").width() / 2),
      Math.floor($("#hippolyta").offset().top + $("#hippolyta").height() / 2)
    );

    if (clickWindowCoord.isNorthOf(hippolytaCenterWindowCoord)) {
        this.board.hippolyta.nextDir = "UP";
    } else if (clickWindowCoord.isEastOf(hippolytaCenterWindowCoord)) {
        this.board.hippolyta.nextDir = "RIGHT";
    } else if (clickWindowCoord.isSouthOf(hippolytaCenterWindowCoord)) {
        this.board.hippolyta.nextDir = "DOWN";
    } else if (clickWindowCoord.isWestOf(hippolytaCenterWindowCoord)) {
        this.board.hippolyta.nextDir = "LEFT";
    } else if (clickWindowCoord.equals(hippolytaCenterWindowCoord)) {
        this.board.hippolyta.nextDir = "STAY";
    };
  };

  View.prototype.startTimer = function () {
    this.timer = setInterval(this.countDown.bind(this), View.TIMER_INTERVAL);
  };

  View.prototype.countDown = function () {
    this.timeLimit -= 1;
    this.$el.find(".timer").html(
      '<b>Timer/Score: </b>' + this.timeLimit +
      ' milliseconds'
    );
  };

  View.prototype.startGame = function () {
    if (!this.isGameStarted) {
      this.startTimer();
      this.run = setInterval(this.step.bind(this), View.MOVEMENT_SLOWNESS);
      this.isGameStarted = true;
    };
  };

  View.prototype.isLost = function () {
    return this.timeLimit <= 0
  };

  View.prototype.renderYouLose = function () {
    this.$el.prepend(
      "<div id='game-lose-modal'>" +
      "<div id='you-win-or-lose'>You Lose!</div>" +
      "<div id='play-again'>Play Again?</div>" +
      "<div>"
    );

    $("#play-again").on("mousedown touchstart", this.reloadPage.bind(this));
    $
  };

  View.prototype.reloadPage = function () {
    window.location.reload();
  };

  View.prototype.isWon = function () {
    return this.$li.children().filter(".dot").length === 0;
  };

  View.prototype.recordScore = function () {
    scores.push({ name: 'YOU', number: this.timeLimit });
    scores = scores.sort( function (a, b) {
               return b.number - a.number;
             }).slice(0, 10);
    localStorage.scores = JSON.stringify(scores);
  };

  View.prototype.renderYouWin = function () {
    var highScores = "",
        rankNum = 1;
    scores.forEach( function (score) {
      if (rankNum === 1){
        highScores += rankNum + ". " + score.name + " : " + score.number;
        rankNum++;
      } else {
        highScores += "<br>" + rankNum + ". " + score.name + " : " + score.number;
        rankNum++;
      };
    })

    this.$el.prepend(
      "<div id='game-win-modal'>" +
      "<div id='you-win-or-lose'>You Win!!!</div>" +
      "<div id='your-score'>Your Score: " +
      this.timeLimit +
      "</div>" +
      "<div id='high-scores-list'>" +
      "<div id='high-scores-title'>" +
      "High Scores:" +
      "</div>" +
      highScores +
      "</div>" +
      "<div id='play-again'>Play Again?</div>" +
      "<div>"
    );

    $("#play-again").on("mousedown touchstart", this.reloadPage.bind(this));
  };

  View.prototype.renderAllImages = function () {
    var dir = View.HIPPOLYTA_IMG_DIRS[this.imageRenderNum];

    if (this.imageRenderNum >= View.NUM_OF_IMGS_TO_RENDER) {
        clearInterval(this.loadingImagesIntervalId)
        this.setupGameStart();
    } else {
      if (!this.isLoading) {
        this.isLoading = true;
        // this.renderLoading();

        this.$currentTile()
          .html("<div id='hippolyta'></div>")
          .append(
            "<img " +
            "src='images/hippolyta-mouth-" + dir + ".png' " +
            "class='hippolyta-mouth-" + dir + "' " +
            "alt='hmcl'>"
          );
      };
      if ($(".hippolyta-mouth-" + dir)[0].complete) {
        this.renderNextImage();
      };
    };
  };

  View.prototype.renderNextImage = function () {
    this.imageRenderNum++;
    this.isLoading = false;
  };

  View.prototype.setupGameStart = function () {
    this.renderHippolyta();
    $("#loading").remove();
    $(window).on("keydown", this.handleKeyDownEvent.bind(this));
    $(window).on("keyup", this.handleKeyUpEvent.bind(this));
    $(window).on("mousedown touchstart", this.handleClickEvent.bind(this));
  };

  View.prototype.setupBoard = function () {
    var that = this,
        html = '<section class="top-bar group">';

    html += '<div class="timer"><b>Timer/Score: </b>' + this.timeLimit;
    html += ' milliseconds</div></section>';

    for (var i = 0; i < this.board.dim; i++) {
      html += '<ul class="group">';

      for (var j = 0; j < this.board.dim; j++) {
        html += '<li></li>';
      }

      html += '</ul>';
    }
    this.$el.html(html);
    this.$li = this.$el.find("li");

    var template = new HHH.Template(this.board.temp);

    //* --- OUTER WALLS RENDER --- *//

    template.outerWallNWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-NW"></div>');
    })
    template.outerWallNEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-NE"></div>');
    })
    template.outerWallSWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-SW"></div>');
    })
    template.outerWallSEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-SE"></div>');
    })
    template.outerWallHorizontalRanges.forEach( function (range) {
      for (var i = range[0]; i <= range[1]; i++) {
        that.$li.eq(i - 1).html('<div class="outer-wall-horizontal"></div>');
      }
    })
    template.outerWallVerticalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="outer-wall-vertical"></div>');
    })

    //* --- INNER WALLS RENDER --- *//

    template.innerWallTopPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-top"></div>');
    })
    template.innerWallBottomPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-bottom"></div>');
    })
    template.innerWallLeftPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-left"></div>');
    })
    template.innerWallRightPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-right"></div>');
    })
    template.innerWallVerticalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-vertical"></div>');
    })
    template.innerWallHorizontalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-horizontal"></div>');
    })
    template.innerWallTeeUpPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-tee-up"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-tee-up-overlay"></div>');
    })
    template.innerWallTeeDownPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-tee-down"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-tee-down-overlay"></div>');
    })
    template.innerWallTeeLeftPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-tee-left"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-tee-left-overlay"></div>');
    })
    template.innerWallTeeRightPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-tee-right"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-tee-right-overlay"></div>');
    })
    template.innerWallNWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-NW"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-NW-overlay"></div>');
    })
    template.innerWallNEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-NE"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-NE-overlay"></div>');
    })
    template.innerWallSWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-SW"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-SW-overlay"></div>');
    })
    template.innerWallSEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-wall-SE"></div>');
      that.$li.eq(pos - 1).append('<div class="inner-wall-SE-overlay"></div>');
    })

    //* --- INNER BLOCKS RENDER --- *//

    template.innerBlockNWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-NW"></div>');
    })
    template.innerBlockNEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-NE"></div>');
    })
    template.innerBlockSWPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-SW"></div>');
    })
    template.innerBlockSEPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-SE"></div>');
    })
    template.innerBlockHorizontalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-horizontal"></div>');
    })
    template.innerBlockVerticalPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="inner-block-vertical"></div>');
    })

    //* --- PORTALS RENDER --- *//

    this.$li.eq(template.portalLeftPosition - 1)
      .append('<div class="portal portal-left"></div>')
      .append('<div class="portal portal-left-overlay"></div>');

    this.$li.eq(template.portalRightPosition - 1)
      .append('<div class="portal portal-right"></div>')
      .append('<div class="portal portal-right-overlay"></div>');

    //* --- DOTS RENDER --- *//

    template.dotPositionRanges.forEach( function (range) {
      for (var i = range[0]; i <= range[1]; i++) {
        that.$li.eq(i - 1).append('<div class="dot"></div>');
      }
    })

    //* --- POWERUPS RENDER --- *//

    template.powerupPositions.forEach( function (pos) {
      that.$li.eq(pos - 1).html('<div class="powerup"></div>');
    });

    this.loadAllImages();
  };

  View.prototype.loadAllImages = function () {
    this.setRenderImagesInterval();
  };

  View.prototype.renderLoading = function () {
    if (!this.areInstructionsShowing) {
      this.$el.prepend(
        "<div id='loading'>" +
        "<div id='loading-title'>Loading...</div>" +
        "</div>"
      );
    }
  };

  View.prototype.removeLoading = function () {
    if (!this.isLoading) {
      $('#loading').remove();
    }
  };

  View.prototype.setRenderImagesInterval = function () {
    this.loadingImagesIntervalId = setInterval(
      this.renderAllImages.bind(this),
      View.LOAD_IMAGES_RENDER_SPEED
    );
  };
})();
