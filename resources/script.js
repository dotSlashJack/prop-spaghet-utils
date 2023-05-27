//Jack Hester for AeroNU

//these are the main things you need to update here at the top

//where the json is coming from (pi or local testing)
//const socket = new WebSocket('ws://localhost:9002/ws');
const socket = new WebSocket('ws://raspberrypi.local:9002/ws');
//const socket = new WebSocket('ws://169.254.90.98:9002/ws');
//const socket = new WebSocket('ws://spaghetti-pi.local:9002/ws');


//where your states/batches are defined
const stateSetJSON = "../resources/STATE_SETS.json";
const valveNameJSON = "../resources/VALVE_NAMES.json";
const sequenceNameJSON = "../resources/SEQUENCE_NAMES.json"

const minSafePneumaticPressure = 80.0; //psi that we acquire "safe" for operation
const throttleInterval = 200; //ms between value/graph updates


//---------//

alert("Don't forget to turn on the logger!");

let stateData = null;
const defaultBatch = "HOT_FIRE";


//----- HANDLE OVERRIDE BUTTON JSON --//

let valveNames = [];
fetch(valveNameJSON)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        valves = data[0].valves;
        //valveNames = data[0].valves

        const overrideGridOx = document.getElementById('override-buttons-ox');
        const overrideGridFuel = document.getElementById('override-buttons-fuel');
        const overrideGridSuppression = document.getElementById('override-buttons-suppression');

        // Populate testType dropdown with options
        valves.forEach(valve => {
            valveNames.push(valve.name);
            //handle numeric entry fields (for fuel proportional this is time in seconds over which to open the valve)
            if (valve.type === "fuel_proportional") {
                const textOption = document.createElement('input');
                textOption.className = 'entry-fuel';
                textOption.id = valve.name + " (s)";
                textOption.id = valve.name;
                textOption.value = '0';

                let namedEntry = document.createElement('div');
                namedEntry.className = "select-with-dropdown";
                namedEntry.style = "color: rgb(252, 127, 32); font-size: large;";
                if (valve.name === "kerFlowTime") {
                    namedEntry.append(valve.name + " (s)");
                } else {
                    namedEntry.append(valve.name);
                }
                namedEntry.append(textOption);
                overrideGridFuel.appendChild(namedEntry);
            }
            //handle non-user-entry dropdowns
            else {
                const select = document.createElement('select');
                if (valve.type === "oxidizer") {
                    select.className = 'dropdown-ox';
                } else if (valve.type === "fuel") {
                    select.className = 'dropdown-fuel';
                } else if (valve.type === "fire_suppress") {
                    select.className = 'dropdown-suppression';
                }
                const option1 = document.createElement('option');
                const option2 = document.createElement('option');

                option1.value = 'OPEN';
                option1.textContent = 'OPEN';
                option2.value = 'CLOSED';
                option2.textContent = 'CLOSED';
                select.appendChild(option1);
                select.appendChild(option2);

                select.id = valve.name;

                let namedSelect = document.createElement('div');
                namedSelect.className = "select-with-dropdown";
                if (valve.type === "oxidizer") {
                    namedSelect.style = "color: lightblue; font-size: large;";
                } else if (valve.type === "fuel" || valve.type === "fuel_proportional") {
                    namedSelect.style = "color: rgb(252, 127, 32); font-size: large;";
                } else if (valve.type === "fire_suppress") {
                    namedSelect.style = "color: #DCD933; font-size: large;";
                }
                namedSelect.append(valve.name);
                namedSelect.append(select);
                //namedSelect.innerHTML = "<p>"+name+"</p><br>"+select.ele;
                if (valve.type === "oxidizer") {
                    overrideGridOx.appendChild(namedSelect);
                } else if (valve.type === "fuel") {
                    overrideGridFuel.appendChild(namedSelect);
                } else if (valve.type === "fire_suppress") {
                    overrideGridSuppression.appendChild(namedSelect);
                }
            }
        });
    });


//createDropdownGrid();


//----- HANDLE STATE MENUS CREATION --///

fetch(stateSetJSON)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        testType = data;

        // Populate testType dropdown with options
        var testTypeDropdown = document.getElementById("testTypeDropdown");
        testType.forEach(function (testType) {
            var option = document.createElement("option");
            option.text = testType.name;
            option.value = testType.name;
            testTypeDropdown.add(option);
        });

        stateData = data;

        testTypeDropdown.value = defaultBatch;

        // Trigger initial update of batches and commands
        updateBatches();
        //updateSequences();
    });

