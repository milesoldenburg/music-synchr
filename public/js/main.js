require.config({
    'baseUrl' : 'js/lib',
    'paths' : {
        'bootstrap' : 'bootstrap/bootstrap.min',
        'html' : '../../html',
        'jquery' : 'jquery/jquery.min',
        'mustache' : 'mustache/mustache.min',
        'socketio' : 'socket.io-client/socket.io',
        'text' : 'text/text'
    },
    'shim' : {
        'bootstrap' : {
            'deps' : ['jquery']
        },
        'socketio' : {
            'exports' : 'io'
        }
    },
    'urlArgs' : 'bust=' + (new Date()).getTime()
});

require(['socketio', 'mustache', '../player', 'bootstrap', '../../lib/scanner.js'], function(io, Mustache, Player){
    $(document).ready(function(){
        // Get uri and port
        var uri = document.location.href;
        var port = uri.split('/')[2].split(':')[1];

        // Connect to node
        var socket = io.connect(uri);

        // When tracklist is received from node
        socket.on('tracklist', function(data){
            // Render into page
            require(['text!html/tracks.html'], function(TracksTemplate){
                $('.page-container').html(Mustache.render(TracksTemplate, data));
            });
        });

        // When tracklist updates are received from node
        socket.on('tracklist-add', function(data){
            require(['text!html/tracks-add.html'], function(TracksAddTemplate){
                $('table.tracklist tbody').append(Mustache.render(TracksAddTemplate, data));
            });
        });
        
        // When tracklist-remove notice is received from node
        socket.on('tracklist-remove', function(data){
            //remove the tracks
        });

        // When stale-tracks notice is received from node
        socket.on('stale-tracks', function(){
            //provide a list of your tracks so server can remove them
            scanner.scan(function(){});
            socket.emit('stale-tracklist', { 'stale-tracks' : scanner.getTracks() });
        });
        
        Player.init(socket, port);

        // When player control is received from node
        socket.on('control', function(message){
            console.log('received', message.type, 'control from server');

            if (message.address !== undefined && message.address !== null) {
                console.log('address', message.address, 'track', message.track);
            }

            // Send control to player
            Player.receiveExternalControl(message);
        });
    });
});
