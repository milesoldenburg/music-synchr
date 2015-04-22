# music-synchr

Music synchronization term project for Spring 2015 CPS512.01

## Documentation
### Dependencies
1. [node.js](https://nodejs.org/)

### Preparation
Put some test .mp3 files into ~/Music/music-synchr. The file scan is recursive so organization does not matter.

### Building
Install proper dependencies

    sudo npm install

Compile LESS and lint JS

    grunt

### Development
Run the watch task if you want to compile the CSS whenever a change to the LESS is made.

	grunt watch

### Running
To create a standalone server node:

    node .

To bootstrap a server to an existing network:

    node . <existing node ip-address> <existing node port>

After startup the IP address of the server will be output to the console. To access the interface, point your browser to the IP address at port 3000.

For example, if you were testing the server on your local machine, access [http://127.0.0.1:3000/](http://127.0.0.1:3000/).

## Contributing
### Style Guide
Soft tabs 4

## Authors

Miles Oldenburg  
[@milesoldenburg](https://github.com/milesoldenburg/)

Bobo Bose-Kolanu  
[@the-bobo](https://github.com/the-bobo)