// functions to define the state sets iteratively from json
var testType = [];

function updateBatches() {
    var selectedtestType = document.getElementById("testTypeDropdown").value;
    var batchDropdown = document.getElementById("batchDropdown");

    // Clear existing options in batch dropdown
    batchDropdown.innerHTML = "";

    // Add new options based on selected testType
    testType.forEach(function (testType) {
        if (testType.name === selectedtestType) {
            testType.batches.forEach(function (batch) {
                var option = document.createElement("option");
                option.text = batch.name;
                option.value = batch.name;
                batchDropdown.add(option);
            });
        }
    });

    // Trigger update of commands and sequences
    updateCommands();
    updateSequences();
}


function updateCommands() {
    var selectedtestType = document.getElementById("testTypeDropdown").value;
    var selectedBatch = document.getElementById("batchDropdown").value;
    var commandDropdown = document.getElementById("commandDropdown");

    // Clear existing options in command dropdown
    commandDropdown.innerHTML = "";

    // Add new options based on selected testType and batch
    testType.forEach(function (testType) {
        if (testType.name === selectedtestType) {
            testType.batches.forEach(function (batch) {
                if (batch.name === selectedBatch) {
                    batch.commands.forEach(function (command) {
                        var option = document.createElement("option");
                        option.text = command.name;
                        option.value = command.value;
                        commandDropdown.add(option);
                    });
                }
            });
        }
    });
}

function updateSequences() {
    var selectedtestType = document.getElementById("testTypeDropdown").value;

    // Clear existing options in command dropdown
    sequenceDropdown.innerHTML = "";

    //sequences
    let sequenceNames = [];
    fetch(sequenceNameJSON)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            sequenceNames = data[selectedtestType];
            //console.log(sequenceNames);

            // Populate sequence dropdown with options
            var sequenceTypeDropdown = document.getElementById("sequenceDropdown");
            sequenceTypeDropdown.className = 'dropdown';
            sequenceNames.forEach(name => {
                var option = document.createElement("option");
                option.text = name;
                option.value = name;
                //sequenceTypeDropdown.add(option);

                sequenceTypeDropdown.add(option);
            });
        });
}

///


let pressureCheckboxValue = "pressureSensorsChecked";
let tempCheckboxValue = "tempSensorsChecked";
let loadCheckboxValue = "loadSensorsChecked";
let pressureCheckbox2Value = "";
let enableOverrideCheckboxValue = "";
let enableSequenceCheckboxValue = "";
let enableHotbuttonCheckbox = "";

//see if things are checked/unchecked to update what's on the graphs
const checkbox_1 = document.getElementById("checkbox_1");
checkbox_1.addEventListener("change", function () {
    pressureCheckboxValue = this.checked ? this.value : "";
    console.log(pressureCheckboxValue);
    if (pressureCheckboxValue === "pressureSensorsChecked") {
        chartData_1 = [];
    }
});

const checkbox_2 = document.getElementById("checkbox_2");
checkbox_2.addEventListener("change", function () {
    tempCheckboxValue = this.checked ? this.value : "";
    console.log(tempCheckboxValue);
    if (tempCheckboxValue === "tempSensorsChecked") {
        chartData_2 = [];
    }
});

const checkbox_3 = document.getElementById("checkbox_3");
checkbox_3.addEventListener("change", function () {
    loadCheckboxValue = this.checked ? this.value : "";
    console.log(loadCheckboxValue);
    if (loadCheckboxValue === "loadSensorsChecked") {
        chartData_3 = [];
    }
});

const checkbox_4 = document.getElementById("checkbox_4");
checkbox_4.addEventListener("change", function () {
    pressureCheckbox2Value = this.checked ? this.value : "";
    console.log(pressureCheckbox2Value);
    if (pressureCheckbox2Value === "pressureSensors2Checked") {
        chartData_4 = [];
    }
});

const overrideCheckbox = document.getElementById("overrideCheckbox");
overrideCheckbox.addEventListener("change", function () {
    enableOverrideCheckboxValue = this.checked ? this.value : "";
    console.log(enableOverrideCheckboxValue);
    if (enableOverrideCheckboxValue === "enableOverrideChecked") {
        document.getElementById("overrideBtn").disabled = false;
    } else {
        document.getElementById("overrideBtn").disabled = true;
    }
});

