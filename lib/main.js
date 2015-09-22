// Dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var scanner = require('./scanner');

// Report crashes to our server
require('crash-reporter').start();

var mainWindow = null;

// Quit when all windows are closed
app.on('window-all-closed', function(){
    if (process.platform !== 'darwin') {
        db.shutdown();
        app.quit();
    }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function(){
    // Create the browser window.
    mainWindow = new BrowserWindow({width : 1000, height : 600});

    // Scan file system for tracks and send list to window when ready
    scanner.scan(function(){
        console.log('scan complete');

        mainWindow.webContents.on('did-finish-load', function(){
            mainWindow.webContents.send('tracklist', scanner.getTracks());
        });
    });

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/static/index.html');

    // Open the devtools.
    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function(){
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});
