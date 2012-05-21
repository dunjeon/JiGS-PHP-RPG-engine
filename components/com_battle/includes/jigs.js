////////////////////////////////////////
// Joomla interactive Game System
////////////Set up the variables ///////////////////////////////
var PosX = '';
var PosY = '';
var grid = '';
var map = '';
var portal_array = new Array();
var to_x = new Array();
var to_y = new Array();
var to_map = new Array();
var to_grid = new Array();
var from_x = new Array();
var from_y = new Array();
var from_map = new Array();
var from_grid = new Array();
document.onkeydown = check;
mycells = new Array(8);
cell = new Array(8);
for ( var i = 0; i < 8; i++)
{
	cell[i] = new Array(8);
	for ( var j = 0; j < 8; j++)
	{
		cell[i][j] = '';
	}
}
// Beginning of initialise process via json calls
window.addEvent('domready',function()
{
	var a = new Request.JSON({
		url : "index.php?option=com_battle&format=raw&task=action&action=get_player",
		onSuccess : function(result){
			PosX = result[0]['posx'];
			PosY = result[0]['posy'];
			grid = result[0]['grid'];
			map = result[0]['map'];
			pX = PosX * 50;
			pY = PosY * 50;
			// // Now we have player co-ordinates we can
			// // get the proper map cells
			var a = new Request.JSON({
				url : "index.php?option=com_battle&format=raw&task=action&action=get_cells&map=" + map,
				onSuccess : function(result) {
					for (i = 0; i < 8; i++)
					mycells[i] = new Array(8);
					mycells[0] = result[0]['row0'].split(',');
					mycells[1] = result[0]['row1'].split(',');
					mycells[2] = result[0]['row2'].split(',');
					mycells[3] = result[0]['row3'].split(',');
					mycells[4] = result[0]['row4'].split(',');
					mycells[5] = result[0]['row5'].split(',');
					mycells[6] = result[0]['row6'].split(',');
					mycells[7] = result[0]['row7'].split(',');
					// Assign each cell from the
					// json rows
					for (y = 0; y <= 7; y++)
					{
						for (x = 0; x <= 7; x++)
						{
							cell[x][y] = mycells[y][x];
						}
					}
					// Are there any portals?
					// Loop through json object
					// containing arrays.

					var a = new Request.JSON({
						url : "index.php?option=com_battle&format=raw&task=action&action=get_portals&map=" + map,
						onSuccess : function(result)
						{
							portal_array = result;
							for (i = 0; i <= portal_array.length-1; i++)
							{
								from_x[i] = portal_array[i].from_x;
								from_y[i] = portal_array[i].from_y;
								from_map[i] = portal_array[i].from_map;
								from_grid[i] = portal_array[i].from_grid;
								to_x[i] = portal_array[i].to_x;
								to_y[i] = portal_array[i].to_y;
								to_map[i] = portal_array[i].to_map;
								to_grid[i] = portal_array[i].to_grid;
							}
						}
					}).get();
					// End of portals json call
				}
			}).get();
		}
	}).get();
});
// End of initialise process

// Standard Function to test for keypresses
function check(e)
{
	if (!e)
		var e = window.event;
	(e.keyCode) ? key = e.keyCode : key = e.which;
	try
	{
		switch (key)
		{
			case 38:
				MoveUp();
				break;
			case 39:
				MoveRight();
				break;
			case 40:
				MoveDown();
				break;
			case 37:
				MoveLeft();
				break;
		}
	}
	catch (Exception)
	{
	}
}

// ////////////////////////////////////////////////////////
function MoveRight()
{
	Portal_Check();
	var right1 = parseInt(PosX) + 1;

	if (PosX == 7)
	{
		PosX = 0;
		map++;
		jump();
		return;
	}

	if (cell[right1][PosY] <= 0)
	{
		PosX++;
		pX = pX + 50;
		Move_Player();
		return;
	}
	else
	{
		walls_alert();
	}
}
// //////////////////////////////////////////////////////////
function MoveLeft()
{
	Portal_Check();
	var left1 = parseInt(PosX) - 1;
	if (PosX == 0)
	{
		PosX = 7;
		map--;
		jump();
		return;
	}
	if (cell[left1][PosY] <= 0)
	{
		PosX--;
		pX = pX - 50;
		Move_Player();
		return;
	}
	else
	{
		walls_alert();
	}
}

// //////////////////////////////////////////////////////////
function MoveUp()
{
	Portal_Check();
	var up = parseInt(PosY) - 1;
	if (PosY == 0)
	{
		PosY = 7;
		map = map - grid_index;
		jump();
		return;
	}
	if (cell[PosX][up] <= 0)
	{
		PosY--;
		pY = pY - 50;
		Move_Player();
		return false;
	}
	else
	{
		walls_alert();
	}
}

// /////////////////////////////////////////////////////////
function MoveDown()
{
	Portal_Check();
	var down = parseInt(PosY) + 1;
	// first check if portal
	// check if player is at edge of current map
	if (parseInt(PosY) == 7)
	{
		PosY = 0;
		map = parseInt(map) + parseInt(grid_index);
		jump();
		return;
	}
	if (cell[PosX][down] <= 0)
	{
		PosY++;
		pY = pY + 50;
		Move_Player();
		return false;
	}
	else
	{
		walls_alert();
	}
}

function walls_alert()
{
	alert('You cant walk through walls...... Yet!');
}

function safety_check()
{
	if (grid == 0 || map == 0)
	{
		grid = 1;
		map = 1;
		PosX = 1;
		PosY = 1;
	}
	return;
}

function jump()
{
	safety_check();
	location.href = 'index.php?option=com_battle&view=single&id=' + map
		+ '&update=1&posx=' + PosX + '&posy=' + PosY + '&grid=' + grid;
}

function Move_Player()
{
	safety_check();
	var a = new Request.JSON({
		url : "index.php?option=com_battle&format=raw&task=action&action=save_coordinate&posx=" +
		PosX + "&posy=" + PosY + "&grid=" + grid + "&map=" + map,
		onSuccess : function()
		{
			var mover = new Fx.Move($('demo'),
			{
				relativeTo : document.getElementById('screen_grid'),
				position : 'upperLeft',
				edge : 'upperLeft',
				offset : {x : pX, y : pY}
			});
			mover.start(); //moves to the new location
		}
	}).get();
}

function Portal_Check()
{

	// alert (portal_array.length);
	for (i = 0; i < portal_array.length; i++)
	{
		// alert(to_grid[i]);
		if (PosX == from_x[i] && PosY == from_y[i])
		{
			PosX = to_x[i];
			PosY = to_y[i];
			map = to_map[i];
			grid = to_grid[i];
			jump();
		}
	}
}