const sequencerCheckbox = document.getElementById("sequenceCheckbox");
sequencerCheckbox.addEventListener("change", function () {
    enableSequenceCheckboxValue = this.checked ? this.value : "";
    console.log(enableSequenceCheckboxValue);
    if (enableSequenceCheckboxValue === "sequenceBoxChecked") {
        document.getElementById("sequencerButton").disabled = false;
    } else {
        document.getElementById("sequencerButton").disabled = true;
    }
});

const hotbuttonCheckbox = document.getElementById("hotbuttonCheckbox");
hotbuttonCheckbox.addEventListener("change", function () {
    enableHotbuttonCheckbox = this.checked ? this.value : "";
    console.log(hotbuttonCheckbox);
    if (enableHotbuttonCheckbox === "hotbuttonBoxChecked") {
        document.getElementById("abortBtn").disabled = false;
        document.getElementById("onlineSafeBtn").disabled = false;
        document.getElementById("pauseBtn").disabled = false;
        document.getElementById("fireSuppressBtn").disabled = false;
    } else {
        document.getElementById("abortBtn").disabled = true;
        document.getElementById("onlineSafeBtn").disabled = true;
        document.getElementById("pauseBtn").disabled = true;
        document.getElementById("fireSuppressBtn").disabled = true;
    }
});

///

// Sensor Value box population

const sensorContainer = document.getElementById('sensorContainer');
const errorDiv = document.getElementById('error');
let lastUpdateTime = 0;

function createSensorDiv(sensorName, sensorValue, unit) {
    const sensorDiv = document.createElement('div');
    sensorDiv.className = 'sensor-value';
    sensorDiv.textContent = `${sensorName}: ${sensorValue.toFixed(4)} ${unit}`;
    return sensorDiv;
}

function displaySensors(sensorGroup, groupName) {
    Object.entries(sensorGroup).forEach(([key, sensor]) => {
        //const sensorDiv = createSensorDiv(`${groupName} - ${key}`, sensor.sensorReading, sensor.unit);
        const sensorDiv = createSensorDiv(`${key}`, sensor.sensorReading, sensor.unit);
        sensorContainer.appendChild(sensorDiv); //TODO
    });
}

/*function displayPressureSensorsOrganized(pressureSensorData){
    //console.log(pressureSensorData.OxTank);
    var OxTank = document.getElementById('OxTankVal');
    var FuelTank = document.getElementById('FuelTankVal');
    var N2Press = document.getElementById('N2PressVal');
    var Chamber = document.getElementById('ChamberVal');
    var Venturi_1 = document.getElementById('Venturi_1Val');
    var Venturi_2 = document.getElementById('Venturi_2Val');
    var Pneumatic = document.getElementById('PneumaticVal');

    //console.log(pressureSensorData.OxTank.sensorReading);

    OxTank.innerHTML = "Ox_Tank:&nbsp" + pressureSensorData.OxTank.sensorReading.toFixed(3);
    FuelTank.innerHTML = "Fuel_Tank:&nbsp" + pressureSensorData.FuelTank.sensorReading.toFixed(3);
    N2Press.innerHTML = "N2_Press:&nbsp;" + pressureSensorData.N2Press.sensorReading.toFixed(3);
    Chamber.innerHTML = "Chamber:&nbsp;" + pressureSensorData.Chamber.sensorReading.toFixed(3);
    Venturi_1.innerHTML = "Venturi_1:&nbsp;" + pressureSensorData.Venturi_1.sensorReading.toFixed(3);
    Venturi_2.innerHTML = "Venturi_2:&nbsp;" + pressureSensorData.Venturi_2.sensorReading.toFixed(3);
    Pneumatic.innerHTML = "Pneumatic:&nbsp;" + pressureSensorData.Pneumatic.sensorReading.toFixed(3);

    //FuelTank.innerHTML = pressureSensorData.OxTank.sensorReading;
}*/

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
});

let currJSONData = "";

socket.addEventListener('message', (event) => {
    try {
        const data = JSON.parse(event.data);
        //console.log(data);
        processData(data);
        updateValveStates(data);
        currJSONData = data;
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.textContent = 'Error processing data: ' + error.message;
        console.error('Error processing data:', error);
    }
});

