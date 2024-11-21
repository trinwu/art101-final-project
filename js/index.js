// List of recipes
const recipes = [
    { difficulty: "easy", recipe: "Scrambled Eggs: Beat eggs, cook in butter, season, enjoy!" },
    { difficulty: "easy", recipe: "Boiled Eggs: Boil eggs for 6-10 minutes, cool, peel, and serve." },
    { difficulty: "medium", recipe: "Omelette: Beat eggs, add fillings, cook on medium heat." },
    { difficulty: "medium", recipe: "Egg Salad: Boiled eggs, mayo, mustard, mix and serve." },
    { difficulty: "hard", recipe: "Soufflé: Separate eggs, whip whites, fold into yolks, bake." },
    { difficulty: "hard", recipe: "Eggs Benedict: Poach eggs, hollandaise sauce, toasted muffin." },
];

// Load eggs dynamically
function loadEggs() {
    const eggContainer = document.getElementById("egg-container");
    eggContainer.innerHTML = ""; // Clear previous eggs
    for (let i = 0; i < 30; i++) { // Create 30 eggs
        const egg = document.createElement("div");
        egg.classList.add("egg");
        egg.addEventListener("click", function () {
            const recipe = getRandomRecipe();
            alert(recipe.recipe); // Display recipe in an alert
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
            alert("Filtered for " + difficulty + " recipes! Click on an egg.");
        });
    });
}

// Initialize the app
function initializeApp() {
    loadEggs();
    setupFilters();
}

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", initializeApp);
