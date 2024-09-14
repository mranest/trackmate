function consoleOutput(message) {
    var output = document.getElementById("console");
    output.innerHTML += message + "<br>";
}

// Connect to MQTT broker
var clientId = localStorage.getItem("clientId")
if (clientId == null) {
    clientId = crypto.randomUUID();
    localStorage.setItem("clientId", clientId);
}

const client = mqtt.connect("wss://montessoriani-lab.georgiadis.online:8084/", {
    username: "trackmate",
    password: "eychev@YU-Ytr3Yj",
    clientId: clientId,
    clean: false
});

// Connect to the MQTT broker
client.on("connect", () => {
    consoleOutput("Connected to MQTT broker");
    client.subscribe("gnss/860470067520241", (err) => {
        if (!err) {
            consoleOutput("Subscribed to topic gnss/860470067520241")
        }
    });
    client.subscribe("will/860470067520241", (err) => {
        if (!err) {
            consoleOutput("Subscribed to topic will/860470067520241")
        }
    });
});

// Set up MQTT client callbacks
client.on("message", (topic, message) => {
    if (topic === "will/860470067520241") {
        consoleOutput(message.toString() + " on " + new Date().toLocaleTimeString());
    } else {
        consoleOutput(message);
    }
});

client.on("reconnect", () => {
    consoleOutput("Reconnecting to MQTT broker");
});

client.on("disconnect", () => {
    consoleOutput("Received disconnect packet from MQTT broker");
});

client.on("close", () => {
    consoleOutput("Connection to MQTT broker closed");
});

client.on("offline", () => {
    consoleOutput("Client is offline");
});

client.on("error", (error) => {
    consoleOutput("Error: " + error);
});