function updateValveStates(data) {
    if (enableOverrideCheckboxValue === "enableOverrideChecked") { //don't change while in override
        return;
    }
    for (v of valveNames) {
        //console.log(v);
        if(v === "kerFlowPneumatic"){
            continue;
        }
        //console.log(v);
        let valveReading = data.data.valves[v].valveState;
        let valveDocText = document.getElementById(v);
        valveDocText.value = valveReading;
        if (valveReading === "OPEN") {
            valveDocText.style.color = "lightgreen";
        } else if (valveReading === "CLOSED") {
            valveDocText.style.color = "rgb(231, 76, 97)";
        }
    }
}

var stateHTML = document.getElementById("lastStateCommandSent");

sendStateCommand = function () {
    var stateToSet = document.getElementById("commandDropdown").value;
    var command = { command: "SET_STATE", newState: stateToSet };
    socket.send(JSON.stringify(command));

    stateHTML.innerHTML = "&nbsp;Last Sent: " + stateToSet;
    console.log("sent ", stateToSet, " command");
}

sendSequenceCommand = function () {
    //{"command": "START_SEQUENCE", "sequence": sequence}
    var sequenceToSet = document.getElementById("sequenceDropdown").value;
    if (sequenceToSet === "SELECT SEQUENCE") {
        console.log("no sequence selected so not sending");
        return;
    } else {
        var command = { command: "START_SEQUENCE", sequence: sequenceToSet };
        socket.send(JSON.stringify(command));

        stateHTML.innerHTML = "&nbsp;Last Sent: " + sequenceToSet;
        console.log("sent ", sequenceToSet, " sequence command");

        //disable the sequencer button for 1.5 seconds to prevent double clicks
        var sequencerButton = document.getElementById("sequencerButton");
        sequencerButton.disabled = true;
        setTimeout(() => {
            console.log("re-enabling sequencer button");
            sequencerButton.disabled = false;
        }, 1500);
    }
}

sendOverrideCommand = function () {
    var activeElementObj = "";
    for (v of valveNames) {
        //console.log(v);
        let valve_value = document.getElementById(v).value;
        //TODO: remove this and make kero valve its own thing again
        if (v === "kerFlow"){
            valve_value = parseInt(valve_value);
            activeElementObj = activeElementObj + '\"' + v + '\"' + ': ' + valve_value + ',';
        } else if(v === "kerFlowTime"){
            valve_value = parseInt(valve_value * 1000);
            activeElementObj = activeElementObj + '\"' + v + '\"' + ': ' + valve_value + ',';
        }
        else {
            activeElementObj = activeElementObj + '\"' + v + '\"' + ': ' + '\"' + valve_value + '\",';
        }
        //activeElementObj = activeElementObj + '\"' + v + '\"' + ': ' + '\"' + valve_value + '\",';
        //activeElementObj = activeElementObj + '\"\"' + v + '_override' + '\"' + ': ' + '\"' + document.getElementById(v + "_override").value + '\",';
    }
    //remove comma at end to create valid json
    activeElementObj = activeElementObj.substring(0, activeElementObj.lastIndexOf(",")) + activeElementObj.substring(activeElementObj.lastIndexOf(",") + 1);
    var obj = '{'
        + '"command": "SET_ACTIVE_ELEMENTS",'
        + '"activeElements": {'
        + activeElementObj
        + '}'
        + '}';
    socket.send(obj);
    console.log(obj);

    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes(); // Be careful! January is 0, not 1
    const currentSeconds = currentDate.getSeconds();
    const dateString = currentHour + ":" + (currentMinutes) + ":" + currentSeconds;
    document.getElementById("lastSentOverrideAt").innerHTML = "Last sent override at: " + dateString;

}

function forceSetOnlineSafe() {
    var command = { command: "SET_STATE", newState: "ONLINE_SAFE" };
    socket.send(JSON.stringify(command));
    stateHTML.innerHTML = "&nbsp;Last Sent: ONLINE_SAFE";
    console.log("sent force online safe");
}

function forceAbort() {
    var abortCommand = { command: "ABORT_SEQUENCE" }
    socket.send(JSON.stringify(abortCommand));
    console.log("sent abort command");

    var command = { command: "START_SEQUENCE", sequence: "ABORT" };
    socket.send(JSON.stringify(command));
    stateHTML.innerHTML = "&nbsp;Last Sent: ABORT (Abort Sequence)";
    console.log("sent abort sequence");
}

