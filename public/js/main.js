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
        socket.on('tracklist', function(data){
            require(['text!html/tracks.html'], function(TracksTemplate){
                $('.page-container').html(Mustache.render(TracksTemplate, data));
            });
        });

        Player.delegateEvents();
    });
});
