// Trying node.js for the first time :p
// ARDUNotifier v3 Controller - (c) Ed E 2020

const display = require("./display").driver; // include display driver

// Main runner
exports.notifier = arrayOfTasks => {
    console.log("Connecting...");
    let i = 0; // index in array of tasks, 0 = default
    display.connect(()=>{
        console.log("Connected!");
        
        let downJustPressed = false;
        setInterval(()=>{
            if (display.buttons.current == "NONE" && downJustPressed) {
                downJustPressed = false;
                // Go down in the array
                i += 1;
                if (i > arrayOfTasks.length - 1 || i < 0) i = 0; // reset if not in range
                arrayOfTasks[i].load(); // run load this tick, next time round our thing will actually be run

            } else if (display.buttons.current == "DOWN") {
                // Show a notif RE changing over
                downJustPressed = true;
                display.showFrom(`
                DSP Switch to:
                ${arrayOfTasks[(i + 1 > arrayOfTasks.length - 1 || i + 1 < 0) ? 0 : i + 1].title}
                `); // DON'T FORGET, WE NEED TO RECALL THE START WHEN DISABLED
            } else {
                arrayOfTasks[i].tick(); // excecute main tick loop
            }
        }, 50); 
    });
};