// TheMealDB API configuration
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
let mealRecipes = [];
let activeFilter = "all"; // Default filter

// Load eggs dynamically
async function loadEggs() {
    const eggContainer = document.getElementById("egg-container");
    eggContainer.innerHTML = ""; // Clear previous eggs

    try {
        await fetchRecipes();

        for (let i = 0; i < 30; i++) {
            const egg = document.createElement("div");
            egg.classList.add("egg");
            egg.addEventListener("click", function () {
                const recipe = getRandomRecipe();
                popupMessage(recipe.name, recipe.instructions, recipe.ingredients);
                const clickSound = document.getElementById("click-sound");
                clickSound.currentTime = 0;
                clickSound.play();
            });
            eggContainer.appendChild(egg);
        }
    } catch (error) {
        console.error("Error loading recipes:", error);
    }
}

// Fetch recipes for "chicken," "chicken breast," and "chicken thighs"
async function fetchRecipes() {
    try {
        const fetchData = async (ingredient) => {
            const response = await fetch(`${BASE_URL}/filter.php?i=${ingredient}`);
            const data = await response.json();
            return data.meals || [];
        };

        // Fetch recipes for chicken, chicken breast, and chicken thighs
        const [chickenMeals, chickenBreastMeals, chickenThighsMeals] = await Promise.all([
            fetchData('chicken'),
            fetchData('chicken_breast'),
            fetchData('chicken_thighs')
        ]);

        // Combine and fetch detailed information for all unique recipes
        const combinedMeals = [...new Map([
            ...chickenMeals,
            ...chickenBreastMeals,
            ...chickenThighsMeals
        ].map(meal => [meal.idMeal, meal])).values()];

        const detailedRecipes = await Promise.all(
            combinedMeals.map(async (meal) => {
                const detailResponse = await fetch(`${BASE_URL}/lookup.php?i=${meal.idMeal}`);
                const detailData = await detailResponse.json();
                const mealDetails = detailData.meals[0];

                const ingredients = [];
                for (let i = 1; i <= 20; i++) {
                    const ingredient = mealDetails[`strIngredient${i}`];
                    const measure = mealDetails[`strMeasure${i}`];
                    if (ingredient) {
                        ingredients.push(`${measure ? measure + ' ' : ''}${ingredient}`);
                    }
                }

                return {
                    name: mealDetails.strMeal,
                    instructions: mealDetails.strInstructions,
                    ingredients: ingredients,
                    difficulty: getDifficulty(ingredients.length), // Assign difficulty based on ingredient count
                };
            })
        );

        mealRecipes = detailedRecipes;
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

// Determine difficulty based on the number of ingredients
function getDifficulty(ingredientCount) {
    if (ingredientCount <= 9) return "easy"; // 9 ingredients or less
    if (ingredientCount <= 13) return "medium"; // 10 to 13 ingredients
    return "hard"; // 14 or more ingredients
}

// Get a random recipe from the filtered pool
function getRandomRecipe() {
    if (mealRecipes.length === 0) {
        return { name: "No Recipe Available", instructions: "Please try again later.", ingredients: [] };
    }

    // Filter recipes based on the active filter
    const filteredRecipes = activeFilter === "all"
        ? mealRecipes
        : mealRecipes.filter(recipe => recipe.difficulty === activeFilter);

    console.log(`Filtered Recipes (${filteredRecipes.length}) for filter "${activeFilter}":`, filteredRecipes);

    if (filteredRecipes.length === 0) {
        return { name: "No Recipe Available", instructions: "Please try a different filter.", ingredients: [] };
    }

    const recipe = filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
    return recipe;
}

// Show recipe details in a popup
function popupMessage(name, recipe, ingredients = []) {
    const recipeTitle = document.getElementById("recipeName");
    const recipeOutput = document.getElementById("recipeOutput");
    const overlay = document.querySelector(".overlay");

    const ingredientsHTML = `<div class="ingredients"><h3>Ingredients:</h3><ul>${ingredients.map((ing) => `<li>${ing}</li>`).join('')}</ul></div>`;
    const instructionsHTML = `<div class="instructions"><h3>Instructions:</h3><p>${recipe}</p></div>`;

    recipeTitle.textContent = name;
    recipeOutput.innerHTML = `${ingredientsHTML}${instructionsHTML}`;
    overlay.style.display = "flex";
}

// Hide the popup
function hideMenu() {
    document.querySelector(".overlay").style.display = "none";
}

// Apply a filter
function applyFilter(filter) {
    activeFilter = filter; // Update the active filter
    loadEggs(); // Reload eggs with the updated filter
}

// Attach event listeners for filtering
document.querySelectorAll(".filter-button").forEach(button => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

// Initialize the app
document.addEventListener("DOMContentLoaded", loadEggs);
document.getElementById("return").addEventListener("click", hideMenu);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideMenu();
});
