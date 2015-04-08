// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var scanner = require('./scanner');
var ip = require('ip');
var net = require('net');

// If arguments are present
if (process.argv.length > 2 && process.argv.length !== 4) {
    console.error('usage:');
    console.error('\tnode .');
    console.error('\tnode . <ip-address> <port>');

    process.exit(1);
} else if (process.argv.length === 4) { // There are command line arguments for bootstrapping to an existing node
    var existingAddress = process.argv[2];
    var existingPort = process.argv[3];

    console.log('bootstrap this machine to', existingAddress, 'port', existingPort);

    // Start of file system
    scanner.scan(function(){
        console.log('scan complete');

        // Create TCP connection to master node
        var client = net.createConnection({
            'host' : existingAddress,
            'port' : existingPort
        });

        // After we are connected, send the tracklist
        client.on('connect', function(){
            console.log('connected to master', existingAddress, 'port', existingPort);
            console.log('sending tracklist');

            client.write('this is my fake tracklist string', function(){
                console.log('tracklist sent');
            });
        });

        client.on('data', function(data){
            console.log('received data from node', socket.remoteAddress, 'port', socket.remotePort);
            console.log(new Buffer(data, 'utf8').toString());
        });

        client.on('close', function(){
            console.log('connection closed from node', socket.remoteAddress, 'port', socket.remotePort);
        });
    });
} else {
    // Start scan of file system
    scanner.scan(function(){
        console.log('scan complete');
    });
}

// Setup server
var httpPort = 3000;
var tcpPort = 3001;

/*** TCP SERVER ***/

var server = net.createServer(function(socket){
    console.log('node', socket.remoteAddress, 'port', socket.remotePort, 'connected');

    socket.on('data', function(data){
        console.log('received data from node', socket.remoteAddress, 'port', socket.remotePort);
        console.log(new Buffer(data, 'utf8').toString());
    });
});

server.listen(tcpPort, function(){
    console.log('tcp server listening on', ip.address(), 'port', tcpPort);
});

/*** HTTP SERVER ***/

// Set http server to listen on port
http.listen(httpPort, function(){
    console.log('http server listening on', ip.address(), 'port', httpPort);
});

// Route static requests to public
app.use(express.static('public'));

// Returns json array of all .mp3 in the client ~/Music/music-synchr dir
app.get('/tracks', function(req, res){
    res.send(scanner.getTracks());
});

// Test HTTP streaming by picking the first track found
app.get('/streamtest', function(req, res){
    var fs = require('fs');
    var readStream = fs.createReadStream(scanner.getTrackPaths()[0]);
    readStream.pipe(res);
});

// Streams the requested track over HTTP
// The trackpath parameter must be base64 encoded
app.get('/stream/:trackpath', function(req, res){
    var fs = require('fs');

    // Deocde path
    var trackpath = new Buffer(req.params.trackpath, 'base64').toString();
    console.log("User " + req.connection.remoteAddress + " requested track: " + trackpath);
    // Read file from path and stream back
    var readStream = fs.createReadStream(trackpath);
    readStream.pipe(res);
});

/*** WEB SOCKET ***/

// When a browser client makes a connection
io.on('connection', function(socket){
    console.log('received client connection', socket.id);

    // Send them all the tracks we have on this node
    socket.emit('tracklist', {
        'tracks' : scanner.getTracks()
    });

    // When a browser client sends back a control event
    socket.on('control', function(message){
        console.log('received', message.type, 'control from client', socket.id);

        if (message.address !== undefined && message.address !== null) {
            console.log('address', message.address, 'track', message.track);
        }

        // Broadcast client message to all other nodes
        socket.broadcast.emit('control', message);
    });

    // Log when a client disconnects
    socket.on('disconnect', function(){
        console.log('disconnected client connection', socket.id);
    });
});
