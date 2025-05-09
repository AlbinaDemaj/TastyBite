$(document).ready(function () {
  console.log("TastyBite is ready!");

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
  }

  $('#logoutBtn').on('click', function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });

  new Typed('#typed-text', {
    strings: ["Delicious Recipes", "Healthy Meals", "Quick Snacks", "Homemade Dishes"],
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 1500,
    loop: true
  });


  const foodEmojis = ["🍎", "🍏", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🍑", "🥭", "🍍", "🥝", "🍅", "🥕", "🌽", "🥦", "🥬", "🧄", "🧅", "🥒", "🥔"];
  const $fallingFood = $("#falling-food");

  setInterval(() => {
    const emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
    const leftPosition = Math.random() * 100;
    const size = Math.random() * 20 + 20;
    const duration = Math.random() * 5 + 5;

    const $foodItem = $("<div class='falling-food-item'></div>")
      .text(emoji)
      .css({ left: `${leftPosition}%`, fontSize: `${size}px`, animationDuration: `${duration}s` });

    $fallingFood.append($foodItem);
    setTimeout(() => $foodItem.remove(), duration * 1000);
  }, 200);

 
  $('#searchBtn').on('click', function () {
    const query = $('#searchInput').val().trim();
    if (query === "") {
      alert("Please enter a keyword to search.");
      return;
    }
    window.location.href = `recipes.html?search=${encodeURIComponent(query)}`;
  });


  function loadRecipesOfTheDay(count = 3) {
    const savedData = localStorage.getItem("recipesOfDay");
    const savedTime = localStorage.getItem("recipesTimestamp");
    const now = new Date().getTime();

    if (savedData && savedTime && now - savedTime < 24 * 60 * 60 * 1000) {
      const recipes = JSON.parse(savedData);
      renderRecipeCards(recipes);
      markFavorites();
      return;
    }

    $('#recipeOfDay').html('<p class="text-center">Loading recipes...</p>');
    let loaded = 0, recipes = [];

    for (let i = 0; i < count; i++) {
      $.ajax({
        url: 'https://www.themealdb.com/api/json/v1/1/random.php',
        method: 'GET',
        success: function (data) {
          recipes.push(data.meals[0]);
          loaded++;
          if (loaded === count) {
            localStorage.setItem("recipesOfDay", JSON.stringify(recipes));
            localStorage.setItem("recipesTimestamp", now.toString());
            renderRecipeCards(recipes);
            markFavorites();
          }
        }
      });
    }
  }

  function renderRecipeCards(recipes) {
    let html = '';
    recipes.forEach(meal => {
      html += `
        <div class="col-md-4 mb-4">
          <div class="recipe-day-card h-100 position-relative">
            <div class="position-absolute top-0 end-0 p-2">
              <button class="btn btn-sm btn-fav" data-id="${meal.idMeal}" title="Save to Favorites">❤️</button>
            </div>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-day-img">
            <div class="recipe-day-body d-flex flex-column">
              <h4 class="recipe-day-title">${meal.strMeal}</h4>
              <p>${meal.strInstructions.substring(0, 100)}...</p>
              <button class="btn btn-view mt-auto view-btn" data-id="${meal.idMeal}">View Recipe</button>
            </div>
          </div>
        </div>
      `;
    });
    $('#recipeOfDay').html(html);
  }

  $(document).on('click', '.view-btn', function () {
    const id = $(this).data('id');
    $.ajax({
      url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
      method: 'GET',
      success: function (data) {
        const meal = data.meals[0];
        let ingredients = '';
        for (let i = 1; i <= 20; i++) {
          let ing = meal['strIngredient' + i], meas = meal['strMeasure' + i];
          if (ing && ing.trim()) ingredients += `<li>${ing} - ${meas}</li>`;
        }
        $('#mealTitle').text(meal.strMeal);
        $('#mealDetails').html(`
          <img src="${meal.strMealThumb}" class="img-fluid mb-3" />
          <h6>Ingredients:</h6><ul>${ingredients}</ul>
          <h6>Instructions:</h6><p>${meal.strInstructions}</p>
        `);
        new bootstrap.Modal(document.getElementById('mealModal')).show();
      }
    });
  });

 
  $(document).on('click', '.btn-fav', function () {
    const id = $(this).data('id').toString();
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!currentUser) return;

    const userEmail = currentUser.email;
    let allFavorites = JSON.parse(localStorage.getItem("favoritesByUser")) || {};
    let favorites = allFavorites[userEmail] || [];

    if (favorites.includes(id)) {
      favorites = favorites.filter(favId => favId !== id);
      $(this).removeClass('active');
    } else {
      favorites.push(id);
      $(this).addClass('active');
    }

    allFavorites[userEmail] = favorites;
    localStorage.setItem("favoritesByUser", JSON.stringify(allFavorites));
  });


  function markFavorites() {
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!currentUser) return;

    const userEmail = currentUser.email;
    const allFavorites = JSON.parse(localStorage.getItem("favoritesByUser")) || {};
    const favorites = allFavorites[userEmail] || [];

    $('.btn-fav').each(function () {
      const id = $(this).data('id').toString();
      if (favorites.includes(id)) {
        $(this).addClass('active');
      }
    });
  }


  function fetchCategories() {
    $.ajax({
      url: 'https://www.themealdb.com/api/json/v1/1/categories.php',
      method: 'GET',
      success: function (data) {
        const categories = data.categories.slice(0, 6);
        let html = '';
        categories.forEach(cat => {
          html += `
            <div class="col-md-4 mb-4">
              <div class="card category-card" data-name="${cat.strCategory}">
                <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" class="category-img">
                <div class="category-body">
                  <div class="category-title">${cat.strCategory}</div>
                  <div class="category-description">${cat.strCategoryDescription}</div>
                </div>
              </div>
            </div>
          `;
        });
        $('#categoriesContainer').html(html);
      }
    });
  }

  $(document).on('click', '.category-card', function () {
    $('#searchInput').val($(this).data('name'));
    $('#searchBtn').click();
  });

