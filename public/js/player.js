define(['jquery'], function($){

    var socket = null;
    var port = null;
    var isPlaying = false;
    var player = $('#audio-player').get(0);

    /**
     * Pauses the audio
     */
    var pause = function(){
        // Pause player
        player.pause();
        isPlaying = false;

        // Set styles
        $('.player-controls button.play-control i').removeClass('fa-pause').addClass('fa-play');

        // Emit event
        emitControl({
            'type' : 'pause'
        });
    };

    /**
     * Resumes the audio
     */
    var play = function(){
        // Play player
        player.play();
        isPlaying = true;

        // Set styles
        $('.player-controls button.play-control i').removeClass('fa-play').addClass('fa-pause');
    };

    /**
     * Loads a new track into the player
     *
     * @param address   The address of the machine the track resides on
     * @param track     The selected track
     */
    var load = function(address, track){
        var path = 'http://' + address + ':' + port + '/stream/' + track;

        // Load track into player
        $('#audio-player source').attr('src', path);
        player.load();
    };

    /**
     * Remove markings from all other tracks
     */
    var setDefaultRowStyles = function(){
        $('table.tracklist tr').removeClass('info now-playing');
        $('table.tracklist i').removeClass('fa-play-circle').addClass('fa-play-circle-o');
    };

    /**
     * Emits a control event back to the node
     *
     * @param control
     */
    var emitControl = function(control){
        socket.emit('control', control);
    };

    /**
     * Set all event listeners
     */
    var delegateEvents = function(){
        // When a track play/pause button is clicked
        $(document).on('click', 'table.tracklist i', function(event){
            // Set the status
            if ($(event.currentTarget).parents('tr').hasClass('now-playing')) { // Pushed play/pause on running track
                if (isPlaying) { // Pause if currently playing
                    pause();
                } else { // Play if currently paused
                    play();

                    // Emit event
                    emitControl({
                        'type' : 'play'
                    });
                }
            } else { // Pushed play on a new track
                setDefaultRowStyles();

                // Update icon to show that this track is currently playing
                $(event.currentTarget).removeClass('fa-play-circle-o').addClass('fa-play-circle').parents('tr').addClass('info now-playing');

                // Get track data
                var address = $(event.currentTarget).parents('tr').attr('data-address');
                var track = $(event.currentTarget).parents('tr').attr('data-track');

                // Load new track and play
                load(address, track);
                play();

                // Emit event
                emitControl({
                    'type' : 'new',
                    'address' : address,
                    'track' : track
                });
            }
        });

        // When the control play/pause button is clicked
        $(document).on('click', '.player-controls button.play-control', function(){
            if (isPlaying) {
                pause();
            } else if ($('table.tracklist tr.now-playing').size() > 0) { // If there is a track paused
                play();

                // Emit event
                emitControl({
                    'type' : 'play'
                });
            } else { // No track is paused but the play button has been clicked so play the first track in the list
                // Get track data
                var firstRow = $('table.tracklist tr:eq(1)');
                var address = firstRow.attr('data-address');
                var track = firstRow.attr('data-track');

                // Update styles
                firstRow.addClass('info now-playing');
                firstRow.find('i').removeClass('fa-play-circle-o').addClass('fa-play-circle');

                // Load new track and play
                load(address, track);
                emitControl({
                    'type' : 'new',
                    'address' : address,
                    'track' : track
                });
            }
        });

        // When the forward button is clicked
        $(document).on('click', '.player-controls button.forward-control', function(){
            if ($('table.tracklist tr.now-playing').size() > 0) { // Only forward track if one has been selected already
                // Get next track row
                var nextRow = $('table.tracklist tr.now-playing').next();
                var address = nextRow.attr('data-address');
                var track = nextRow.attr('data-track');

                setDefaultRowStyles();

                // Update styles
                nextRow.addClass('info now-playing');
                nextRow.find('i').removeClass('fa-play-circle-o').addClass('fa-play-circle');

                // Load new track and play
                load(address, track);
                play();

                // Emit event
                emitControl({
                    'type' : 'forward',
                    'address' : address,
                    'track' : track
                });
            }
        });

        // When the backward button is clicked
        $(document).on('click', '.player-controls button.backward-control', function(){
            if ($('table.tracklist tr.now-playing').size() > 0) { // Only backward track if one has been selected already
                if (isPlaying && player.currentTime > 3) { // If already playing then restart the track if we are after 3 seconds of start
                    player.currentTime = 0;

                    // Emit event
                    emitControl({
                        'type' : 'restart'
                    });
                } else { // Otherwise play previous track
                    // Get previous track row
                    var previousRow = $('table.tracklist tr.now-playing').prev();
                    var address = previousRow.attr('data-address');
                    var track = previousRow.attr('data-track');

                    setDefaultRowStyles();

                    // Update styles
                    previousRow.addClass('info now-playing');
                    previousRow.find('i').removeClass('fa-play-circle-o').addClass('fa-play-circle');

                    // Load new track and play
                    load(address, track);
                    play();

                    // Emit event
                    emitControl({
                        'type' : 'backward',
                        'address' : address,
                        'track' : track
                    });
                }
            }
        });
    };

    /**
     * Initialzes the player controls
     *
     * @param _socket   The socket.io web socket to communicate with the node
     * @param _port     The port the node is listening on
     */
    var init = function(_socket, _port){
        socket = _socket;
        port = _port;

        delegateEvents();
    };

    return {
        'init' : init
    };

});
