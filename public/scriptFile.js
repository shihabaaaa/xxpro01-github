
//create gauge chart
let data = [
    {
        domain: { x: [0, 1], y: [0, 1] },
        value: 20, // Initial temperature value
        title: { text: "Temperature" },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
            axis: { range: [0, 100] }, // Set the range for your gauge from 0 to 100
            bar: { color: "black" },
            steps: [
                { range: [0, 40], color: "green" },
                { range: [40, 100], color: "red" },
            ],
        }
    }
];

let layout = { width: 400, height: 400, margin: { t: 0, b: 0 } };
Plotly.newPlot('gaugeDiv', data, layout);


// create line chart
let temperatureData = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    name: 'Temperature'
};

let temperatureLayout = {
    title: 'Temperature Data',
    xaxis: {
        title: 'Time'
    },
    yaxis: {
        title: 'Temperature'
    },
    width: 600, // Set the width of the line chart
    height: 300, // Set the height of the line chart
    margin: { t: 30, b: 30, l: 50, r: 10 } // Adjust margins as needed
};

Plotly.newPlot('lineDiv', [temperatureData], temperatureLayout);


const brokerUrl = "ws://ec2-34-201-134-134.compute-1.amazonaws.com:9001/mqtt";
const clientId = "web-client-" + new Date().getTime();  // create random clientId 
let temperatureTopic = "temperature"; 
let nurseTopic = "nurseMessage";
let lightTopic = "lightStatus";

//shihab
// create client MQTT via WebSocket
let client = new Paho.MQTT.Client(brokerUrl, clientId);
let connectionStatusElement = document.getElementById("connection-status");


// connect to broker MQTT
client.connect({ onSuccess: onConnect });

// register callback when callback lost
client.onConnectionLost = onConnectionLost;

// register callback when message arrive
client.onMessageArrived = onMessageArrived;

// Callback when connect successfully
function onConnect() {
    console.log("Connected to MQTT broker");
    client.subscribe(temperatureTopic, { qos: 1 });
    client.subscribe(nurseTopic, { qos: 1 });
    client.subscribe(lightTopic, { qos: 1 });
    connectionStatusElement.textContent = "Connected";
    connectionStatusElement.style.color = "green";

}

// Callback when lost connect
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection lost: " + responseObject.errorMessage);
        connectionStatusElement.textContent = "Disconnected";
        connectionStatusElement.style.color = "red";
    }
}


// Callback when receive message
function onMessageArrived(message) {
    try {
        let jsonData = JSON.parse(message.payloadString);

        // Check the topic of the received message
        let topic = message.destinationName;

        if (topic === temperatureTopic) {
            // Handle temperature data
            let temperature = jsonData.temperature;
            let temperatureContainer = document.getElementById("temperature-container");
            temperatureContainer.innerHTML = 'Temperature: ' + temperature;

            // Update the gauge chart with the new temperature value
            Plotly.update('gaugeDiv', { "value": temperature });

            // Update the line chart with the new temperature data
            let currentTime = new Date();
            temperatureData.x.push(currentTime);
            temperatureData.y.push(temperature);
            Plotly.update('lineDiv', [temperatureData], temperatureLayout);

        } else if (topic === nurseTopic) {
            // Handle nurse messages
            let nurseMessage = jsonData.nurseMessage;
            let imagePatient = document.getElementById("imagePatient");
            let audioPlayer = document.getElementById("audioPlayer");
            let audioSource = document.getElementById("audioSource");

            if (nurseMessage === "NORMAL") {
                // Set the image source to the default image
                imagePatient.src = "normal.PNG";

                audioSource.src = "Normal.mp3";
                audioPlayer.load();
                audioPlayer.play();

            } else if (nurseMessage === "EMERGENCY") {
                // Set the image source to the emergency image
                imagePatient.src = "emergency.PNG";

                audioSource.src = "Emergency.mp3";
                audioPlayer.load();
                audioPlayer.play();
            } else if (nurseMessage === "CONFIRM") {
                // Set the image source to the confirm image
                imagePatient.src = "confirm.PNG";
                audioPlayer.pause();
            }
        } else if (topic === lightTopic) {
            // Handle nurse messages
            var lightStatusMessage = jsonData.lightStatus;
            var imageLight = document.getElementById("imageLight");

            if (lightStatusMessage === "True") {

                imageLight.src = "lightOn.PNG";
            } else if (lightStatusMessage === "False") {

                imageLight.src = "lightOff.PNG";
            }
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
}

function turnOnOffLight(status) {

    try {
        const jsonObject = { "light": status };
        let message = new Paho.MQTT.Message(JSON.stringify(jsonObject));
        message.destinationName = 'lightControl'; // Replace with your MQTT topic
        message.qos = 1; // Set QoS level to 1 (At least once)
    
        client.send(message);
        console.log('Published JSON message:', jsonObject);

        // Clear the input field
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
}