function forceFireSuppress() {
    console.log("sent fire suppress command");
}

function forcePause() {
    var abortCommand = { command: "ABORT_SEQUENCE" }
    socket.send(JSON.stringify(abortCommand));
    console.log("sent abort sequence command");

    //var command = { command: "START_SEQUENCE", sequence: "PAUSE" };
    //socket.send(JSON.stringify(command));
    //stateHTML.innerHTML = "&nbsp;Last Sent: PAUSE FLOW (ALL_PRESS)";
    console.log("sent force pause flow");

}


function downloadJSONFile() {
    const filename = "curr_json.json";

    // Convert the JavaScript object into a JSON string
    const json = JSON.stringify(currJSONData);

    // Create a file object using the JSON string and set the type as 'application/json'
    const file = new Blob([json], { type: 'application/json' });

    // Create a URL for the file object
    const url = URL.createObjectURL(file);

    // Create a link element and set its attributes
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Programmatically click the link element to initiate the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed:', event);
    errorDiv.textContent = 'WebSocket connection closed. Please refresh the page to reconnect.';
    alert("connection closed or lost");
});

socket.addEventListener('error', (event) => {
    console.log('WebSocket error:', event);
    errorDiv.textContent = 'WebSocket error. Please check the connection.';
    alert("websockets error, check console!");
});

//----------//
//PLOT CODE//

const chartDiv_1 = document.getElementById('chart1');
const chartDiv_2 = document.getElementById('chart2');
const chartDiv_3 = document.getElementById('chart3');
const chartDiv_4 = document.getElementById('chart4');

const visibleDataPoints = 30;

// Initialize chart
let chartData_1 = [];
let chartData_2 = [];
let chartData_3 = [];
let chartData_4 = [];

