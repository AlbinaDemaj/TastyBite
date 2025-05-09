$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('search');

  if (initialQuery) {
    $('#searchInputPage').val(initialQuery);
    searchRecipes(initialQuery);
  }

  $('#searchInputPage').on('keypress', function (e) {
    if (e.which === 13) {
      const query = $(this).val().trim();
      if (query) {
        searchRecipes(query);
      }
    }
  });

  $('#categoryFilter').on('change', function () {
    const category = $(this).val();
    if (category) {
      filterByCategory(category);
    } else {
      const current = $('#searchInputPage').val().trim();
      if (current) searchRecipes(current);
    }
  });

  $('#areaFilter').on('change', function () {
    const area = $(this).val();
    if (area) {
      filterByArea(area);
    } else {
      const current = $('#searchInputPage').val().trim();
      if (current) searchRecipes(current);
    }
  });


  $.ajax({
    url: 'https://www.themealdb.com/api/json/v1/1/categories.php',
    method: 'GET',
    success: function (data) {
      data.categories.forEach(cat => {
        $('#categoryFilter').append(`<option value="${cat.strCategory}">${cat.strCategory}</option>`);
      });
    }
  });


  $.ajax({
    url: 'https://www.themealdb.com/api/json/v1/1/list.php?a=list',
    method: 'GET',
    success: function (data) {
      data.meals.forEach(area => {
        $('#areaFilter').append(`<option value="${area.strArea}">${area.strArea}</option>`);
      });
    }
  });

  function searchRecipes(query) {
    $('#mealsContainer').html('<p class="text-center">Loading recipes...</p>');
    $.ajax({
      url: 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + query,
      method: 'GET',
      success: function (data) {
        renderRecipes(data.meals);
      }
    });
  }

  function filterByCategory(category) {
    $('#mealsContainer').html('<p class="text-center">Loading recipes...</p>');
    $.ajax({
      url: 'https://www.themealdb.com/api/json/v1/1/filter.php?c=' + category,
      method: 'GET',
      success: function (data) {
        renderRecipes(data.meals, true);
      }
    });
  }

  function filterByArea(area) {
    $('#mealsContainer').html('<p class="text-center">Loading recipes...</p>');
    $.ajax({
      url: 'https://www.themealdb.com/api/json/v1/1/filter.php?a=' + area,
      method: 'GET',
      success: function (data) {
        renderRecipes(data.meals, true);
      }
    });
  }

  function renderRecipes(meals, short = false) {
    if (!meals || meals.length === 0) {
      $('#mealsContainer').html('<p class="text-center text-danger">No recipes found.</p>');
      $('#pagination').empty();
      return;
    }
  
    const recipesPerPage = 6;
    let currentPage = 1;
    const totalPages = Math.ceil(meals.length / recipesPerPage);
  
    function displayPage(page) {
      const start = (page - 1) * recipesPerPage;
      const end = start + recipesPerPage;
      const currentMeals = meals.slice(start, end);
  
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      let html = '';
  
      currentMeals.forEach(meal => {
        const isFav = favorites.includes(meal.idMeal.toString());
        html += `
          <div class="col-md-4 mb-4">
            <div class="card recipe-card shadow-sm h-100 position-relative">
              <div class="position-absolute top-0 end-0 p-2">
                <button class="btn btn-sm btn-fav ${isFav ? 'active' : ''}" data-id="${meal.idMeal}" title="Save to Favorites">❤️</button>
              </div>
              <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title text-center">${meal.strMeal}</h5>
                <button class="btn btn-outline-secondary btn-sm mb-2 toggle-ingredients" data-id="${meal.idMeal}">+ Ingredients</button>
                <ul class="ingredients-list list-unstyled small text-start d-none" id="ingredients-${meal.idMeal}">Loading ingredients...</ul>
                <button class="btn btn-primary mt-auto view-btn" data-id="${meal.idMeal}">
                  🍽️ View Full Recipe
                </button>
              </div>
            </div>
          </div>`;
      });
  
      $('#mealsContainer').html(html);
      renderPagination(totalPages, page);
    }
  
    function renderPagination(totalPages, currentPage) {
      let paginationHTML = '';
  
      if (totalPages > 1) {
        paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`;
  
        for (let i = 1; i <= totalPages; i++) {
          paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
  
        paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`;
      }
  
      $('#pagination').html(paginationHTML);
    }
  
    displayPage(currentPage);
  
    $(document).on('click', '#pagination .page-link', function (e) {
      e.preventDefault();
      const page = Number($(this).data('page'));
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayPage(currentPage);
      }
    });
  }
  
  

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


$(document).on('click', '.btn-fav', function () {
  const id = $(this).data('id').toString();
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!currentUser) {
    alert("Please login to save favorites.");
    return;
  }

  const userEmail = currentUser.email;
  let allFavorites = JSON.parse(localStorage.getItem("favoritesByUser")) || {};
  let favorites = allFavorites[userEmail] || [];

  let message = "";
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
    $(this).removeClass('active');
    message = "Removed from favorites!";
  } else {
    favorites.push(id);
    $(this).addClass('active');
    message = "Added to favorites!";
  }

  allFavorites[userEmail] = favorites;
  localStorage.setItem("favoritesByUser", JSON.stringify(allFavorites));

  const $toast = $('#toastFav');
  $toast.removeClass('bg-success bg-danger');

  if (message.includes("Removed")) {
    $toast.addClass('bg-danger');
  } else {
    $toast.addClass('bg-success');
  }

  $('#toastMessage').text(message);
  const toast = new bootstrap.Toast(document.getElementById('toastFav'));
  toast.show();
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



if (!initialQuery && !$('#searchInputPage').val().trim()) {
  loadRandomRecipes(6); 
}


function loadRandomRecipes(count = 6) {
  $('#mealsContainer').html('<p class="text-center">Loading random recipes...</p>');
  let loaded = 0;
  let meals = [];

  for (let i = 0; i < count; i++) {
    $.ajax({
      url: 'https://www.themealdb.com/api/json/v1/1/random.php',
      method: 'GET',
      success: function (data) {
        meals.push(data.meals[0]);
        loaded++;
        if (loaded === count) {
          renderRecipes(meals); 
        }
      }
    });
  }
}

});
