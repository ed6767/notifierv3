// Spotify info things
const windowInfo = require('get-window-by-name');

const spotifyInfo = {
    // callback is playing, current track
    "check": callback=>{
        // Updates cycle
        // Get window info
        const SpotifyProcInfo = windowInfo.getWindowText("Spotify.exe");

        // Filter all background processes
        SpotifyProcInfo.filter(process=>{return process.processTitle !== '';});

        // If no active windows
        if (SpotifyProcInfo.length < 1) {
            callback(false);
            return;
        }

        // Isplaying = false if spotify in title, Callback with current title, let the main process handle the rest
        callback(!SpotifyProcInfo[0].processTitle.includes("Spotify"), SpotifyProcInfo[0].processTitle);
    }
};

exports.check = spotifyInfo.check; 