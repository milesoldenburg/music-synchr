var ipc = require('ipc');


ipc.on('tracklist', function(tracklist){
    console.log(tracklist);
});
