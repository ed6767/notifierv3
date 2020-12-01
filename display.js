/*
ARDUNotifier v3 Driver - (c) Ed E 2020
#define btnRIGHT  0
#define btnUP     1
#define btnDOWN   2
#define btnLEFT   3
#define btnSELECT 4
#define btnNONE   5
*/

// Init things 
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

// Stop flicker
let oldLine1 = "";
let oldLine2 = "";

// Set up class
var display = {
    // Commands list
    "commands" : {
        "clear" : "`c",
        "readButtons" : "`b", // read buttons - see above for ref
        "powerOff" : "`p", // shut down/suspend
        "nextLine" : "`2" // move cursor to line 2
    },

    "buttons" : {
        "map" : [ // for converting byte to value
            'RIGHT',
            'UP',
            'DOWN',
            'LEFT',
            'SELECT',
            'NONE'
        ],

        "current" : "NONE" // current button value
    }, 

    "scrollTop": "", // line1
    "scrollText" : "", // supports bottom row only
    "scrolling" : false,
    "scrollOffset": 0,

    "connect" : callback=>{
        // Connect to display
        // Open port to COM11
        display.port = new SerialPort("COM13", { baudRate: 500000, databits: 8 });
        display.parser = new Readline();
        display.port.pipe(display.parser);

        // Button press handlers
        display.parser.on('data', line => {
            // Convert to text
            display.buttons.current = display.buttons.map[line.trim()];
        });

        // Scroll handler
        setInterval(()=>{
            if (display.scrolling) {

                let stringToScroll = "  " + display.scrollText + "     " + display.scrollText.substring(0, 16); // make string for smooth return when scroll complete
                let scrollStr = stringToScroll.substring(display.scrollOffset, display.scrollOffset + 16);
                display.port.write(
                    display.commands.clear +
                    display.scrollTop +
                    display.commands.nextLine +
                    scrollStr
                );

                // Up ofset
                display.scrollOffset += 1;
                
                if (display.buttons.current == "RIGHT") {
                    // Jump right a bit more
                    display.scrollOffset += 4;
                } else if (display.buttons.current == "LEFT") {
                    // Jump back
                    display.scrollOffset -= 2;
                }

                // Reset test
                if (display.scrollOffset > stringToScroll.length - 16) {
                    // Reset
                    display.scrollOffset = 3;
                }
            }
        }, 500);

        setTimeout(()=>{
            callback();
        }, 2000); // wait to get past boot screen
    },

    "show" : (line1, line2) => {
        if ((line1 == oldLine1) && (line2 == oldLine2)) return; // to stop flicker do not update if same
        oldLine1 = line1; oldLine2 = line2;

        // Test if scrolling
        if (line2.length > 16) {
            display.scrolling = true;
            display.scrollOffset = 0;
            display.scrollText = line2;
            display.scrollTop = line1;
        } else {
            display.scrolling = false;
        }

        // Display on screen
        display.port.write(
            display.commands.clear +
            line1.substring(0,16) +
            display.commands.nextLine +
            line2.substring(0,16)
        );
    },

    "showFrom" : text => display.show(text.trim().split("\n")[0].trim(), text.trim().split("\n")[1].trim()),  // shows in a standard way by spliting at the newline,

    "backlightLevel" :255,
    "backlight" : level=>{
        // Set backlight brightness via byte
        display.port.write((()=>{
            let buff = Buffer.alloc(3);
            buff[0] = 0x60; // Special command distingush
            buff[1] = 0x6C; // Backlight command
            buff[2] = level; // Byte level
            return buff; // to send
        })());
        display.backlightLevel = level;
    },

    "powerOff" : ()=> {
        // Power off display / suspend CPU
        display.port.write(display.commands.powerOff);
    }
};

// Return to other modules
exports.driver = display;