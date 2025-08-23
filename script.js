async function initAutocomplete() {
  try {
    await google.maps.importLibrary("places");

    const ids = ["from", "to", "booking-from", "booking-to"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        new google.maps.places.PlaceAutocompleteElement({
          inputElement: el,
          componentRestrictions: { country: "ee" }
        });
      }
    });
  } catch (e) {
    console.error("Places API init failed:", e);
  }
}
window.initAutocomplete = initAutocomplete;

function calculateRoute(event) {
  event.preventDefault();

  const originRaw = document.getElementById("from").value;
  const destinationRaw = document.getElementById("to").value;
  const carType = document.getElementById("car-type").value.toLowerCase();

  if (!originRaw || !destinationRaw) {
    document.getElementById("price-output").innerHTML =
      "<p style='color:red;'>⚠️ Укажите оба адреса</p>";
    return;
  }

  if (!window.google || !google.maps.DistanceMatrixService) {
    document.getElementById("price-output").innerHTML =
      "<p style='color:red;'>Google Maps API недоступен. Проверьте ключ и API.</p>";
    return;
  }

  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: [originRaw],
      destinations: [destinationRaw],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    },
    (response, status) => {
      if (status !== "OK") {
        document.getElementById("price-output").innerHTML =
          `<p style='color:red;'>Error: ${status}</p>`;
        return;
      }

      const element = response.rows[0].elements[0];
      if (!element || element.status !== "OK") {
        document.getElementById("price-output").innerHTML =
          "<p style='color:red;'>Маршрут не найден.</p>";
        return;
      }

      const distanceKm = element.distance.value / 1000;
      const distanceText = element.distance.text;
      const durationText = element.duration.text;

      const fixedRoutes = {
        "tallinn-narva": { standard: 180, minibus: 230, business: 250, minibusbusiness: 350 },
        "narva-tallinn": { standard: 180, minibus: 230, business: 250, minibusbusiness: 350 },
        "tallinn-koidula": { standard: 280, minibus: 320, business: 330, minibusbusiness: 400 },
        "koidula-tallinn": { standard: 280, minibus: 320, business: 330, minibusbusiness: 400 },
        "tallinn-parnu": { standard: 110, minibus: 150, business: 150, minibusbusiness: 250 },
        "parnu-tallinn": { standard: 110, minibus: 150, business: 150, minibusbusiness: 250 },
        "tallinn-tartu": { standard: 160, minibus: 200, business: 210, minibusbusiness: 300 },
        "tartu-tallinn": { standard: 160, minibus: 200, business: 210, minibusbusiness: 300 },
        "tallinn-riga": { standard: 280, minibus: 320, business: 320, minibusbusiness: 380 },
        "riga-tallinn": { standard: 280, minibus: 320, business: 320, minibusbusiness: 380 },
        "tallinn-vilnius": { standard: 580, minibus: 600, business: 650, minibusbusiness: 800 },
        "vilnius-tallinn": { standard: 580, minibus: 600, business: 650, minibusbusiness: 800 },
        "riga-narva": { standard: 450, minibus: 550, minibusbusiness: 600 },
        "narva-riga": { standard: 450, minibus: 550, minibusbusiness: 600 },
        "riga-luhamaa": { standard: 280, minibus: 300, minibusbusiness: 330 },
        "luhamaa-riga": { standard: 280, minibus: 300, minibusbusiness: 330 },
        "riga-koidula": { standard: 300, minibus: 320, minibusbusiness: 350 },
        "koidula-riga": { standard: 300, minibus: 320, minibusbusiness: 350 },
      };

      let routeKey = null;
      for (const key in fixedRoutes) {
        const [fromCity, toCity] = key.split("-");
        if (origin.toLowerCase().includes(fromCity) && destination.toLowerCase().includes(toCity)) {
          routeKey = key;
          break;
        }
      }

      let price = 0;
      if (routeKey && fixedRoutes[routeKey][carType] !== undefined) {
        price = fixedRoutes[routeKey][carType];
      } else {
        const cityPrices = { standard: 20, minibus: 30, business: 35, minibusbusiness: 50 };
        const basePrice = cityPrices[carType] || 20;
        price = distanceKm <= 10 ? basePrice : basePrice + (distanceKm - 10) * 1;
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

document.addEventListener("DOMContentLoaded", () => {
  const transferForm = document.getElementById("transfer-form");
  if (transferForm) {
    transferForm.addEventListener("submit", calculateRoute);
  }

  setLanguage("en");

  const langSelect = document.getElementById("language-select");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }
});

const translations = {
  en: {
    title: "TaksTom",
    tagline: "Fast, Safe, Convenient",
    desc: "Book transfers in Tallinn and all over Estonia",
    book: "Book a Transfer",
    check: "Check Price",
    checkTitle: "Check Transfer price",
    routesTitle: "Popular Routes",
    fleetTitle: "Our Fleet",
    standard: "Standard",
    minibus: "Minibus",
    business: "Business",
    standardDesc: "Up to 3 passengers and 3 pieces luggage",
    minibusDesc: "Up to 8 passengers and 8 pieces luggage",
    businessDesc: "Up to 3 passengers and 3 pieces luggage",
    toursTitle: "Tallinn & Estonia Tours",
    toursDesc: "Discover the best sights with our guided tours in Tallinn and beyond!",
    learnMore: "Learn More",
    bookFormTitle: "Book a Transfer",
    contactTitle: "Contact Us",
    send: "Send Request",
    backHome: "← Back to Home",
    comingTitle: "Coming Soon!",
    minibusBusiness:"Minibus Business",
    minibusBusinessDesc:"Up to 5 passengers and 5 pieces luggage"
  },
  ru: {
    title: "TaksTom",
    tagline: "Быстро, безопасно, удобно",
    desc: "Закажите трансфер по Таллинну и всей Эстонии",
    book: "Заказать трансфер",
    check: "Рассчитать цену",
    checkTitle: "Рассчитать цену трансфера",
    routesTitle: "Популярные маршруты",
    fleetTitle: "Наш автопарк",
    standard: "Стандарт",
    minibus: "Минивэн",
    business: "Бизнес",
    standardDesc: "До 3 пассажиров и 3 места для багажа",
    minibusDesc: "До 8 пассажиров и 8 места для багажа",
    businessDesc: "До 3 пассажиров и 3 места для багажа",
    toursTitle: "Туры по Таллинну и Эстонии",
    toursDesc: "Откройте лучшие достопримечательности Таллинна и всей Эстонии вместе с нами!",
    learnMore: "Подробнее",
    bookFormTitle: "Заказать трансфер",
    contactTitle: "Контакты",
    send: "Отправить заявку",
    backHome: "← Назад на главную",
    comingTitle: "Скоро!",
    minibusBusiness:"Минивэн Бизнес",
    minibusBusinessDesc:"До 5 пассажиров и 5 места для багажа"
  },
  et: {
    title: "TaksTom",
    tagline: "Kiire, turvaline, mugav",
    desc: "Broneeri transfeer Tallinnas ja üle Eesti",
    book: "Broneeri transfeer",
    check: "Arvuta hind",
    checkTitle: "Arvuta transfeeri hind",
    routesTitle: "Populaarsed marsruudid",
    fleetTitle: "Meie autopark",
    standard: "Standard",
    minibus: "Minibuss",
    business: "Äriklass",
    standardDesc: "Kuni 3 reisijat ja 3 pagasikohta",
    minibusDesc: "Kuni 8 reisijat ja 8 pagasikohta",
    businessDesc: "Kuni 3 reisijat ja 3 pagasikohta",
    toursTitle: "Tallinna ja Eesti ekskursioonid",
    toursDesc: "Avasta Tallinna ja kogu Eesti parimad paigad meiega!",
    learnMore: "Loe lähemalt",
    bookFormTitle: "Broneeri transfer",
    contactTitle: "Võta meiega ühendust",
    send: "Saada päring",
    backHome: "← Tagasi avalehele",
    comingTitle: "Varsti saadaval!",
    minibusBusiness:"Äriklassi minibuss",
    minibusBusinessDesc:"Kuni 5 reisijat ja 5 pagasikohta"
  }
};

function setLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}
