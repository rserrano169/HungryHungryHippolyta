(function () {
  if (typeof HHH === "undefined") {
    window.HHH = {};
  }

  var currentLocalStorageVersion = "1";
  if (localStorage.version !== currentLocalStorageVersion) {
    localStorage.clear();
    localStorage.version = currentLocalStorageVersion;
  }

  if (typeof localStorage.scores === "undefined") {
    localStorage.scores = JSON.stringify([
      { name: 'GOOD', number: 2500 },
      { name: 'BAD', number: 1800 },
      { name: 'UGLY', number: 1338 }
    ]);
  }
  var scores = JSON.parse(localStorage.scores);

  var View = HHH.View = function ($el) {
    this.$el = $el;
    this.timeLimit = View.TIME_LIMIT_MINUTES * 60 * 1000 / View.TIMER_INTERVAL;
    this.board = new HHH.Board(View.BOARD_TEMPLATE_NUMBER);
    this.$grid;
    this.template = new HHH.Template(View.BOARD_TEMPLATE_NUMBER);
    this.renderImagesIntervalId;

    this.setupBoard();

    this.imageRenderNum = 0;
    this.isImageLoading = false;
    this.areInstructionsRendered = false;
    this.isLoadingModalRendered = false;
    this.board.hippolyta.prevHorDir = "LEFT";
    this.areAllImagesLoaded = false;
    this.areWindowEventsBound = false;
    this.isPressing = false;
    this.isGameStarted = false;
    this.timerIntervalId;
    this.runIntervalId;
    this.numOfCurrentPowerups = this.$grid.children().filter(".powerup").length;
    this.stepNum = 1;
    this.BFSsequence = [];
    this.BFSindex = 0;
    this.board.hippolyta.nextDir = "STAY";

    this.loadAllImages();
    this.renderInstructions();
  };

  View.TIME_LIMIT_MINUTES = 5;

  View.TIMER_INTERVAL = 100;

  View.BOARD_TEMPLATE_NUMBER = 1;

  View.IMAGE_RENDER_SLOWNESS = 70;

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

  View.KEYS = {
    38: "UP",
    39: "RIGHT",
    40: "DOWN",
    37: "LEFT",
    80: "STAY"  // "P" button to stop Hippolyta from moving
  };

  View.MOVEMENT_SLOWNESS = 70;

  View.SPEED_BOOST_DIVISOR = 4;

  View.ORIGINAL_MOVEMENT_SLOWNESS = View.MOVEMENT_SLOWNESS;

  View.RATE_OF_SLOWNESS_RECOVERY_AFTER_BOOST = 0.2;

  View.prototype.setupBoard = function () {
    this.create$Grid();
    this.renderWalls();
    this.renderPortals();
    this.renderDots();
    this.renderPowerups();
  };

  View.prototype.create$Grid = function () {
    var html = '<section class="top-bar group">' +
               '<div class="timer"><b>Timer/Score: </b>' + this.timeLimit +
               ' milliseconds</div></section>';

    for (var i = 0; i < this.board.dim; i++) {
      html += '<ul class="group">';

      for (var j = 0; j < this.board.dim; j++) {
        html += '<li></li>';
      }

      html += '</ul>';
    }

    this.$el.html(html);
    this.$grid = this.$el.find("li");
  };

  View.prototype.renderWalls = function () {
    this.renderNoOverlayWalls();
    this.renderOverlayWalls();
    this.renderRangesOfWalls();
  };

  View.prototype.renderNoOverlayWalls = function () {
    var that = this;

    for (var key in this.template.noOverlayWallPositions) {
      var wallPositions = this.template.noOverlayWallPositions[key],
          wallClassStr = key;

      wallPositions.forEach( function (pos) {
        var $gridPos = that.$grid.eq(pos - 1);

        $gridPos.html("<div class='" + wallClassStr + "'></div>");
      })
    }
  };

  View.prototype.renderOverlayWalls = function () {
    var that = this;

    for (var key in this.template.overlayWallPositions) {
      var wallPositions = this.template.overlayWallPositions[key],
          wallClassStr = key;

      wallPositions.forEach( function (pos) {
        var $gridPos = that.$grid.eq(pos - 1);

        $gridPos
          .html("<div class='" + wallClassStr + "'></div>")
          .append("<div class='" + wallClassStr + "-overlay'></div>");
      })
    }
  };

  View.prototype.renderRangesOfWalls = function () {
    var that = this;

    for (var key in this.template.rangesOfWallPositions) {
      var rangesOfWallPositions = this.template.rangesOfWallPositions[key],
          wallClassStr = key;

      rangesOfWallPositions.forEach( function (range) {
        for (var i = range[0]; i <= range[1]; i++) {
          var $gridPos = that.$grid.eq(i - 1);

          $gridPos.html("<div class='" + wallClassStr + "'></div>");
        }
      })
    }
  };

  View.prototype.renderPortals = function () {
    for (var key in this.template.portalPositions) {
      var portalPosition = this.template.portalPositions[key],
          portalClassStr = key,
          $gridPos = this.$grid.eq(portalPosition - 1);

      $gridPos
        .append("<div class='portal " + portalClassStr + "'></div>")
        .append("<div class='portal " + portalClassStr + "-overlay'></div>");
    }
  };

  View.prototype.renderDots = function () {
    var that = this;

    this.template.dotPositionRanges.forEach( function (range) {
      for (var i = range[0]; i <= range[1]; i++) {
        var $gridPos = that.$grid.eq(i - 1);

        $gridPos.append('<div class="dot"></div>');
      }
    })
  };

  View.prototype.renderPowerups = function () {
    var that = this;

    this.template.powerupPositions.forEach( function (pos) {
      that.$grid.eq(pos - 1).html('<div class="powerup"></div>');
    })
  };

  View.prototype.loadAllImages = function () {
    this.setRenderImagesInterval();
  };

  View.prototype.setRenderImagesInterval = function () {
    this.renderImagesIntervalId = setInterval(
      this.renderAllImages.bind(this),
      View.IMAGE_RENDER_SLOWNESS
    );
  };

  View.prototype.renderAllImages = function () {
    var dir = View.HIPPOLYTA_IMG_DIRS[this.imageRenderNum];

    if (this.imageRenderNum < View.NUM_OF_IMGS_TO_RENDER) {
      if (!this.isImageLoading) {
        this.isImageLoading = true;
        this.renderLoadingModal();
        this.renderCurrentImage(dir);
      }

      if ($(".hippolyta-mouth-" + dir)[0].complete) {
        this.renderNextImage();
      }
    } else {
      clearInterval(this.renderImagesIntervalId)
      this.renderHippolyta();
      this.removeLoading();
      this.areAllImagesLoaded = true;
      this.bindWindowEvents();
    }
  };

  View.prototype.renderLoadingModal = function () {
    if (!this.areInstructionsRendered && !this.isLoadingModalRendered) {
      this.$el.prepend(
        "<div id='loading'>" +
          "<div id='loading-content'>Loading...</div>" +
        "</div>"
      );

      this.isLoadingModalRendered = true;
    }
  };

  View.prototype.renderCurrentImage = function (dir) {
    this.$currentTile()
      .html("<div id='hippolyta'></div>")
      .append(
        "<img src='images/hippolyta-mouth-" + dir + ".png' " +
              "class='hippolyta-mouth-" + dir + "' " +
              "alt='hmcl'>"
      );
  };

  View.prototype.$currentTile = function () {
    return this.$grid.eq(this.board.hippolyta.$gridPos());
  };

  View.prototype.renderNextImage = function () {
    this.imageRenderNum++;
    this.isImageLoading = false;
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
    }
  };

  View.prototype.isMovingToOrFromPortal = function () {
    if (this.$currentTile().children().hasClass("portal")) {
      return true;
    }

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
    }
  };

  View.prototype.renderMovingTo = function () {
    if (this.isMovingToOrFromPortal()) {
      this.renderMovingToPortal();
    } else if (
      this.board.hippolyta.dir === "STAY" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-left.png" ' +
                'class="hippolyta-mouth-closed-left" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "STAY" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-right.png" ' +
                'class="hippolyta-mouth-closed-right" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "UP" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-up-left.png" ' +
                'class="hippolyta-mouth-closed-up-left" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "UP" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-up-right.png" ' +
                'class="hippolyta-mouth-closed-up-right" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "DOWN" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-down-left.png" ' +
                'class="hippolyta-mouth-closed-down-left" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "DOWN" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-down-right.png" ' +
                'class="hippolyta-mouth-closed-down-right" ' +
                'alt="">'
        );
    } else if (this.board.hippolyta.dir === "LEFT") {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-left.png" ' +
                'class="hippolyta-mouth-closed-left" ' +
                'alt="">'
        );
    } else if (this.board.hippolyta.dir === "RIGHT") {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-right.png" ' +
                'class="hippolyta-mouth-closed-right" ' +
                'alt="">'
        );
    }
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
    }
  };

  View.prototype.removeLoading = function () {
    $('#loading').remove();

    this.isLoadingModalRendered = false;
  };

  View.prototype.bindWindowEvents = function () {
    if (!this.areInstructionsRendered &&
        !this.areWindowEventsBound &&
        this.areAllImagesLoaded) {
      $(window).on("keydown", this.handleKeyDownEvent.bind(this));
      $(window).on("keyup", this.handleKeyUpEvent.bind(this));
      $(window).on("mousedown touchstart", this.handleClickEvent.bind(this));

      this.areWindowEventsBound = true;
    }
  };

  View.prototype.handleKeyDownEvent = function (event) {
    if (View.KEYS[event.keyCode]) {
      event.preventDefault();

      if (!this.isPressing) {
        this.startGame();
        this.stepNum = 1;
        this.board.hippolyta.nextDir = View.KEYS[event.keyCode];
        this.isPressing = true;
      }
    }

    if (event.keyCode === 13) {
      event.preventDefault();

      if ($("#play-again").length) {
        $("#play-again").trigger("mousedown");
      }
    }
  };

  View.prototype.startGame = function () {
    if (!this.isGameStarted) {
      this.startTimer();
      this.runIntervalId = setInterval(
        this.step.bind(this),
        View.MOVEMENT_SLOWNESS
      );
      this.isGameStarted = true;
    }
  };

  View.prototype.startTimer = function () {
    this.timerIntervalId = setInterval(
      this.countDown.bind(this),
      View.TIMER_INTERVAL
    );
  };

  View.prototype.countDown = function () {
    this.timeLimit -= 1;
    this.$el.find(".timer").html(
      '<b>Timer/Score: </b>' + this.timeLimit +
      ' milliseconds'
    );
  };

  View.prototype.step = function () {
    if (this.hasEatenPowerup()) {
      this.boostSpeed();
    }

    if (this.isSpeedBoosted()) {
      this.increaseSlowness();
    }

    if (this.stepNum === 1) {
      this.setNextDirWithBFS(); // if applicable

      if (this.isNextDirValid()) {
        this.setPrevHorDir();
        this.changeDirection();
      }

      this.stepNum = 2;
    } else if (this.stepNum === 2) {
      if(this.isValidMove()) {
        this.renderMouthOpen();
      }

      this.stepNum = 3;
    } else if (this.stepNum === 3) {
      if (this.isValidMove()) {
        this.renderHippolyta();
      }

      this.stepNum = 1;
    }

    if (this.isLost()) {
      clearInterval(this.timerIntervalId);
      clearInterval(this.runIntervalId);
      this.renderYouLose();
    }

    if (this.isWon()) {
      clearInterval(this.timerIntervalId);
      clearInterval(this.runIntervalId);
      this.recordScore();
      this.renderYouWin();
    }
  };

  View.prototype.hasEatenPowerup = function () {
    if (this.numOfCurrentPowerups > this.numOfPowerups()) {
      this.numOfCurrentPowerups = this.numOfPowerups();
      return true;
    }

    return false;
  };

  View.prototype.numOfPowerups = function () {
    return this.$grid.children().filter(".powerup").length;
  };

  View.prototype.boostSpeed = function () {
    View.MOVEMENT_SLOWNESS /= View.SPEED_BOOST_DIVISOR;
    clearInterval(this.runIntervalId);

    this.runIntervalId = setInterval(
      this.step.bind(this),
      View.MOVEMENT_SLOWNESS
    );
  };

  View.prototype.isSpeedBoosted = function () {
    return View.MOVEMENT_SLOWNESS < View.ORIGINAL_MOVEMENT_SLOWNESS;
  };

  View.prototype.increaseSlowness = function () {
    View.MOVEMENT_SLOWNESS += View.RATE_OF_SLOWNESS_RECOVERY_AFTER_BOOST;
    clearInterval(this.runIntervalId);

    this.runIntervalId = setInterval(
      this.step.bind(this),
      View.MOVEMENT_SLOWNESS
    );
  };

  View.prototype.setNextDirWithBFS = function () {
    if (this.BFSsequence) {
      if (this.BFSsequence[this.BFSindex] -
          this.board.hippolyta.$gridPos() === -25) {
        this.board.hippolyta.nextDir = "UP";
      } else if (this.BFSsequence[this.BFSindex] -
                this.board.hippolyta.$gridPos() === 1) {
        this.board.hippolyta.nextDir = "RIGHT";
      } else if (this.BFSsequence[this.BFSindex] -
                this.board.hippolyta.$gridPos() === 25) {
        this.board.hippolyta.nextDir = "DOWN";
      } else if (this.BFSsequence[this.BFSindex] -
                this.board.hippolyta.$gridPos() === -1) {
        this.board.hippolyta.nextDir = "LEFT";
      }
    }

    this.BFSindex++;
  };

  View.prototype.isNextDirValid = function () {
    return this.isValidMove(this.board.hippolyta.nextDir);
  };

  View.prototype.isValidMove = function (dir, $tile) {
    if (typeof dir === 'undefined') {
      dir = this.board.hippolyta.dir;
    }

    if (typeof $tile === 'undefined') {
      $tile = this.$nextTile(dir);
    }

    return (
      $tile.children().hasClass("dot") ||
      $tile.children().hasClass("powerup") ||
      $tile.children().hasClass("portal") ||
      $tile.children().hasClass("") ||
      $tile.find("#hippolyta").length > 0
    );
  };

  View.prototype.setPrevHorDir = function () {
    if (this.board.hippolyta.nextDir !== this.board.hippolyta.dir && (
      this.board.hippolyta.dir === "RIGHT" ||
      this.board.hippolyta.dir === "LEFT"
    )) {
      this.board.hippolyta.prevHorDir = this.board.hippolyta.dir;
    }
  };

  View.prototype.$nextTile = function (dir) {
    if (typeof dir === 'undefined') {
      dir = this.board.hippolyta.dir;
    }

    return this.$grid.eq(this.board.hippolyta.next$gridPos(dir));
  };

  View.prototype.changeDirection = function () {
    return this.board.hippolyta.dir = this.board.hippolyta.nextDir;
  };

  View.prototype.renderMouthOpen = function () {
    if (this.isMovingToOrFromPortal()) {
      this.renderMovingToPortal();
    } else if (
      this.board.hippolyta.dir === "STAY" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-left.png" ' +
                'class="hippolyta-mouth-closed-left" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "STAY" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-closed-right.png" ' +
                'class="hippolyta-mouth-closed-right" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "UP" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-open-up-left.png" ' +
                'class="hippolyta-mouth-open-up-left" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "UP" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-open-up-right.png" ' +
                'class="hippolyta-mouth-open-up-right" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "DOWN" &&
      this.board.hippolyta.prevHorDir === "LEFT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-open-down-left.png" ' +
                'class="hippolyta-mouth-open-down-left" ' +
                'alt="">'
        );
    } else if (
      this.board.hippolyta.dir === "DOWN" &&
      this.board.hippolyta.prevHorDir === "RIGHT"
    ) {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-open-down-right.png" ' +
                'class="hippolyta-mouth-open-down-right" ' +
                'alt="">'
        );
    } else if (this.board.hippolyta.dir === "LEFT") {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-open-left.png" ' +
                'class="hippolyta-mouth-open-left" ' +
                'alt="">'
        );
    } else if (this.board.hippolyta.dir === "RIGHT") {
      this.$currentTile()
        .html('<div id="hippolyta"></div>')
        .append(
          '<img src="images/hippolyta-mouth-open-right.png" ' +
                'class="hippolyta-mouth-open-right" ' +
                'alt="">'
        );
    }
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
    return this.numberOfDotsLeft() === 0;
  };

  View.prototype.numberOfDotsLeft = function () {
    return this.$grid.children().filter(".dot").length;
  };

  View.prototype.recordScore = function () {
    scores.push({ name: 'YOU', number: this.timeLimit });
    scores = scores
      .sort( function (a, b) {
        return b.number - a.number;
      })
      .slice(0, 10);
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
      }
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

  View.prototype.handleKeyUpEvent = function (event) {
    this.isPressing = false;
  };

  View.prototype.handleClickEvent = function (event) {
    this.startGame()
    this.stepNum = 1;
    this.createBFSsequence(event);
    if (this.BFSsequence.length <= 0) {
      this.setNextDirNESWonClick(event);
    }
  };

  View.prototype.createBFSsequence = function (event) {
    if ($(event.target).is("li")) {
      var $clickedTile = $(event.target);
    } else {
      var $clickedTile = $(event.target).parent();
    }

    var directions = [-25, 1, 25, -1],
        clicked$gridPos = this.$grid.index($clickedTile),
        checked$gridPositions = [],
        tilesToCheck = [$clickedTile],
        $checking = tilesToCheck.shift(),
        childToParent = {},
        that = this;

    while ($checking && $checking.find("#hippolyta").length === 0) {
      directions.forEach( function (dir) {
        var checking$gridPos = that.$grid.index($checking),
        next$gridPos = checking$gridPos + dir;
        $adjTile = that.$grid.eq(next$gridPos);

        if (
          that.isValidMove('undefined', $adjTile) &&
          checked$gridPositions.indexOf(next$gridPos) === -1
        ) {
            childToParent[next$gridPos] = checking$gridPos;
            tilesToCheck.push($adjTile);
        }
      })

      checked$gridPositions.push(this.$grid.index($checking));
      $checking = tilesToCheck.shift();
    };

    var $foundHippolytaTile = $checking,
        child$gridPos = this.$grid.index($foundHippolytaTile),
        posSequence = [];

    while (posSequence.indexOf(clicked$gridPos) === -1 && child$gridPos > 0) {
      child$gridPos = childToParent[child$gridPos];
      posSequence.push(child$gridPos);
    }

    if (!this.isValidMove('undefined', $clickedTile)) {
      posSequence.pop();
    }

    this.BFSindex = 0;
    this.BFSsequence = posSequence;
  };

  View.prototype.setNextDirNESWonClick = function (event) {
    var clickWindowCoord = new HHH.Coord(event.pageX, event.pageY);
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
    }
  };

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

    this.areInstructionsRendered = true;
    this.bindInstructionsEvents();
  };

  View.prototype.bindInstructionsEvents = function () {
    $("#instructions-modal-start-game").on(
      "click touch",
      this.handleInstructionsClickAndTouch.bind(this)
    );

    $(window).on(
      "keydown.instructions",
      this.handleInstructionsKeyDownEvent.bind(this)
    );
  };

  View.prototype.handleInstructionsClickAndTouch = function (event) {
    this.removeInstructions();
    this.bindWindowEvents();
  };

  View.prototype.removeInstructions = function () {
    $("#instructions-modal").remove();
    $(window).off(".instructions");

    this.areInstructionsRendered = false;
  };

  View.prototype.handleInstructionsKeyDownEvent = function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();

      this.removeInstructions();
      this.bindWindowEvents();
    }
  };
})();
