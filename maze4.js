// Loads up the game
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];

// Dropdown lists for maze dimensions
var lvlwidth = { "Select": 0, "Easy": 420, "Medium": 540, "Hard": 660, "Expert": 780 };
var lvlheight = { "Select": 0, "Easy": 300, "Medium": 360, "Hard": 450, "Expert": 570 };
var select = document.createElement("select");
select.name = "level";
select.id = "level";

for (const val of Object.keys(lvlwidth)) {
    var option = document.createElement("option");
    option.value = val;
    option.text = val.charAt(0).toUpperCase() + val.slice(1);
    select.appendChild(option);
}

var label = document.createElement("label");
// label.innerHTML = "Choose your level: ";
label.htmlFor = "level";

var eleme = document.getElementById("levelcontainer4").appendChild(label);
var strUser = eleme.value;

var x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
var width = 780,
    height = 570;

// refresh page after change in dropdown list
// if (strUser == "Easy" || strUser == "Medium" || strUser == "Hard" || strUser == "Expert") {
    // width = lvlwidth[strUser];
    // height = lvlheight[strUser];
    // document.getElementById("newmaze")window.location.reload();
    // };
// }

var currentPosition;

var N = 1 << 0,
    S = 1 << 1,
    W = 1 << 2,
    E = 1 << 3;

var body = document.querySelectorAll('body');


var layout = [],
    fronteirTest = [];
// Determines the size of the blocks 
var cellSize = 20,
    cellSpacing = 10,
    cellWidth = Math.floor((width - cellSpacing) / (cellSize + cellSpacing)),
    cellHeight = Math.floor((height - cellSpacing) / (cellSize + cellSpacing)),
    cells = new Array(cellWidth * cellHeight), // each cell’s edge bits
    frontier = [];

var maxY = Math.floor((height - cellSpacing) / (cellSize + cellSpacing)) - 1,
    maxX = Math.floor((width - cellSpacing) / (cellSize + cellSpacing)) - 1;


var canvas = document.createElement('canvas');

canvas.setAttribute("id", "canvas");
canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

body[0].appendChild(canvas);

var context = canvas.getContext("2d");


context.translate(
    Math.round((width - cellWidth * cellSize - (cellWidth + 1) * cellSpacing) / 2),
    Math.round((height - cellHeight * cellSize - (cellHeight + 1) * cellSpacing) / 2)
);
// context.font = '20px serif';
// context.fillText('🕵️‍♂️', cellWidth, cellHeight);


var canvas2 = document.createElement('canvas');

canvas2.setAttribute("id", "canvas2");
canvas2.setAttribute("width", width);
canvas2.setAttribute("height", height);

body[0].appendChild(canvas2);

var game = canvas2.getContext("2d");

game.translate(
    Math.round((width - cellWidth * cellSize - (cellWidth + 1) * cellSpacing) / 2),
    Math.round((height - cellHeight * cellSize - (cellHeight + 1) * cellSpacing) / 2)
);
// game.font = '20px serif';
// game.fillText('👑', cellWidth, cellHeight);


//color of the maze
context.fillStyle = "#665102";

// Add a random cell and two initial edges.
var start = (cellHeight - 1) * cellWidth;
cells[start] = 0;
fillCell(start);
frontier.push({
    index: start,
    direction: N
});
frontier.push({
    index: start,
    direction: E
});

// Explore the frontier until the tree spans the graph.
function run() {
    var done, k = 0;
    while (++k < 50 && !(done = exploreFrontier()));
    return done;
};

