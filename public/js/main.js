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

require(['socketio', 'mustache', '../player', 'bootstrap'], function(io, Mustache, Player){
    var port = 3000;

    $(document).ready(function(){
        // Connect to node
        var socket = io.connect('http://localhost:' + port);

        // When tracklist is received from node
        socket.on('tracklist', function(data){
            // Render into page
            require(['text!html/tracks.html'], function(TracksTemplate){
                $('.page-container').html(Mustache.render(TracksTemplate, data));
            });
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
