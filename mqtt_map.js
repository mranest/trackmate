// Connect to MQTT broker
const client = mqtt.connect("wss://zae6a16b.ala.us-east-1.emqxsl.com:8084/mqtt", {
	username: "a7670",
	password: "a7670SIM"
});

var busIcon = L.icon({
    iconUrl: 'bus.png', // Replace with the path to your bus icon
    iconSize: [48, 48], // Adjust the size of your icon
    iconAnchor: [32, 32], // Adjust the anchor point if needed
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

const layerGroup = L.layerGroup().addTo(mymap);

function convertDDToDMS(D, lng) {
  return {
    dir: D < 0 ? (lng ? "W" : "S") : lng ? "E" : "N",
    deg: 0 | (D < 0 ? (D = -D) : D),
    min: 0 | (((D += 1e-9) % 1) * 60),
		sec: (0 | (((D * 60) % 1) * 6000)) / 100,
  };
}

function formatDMS(dms) {
	return dms.deg + "°" + dms.min + "'" + dms.sec + '"' + dms.dir;
}

// Function to handle incoming MQTT messages
function onMessageArrived(message) {
    try {
        // Decode the JSON payload
        const data = JSON.parse(message.toString())
        console.log("Received data:", data);

				updateMap(data);
    } catch (error) {
        console.error("Error decoding JSON:", error);
    }
}

// Function to update the map with new GPS coordinates
function updateMap(data) {
	layerGroup.clearLayers();
	
  var rssi = Number(data.csq.substring(0, data.csq.indexOf(","))) * 2 - 113;

  var theMarker = L.marker([data.lat, data.lon], { icon: busIcon });
  var thePopup = theMarker.bindPopup(
  	"<p>Latitude: <b>" + formatDMS(convertDDToDMS(data.lat, false)) + "</b>" +
  	"<br/>Longitude: <b>" + formatDMS(convertDDToDMS(data.lon, true)) + "</b>" +
  	"<br/>RSSI: <b>" + rssi + "dBm" + "</b>" +
  	"<br/>Battery: <b>" + data.battery_voltage / 1000 + "V" + "</b>" +
  	"</p>");
  
  layerGroup.addLayer(theMarker);  	
  //thePopup.openPopup();
}

// Connect to the MQTT broker
client.on("connect", () => {
	console.log("Connected to MQTT broker");
  client.subscribe("a7670/860470067520241", (err) => {
    if (!err) {
      console.log("Subscribed to topic a7670/860470067520241")
    }
  });
});

// Set up MQTT client callbacks
client.on("message", (topic, message) => {
	onMessageArrived(message);
});