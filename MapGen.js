var GameVars = require("./GameVars");
var GRID = GameVars.GRID;
var GRIDWIDTH = GameVars.GRIDWIDTH;
var GRIDHEIGHT = GameVars.GRIDHEIGHT;
var SolidBlock = require("./SolidBlock");

var roomList = []; // rooms are {x, y, width, height}
function center(room) {
	return {x: Math.round(room.x+room.width/2), y: Math.round(room.y+room.height/2)};
}

function dist(room1, room2) {
	var r1 = center(room1);
	var r2 = center(room2);
	return Math.sqrt( (r2.x - r1.x)*(r2.x - r1.x) + (r2.y - r1.y)*(r2.y - r1.y) );
}

function shittyMST(rooms) {
	var inMST = [];
	var notInMST = rooms.slice();
	var edges = [];
	inMST.push(notInMST[0]);
	notInMST.splice(0, 1);

	var shortest = 99999;
	var shortestRoom = undefined;
	var correspondingRoom = undefined;
	var chanceRoom = undefined;

	while(notInMST.length > 0) {
		for(var r = 0; r < notInMST.length; r++) {
			for(var i = 0; i < inMST.length; i++) {
				var d = dist(notInMST[r], inMST[i]);
				if(d < shortest) {
					shortest = d;
					shortestRoom = notInMST[r];
					chanceRoom = correspondingRoom;
					correspondingRoom = inMST[i];
				}
			}
		}
		inMST.push(shortestRoom);
		notInMST.splice(notInMST.indexOf(shortestRoom), 1);
		shortest = 99999;
		if(Math.random()<0.4) {
			//small chance to also include the second shortest edge (this makes the edges not MST)
			if(chanceRoom) {
				edges.push({room1: shortestRoom, room2: chanceRoom});
			}
		}
		edges.push({room1: shortestRoom, room2: correspondingRoom});
	}
	return edges;
}

