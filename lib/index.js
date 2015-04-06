// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var scanner = require('./scanner');
var ip = require('ip');

// If arguments are present
if (process.argv.length > 2 && process.argv.length !== 4) {
    console.error('usage:');
    console.error('\tnode .');
    console.error('\tnode . <ip-address> <port>');

    process.exit(1);
} else { // There are command line arguments for bootstrapping to an existing node
    var existingAddress = process.argv[2];
    var existingPort = process.argv[3];

    console.log('bootstrap this machine to', existingAddress, ':', existingPort);
}

// Start of file system
scanner.scan();

// Setup server
var port = 3000;

// Set server to listen on port 3000
http.listen(port, function(){
    console.log('server listening on', ip.address(), 'port', port);
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