function exploreFrontier() {

    if ((edge = popRandom(frontier)) == null) {
        layout.push({ x: 0, y: maxY, d1: 0, d0: 0 })
        for (var i = layout.length - 1; i >= 0; i--) {
            if (layout[i].x === 0 && layout[i].y === maxY) {
                drawPlayer(layout[i]);
            }
        };
        return true;
    }

    var edge,
        i0 = edge.index,
        d0 = edge.direction,
        i1 = i0 + (d0 === N ? -cellWidth : d0 === S ? cellWidth : d0 === W ? -1 : +1),
        x0 = i0 % cellWidth,
        y0 = i0 / cellWidth | 0,
        x1,
        y1,
        d1,
        open = cells[i1] == null, // opposite not yet part of the maze
        north,
        east,
        south,
        west;
    // makes the maze color
    var my_gradient=context.createLinearGradient(0,0,0,400);
    my_gradient.addColorStop(1,"#665102");
    my_gradient.addColorStop(0,"#cfaf1d");
    context.fillStyle=open ? my_gradient : "transparent";
    // context.fillStyle = open ? "#a38105" : "transparent";
    if (d0 === N) fillSouth(i1), x1 = x0, y1 = y0 - 1, d1 = S, south = true;
    else if (d0 === S) fillSouth(i0), x1 = x0, y1 = y0 + 1, d1 = N, south = true;
    else if (d0 === W) fillEast(i1), x1 = x0 - 1, y1 = y0, d1 = E, east = true;
    else fillEast(i0), x1 = x0 + 1, y1 = y0, d1 = W, east = true;




    if (open) {
        fillCell(i1);
        cells[i0] |= d0, cells[i1] |= d1;
        context.fillStyle = "transparent";
        if (y1 > 0 && cells[i1 - cellWidth] == null) fillSouth(i1 - cellWidth), frontier.push({
            index: i1,
            direction: N
        }), south = true;
        if (y1 < cellHeight - 1 && cells[i1 + cellWidth] == null) fillSouth(i1), frontier.push({
            index: i1,
            direction: S
        }), south = true;
        if (x1 > 0 && cells[i1 - 1] == null) fillEast(i1 - 1), frontier.push({
            index: i1,
            direction: W
        }), east = true;
        if (x1 < cellWidth - 1 && cells[i1 + 1] == null) fillEast(i1), frontier.push({
            index: i1,
            direction: E
        }), east = true;
    }

    layout.push({
        open: open,
        x: x1,
        y: y1,
        d0: d0,
        d1: d1
    });
}

function fillCell(index) {
    var i = index % cellWidth,
        j = index / cellWidth | 0;
    context.fillRect(i * cellSize + (i + 1) * cellSpacing, j * cellSize + (j + 1) * cellSpacing, cellSize, cellSize);
}

function fillEast(index) {
    var i = index % cellWidth,
        j = index / cellWidth | 0;
    context.fillRect((i + 1) * (cellSize + cellSpacing), j * cellSize + (j + 1) * cellSpacing, cellSpacing, cellSize);
}

function fillSouth(index) {
    var i = index % cellWidth,
        j = index / cellWidth | 0;
    context.fillRect(i * cellSize + (i + 1) * cellSpacing, (j + 1) * (cellSize + cellSpacing), cellSize, cellSpacing);
}

function popRandom(array) {
    if (!array.length) return;
    var n = array.length,
        i = Math.random() * n | 0,
        t;
    t = array[i], array[i] = array[n - 1], array[n - 1] = t;
    return array.pop();
}
//Changing the color and size of the balls
function drawPlayer(position) {
    game.clearRect(0, 0, width, height);
    currentPosition = position;
    var playerX = position.x * cellSize + (position.x + 1) * cellSpacing;
    var playerY = position.y * cellSize + (position.y + 1) * cellSpacing
    var finishX = maxX * cellSize + (maxX + 1) * cellSpacing;
    var finishY = 0 * cellSize + (0 + 1) * cellSpacing
    game.beginPath();
    // game.arc(finishX + (cellSize / 2), finishY + (cellSize / 2), cellSize / 2, 0, 2 * Math.PI, false);
    // game.fillStyle = "green";
    game.font = '30px serif';
    // loadImage('chest.png').then(image => {
    // game.drawImage(image, finishX, finishY, cellWidth + 10, clientHeight + 10)
    // });
    game.textAlign = "center";
    game.textBaseline = "middle";
    game.fillText('💎', finishX + (cellSize / 2), finishY + (cellSize / 2));
    // game.fill();
    game.beginPath();
    // game.arc(playerX + (cellSize / 2), playerY + (cellSize / 2), cellSize / 2, 0, 2 * Math.PI, false);
    // game.fillStyle = "black";
    game.font = '30px serif';
    game.textAlign = "center";
    game.textBaseline = "middle";
    game.fillText('🤠', playerX + (cellSize / 2), playerY + (cellSize / 2));
    // game.fill();
}