// MapGen changes GameVars.GRID
function MapGen() {
	this.generateMap = function() {
		roomList = [];
		resetGrid();
		addRooms(20, 5, 5, 20, 20);
		addPaths();
		addPillars(25);

		return addBlocksToWorld();
	};

	function resetGrid() {
		for(var x = 0; x < GRIDWIDTH; x ++) {
			for(var y = 0; y < GRIDHEIGHT; y ++) {
				GRID[x][y] = true;
			}
		}
	}

	function addRooms(maxRooms, minWidth, minHeight, maxWidth, maxHeight) {
		function placeOneRoom(gridX,gridY,width,height) {
			if(gridX + width > GRIDWIDTH || gridY + height > GRIDHEIGHT) {
				return false;
			}
			//check for overlap (with 1 unit margine)
			for(var x = gridX-1; x < gridX+width+1; x++) {
				for(var y = gridY-1; y < gridY+height+1; y++) {
					if(x < 0 || x >= GRIDWIDTH || y < 0 || y >= GRIDHEIGHT) {
						continue; //index outa bounds
					}
					if(!GRID[x][y]) {
						return false; //overlap existing room
					}
				}
			}
			//no overlap :D, now place the room
			for(var x = gridX; x < gridX+width; x++) {
				for(var y = gridY; y < gridY+height; y++) {
					GRID[x][y] = false;
				}
			}
			roomList.push({x: gridX, y: gridY, width: width, height: height});
			return true;
		}
		var tryCount = 0;
		var roomsPlaced = 0;
		while(roomsPlaced < maxRooms && tryCount < 10000) {
			if(placeOneRoom(
				Math.round(Math.random()*(GRIDWIDTH)),
				Math.round(Math.random()*(GRIDHEIGHT)),
				Math.round(minWidth+Math.random()*(maxWidth-minWidth)),
				Math.round(minHeight+Math.random()*(maxHeight-minHeight)))) {
				roomsPlaced++;
			}
			tryCount++;
		}
	}

	function addPaths() {
		function placePath(pathSize, startX, startY, endX, endY) {
			var sX = startX-pathSize;
			var eX = endX+pathSize;
			if(startX > endX) {
				sX = endX-pathSize;
				eX = startX+pathSize;
			}

			var sY = startY-pathSize;
			var eY = endY+pathSize;
			if(startY > endY) {
				sY = endY-pathSize;
				eY = startY+pathSize;
			}

			for(var x = sX; x <= eX; x++) {
				for(var y = sY; y <= eY; y++) {
					if(x < 0 || x >= GRIDWIDTH || y < 0 || y >= GRIDHEIGHT) {
						continue; //index outa bounds
					}
					GRID[x][y] = false;
				}
			}
		}
		function join2Rooms(pathSize, room1, room2) {
			var r1 = center(room1);
			var r2 = center(room2);
			
			if(Math.abs(r1.x - r2.x) < (r1.width + r2.width)/2) {
				// join vertically
				var totalOffset = r2.x - r1.x;
				var maxOffset = (r1.width + r2.width)/2;
				var percentOffset = Math.abs(totalOffset/maxOffset);
				var adjust = (r1.width/2)*percentOffset * (totalOffset/Math.abs(totalOffset));

				placePath(pathSize, r1.x + adjust, r1.y, r1.x + adjust, r2.y);
			} else if(Math.abs(r1.y - r2.y) < (r1.height + r2.height)/2) {
				// join horiz
				var totalOffset = r2.y - r1.y;
				var maxOffset = (r1.height + r2.height)/2;
				var percentOffset = Math.abs(totalOffset/maxOffset);
				var adjust = (r1.height/2)*percentOffset * (totalOffset/Math.abs(totalOffset));

				placePath(pathSize, r1.x, r1.y+adjust, r2.x, r1.y+adjust);
			} else {
				// L join
				placePath(pathSize, r1.x, r1.y, r2.x, r1.y);
				placePath(pathSize, r2.x, r1.y, r2.x, r2.y);
			}
		}
		var edges = shittyMST(roomList);
		for(var e = 0; e < edges.length; e++) {
			join2Rooms(1, edges[e].room1, edges[e].room2);
		}
	}

	function addPillars(maxAmount) {
		function placeOnePillar(x,y) {
			// turn GRID[x][y] to true iff it is not surrounded by any true
			for(var i = x-1; i <= x+1; i++) {
				for(var k = y-1; k <= y+1; k++) {
					if(i < 0 || i >= GRIDWIDTH || k < 0 || k >= GRIDHEIGHT) {
						continue; //index outa bounds
					}
					if(GRID[i][k]) {
						return false; //not valid
					}
				}
			}
			GRID[x][y] = true;
			return true;
		}

		var tryCount = 0;
		var placed = 0;
		while(placed < maxAmount && tryCount < 10000) {
			if(placeOnePillar(Math.round(Math.random()*(GRIDWIDTH-1)), Math.round(Math.random()*(GRIDHEIGHT-1)))) {
				placed++;
			}
			tryCount++;
		}
	}

	function addBlocksToWorld() {
		var helpGrid = new Array(GRIDWIDTH); // helpGrid stores bools indicating wether block has been placed or not
		for(var i = 0; i < helpGrid.length; i ++) {
			helpGrid[i] = new Array(GRIDHEIGHT);
		}
		for(var x = 0; x < GRIDWIDTH; x ++) {
			for(var y = 0; y < GRIDHEIGHT; y ++) {
				helpGrid[x][y] = false;
			}
		}
		function countRight(x,y) {
			//returns the # of blocks to the right of x,y (including x,y), which have not been placed (==false) && != false
			var count = 0;
			for(var i = x; i < GRIDWIDTH; i++) {
				if(!GRID[i][y] || helpGrid[i][y] == true) {
					break;
				}
				count ++;
			}
			return count;
		}

		var blocks = [];
		function addBlock(x,y,wid,hei) {
			if(wid == 0 || hei == 0) {
				return;
			}
			for(var i = x; i < x+wid; i ++) {
				for(var k = y; k < y+hei; k ++) {
					helpGrid[i][k] = true;
				}
			}
			blocks.push(new SolidBlock(-1, x, y, wid, hei));
			// REMEMBER TO REWORK THIS TO USE A OBJ CREATOR!!! SO U DUN HAVE TO DO ID SHIT
		}
		for(var x = 0; x < GRIDWIDTH; x++) {
			for(var y = 0; y < GRIDHEIGHT; y++) {

				var wid = countRight(x,y);
				var hei = 0;
				for(var down = y; down < GRIDHEIGHT; down++) {
					if(countRight(x,down) < wid) {
						break;
					}
					hei++;
				}
				addBlock(x,y,wid,hei);

			}
		}
		return blocks;
	}
}
module.exports = MapGen;