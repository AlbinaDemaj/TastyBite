// favorites.js
$(document).ready(function () {
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!currentUser) {
    alert("You must be logged in to view your favorites.");
    window.location.href = "login.html";
    return;
  }

  const userEmail = currentUser.email;
  const allFavorites = JSON.parse(localStorage.getItem("favoritesByUser")) || {};
  const favorites = allFavorites[userEmail] || [];

  if (favorites.length === 0) {
    $('#favoritesContainer').html('<p class="text-center text-muted">You haven\'t saved any recipes yet. Start exploring!</p>');
    return;
  }

  $('#favoritesContainer').html(`
    <div class="text-end mb-4">
      <button class="btn btn-danger" id="clearFavorites">🗑️ Clear All Favorites</button>
    </div>
    <div class="row" id="favCardsWrapper">Loading your favorite recipes...</div>
  `);

  let loaded = 0;
  let html = '';

  favorites.forEach(id => {
    $.ajax({
      url: 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id,
      method: 'GET',
      success: function (data) {
        const meal = data.meals[0];
        html += `
          <div class="col-md-4 mb-4">
            <div class="card recipe-card shadow-sm h-100 position-relative">
              <div class="position-absolute top-0 end-0 p-2">
                <button class="btn btn-sm btn-danger remove-fav" data-id="${meal.idMeal}" title="Remove from Favorites">&times;</button>
              </div>
              <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title text-center">${meal.strMeal}</h5>
                <button class="btn btn-outline-secondary btn-sm mb-2 toggle-ingredients" data-id="${meal.idMeal}">+ Ingredients</button>
                <ul class="ingredients-list list-unstyled small text-start d-none" id="ingredients-${meal.idMeal}">Loading ingredients...</ul>
                <button class="btn btn-primary mt-auto view-btn" data-id="${meal.idMeal}">🍽️ View Full Recipe</button>
              </div>
            </div>
          </div>
        `;

        loaded++;
        if (loaded === favorites.length) {
          $('#favCardsWrapper').html(html);
        }
      }
    });
  });


  $(document).on('click', '.view-btn', function () {
    const id = $(this).data('id');
    $.ajax({
      url: 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id,
      method: 'GET',
      success: function (data) {
        const meal = data.meals[0];
        $('#mealTitle').text(meal.strMeal);

        let ingredients = '';
        for (let i = 1; i <= 20; i++) {
          const ing = meal['strIngredient' + i];
          const meas = meal['strMeasure' + i];
          if (ing && ing.trim()) {
            ingredients += `<li>${ing} - ${meas}</li>`;
          }
        }

        $('#mealDetails').html(`
          <img src="${meal.strMealThumb}" class="img-fluid mb-3" />
          <h6>Ingredients:</h6>
          <ul>${ingredients}</ul>
          <h6>Instructions:</h6>
          <p>${meal.strInstructions}</p>
        `);

        const modal = new bootstrap.Modal(document.getElementById('mealModal'));
        modal.show();
      }
    });
  });


  $(document).on('click', '.toggle-ingredients', function () {
    const id = $(this).data('id');
    const $list = $(`#ingredients-${id}`);

    if (!$list.hasClass('d-none')) {
      $list.addClass('d-none');
      $(this).text('+ Ingredients');
      return;
    }

    if ($list.text().includes("Loading")) {
      $.ajax({
        url: 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id,
        method: 'GET',
        success: function (data) {
          const meal = data.meals[0];
          let ingredients = '';
          for (let i = 1; i <= 20; i++) {
            const ing = meal['strIngredient' + i];
            const meas = meal['strMeasure' + i];
            if (ing && ing.trim()) {
              ingredients += `<li>✔️ ${ing} - ${meas}</li>`;
            }
          }
          $list.html(ingredients).removeClass('d-none');
        }
      });
    } else {
      $list.removeClass('d-none');
    }

    $(this).text('− Ingredients');
  });


  $(document).on('click', '.remove-fav', function () {
    const id = $(this).data('id').toString();
    const allFavorites = JSON.parse(localStorage.getItem("favoritesByUser")) || {};
    let userFavorites = allFavorites[userEmail] || [];

    userFavorites = userFavorites.filter(favId => favId !== id);
    allFavorites[userEmail] = userFavorites;
    localStorage.setItem("favoritesByUser", JSON.stringify(allFavorites));

    $(this).closest('.col-md-4').remove();

    if (userFavorites.length === 0) {
      $('#favoritesContainer').html('<p class="text-center text-muted">You haven\'t saved any recipes yet. Start exploring!</p>');
    }
  });


  $(document).on('click', '#clearFavorites', function () {
    if (confirm("Are you sure you want to remove all favorites?")) {
      const allFavorites = JSON.parse(localStorage.getItem("favoritesByUser")) || {};
      delete allFavorites[userEmail];
      localStorage.setItem("favoritesByUser", JSON.stringify(allFavorites));

      $('#favoritesContainer').html('<p class="text-center text-muted">You haven\'t saved any recipes yet. Start exploring!</p>');
    }
  });
});