window.addEventListener("keydown", function (e) {

    var value = e.which;

    if (value === 37) moveWest(), e.preventDefault();
    if (value === 38) moveNorth(), e.preventDefault();
    if (value === 39) moveEast(), e.preventDefault();
    if (value === 40) moveSouth(), e.preventDefault();

    return false;

});

function moveWest() {
    var newY = currentPosition.y;
    var newX = currentPosition.x - 1;
    var newPosition;

    if (newX < 0) return false;

    for (var i = layout.length - 1; i >= 0; i--) {
        if (layout[i].x === newX && layout[i].y === newY) {
            newPosition = layout[i];
        }
    };

    if (newPosition.x === maxX && newPosition.y === 0) {
        gameComplete();
    }


    if ((currentPosition.d1 === W) || (newPosition.d1 === E)) {
        drawPlayer(newPosition);
    };
}

function moveEast() {
    var newY = currentPosition.y;
    var newX = currentPosition.x + 1;
    var newPosition;

    if (newX > maxX) return false;

    for (var i = layout.length - 1; i >= 0; i--) {
        if (layout[i].x === newX && layout[i].y === newY) {
            newPosition = layout[i];
        }
    };

    if (newPosition.x === maxX && newPosition.y === 0) {
        gameComplete();
    }

    if ((currentPosition.d1 === E) || (newPosition.d1 === W)) {
        drawPlayer(newPosition);
    };


}

function moveNorth() {
    var newY = currentPosition.y - 1;
    var newX = currentPosition.x;
    var newPosition;


    if (newY < 0) return false;

    for (var i = layout.length - 1; i >= 0; i--) {
        if (layout[i].x === newX && layout[i].y === newY) {
            newPosition = layout[i];
        }
    };

    if (newPosition.x === maxX && newPosition.y === 0) {
        gameComplete();
    }

    if ((currentPosition.d1 === N) || (newPosition.d1 === S)) {
        drawPlayer(newPosition);
    };

}

function moveSouth() {
    var newY = currentPosition.y + 1;
    var newX = currentPosition.x;
    var newPosition;

    if (newY > maxY) return false;

    for (var i = layout.length - 1; i >= 0; i--) {
        if (layout[i].x === newX && layout[i].y === newY) {
            newPosition = layout[i];
        }
    };

    if (newPosition.x === maxX && newPosition.y === 0) {
        gameComplete();
    }

    if ((currentPosition.d1 === S) || (newPosition.d1 === N)) {
        drawPlayer(newPosition);
    };

}
//Changes the alert when you win the game
function gameComplete() {
    alert('Congratulations, 🤠 you found the treasure 💎!');
}


(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());

function animate() {

    requestAnimationFrame(function () {
        if (!run()) {
            animate();
        }
    });
}

animate();

document.getElementById('doomsday').innerHTML =
  01 + ":" + 00;
startTimer();


function startTimer() {
  var presentTime = document.getElementById('doomsday').innerHTML;
  var timeArray = presentTime.split(/[:]+/);
  var m = timeArray[0];
  var s = checkSecond((timeArray[1] - 1));
  if(s==59){m=m-1}
  if(m<0){
    return
  }
  
  document.getElementById('doomsday').innerHTML =
    m + ":" + s;
  console.log(m)
  setTimeout(startTimer, 1000);
  if (m == 0 && s == 0) {
      gameLost();
  }
}

function checkSecond(sec) {
  if (sec < 10 && sec >= 0) {sec = "0" + sec}; // add zero in front of numbers < 10
  if (sec < 0) {sec = "59"};
  return sec;
}

function gameLost() {
    if (confirm('Oh no, you are lost in the maze 😭! Want to start over?')) {
        window.location.reload();
    }
}