//expand and edit these if you want to update chart titles/colors/text
const chartLayout = {
    xaxis: {
        title: {
            text: 'Time',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    yaxis: {
        title: {
            text: 'Sensor Value (PSI)',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    title: {
        text: 'Pressure Sensors',
        font: {
            color: 'white'
        }
    },
    legend: {
        font: {
            color: 'white'
        }
    },
    plot_bgcolor: '#D3D3D3',
    paper_bgcolor: '#181F2D',
};
const chart2Layout = {
    xaxis: {
        title: {
            text: 'Time',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    yaxis: {
        title: {
            //text: 'Temperature Value',
            text: 'Sensor Value (PSI)',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    title: {
        //text: 'Temperature Sensors',
        text: 'Pressure Sensors',
        font: {
            color: 'white'
        }
    },
    legend: {
        font: {
            color: 'white'
        }
    },
    plot_bgcolor: '#D3D3D3',
    paper_bgcolor: '#181F2D',
};
const chart3Layout = {
    xaxis: {
        title: {
            text: 'Time',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    yaxis: {
        title: {
            //text: 'Load Cell Value', //TODO: update this and later vals if you want to add load cells back  in
            text: 'Sensor Value (PSI)',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    title: {
        //text: 'Load Cell Sensors',
        text: 'Pressure Sensors',
        font: {
            color: 'white'
        }
    },
    showlegend: true,
    legend: {
        font: {
            color: 'white'
        }
    },
    plot_bgcolor: '#D3D3D3',
    paper_bgcolor: '#181F2D',
};

const chart4Layout = {
    xaxis: {
        title: {
            text: 'Time',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    yaxis: {
        title: {
            text: 'Sensor Value (PSI)',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    title: {
        text: 'Pressure Sensors',
        font: {
            color: 'white'
        }
    },
    legend: {
        font: {
            color: 'white'
        }
    },
    plot_bgcolor: '#D3D3D3',
    paper_bgcolor: '#181F2D',
};

////// CHARTS //////
function initChart_1(sensors) {
    Object.keys(sensors).forEach((key) => {
        const sensor = sensors[key];
        chartData_1.push({
            x: [sensor.timeStamp],//new Date().getTime()
            y: [sensor.sensorReading],
            mode: 'lines+markers',
            name: key
        });
    });
    Plotly.newPlot(chartDiv_1, chartData_1, chartLayout);
}

function updateChart_1(sensors) {
    let latestTimeStamp = -Infinity;

    Object.keys(sensors).forEach((key, index) => {
        const sensor = sensors[key];
        chartData_1[index].x.push(sensor.timeStamp);
        chartData_1[index].y.push(sensor.sensorReading);

        // Remove old data points if the number of data points exceeds visibleDataPoints
        if (chartData_1[index].x.length > visibleDataPoints) {
            chartData_1[index].x.shift();
            chartData_1[index].y.shift();
        }

        latestTimeStamp = Math.max(latestTimeStamp, sensor.timeStamp);
    });

    // Update x-axis range
    const startTime = latestTimeStamp - visibleDataPoints * throttleInterval;
    chartLayout.xaxis.range = [startTime, latestTimeStamp];
    Plotly.update(chartDiv_1, chartData_1, chartLayout);
}

///2nd chart

function initChart_2(sensors) {
    Object.keys(sensors).forEach((key) => {
        const sensor = sensors[key];
        chartData_2.push({
            x: [sensor.timeStamp],//new Date().getTime()
            y: [sensor.sensorReading],
            mode: 'lines+markers',
            name: key
        });
    });
    Plotly.newPlot(chartDiv_2, chartData_2, chart2Layout);
}

function updateChart_2(sensors) {
    let latestTimeStamp = -Infinity;

    Object.keys(sensors).forEach((key, index) => {
        const sensor = sensors[key];
        chartData_2[index].x.push(sensor.timeStamp);
        chartData_2[index].y.push(sensor.sensorReading);

        // Remove old data points if the number of data points exceeds visibleDataPoints
        if (chartData_2[index].x.length > visibleDataPoints) {
            chartData_2[index].x.shift();
            chartData_2[index].y.shift();
        }

        latestTimeStamp = Math.max(latestTimeStamp, sensor.timeStamp);
    });

    // Update x-axis range
    const startTime = latestTimeStamp - visibleDataPoints * throttleInterval;
    chartLayout.xaxis.range = [startTime, latestTimeStamp];
    Plotly.update(chartDiv_2, chartData_2, chart2Layout);
}

//3rd chart

function initChart_3(sensors) {
    Object.keys(sensors).forEach((key) => {
        const sensor = sensors[key];
        chartData_3.push({
            x: [sensor.timeStamp],//new Date().getTime()
            y: [sensor.sensorReading],
            mode: 'lines+markers',
            //name: 'LC_01' //TODO: modify this if there are more load cell sensors (disabled because currently set to pressure sensors)
            name: key
        });
    });
    Plotly.newPlot(chartDiv_3, chartData_3, chart3Layout);
}

function updateChart_3(sensors) {
    let latestTimeStamp = -Infinity;

    Object.keys(sensors).forEach((key, index) => {
        const sensor = sensors[key];
        chartData_3[index].x.push(sensor.timeStamp);
        chartData_3[index].y.push(sensor.sensorReading);

        // Remove old data points if the number of data points exceeds visibleDataPoints
        if (chartData_3[index].x.length > visibleDataPoints) {
            chartData_3[index].x.shift();
            chartData_3[index].y.shift();
        }

        latestTimeStamp = Math.max(latestTimeStamp, sensor.timeStamp);
    });

    // Update x-axis range
    const startTime = latestTimeStamp - visibleDataPoints * throttleInterval;
    chartLayout.xaxis.range = [startTime, latestTimeStamp];
    Plotly.update(chartDiv_3, chartData_3, chart3Layout);
}

//4th chart

function initChart_4(sensors) {
    Object.keys(sensors).forEach((key) => {
        const sensor = sensors[key];
        chartData_4.push({
            x: [sensor.timeStamp],//new Date().getTime()
            y: [sensor.sensorReading],
            mode: 'lines+markers',
            name: key
        });
    });
    Plotly.newPlot(chartDiv_4, chartData_4, chart4Layout);
}

function updateChart_4(sensors) {
    let latestTimeStamp = -Infinity;

    Object.keys(sensors).forEach((key, index) => {
        const sensor = sensors[key];
        chartData_4[index].x.push(sensor.timeStamp);
        chartData_4[index].y.push(sensor.sensorReading);

        // Remove old data points if the number of data points exceeds visibleDataPoints
        if (chartData_4[index].x.length > visibleDataPoints) {
            chartData_4[index].x.shift();
            chartData_4[index].y.shift();
        }

        latestTimeStamp = Math.max(latestTimeStamp, sensor.timeStamp);
    });

    // Update x-axis range
    const startTime = latestTimeStamp - visibleDataPoints * throttleInterval;
    chartLayout.xaxis.range = [startTime, latestTimeStamp];
    Plotly.update(chartDiv_4, chartData_4, chart4Layout);
}




/// end chart creation ///



//sequence loading bar status
function updateSequenceInfo(data) {
    const progress = data.sequenceProgress * 100;
    const sequence = data.engineSequence;
    const abort = data.recordedAbort;

    const loadingBar = document.getElementById("sequence-progress-bar");
    const progressText = document.getElementById("sequence-progress-text");
    const sequenceName = document.getElementById("sequence-name-text");
    const lastAbort = document.getElementById("recorded-abort-text");

    progressText.innerHTML = `${progress.toFixed(2)}%`;
    sequenceName.innerHTML = sequence;
    lastAbort.innerHTML = abort;

    loadingBar.style.width = `${progress}%`;
}


var pneumaticSysPress = document.getElementById("pneumaticSysPress");
function displayPneumaticSystemPressure(pneumaticPressureReading) {
    if (pneumaticPressureReading.sensorReading < minSafePneumaticPressure) {
        pneumaticSysPress.innerHTML = "<span class=\"alarm\">LOW PNEUMATIC PRESSURE: " + pneumaticPressureReading.sensorReading.toFixed(2) + " " + pneumaticPressureReading.unit + "</span>";
    } else {
        pneumaticSysPress.innerHTML = "Available Pneumatic Pressure: " + pneumaticPressureReading.sensorReading.toFixed(2) + " " + pneumaticPressureReading.unit;
    }
}

var testStandState = document.getElementById("currentTestStandState");
function displayTestStandState(currentState) {
    testStandState.innerHTML = "Current State:&nbsp;" + currentState;
}

// Modify processData function to initialize and update the chart
function processData(data) {
    const currentTime = new Date().getTime();
    if (currentTime - lastUpdateTime < throttleInterval) {
        return;
    }
    //sensorContainer.innerHTML = ''; //TODO: update this if you go back to automatically populating the sensor data

    updateSequenceInfo(data);

    sensorContainer.innerHTML = ""; //clear the sensor container before populating it again
    displaySensors(data.data.loadCellSensors, 'Load Cell Sensor');
    displaySensors(data.data.pressureSensors, 'Pressure Sensor'); //use this default one almost always, especially if names of things change (otherwise you need to update the format function)
    //displayPressureSensorsOrganized(data.data.pressureSensors)
    displaySensors(data.data.tempSensors, 'Temperature Sensor');

    displayPneumaticSystemPressure(data.data.pressureSensors.pneumaticDucer);
    displayTestStandState(data.currentState);

    if (chartData_1.length === 0) {
        initChart_1(data.data.pressureSensors);
    } else {
        if (pressureCheckboxValue === "pressureSensorsChecked") {
            updateChart_1(data.data.pressureSensors);
        }
    }

    // TODO: put this part back if you want to use load cells again, but they're on a separate arduino for now
    /*if (chartData_2.length === 0) {
        initChart_2(data.data.tempSensors);
    } else {
        if (tempCheckboxValue === "tempSensorsChecked") {
            updateChart_2(data.data.tempSensors);
        }
    }*/
    if (chartData_2.length === 0) {
        initChart_2(data.data.pressureSensors);
    } else {
        if (tempCheckboxValue === "tempSensorsChecked") {
            updateChart_2(data.data.pressureSensors);
        }
    }
    /// end todo1 ///

    // TODO: put this part back if you want to use load cells again, but they're on a separate arduino for now
    //note that the checkbox names were not changed to reflect pressure sensors instead of load cell sensors
    /*if (chartData_3.length === 0) {
        initChart_3(data.data.loadCellSensors);
    } else {
        if (loadCheckboxValue === "loadSensorsChecked") {
            updateChart_3(data.data.loadCellSensors);
        }
    }*/
    if (chartData_3.length === 0) {
        initChart_3(data.data.pressureSensors);
    } else {
        if (loadCheckboxValue === "loadSensorsChecked") {
            updateChart_3(data.data.pressureSensors);
        }
    }
    /// end todo2 ///

    if (chartData_4.length === 0) {
        initChart_4(data.data.pressureSensors);
    } else {
        if (pressureCheckbox2Value === "pressureSensors2Checked") {
            updateChart_4(data.data.pressureSensors);
        }
    }

    lastUpdateTime = currentTime;
}