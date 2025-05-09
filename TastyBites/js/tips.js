    const tips = [
      { emoji: "🥕", title: "Store Carrots the Right Way", text: "Cut off the tops and keep carrots in a sealed bag with a bit of moisture." },
      { emoji: "🧂", title: "Salt the Water", text: "Always salt your pasta water. It should taste like the sea." },
      { emoji: "🧄", title: "Easy Garlic Peeling", text: "Smash cloves with a flat knife blade and the peel comes right off." },
      { emoji: "🍚", title: "Rice Water Ratio", text: "Use the 1:2 ratio for fluffy, perfectly cooked rice." },
      { emoji: "🧈", title: "Butter Substitute", text: "Use mashed bananas, avocado, or yogurt in baking as alternatives." },
      { emoji: "🍳", title: "Preheat the Pan", text: "Always preheat your skillet before adding food for best results." },
      { emoji: "🥒", title: "No More Soggy Cucumbers", text: "Salt cucumber slices first and drain excess water before using in salads." },
      { emoji: "🥚", title: "Egg Test", text: "Place eggs in water — if they sink, they're fresh. If they float, toss them." },
      { emoji: "🍋", title: "Juice Lemons Easily", text: "Microwave lemons for 10 seconds to get more juice out." },
      { emoji: "🍞", title: "Revive Stale Bread", text: "Sprinkle with water and warm in oven to soften stale bread." }
    ];

    tips.forEach((tip, index) => {
      $('#tipsContainer').append(`
        <div class="col-md-4">
          <div class="tip-card p-4 rounded shadow bg-white animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
            <h5 class="fw-semibold mb-2">${tip.emoji} ${tip.title}</h5>
            <p class="text-muted">${tip.text}</p>
          </div>
        </div>
      `);
    });