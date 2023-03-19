//Jack Hester for AeroNU

//these are the things you need to update

//where the json is coming from (pi or local testing)
//const socket = new WebSocket('ws://localhost:9002/ws');
const socket = new WebSocket('ws://ecs-sim-pi.local:9002');

//where your states/batches are defined
const stateSetJSON = "../resources/STATE_SETS.json";

const minSafePneumaticPressure = 80.0;



//---------//

let stateData = null;
let batchName = "waterflow";


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

        // Trigger initial update of batches and commands
        updateBatches();
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

    // Trigger update of commands
    updateCommands();
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

///


let pressureCheckboxValue = "pressureSensorsChecked";
let tempCheckboxValue = "tempSensorsChecked";
let loadCheckboxValue = "loadSensorsChecked";
let pressureCheckbox2Value = "";

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

const sensorContainer = document.getElementById('sensorContainer');
const errorDiv = document.getElementById('error');
let lastUpdateTime = 0;
const throttleInterval = 500;

function createSensorDiv(sensorName, sensorValue, unit) {
    const sensorDiv = document.createElement('div');
    sensorDiv.className = 'sensor-value';
    sensorDiv.textContent = `${sensorName}: ${sensorValue.toFixed(2)} ${unit}`;
    return sensorDiv;
}

function displaySensors(sensorGroup, groupName) {
    Object.entries(sensorGroup).forEach(([key, sensor]) => {
        //const sensorDiv = createSensorDiv(`${groupName} - ${key}`, sensor.sensorReading, sensor.unit);
        const sensorDiv = createSensorDiv(`${key}`, sensor.sensorReading, sensor.unit);
        sensorContainer.appendChild(sensorDiv); //TODO:
    });
}

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
});

let currJSONData = "";

socket.addEventListener('message', (event) => {
    //console.log(event.data);
    //console.log('WebSocket message received:', event);
    try {
        const data = JSON.parse(event.data);
        processData(data);
        currJSONData = data;
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.textContent = 'Error processing data: ' + error.message;
        console.error('Error processing data:', error);
    }
});

var stateHTML = document.getElementById("lastStateCommandSent");

sendStateCommand = function () {
    var stateToSet = document.getElementById("commandDropdown").value;
    var command = { command: "SET_STATE", newState: stateToSet };
    socket.send(JSON.stringify(command));

    stateHTML.innerHTML = "&nbsp;Last Sent: " + stateToSet;
    console.log("sent ", stateToSet, " command");
}

function forceSetOnlineSafe() {
    var command = { command: "SET_STATE", newState: "ONLINE_SAFE" };
    socket.send(JSON.stringify(command));
    stateHTML.innerHTML = "&nbsp;Last Sent: ONLINE_SAFE";
    console.log("Selected and sent command: ONLINE_SAFE ");
}


function downloadJSONFile() {
    //console.log('click');
    //console.log(currJSONData);
    const filename = "curr_json.json";
    // Parse the JSON data into a JavaScript object
    //const data = JSON.parse(currJSONData);

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
            text: 'Temperature Value',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    title: {
        text: 'Temperature Sensors',
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
            text: 'Load Cell Value',
            font: {
                color: 'white'
            }
        },
        tickfont: {
            color: 'white'
        }
    },
    title: {
        text: 'Load Cell Sensors',
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
    //console.log('init chart');
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
    //console.log("updating chart");
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
    //console.log('init chart');
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
    //console.log("updating chart");
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
    //console.log('init chart');
    Object.keys(sensors).forEach((key) => {
        const sensor = sensors[key];
        chartData_3.push({
            x: [sensor.timeStamp],//new Date().getTime()
            y: [sensor.sensorReading],
            mode: 'lines+markers',
            name: 'LC_01' //TODO: modify this if there are more load cell sensors
        });
    });
    Plotly.newPlot(chartDiv_3, chartData_3, chart3Layout);
}

function updateChart_3(sensors) {
    //console.log("updating chart");
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
    //console.log('init chart');
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
    //console.log("updating chart");
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

var pneumaticSysPress = document.getElementById("pneumaticSysPress");
function displayPneumaticSystemPressure(pneumaticPressureReading) {
    if(pneumaticPressureReading.sensorReading < minSafePneumaticPressure){
        pneumaticSysPress.innerHTML = "<span class=\"alarm\">LOW PNEUMATIC PRESSURE: " + pneumaticPressureReading.sensorReading + " " + pneumaticPressureReading.unit+"</span>";
    } else{
        pneumaticSysPress.innerHTML = "Available Pneumatic Pressure: " + pneumaticPressureReading.sensorReading + " " + pneumaticPressureReading.unit;
    }
}

var testStandState = document.getElementById("currentTestStandState");
function displayTestStandState(currentState) {
    testStandState.innerHTML = "Current State:&nbsp;" + currentState;
}

// Modify processData function to initialize and update the chart
function processData(data) {
    //console.log('process data');
    const currentTime = new Date().getTime();
    if (currentTime - lastUpdateTime < throttleInterval) {
        return;
    }
    sensorContainer.innerHTML = '';

    displaySensors(data.data.loadCellSensors, 'Load Cell Sensor');
    displaySensors(data.data.pressureSensors, 'Pressure Sensor');
    displaySensors(data.data.tempSensors, 'Temperature Sensor');

    displayPneumaticSystemPressure(data.data.pressureSensors.Pneumatic);
    displayTestStandState(data.currentState);

    if (chartData_1.length === 0) {
        initChart_1(data.data.pressureSensors);
    } else {
        if (pressureCheckboxValue === "pressureSensorsChecked") {
            updateChart_1(data.data.pressureSensors);
        }
    }

    if (chartData_2.length === 0) {
        initChart_2(data.data.tempSensors);
    } else {
        if (tempCheckboxValue === "tempSensorsChecked") {
            updateChart_2(data.data.tempSensors);
        }
    }

    if (chartData_3.length === 0) {
        initChart_3(data.data.loadCellSensors);
    } else {
        if (loadCheckboxValue === "loadSensorsChecked") {
            updateChart_3(data.data.loadCellSensors);
        }
    }

    if (chartData_4.length === 0) {
        initChart_4(data.data.pressureSensors);
    } else {
        if (pressureCheckbox2Value === "pressureSensors2Checked") {
            updateChart_4(data.data.pressureSensors);
        }
    }

    lastUpdateTime = currentTime;
}