$('#aiQuizForm').on('submit', function (e) {
  e.preventDefault();

  const diet = $('select[name="diet"]').val();
  const goal = $('select[name="goal"]').val();
  const avoid = $('input[name="avoid"]').val();
  const cuisine = $('select[name="cuisine"]').val();

  const prompt = `Suggest a recipe for someone who is ${diet || 'open to all'} with a goal of ${goal}, avoids ${avoid || 'nothing specific'}, and prefers ${cuisine} cuisine.`;

  const suggestions = [
    {
      title: "Grilled Mediterranean Quinoa Salad",
      desc: "Packed with protein and fiber, perfect for healthy eating. Avoids your preferences."
    },
    {
      title: "Zucchini Noodles with Pesto",
      desc: "Low-carb and full of flavor. Great for light meals and dietary goals."
    },
    {
      title: "Avocado Chickpea Toast",
      desc: "A simple, nutritious breakfast packed with good fats and plant protein."
    },
    {
      title: "Thai Peanut Stir Fry",
      desc: "Spicy, satisfying, and adaptable to any diet or allergy needs."
    },
    {
      title: "Berry Yogurt Parfait",
      desc: "Great for dessert or snack. Layers of fruit, granola and yogurt."
    }
  ];


  const randomRecipe = suggestions[Math.floor(Math.random() * suggestions.length)];

  $('#aiResult').html('<p class="text-muted">Generating suggestion...</p>');

  setTimeout(() => {
    $('#aiResult').html(`
      <div class="alert alert-success">
        <h6>🥗 Suggested Recipe:</h6>
        <strong>${randomRecipe.title}</strong><br>
        ${randomRecipe.desc}
      </div>
    `);
  }, 1500);
});


  VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
    max: 10,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
  });

  fetchCategories();
  loadRecipesOfTheDay();
});

 $("#contactForm").on("submit", function (e) {
    e.preventDefault();
    $("#formMessage").html('<div class="alert alert-success">Thank you! Your message has been sent. 🍽️</div>');
    this.reset();
  });
