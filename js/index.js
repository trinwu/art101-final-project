// List of recipes
const recipes = [
    { difficulty: "easy", name: "Scrambled Eggs:", recipe: "Beat eggs, cook in butter, season, enjoy!" },
    { difficulty: "easy", name: "Boiled Eggs:", recipe: "Boil eggs for 6-10 minutes, cool, peel, and serve." },
    { difficulty: "medium", name: "Omlette", recipe: "Beat eggs, add fillings, cook on medium heat." },
    { difficulty: "medium", name: "Egg Salad:", recipe: "Boiled eggs, mayo, mustard, mix and serve." },
    { difficulty: "hard", name: "Soufflé", recipe: "Separate eggs, whip whites, fold into yolks, bake." },
    { difficulty: "hard", name: "Eggs Benedict", recipe: "Poach eggs, hollandaise sauce, toasted muffin." },
];

const overlay = document.querySelector(".overlay");
const recipeTitle = document.getElementById("recipeName");
const recipeOutput = document.getElementById("recipeOutput");


// Load eggs dynamically
function loadEggs() {
    const eggContainer = document.getElementById("egg-container");
    eggContainer.innerHTML = ""; // Clear previous eggs
    for (let i = 0; i < 30; i++) { // Create 30 eggs
        const egg = document.createElement("div");
        egg.classList.add("egg");
        egg.addEventListener("click", function () {
            const recipe = getRandomRecipe();
            // alert(recipe.recipe);
            popupMessage(recipe.name, recipe.recipe);
        });
        eggContainer.appendChild(egg);
    }
}

// Get a random recipe
function getRandomRecipe(difficulty = "all") {
    let filteredRecipes = recipes;
    if (difficulty !== "all") {
        filteredRecipes = recipes.filter(function (recipe) {
            return recipe.difficulty === difficulty;
        });
    }
    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    return filteredRecipes[randomIndex];
}

// Filter recipes
function setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-button");
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const difficulty = button.dataset.filter;
            loadEggs(); // Refresh eggs
            popupMessage("Changes made!", "Filtered for " + difficulty + " recipes! Click on an egg!");

        });
    });
}

// Function that displays and hides the popup. Name takes in the title <h2> and recipe is the message <p>
function popupMessage (name, recipe) {
    recipeTitle.textContent = name;
    recipeOutput.textContent = recipe;
    overlay.style.display = "flex";
}


// Function that hides the menu when the return button is clicked
function hideMenu() {
    if (overlay) {
        overlay.style.display = "none";
    }
}

// Initialize the app
function initializeApp() {
    loadEggs();
    setupFilters();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", initializeApp);
document.getElementById("return").addEventListener("click", hideMenu); // Return button for pop-up menu
document.addEventListener("keydown", hideMenu); // Escape Key for pop-up menu


