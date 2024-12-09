// TheMealDB API configuration
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
let mealRecipes = [];

// Load eggs dynamically (now with chicken theme)
async function loadEggs() {
    const eggContainer = document.getElementById("egg-container");
    eggContainer.innerHTML = ""; // Clear previous eggs

    try {
        // Fetch chicken recipes from TheMealDB
        await fetchChickenRecipes();

        for (let i = 0; i < 30; i++) { // Create 30 eggs
            const egg = document.createElement("div");
            egg.classList.add("egg");
            egg.addEventListener("click", function () {
                const recipe = getRandomRecipe();
                popupMessage(recipe.name, recipe.instructions, recipe.ingredients);
                const clickSound = document.getElementById("click-sound");
                clickSound.currentTime = 0; // Reset sound to start
                clickSound.play();
            });
            eggContainer.appendChild(egg);
        }
    } catch (error) {
        console.error("Detailed Error Loading Chicken Recipes:", error);
        
        // Fallback to default recipes
        mealRecipes = [
            { 
                difficulty: "easy", 
                name: "Grilled Chicken", 
                instructions: "Season chicken, grill until cooked through, serve hot.",
                ingredients: [
                    "Chicken breast",
                    "Salt",
                    "Pepper",
                    "Olive oil"
                ]
            },
            { 
                difficulty: "medium", 
                name: "Chicken Stir Fry", 
                instructions: "Cut chicken, stir fry with vegetables, add sauce, serve over rice.",
                ingredients: [
                    "Chicken thighs",
                    "Mixed vegetables",
                    "Soy sauce",
                    "Garlic",
                    "Rice"
                ]
            },
            { 
                difficulty: "hard", 
                name: "Roasted Chicken", 
                instructions: "Prepare whole chicken, season inside and out, roast in oven until golden and cooked through.",
                ingredients: [
                    "Whole chicken",
                    "Rosemary",
                    "Thyme",
                    "Butter",
                    "Salt",
                    "Pepper"
                ]
            }
        ];

        popupMessage("Error", "Could not fetch recipes. Using default recipes.", mealRecipes[0].ingredients);
    }
}

// Fetch recipes with "chicken" and "chicken_breast" as main ingredients from TheMealDB API
async function fetchChickenRecipes() {
    try {
        // Fetch recipes where chicken is the main ingredient
        const chickenUrl = `${BASE_URL}/filter.php?i=chicken`;
        const chickenResponse = await fetch(chickenUrl);

        if (!chickenResponse.ok) {
            throw new Error(`HTTP error for chicken! status: ${chickenResponse.status}`);
        }
        const chickenData = await chickenResponse.json();

        // Fetch recipes where chicken_breast is the main ingredient
        const chickenBreastUrl = `${BASE_URL}/filter.php?i=chicken_breast`;
        const chickenBreastResponse = await fetch(chickenBreastUrl);

        if (!chickenBreastResponse.ok) {
            throw new Error(`HTTP error for chicken_breast! status: ${chickenBreastResponse.status}`);
        }
        const chickenBreastData = await chickenBreastResponse.json();

        // Combine the recipes
        const allMeals = [
            ...(chickenData.meals || []),
            ...(chickenBreastData.meals || [])
        ];

        // Log the number of recipes fetched
        console.log(`Initial fetch: Found ${allMeals.length} recipes with chicken and chicken_breast as main ingredients.`);

        if (allMeals.length === 0) {
            throw new Error("No recipes with chicken or chicken_breast found");
        }

        // Fetch detailed information for each recipe
        const detailedRecipes = await Promise.all(
            allMeals.map(async (meal) => {
                try {
                    const detailUrl = `${BASE_URL}/lookup.php?i=${meal.idMeal}`;
                    const detailResponse = await fetch(detailUrl);
                    const detailData = await detailResponse.json();

                    const mealDetails = detailData.meals[0];
                    const ingredients = [];

                    // Extract ingredients and measurements
                    for (let i = 1; i <= 20; i++) {
                        const ingredient = mealDetails[`strIngredient${i}`];
                        const measure = mealDetails[`strMeasure${i}`];

                        if (ingredient && ingredient.trim() !== '') {
                            ingredients.push(`${measure ? measure + ' ' : ''}${ingredient}`);
                        }
                    }

                    return {
                        id: mealDetails.idMeal,
                        name: mealDetails.strMeal,
                        instructions: mealDetails.strInstructions,
                        ingredients: ingredients,
                        difficulty: getDifficulty(mealDetails.strInstructions)
                    };
                } catch (err) {
                    console.error(`Error fetching details for recipe ${meal.idMeal}:`, err);
                    return null;
                }
            })
        );

        // Filter out any null recipes and assign to mealRecipes
        mealRecipes = detailedRecipes.filter(recipe => recipe !== null);

        // Log the number of detailed recipes successfully fetched
        console.log(`Detailed fetch: Successfully retrieved ${mealRecipes.length} detailed recipes from both chicken and chicken_breast.`);
    } catch (error) {
        console.error("Detailed Fetch Error:", error);
        throw error;
    }
}




// Determine recipe difficulty based on instructions length
function getDifficulty(instructions) {
    const length = instructions ? instructions.length : 0;
    if (length <= 200) return "easy";
    if (length <= 400) return "medium";
    return "hard";
}

// Get a random recipe
function getRandomRecipe(difficulty = "all") {
    let filteredRecipes = mealRecipes;
    if (difficulty !== "all") {
        filteredRecipes = mealRecipes.filter(function (recipe) {
            return recipe.difficulty === difficulty;
        });
    }

    // Fallback to default recipes if no API recipes found
    if (filteredRecipes.length === 0) {
        filteredRecipes = [
            { name: "No Recipes", instructions: "Unable to fetch recipes from TheMealDB.", ingredients: [] }
        ];
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
            popupMessage("Changes made!", "Filtered for " + difficulty + " recipes! Click on an Chicken!");
        });
    });
}

// Function that displays and hides the popup
function popupMessage (name, recipe, ingredients = []) {
    const recipeTitle = document.getElementById("recipeName");
    const recipeOutput = document.getElementById("recipeOutput");
    const overlay = document.querySelector(".overlay");

    // Prepare ingredients list
    const ingredientsList = ingredients.length > 0 
        ? "Ingredients:\n" + ingredients.map(ing => `• ${ing}`).join('\n')
        : "No ingredients found";

    // Truncate long instructions if needed
    const truncatedRecipe = recipe.length > 500 
        ? recipe.substring(0, 500) + "..." 
        : recipe;

    // Combine ingredients and instructions
    const fullRecipeText = `${ingredientsList}\n\nInstructions:\n${truncatedRecipe}`;

    recipeTitle.textContent = name;
    recipeOutput.textContent = fullRecipeText;
    overlay.style.display = "flex";
}

// Function that hides the menu when the return button is clicked
function hideMenu() {
    const overlay = document.querySelector(".overlay");
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
document.getElementById("return").addEventListener("click", hideMenu);
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") hideMenu();
});