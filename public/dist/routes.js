page('/', index);
page('/:myFavoriteRecipes', getFavoriteList);
page('/:search/:categoryName', getRecipesList);
page('/:search/:categoryName/:recipeName', getRecipePage);
page('*', notfound);
page();

let favoriteList = [];
localStorage.setItem('favoriteList', favoriteList.toString);

$('#favorite-list-btn').click(redirectToFavoriteRecipesPage);

function redirectToFavoriteRecipesPage() {
  page.redirect('/myFavoriteRecipes');
}

function redirectToOneRecipePage(event, recipeLink) {
  event.preventDefault();
  page(`/search/'${recipeLink.name}`);
}

function index() {
  let url = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list';
  let success = getCategories;
  requestAPI(url, success);
}

function requestAPI(url, success) {
  $.ajax({
    type: 'GET',
    url,
    success,
    error: erro
  });
}

function getCategories(data) {
  mainTemplateDefault('categories', 'Choose a Category');
  getEachCategory(data);
}

function mainTemplateDefault(id, title) {
  $('main').html(`
  <div class="container">
    <div class="section">
      <div class="row">
        <div class="col s12">                    
          <div id="${id}" class="section to-list">
            <div class="col s12">
              <span class="title">${title}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `);
}

function getEachCategory(data) {
  data['drinks'].map((el, i) => {
    $('#categories').append(`
      <div class="col s12 m6 l4">                            
        <div class="card">
          <div class="card-image waves-effect waves-block waves-light">
            <a name="${Object.values(el)[0].replace(/\//g,'&&')}" href="/search/${Object.values(el)[0].replace(/\//g,'&&')}">
              <img id="category-img-${i}" width="305" height="229" src="" class="responsive-img wp-post-image">
              <span class="card-title text-brown">${Object.values(el)[0]}</span>
            </a>
          </div>
        </div>
      </div>
    `)
    getSrcCategoryImg(Object.values(el)[0], i);
  });
}

function getSrcCategoryImg(thisCategory, indexImg) {
  $.ajax({
    type: 'GET',
    url:'https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=' + thisCategory,
    success: function (data) {
      $(`#category-img-${indexImg}`).attr('src', data['drinks'][0]['strDrinkThumb']);
    },
    error: erro
  });
}

function getFavoriteList(ctx) {
  mainTemplateDefault('favorite-list', 'My Favorite Recipes');
  let favoriteList = localStorage.getItem('favoriteList').split(',');
  favoriteList.forEach( function (el) {
    let idDrink = el.split('-')[2];
    let url = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=' + idDrink;
    let success = getEachRecipe;
    requestAPI(url, success);
  });
}

function getRecipesList(ctx) {
  let categoryNameFromURI = ctx.params.categoryName;
  let thisCategory = categoryNameFromURI.replace(/&&/g,'/');
  mainTemplateDefault('recipes-list', thisCategory);
  let url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=' + thisCategory.replace(' ','_');
  let success = getEachRecipe;
  requestAPI(url, success);
}

function getRecipePage(ctx) {
  let drinkNameFromURI = ctx.params.recipeName;
  let drinkName = drinkNameFromURI.replace(/&&/g,'/');
  recipeTemplateDefault(drinkName);
  let url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + drinkName.replace(' ','_');
  let success = getEachInstruction;
  requestAPI(url, success);
}

