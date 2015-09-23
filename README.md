# music-synchr

Music-synchr is a distributed music network app that is built with electron.io.

## Dependencies
1. [node.js](https://nodejs.org/)

## Preparation
Put some test .mp3 files into ~/Music/music-synchr. The file scan is recursive so organization does not matter.

## Building
Install proper dependencies

    npm install

Compile LESS

    gulp less

Run the watch task if you want to compile the CSS whenever a change to the LESS is made.

	gulp watch
	
## Testing
Lint all code

    gulp lint

## Running  
    npm start
