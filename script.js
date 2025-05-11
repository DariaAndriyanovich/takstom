function calculateRoute() {
  const origin = document.getElementById("from").value;
  const destination = document.getElementById("to").value;
  const carType = document.getElementById("car-type").value;

  const service = new google.maps.DistanceMatrixService();

  service.getDistanceMatrix(
    {
      origins: [origin],
      destinations: [destination],
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC,
    },
    (response, status) => {
      if (status !== 'OK') {
        alert('Ошибка: ' + status);
        return;
      }

      const element = response.rows[0].elements[0];

      if (element.status !== 'OK') {
        alert('Маршрут не найден.');
        return;
      }

      const distanceText = element.distance.text;
      const durationText = element.duration.text;
      const distanceKm = element.distance.value / 1000;

      let pricePerKm = 0.85;
      if (carType === 'business') pricePerKm = 1.15;
      if (carType === 'minibus') pricePerKm = 1.30;

      let fixedPrice = null;
      const fromLower = origin.toLowerCase();
      const toLower = destination.toLowerCase();

      if (fromLower.includes('airport') && toLower.includes('pirita')) fixedPrice = 50;
      if (fromLower.includes('airport') && toLower.includes('old town')) fixedPrice = 20;

      const price = fixedPrice !== null ? fixedPrice : (distanceKm * pricePerKm).toFixed(2);

      document.getElementById("price-output").innerHTML = `
        <p><strong>Distance:</strong> ${distanceText}</p>
        <p><strong>Duration:</strong> ${durationText}</p>
        <p><strong>Estimated Price:</strong> €${price}</p>
      `;
    }
  );
}

function initAutocomplete() {
  const fromInput = document.getElementById("from");
  const toInput = document.getElementById("to");

  new google.maps.places.Autocomplete(fromInput, {
    componentRestrictions: { country: 'ee' }
  });

  new google.maps.places.Autocomplete(toInput, {
    componentRestrictions: { country: 'ee' }
  });
}

window.initAutocomplete = initAutocomplete;

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("transfer-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculateRoute();
  });
});
