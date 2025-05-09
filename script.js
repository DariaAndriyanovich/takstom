document.getElementById('transfer-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const from = this.from.value.trim().toLowerCase();
  const to = this.to.value.trim().toLowerCase();
  const vehicle = this.vehicle.value;

  let basePrice = 20;

  if (from.includes('tartu') || to.includes('tartu')) {
    basePrice = 80;
  } else if (from.includes('pirita') || to.includes('pirita')) {
    basePrice = 25;
  } else if (from.includes('narva') || to.includes('narva')) {
    basePrice = 90;
  } else if (from.includes('old town') || to.includes('old town')) {
    basePrice = 20;
  }

  let multiplier = 1;
  if (vehicle === 'xl') multiplier = 1.5;
  if (vehicle === 'business') multiplier = 2;

  const finalPrice = basePrice * multiplier;

  document.getElementById('price-result').textContent = `Estimated Price: €${finalPrice.toFixed(2)}`;
});
