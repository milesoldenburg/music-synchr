// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var scanner = require('./scanner');
var ip = require('ip');
var clientio = require("socket.io-client");

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

        // Connect to master node
        var client = clientio.connect('http://' + existingAddress + ':' + existingPort);

        client.on('connect', function(){
            // Send tracklist
            client.emit('tracklist', scanner.getTracks());
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

    socket.on('tracklist', function(tracklist){
        console.log('received tracklist from client', socket.id);

        // Send tracklist to everyone but the one we recieved from
        socket.broadcast.emit('tracklist-add', tracklist);
    });
    
    // When disconnect event fires remove stale tracks
    socket.on('disconnect', function(){
    socket.emit('stale-tracks'); //ask client for its tracks to mark for removal
    console.log('client attempting disconnect, asked it for stale-tracks', socket.id);
    });

    // When browser client returns stale-tracklist
    socket.on('stale-tracklist', function(data){
        console.log('received stale-tracks from client', socket.id);
        socket.broadcast.emit('tracklist-remove', data);
    });
    
});
