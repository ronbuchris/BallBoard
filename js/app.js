var WALL = "WALL";
var FLOOR = "FLOOR";
var BALL = "BALL";
var GAMER = "GAMER";
var BRIDGE = "BRIDGE";
var GLUE = "GLUE";

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/candy.png" />';

var gBoard;
var gGamerPos;
var gIntervalBall;
var gBallCount;
var gBallsCollected;
var gGameIsOn;
var gIsGlue;
var gIntervalGlue;

function initGame() {
  gGameIsOn = true;
  gGamerPos = { i: 2, j: 9 };
  gBoard = buildBoard();
  renderBoard(gBoard);
  gBallCount = 2;
  gBallsCollected = 0;
  gIsGlue = false;
  gIntervalBall = setInterval(addBall, 3000);
  gIntervalGlue = setInterval(addGlue, 5000);
}

function checkVictory() {
  if (gBallCount === gBallsCollected) {
    console.log("you win");
    gGameIsOn = false;
    clearInterval(addBall);
    clearInterval(addGlue);
  }
}

function addGlue() {
  if (!gGameIsOn) return;
  var cell = getEmptyCell();
  gBoard[cell.i][cell.j].gameElement = GLUE;
  renderCell(cell, GLUE_IMG);
  setTimeout(function () {
    if (gBoard[cell.i][cell.j].gameElement !== GAMER) {
      gBoard[cell.i][cell.j].gameElement = null;
      renderCell(cell, '');
    }
  }, 3000);
}

function addBall() {
  if (!gGameIsOn) return;
  var cell = getEmptyCell();
  gBoard[cell.i][cell.j].gameElement = BALL;
  renderCell(cell, BALL_IMG);
  gBallCount++;
}

function getEmptyCell() {
  var emptyCells = getEmptyCells();
  var idx = getRandomInt(0, emptyCells.length);
  var emptyCell = emptyCells[idx];
  return emptyCell;
}

function getEmptyCells() {
  var emptyCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].type === FLOOR && gBoard[i][j].gameElement === null) {
        emptyCells.push({ i: i, j: j });
      }
    }
  }
  return emptyCells;
}

function buildBoard() {
  // Create the Matrix
  var board = createMat(10, 12);

  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      // Put FLOOR in a regular cell
      var cell = { type: FLOOR, gameElement: null };

      // Place Walls at edges
      if (
        i === 0 ||
        i === board.length - 1 ||
        j === 0 ||
        j === board[0].length - 1
      ) {
        cell.type = WALL;
      }

      // Add created cell to The game board
      if (
        (i === 0 && j === 5) ||
        (i === board.length - 1 && j === 5) ||
        (i === 5 && j === 0) ||
        (i === 5 && j === board[0].length - 1)
      ) {
        cell.type = BRIDGE;
      }
      board[i][j] = cell;
    }
  }

  // Place the gamer at selected position
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

  // Place the Balls (currently randomly chosen positions)
  board[3][8].gameElement = BALL;
  board[7][4].gameElement = BALL;
  return board;
}

// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });

      // TODO - change to short if statement
      if (currCell.type === FLOOR || currCell.type === BRIDGE)
        cellClass += " floor";
      else if (currCell.type === WALL) cellClass += " wall";

      //TODO - Change To template string
      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '"  onclick="moveTo(' +
        i +
        "," +
        j +
        ')" >\n';

      // TODO - change to switch case statement
      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG;
      }

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }

  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  if (gIsGlue) return;
  if (!gGameIsOn) return;
  if (i === -1) i = 9;
  if (i === 10) i = 0;
  if (j === -1) j = 11;
  if (j === 12) j = 0;
  var targetCell = gBoard[i][j];
  if (targetCell.type === WALL) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  var iAbsDiff = Math.abs(i - gGamerPos.i);
  var jAbsDiff = Math.abs(j - gGamerPos.j);

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    targetCell.type === BRIDGE
  ) {
    if (targetCell.gameElement === BALL) {
      gBallsCollected++;
      var elSpan = document.querySelector("h2 span");
      elSpan.innerHTML = gBallsCollected;
      checkVictory();
    }
    if (targetCell.gameElement === GLUE) {
      gIsGlue = true;
      setTimeout(function () {
        gIsGlue = false;
      }, 3000);
    }

    // MOVING from current position
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // Dom:
    renderCell(gGamerPos, "");

    // MOVING to selected position
    // Model:
    gGamerPos.i = i;
    gGamerPos.j = j;
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    // DOM:
    renderCell(gGamerPos, GAMER_IMG);
  } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  var cellSelector = "." + getClassName(location);
  var elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;

  switch (event.key) {
    case "ArrowLeft":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
      moveTo(i + 1, j);
      break;
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  var cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}
