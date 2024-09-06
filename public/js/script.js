const socket = io();

// Initialize the map
const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

// Watch the user's position
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`Sending location: Latitude ${latitude}, Longitude ${longitude}`);
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

// Handle incoming location updates from the server
socket.on("update-location", (data) => {
  console.log("Received update-location data:", data);
  const { latitude, longitude } = data;
  L.marker([latitude, longitude]).addTo(map);
});

// Handle location updates from the server with markers
const markers = {}; // Initialize markers object

socket.on("receive-location", (data) => {
  console.log("Received receive-location data:", data);
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude], 16); // Center map on the new location

  if (markers[id]) {
    // Update the existing marker
    markers[id].setLatLng([latitude, longitude]);
  } else {
    // Add a new marker
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

// Handle disconnection event from the server
socket.on("disconnected", (id) => {
  console.log(`Removing marker for disconnected ID: ${id}`);
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
