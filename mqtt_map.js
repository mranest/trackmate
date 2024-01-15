// Connect to MQTT broker
const client = mqtt.connect("wss://zae6a16b.ala.us-east-1.emqxsl.com:8084/mqtt", {
	username: "a7670",
	password: "a7670SIM"
});

var theMarker = {};

var busIcon = L.icon({
    iconUrl: 'bus.png', // Replace with the path to your bus icon
    iconSize: [32, 32], // Adjust the size of your icon
    iconAnchor: [16, 16], // Adjust the anchor point if needed
    popupAnchor: [0, -16] // Adjust the popup anchor point if needed
});

// Initialize the map
const mymap = L.map('map', {
    center: [37.998985, 23.764355],
    zoom: 13
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '© OpenStreetMap'
}).addTo(mymap);

// Function to handle incoming MQTT messages
function onMessageArrived(message) {
    try {
        // Decode the JSON payload
        const data = JSON.parse(message.toString())
        console.log("Received data:", data);

        // Extract GPS coordinates
        const latitude = data.lat;
        const longitude = data.lon;

        // Plot the data on the map
        if (latitude !== undefined && longitude !== undefined) {
            updateMap(latitude, longitude);
        }
    } catch (error) {
        console.error("Error decoding JSON:", error);
    }
}

// Function to update the map with new GPS coordinates
function updateMap(latitude, longitude) {
	if (theMarker != undefined) {
		mymap.removeLayer(theMarker);
  };
  
  theMarker = L.marker([latitude, longitude], { icon: busIcon }).addTo(mymap);
}

// Connect to the MQTT broker
client.on("connect", () => {
	console.log("Connected to MQTT broker");
  client.subscribe("a7670/860470067520241", (err) => {
    if (!err) {
      console.log("Subscribed to topic")
    }
  });
});

// Set up MQTT client callbacks
client.on("message", (topic, message) => {
	onMessageArrived(message);
});