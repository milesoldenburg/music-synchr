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

require(['socketio', 'mustache', 'bootstrap'], function(io, Mustache){
    var socket = io.connect('http://localhost:3000');

    socket.on('tracklist', function(data){
        $(document).ready(function(){
            require(['text!html/tracks.html'], function(TracksTemplate){
                $('.page-container').html(Mustache.render(TracksTemplate, data));
            });
        });
    });
});
