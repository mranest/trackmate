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

var busIcon = L.icon({
    iconUrl: 'bus.png', // Replace with the path to your bus icon
    iconSize: [48, 48], // Adjust the size of your icon
    iconAnchor: [32, 32], // Adjust the anchor point if needed
    popupAnchor: [0, -16] // Adjust the popup anchor point if needed
});

// Initialize the map
const mymap = L.map('map', {
    center: [37.999267, 23.764247],
    zoom: 13
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(mymap);

const layerGroup = L.layerGroup().addTo(mymap);

function convertDDToDMS(D/*, lng */) {
    return {
//     dir: D < 0 ? (lng ? "W" : "S") : lng ? "E" : "N",
        deg: 0 | (D < 0 ? (D = -D) : D),
        min: 0 | (((D += 1e-9) % 1) * 60),
        sec: (0 | (((D * 60) % 1) * 6000)) / 100,
    };
}

function formatDMS(dms, nsew) {
    return dms.deg + "°" + dms.min + "'" + dms.sec + '"' + nsew;
}

function formatGDOP(gdop) {
    if (gdop < 1) {
        return "Ideal";
    } else if (gdop < 2) {
        return "Excellent";
    } else if (gdop < 5) {
        return "Good";
    } else if (gdop < 10) {
        return "Moderate";
    } else if (gdop < 20) {
        return "Fair";
    } else {
        return "Poor";
    }
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

    var theMarker = L.marker([data.lat, data.lon], {icon: busIcon});
    var thePopup = theMarker.bindPopup(
        "<p>Latitude: <b>" + formatDMS(convertDDToDMS(data.lat), data.ns) + "</b>" +
        "<br/>Longitude: <b>" + formatDMS(convertDDToDMS(data.lon), data.ew) + "</b>" +
        "<br/>GDOP: <b>" + formatGDOP(data.gdop) + "</b>" +
        "<br/>Speed: <b>" + data.speed + "km/h</b>" +
        "<br/>RSSI: <b>" + data.rssi + "dBm</b>" +
        "<br/>Battery: <b>" + data.battery_voltage / 1000 + "V" + "</b>" +
        "<br/>Timestamp: <b>" + new Date(Date.parse(data.timestamp)).toLocaleTimeString() + "</b>" +
        "</p>");

    layerGroup.addLayer(theMarker);
    //thePopup.openPopup();
}

// Connect to the MQTT broker
client.on("connect", () => {
    console.log("Connected to MQTT broker");
    client.subscribe("gnss/860470067520241", {"qos": 1}, (err) => {
        if (!err) {
            console.log("Subscribed to topic gnss/860470067520241")
        }
    });
    client.subscribe("will/860470067520241", {"qos": 1}, (err) => {
        if (!err) {
            console.log("Subscribed to topic will/860470067520241")
        }
    });
});

// Set up MQTT client callbacks
client.on("message", (topic, message) => {
    if (topic === "will/860470067520241") {
        console.log(message.toString() + " on " + new Date().toLocaleTimeString());
    } else {
        onMessageArrived(message);
    }
});

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var userLat = position.coords.latitude;
        var userLng = position.coords.longitude;

        // Set the map view to the user's location
        // map.setView([userLat, userLng], 13);

        // Add a marker at the user's location
        //L.marker([userLat, userLng]).addTo(mymap);

        L.circle([userLat, userLng], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(mymap);
    }, function (error) {
        console.log('Error getting user location:', error.message);
    });
} else {
    console.log('Geolocation is not supported by your browser');
}