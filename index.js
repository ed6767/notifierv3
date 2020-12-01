// (c) Ed E 2020

const prompts = require('prompts');
const display = require("./display").driver; // include display driver
const notifier = require("./notifier").notifier; // notifier software
const spotifyCheck = require("./spotifyInfo").check; // spotify 

// Our varibles
let lastTrack = "";

// Start and pass the list
notifier([
    // 0 and default, clock/spotify
    {
        "title" : "Clock / Spotify",
        "load" : ()=>{lastTrack = "";}, // reset last track on load
        
        // every 50ms
        "tick" : ()=>spotifyCheck((isPlaying, currentTrack)=>{
            if (isPlaying) { 
                if (currentTrack == lastTrack) return; // don't bother if the same track
                lastTrack = currentTrack;

                // show track
                display.showFrom(`
                Now Playing:
                ${currentTrack}
                `);
            } else { // nothing is playing
                // Clear last track so it can reset
                lastTrack = "";

                let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // current time in format HH:MM
                let currentMonth = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][new Date().getMonth()];
                let currentDate = new Date().getDate();

                // Display a clock - top row time, bottom row date (+0 to keep 2 digit if < 10) + month
                display.showFrom(`
                ${currentTime} 
                ${(currentDate < 10 ? "0" + currentDate : currentDate)} ${currentMonth}
                `);
            }
        })
    }, // end clock/spotify

    {
        "title" : "Custom Text",
        "load" : ()=>display.show("Custom Text Mode", "Press SELECT to enter new text in the driver. Do this now :)"),
        "tick" : async ()=>{
            if (display.buttons.current == "SELECT") {
                display.show("Waiting...", "Please open driver and enter text.");

                // Select button, so prompt
                const line1 = await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Line 1 text:',
                    validate: value => value.length > 16 ? `Max 16 Characters` : true
                });

                const line2 = await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Line 2 text:',
                });

                display.show(line1.value, line2.value); // show
            }
        }
    },

    {
        "title" : "Brightness",
        "load": ()=>{},

        "tick" : ()=>{
            // Display current backlight level
            // Generate text progress bar
            let progressLevel = Math.round((display.backlightLevel / 255) * 14);
            let textProgress = "*".repeat(progressLevel) + " ".repeat(14 - progressLevel);
            
            display.show("Brightness: " + Math.round((display.backlightLevel / 255) * 100) + "%", `[${textProgress}]`);

            // Push Left / Right to adjust brightness
            if (display.buttons.current == "LEFT") {
                if (display.backlightLevel > 7) { // if we will be sent negative
                    display.backlight(display.backlightLevel - 7); // decrease brightness
                } else {
                    display.backlight(0); // 0 is minimum
                }
            } else if (display.buttons.current == "RIGHT") {
                if (display.backlightLevel < 248) { // if we're gonna go over the max
                    display.backlight(display.backlightLevel + 7);
                } else {
                    display.backlight(255); // 255 is maximum
                }
            } 
        }
    },

    {
        "title" : "Shut Down",
        "load" : ()=>{},
        "tick" : ()=>{
            // Show a note
            display.showFrom(`
            Shut down?
            Press SELECT to power off and end driver, or press UP/DOWN to switch displays.
            `);

            if (display.buttons.current == "SELECT") {
                // if select pressed then shut down and exit
                display.powerOff(); // goodbye
                setTimeout(()=>process.exit(), 250); // exit driver after 250ms
            }
        }
    }

]);