const WINNIPEG_TRANSIT_API_KEY = "sLnjn08u0B7FNCC4Yixz";
const MAPBOX_API_KEY = 'pk.eyJ1Ijoic2hhbHluZS1zYXdlIiwiYSI6ImNrYWpqbzlzbTBlMzEycW1zeWQzcXkwaGUifQ.MOBoivF_MRX6Lj_I_ljR1w';

const BOUNDARY_BOX = '-97.325875, 49.766204, -96.953987, 49.99275';

// Render start locations
const renderStartLocations = features => {
  const startLocationsHTML = features.map(feature =>
    `
    <li data-long="${feature.geometry.coordinates[0]}" data-lat="${feature.geometry.coordinates[1]}">
      <div class="name">${feature.text}</div>
      <div>${feature.properties.address}</div>
    </li>
  `
  );
  document.querySelector(".origin-container .origins").innerHTML = startLocationsHTML.join("");
  locationSelectEventListener();
}

// Function to search for starting location
const searchStartLocations = inputValue => {
  // Clear start locations
  renderStartLocations([]);
  // Search
  const requestURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${inputValue}.json?access_token=${MAPBOX_API_KEY}&bbox=${BOUNDARY_BOX}`
  fetch(requestURL)
    .then((response) => response.json())
    .then((data) => renderStartLocations(data.features));
}

// Register origin form listeners
const originFormEventListener = () => {

  const originForm = document.querySelector('.origin-form');
  originForm.onsubmit = e => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    searchStartLocations(input.value);
    input.value = "";
  }

};


// Register location select event listener
const locationSelectEventListener = () => {
  const locations = document.querySelectorAll(".origin-container .origins li");
  locations.forEach(location => {
    location.onclick = e => {
      // Clear any selected elements in origins list
      document.querySelectorAll(".origin-container .origins .selected").forEach(selectedLocation => selectedLocation.classList.remove('selected'));
      // Mark target element as selected
      e.currentTarget.classList.add('selected');
    }
  });
}

//render stop locations
const renderStopLocations = features => {
  const stopLocationsHTML = features.map(feature =>
      `
    <li data-long="${feature.geometry.coordinates[0]}" data-lat="${feature.geometry.coordinates[1]}">
      <div class="name">${feature.text}</div>
      <div>${feature.properties.address}</div>
    </li>
  `
  );
  document.querySelector(".destination-container .destinations").innerHTML = stopLocationsHTML.join("");
  locationDestSelectEventListener();
}

// Function to search for stop location
const searchStopLocations = inputValue => {
  // Clear stop locations
  renderStopLocations([]);
  // Search
  const requestURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${inputValue}.json?access_token=${MAPBOX_API_KEY}&bbox=${BOUNDARY_BOX}`
  fetch(requestURL)
    .then((response) => response.json())
    .then((data) => renderStopLocations(data.features));
}

// Function to generate human readable instructions for segment
const humanReadableSegment = segment => {
  // Create icon and text
  let icon, text;
  switch (segment.type) {
    case "walk":
      icon = "fas fa-walking";
      // Check if you have arrived
      text = `Walk for ${segment.times.durations.total} minutes `;
      text += segment.to.stop ? `to stop #${segment.to.stop.key} - ${segment.to.stop.name}.` : 'to your destination.'
      break;
    case "ride":
      icon = "fas fa-bus";
      text = `Ride the `;
      text += segment.route.key == "BLUE" ? "BLUE" : segment.route.name;
      text += ` for ${segment.times.durations.total} minutes.`;
      break;
    case "transfer":
      icon = "fas fa-ticket-alt";
      text = `Transfer from stop #${segment.from.stop.key} - ${segment.from.stop.name} to stop #${segment.to.stop.key} - ${segment.to.stop.name}.`;
      break;
    default:
      break;
  }
  // Return output
  return `<li><i class="${icon}" aria-hidden="true"></i> ${text}</li>`;
}

// Function to render the trip instructions
const renderTripInstructions = (segments) => {
  const planHTML = segments.map(segment => humanReadableSegment(segment));
  document.querySelector(".bus-container .my-trip").innerHTML = planHTML.join("");
}

// Function to plan trip
const planTrip = () => {
  // Clear instructions
  renderTripInstructions([]);
  // Get start coordinates
  const start = document.querySelector(".origin-container .origins .selected");
  const destination = document.querySelector(".destination-container .destinations .selected");
  if (start == null || destination == null) {
    return;
  }
  const startLong = start.dataset["long"];
  const startLat = start.dataset["lat"];
  const destinationLong = destination.dataset["long"];
  const destinationLat = destination.dataset["lat"];

  const requestURL = `https://api.winnipegtransit.com/v3/trip-planner.json?api-key=${WINNIPEG_TRANSIT_API_KEY}&origin=geo/${startLat},${startLong}&destination=geo/${destinationLat},${destinationLong}`;

  fetch(requestURL)
    .then(response => response.json())
    .then(data => renderTripInstructions(data.plans[0].segments));
}

// Register origin form listeners
const destinationFormEventListener = () => {

  const destinationForm = document.querySelector('.destination-form');
  destinationForm.onsubmit = e => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    searchStopLocations(input.value);
    input.value = "";
  }

};

// Register location select event listener
const locationDestSelectEventListener = () => {
  const locations = document.querySelectorAll(".destination-container .destinations li");
  locations.forEach(location => {
    location.onclick = e => {
      // Clear any selected elements in origins list
      document.querySelectorAll(".destination-container .destinations .selected").forEach(selectedLocation => selectedLocation.classList.remove('selected'));
      // Mark target element as selected
      e.currentTarget.classList.add('selected');
    }
  });
}

// Register plan trip event listener
const registerPlanTripEventListener = () => {
  const button = document.querySelector("button.plan-trip");
  button.onclick = e => { planTrip(); };
}

const initialize = () => {
  // Clear locations
  renderStartLocations([]);
  renderStopLocations([]);
  renderTripInstructions([]);

  // Register event listeners
  originFormEventListener();
  destinationFormEventListener();
  registerPlanTripEventListener();
}

initialize();