function initAutocomplete() {
  const fromInput = document.getElementById("from");
  const toInput = document.getElementById("to");

  new google.maps.places.Autocomplete(fromInput, {
    componentRestrictions: { country: "ee" },
  });
  new google.maps.places.Autocomplete(toInput, {
    componentRestrictions: { country: "ee" },
  });
}

function calculateRoute(event) {
  event.preventDefault();

  const origin = document.getElementById("from").value;
  const destination = document.getElementById("to").value;
  const carType = document.getElementById("car-type").value.toLowerCase();

  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    },
    (response, status) => {
      if (status !== "OK") {
        document.getElementById("price-output").innerHTML =
          "<p style='color:red;'>Error: " + status + "</p>";
        return;
      }

      const element = response.rows[0].elements[0];
      if (element.status !== "OK") {
        document.getElementById("price-output").innerHTML =
          "<p style='color:red;'>Маршрут не найден.</p>";
        return;
      }

      const distanceKm = element.distance.value / 1000;
      const distanceText = element.distance.text;
      const durationText = element.duration.text;

      const fixedRoutes = {
        "tallinn-narva": { standard: 180, xl: 230, business: 250 },
        "tallinn-koidula": { standard: 280, xl: 320, business: 330 },
        "tallinn-parnu": { standard: 110, xl: 150, business: 150 },
        "tallinn-tartu": { standard: 160, xl: 200, business: 210 },
        "tallinn-riga": { standard: 280, xl: 320, business: 320 },
        "tallinn-vilnius": { standard: 580, xl: 600, business: 650 },
        "riga-narva": { standard: 450, xl: 550, business: 600 },
        "riga-luhamaa": { standard: 280, xl: 300, business: 330 },
        "riga-koidula": { standard: 300, xl: 320, business: 350 },
      };

      const fromLower = origin.toLowerCase();
      const toLower = destination.toLowerCase();

      let routeKey = null;
      for (const key in fixedRoutes) {
        const [fromCity, toCity] = key.split("-");
        if (fromLower.includes(fromCity) && toLower.includes(toCity)) {
          routeKey = key;
          break;
        }
      }

      let price = 0;

      if (routeKey && fixedRoutes[routeKey][carType] !== undefined) {
        price = fixedRoutes[routeKey][carType];
      } else {
        // По городу до 10 км
        const cityPrices = { standard: 20, xl: 30, business: 35 };
        const basePrice = cityPrices[carType] || 20;

        if (distanceKm <= 10) {
          price = basePrice;
        } else {
          price = basePrice + (distanceKm - 10) * 1;
        }
        price = Math.round(price);
      }

      document.getElementById("price-output").innerHTML = `
        <p><strong>Distance:</strong> ${distanceText}</p>
        <p><strong>Duration:</strong> ${durationText}</p>
        <p><strong>Estimated Price:</strong> €${price.toFixed(2)}</p>
      `;
    }
  );
}

document.getElementById("transfer-form").addEventListener("submit", calculateRoute);

document.getElementById('booking-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  fetch('https://formsubmit.co/ajax/your@email.com', {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    },
    body: formData
  })
    .then(response => {
      if (response.ok) {
        document.getElementById('booking-message').style.display = 'block';
        form.reset();
      } else {
        alert('There was an error. Please try again.');
      }
    })
    .catch(error => {
      alert('Failed to send. Check your internet or try again later.');
    });
});
