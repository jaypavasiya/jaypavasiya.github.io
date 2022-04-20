import { useEffect, useState } from 'react';


// var context = canvas.getContext('2d');
var grid = 16;
var count = 0;
var snake = {
	x: 160,
	y: 160,
	// snake velocity. moves one grid length every frame in either the x or y direction
	dx: grid,
	dy: 0,
	// keep track of all grids the snake body occupies
	cells: [],
	// length of the snake. grows when eating an apple
	maxCells: 4
};
var apple = {
	x: 320,
	y: 320
};
var apple1 = {
	x: 320,
	y: 320
};

var megaApple = {
	x: 560,
	y: 560
};
function Snake() {

	var canvas
	var context
	// var score = 0;
	const [score, setScore] = useState(0)
	// canvas = document.getElementById('game');
	// context = canvas?.getContext('2d');
	useEffect(() => {
		// eslint-disable-next-line
		canvas = document.getElementById('game');
		// eslint-disable-next-line
		context = canvas.getContext('2d');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight - 10;
		document.addEventListener('keydown', (e) => gameControl(e));
		requestAnimationFrame(loop);

	}, [])


	const gameControl = (e) => {
		// prevent snake from backtracking on itself by checking that it's 
		// not already moving on the same axis (pressing left while moving
		// left won't do anything, and pressing right while moving left
		// shouldn't let you collide with your own body)
		// left arrow key
		if (e.which === 37 && snake.dx === 0) {
			snake.dx = -grid;
			snake.dy = 0;
		}
		// up arrow key
		else if (e.which === 38 && snake.dy === 0) {
			snake.dy = -grid;
			snake.dx = 0;
		}
		// right arrow key
		else if (e.which === 39 && snake.dx === 0) {
			snake.dx = grid;
			snake.dy = 0;
		}
		// down arrow key
		else if (e.which === 40 && snake.dy === 0) {
			snake.dy = grid;
			snake.dx = 0;
		}
	}


	// get random whole numbers in a specific range
	const getRandomInt = (min, max) => {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	const loop = () => {
		requestAnimationFrame(loop);
		// slow game loop to 15 fps instead of 60 (60/15 = 4)
		let fps = 8
		if (++count < fps) {
			return;
		}
		count = 0;
		context?.clearRect(0, 0, canvas.width, canvas.height);
		// move snake by it's velocity
		snake.x += snake.dx;
		snake.y += snake.dy;
		// wrap snake position horizontally on edge of screen
		if (snake.x < 0) {
			snake.x = canvas.width - grid;
		}
		else if (snake.x >= canvas.width) {
			snake.x = 0;
		}
		// wrap snake position vertically on edge of screen
		if (snake.y < 0) {
			snake.y = canvas.height - grid;
		}
		else if (snake.y >= canvas.height) {
			snake.y = 0;
		}
		// keep track of where snake has been. front of the array is always the head
		snake.cells.unshift({ x: snake.x, y: snake.y });
		// remove cells as we move away from them
		if (snake.cells.length > snake.maxCells) {
			snake.cells.pop();
		}
		// draw apple
		context.fillStyle = 'red';
		context.fillRect(apple.x, apple.y, grid - 1, grid - 1);
		context.fillRect(apple1.x, apple1.y, grid - 1, grid - 1);
		if (snake.cells.length >= 9 && snake.cells.length % 10 === 0) {
			context.fillStyle = 'white';
			context.fillRect(megaApple.x, megaApple.y, grid - 1, grid - 1);
		}
		// print game score
		setScore(snake.cells.length - 4);
		context.font = "20px Arial";
		context.fillStyle = '#5dea62';
		context.fillText(`Score - ${snake.cells.length}`,0,20);
		context.font = "15px Arial";
		context.fillStyle = 'white';
		context.fillText('White apples make you wild',0,40);
		// draw snake one cell at a time
		context.fillStyle = '#5dea62';
		snake.cells.forEach(function (cell, index) {
			// drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
			context.fillRect(cell.x, cell.y, grid - 1, grid - 1);
			// snake ate apple
			console.log(megaApple.x, megaApple.y,'pos');
			if ((cell.x === apple.x && cell.y === apple.y)) {
				snake.maxCells++;
				// canvas is 400x400 which is 25x25 grids 
				let w = canvas.width / grid;
				let h = canvas.height / grid;
				apple.x = getRandomInt(0, w) * grid;
				apple.y = getRandomInt(0, h) * grid;
			} else if (cell.x === apple1.x && cell.y === apple1.y) {
				snake.maxCells++;
				// canvas is 400x400 which is 25x25 grids 
				let w = canvas.width / grid;
				let h = canvas.height / grid;
				apple1.x = getRandomInt(0, w) * grid;
				apple1.y = getRandomInt(0, h) * grid;
			}else if(cell.x === megaApple.x && cell.y === megaApple.y){
				snake.maxCells = snake.maxCells + 2;
				// snake.maxCells++;
				// snake.maxCells++;
				// canvas is 400x400 which is 25x25 grids
				
			}
			// else if (snake.cells.length >= 9 && snake.cells.length % 10 === 0) {
			// 	// snake died
			// 	let w = canvas.width / grid;
			// 	let h = canvas.height / grid;
			// 	megaApple.x = getRandomInt(0, w) * grid;
			// 	megaApple.y = getRandomInt(0, h) * grid;
			// 	// snake.alive = false;
			// }
			// check collision with all cells after this one (modified bubble sort)
			for (var i = index + 1; i < snake.cells.length; i++) {
				// snake occupies same space as a body part. reset game
				if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
					let w = canvas.width / grid;
					let h = canvas.height / grid;
					console.log('GAME OVER');
					snake.x = 160;
					snake.y = 160;
					snake.cells = [];
					snake.maxCells = 4;
					snake.dx = grid;
					snake.dy = 0;
					apple.x = getRandomInt(0, w) * grid;
					apple.y = getRandomInt(0, h) * grid;
					apple1.x = getRandomInt(0, w) * grid;
					apple1.y = getRandomInt(0, h) * grid;
				}
			}
		});
	}

	return (
		<>
			<div className='snakeBg'>
				<div className='snake_game'>
					<canvas id="game"></canvas>
					{/* <h1>Your Score is {score}</h1> */}
				</div>
				{/* <div className='ComingSoon link' >
					<a href='/'>Home|</a>
				</div> */}
			</div>

		</>
	);
}

export default Snake;