function recipeTemplateDefault(drinkName) {
  $('main').html(`
    <div class="container my-font-color">
      <div class="section"> 
        <div class="row">      
          <div class="col l12">
            <article class="post-2548 post type-post status-publish format-standard has-post-thumbnail hentry category-downtown tag-mtlcafecrawl roaster-cut-coffee roaster-george-howell roaster-path-coffee-roasters roaster-st-henri roaster-the-barn-coffee-roasters roaster-transcend supplier-guillaume metro-orange metro-sherbrooke moods-community moods-philosophical purpose-social-meetups purpose-work" id="post-2548">
              <div class="row">
                <div class="col l8 s12">
                  <h4>${drinkName} <i id="" class="favorite-icon large material-icons" onclick="toFavoriteRecipe(this)">favorite</i></h4>  
                  <img id="recipe-img" width="800" height="600" src="" class="single-photo responsive-img z-depth-3 wp-post-image" sizes="(max-width: 800px) 100vw, 800px">
                </div>
                <div class="col l4 s12">
                  <div class="card-panel my-bg-color" style="min-height: 800px;">
                    <h6>RECIPE</h6>
                    <hr>
                    <span class="detail-title"><i class="tiny material-icons">shopping_cart</i> Ingredients</span>
                    <ul id="ingredients-list"></ul>
                    <hr>
                    <span class="detail-title"><i class="tiny material-icons">menu</i> Instructions</span>
                    <p id="recipe-instructions"></p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
}

function getEachInstruction(data) {
  let obj = data['drinks'][0];
  $("#recipe-img").attr('src', obj['strDrinkThumb']);
  $('#recipe-instructions').html(obj['strInstructions']);
  getIngredients(obj);
  insertFavoriteBtn(obj);
}

function getIngredients(obj) {
  for (key in obj) {
    if ((key.slice(0, 13) === 'strIngredient') && (obj[key] !== '') && (obj[key] !== null)) {
      $('#ingredients-list').append(`
      <li><i class="tiny material-icons">check</i> ${obj[key]}</li>
      `);
    }
  }
}

function insertFavoriteBtn(obj) {
  $(".favorite-icon").attr('id', `favorite-recipe-${obj['idDrink']}`);
  $(".favorite-icon").addClass(verifyRecipeIsFavorite(`favorite-recipe-${obj['idDrink']}`));
}

function getEachRecipe(data) {
  let categoryNameToURI = $('.title').html().replace(/\//g,'&&');
  data['drinks'].map((el, i) =>
    $('.to-list').append(`
      <div class="col s12 m6 l4 to-remove">
        <div class="card">
          <div class="card-image waves-effect waves-block waves-light">
            <span class="card-title favorite-icon">
              <i id="favorite-recipe-${data['drinks'][i]['idDrink']}" class="medium material-icons ${verifyRecipeIsFavorite('favorite-recipe-' + data['drinks'][i]['idDrink'])}" onclick="toFavoriteRecipe(this)">favorite</i>
            </span>
            <a name="${categoryNameToURI}/${data['drinks'][i]['strDrink'].replace(/\//g,'&&')}" onclick="redirectToOneRecipePage(event, this)">
              <img width="305" height="229" src="${data['drinks'][i]['strDrinkThumb']}">
            </a>
          </div>
          <div class="card-content">
            <p class="area"><a name="${categoryNameToURI}/${data['drinks'][i]['strDrink'].replace(/\//g,'&&')}" onclick="redirectToOneRecipePage(this)">See recipe</a></p>
            <a name="${categoryNameToURI}/${data['drinks'][i]['strDrink'].replace(/\//g,'&&')}" onclick="redirectToOneRecipePage(this)" class="card-title activator brown-text text-darken-4">${data['drinks'][i]['strDrink']}</span></a>
          </div>
        </div>
      </div>
    `)
  );
}

function verifyRecipeIsFavorite(id) {
  let favoriteList = localStorage.getItem('favoriteList');
  if (favoriteList.includes(id)) {
    return 'favorite-icon-selected';
  } else {
    return 'favorite-icon-unselected';
  }
}

function toFavoriteRecipe(recipeSelected) {
  setClassToFavoriteIcon(recipeSelected);
  toUpdateFavoriteList(recipeSelected);
}

function setClassToFavoriteIcon(recipeSelected) {
  if ($(recipeSelected).hasClass('favorite-icon-selected')) {
    $(recipeSelected).removeClass('favorite-icon-selected');
    $(recipeSelected).addClass('favorite-icon-unselected');
    removeRecipeFromFavoriteList(recipeSelected);
  } else {
    $(recipeSelected).removeClass('favorite-icon-unselected');
    $(recipeSelected).addClass('favorite-icon-selected');
  }
}

function removeRecipeFromFavoriteList(recipeSelected) {
  $(recipeSelected).closest('#favorite-list .to-remove').fadeOut('slow');
}

function toUpdateFavoriteList(recipeSelected) {
  if ($(recipeSelected).hasClass('favorite-icon-selected')) {
    favoriteList.push(recipeSelected.id);
    $('#favorites-counter').html(favoriteList.length);
    localStorage.setItem('favoriteList', favoriteList);
  } else {
    favoriteList = favoriteList.filter(el => el !== recipeSelected.id);
    $('#favorites-counter').html(favoriteList.length);
    localStorage.setItem('favoriteList', favoriteList);
  }
}

function notfound() {
  $('main').html('Page not found');
}

function erro() {
  console.log('Error in API requesting');
}