// TheMealDB API configuration
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
let mealRecipes = [];
let activeFilter = "all"; // Default filter
let isSpinning = false;

// Initialize slot machine elements
const chickenRow = document.querySelector('.chicken-row');
const spinButton = document.querySelector('.spin-button');
const chickenWidth = 250;
const totalChickens = 10;
const setWidth = chickenWidth * totalChickens;

// Disable transitions initially
if (chickenRow) {
    chickenRow.style.transition = 'none';
    chickenRow.style.transform = 'translateX(0)';
}

// Fetch recipes for "chicken," "chicken breast," and "chicken thighs"
async function fetchRecipes() {
    try {
        const fetchData = async (ingredient) => {
            const response = await fetch(`${BASE_URL}/filter.php?i=${ingredient}`);
            const data = await response.json();
            return data.meals || [];
        };

        // Fetch recipes for different chicken types
        const [chickenMeals, chickenBreastMeals, chickenThighsMeals] = await Promise.all([
            fetchData('chicken'),
            fetchData('chicken_breast'),
            fetchData('chicken_thighs')
        ]);

        // Combine and fetch detailed information
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
                    difficulty: getDifficulty(ingredients.length),
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
    if (ingredientCount <= 9) return "easy";
    if (ingredientCount <= 13) return "medium";
    return "hard";
}

// Get a random recipe
function getRandomRecipe() {
    if (mealRecipes.length === 0) {
        return { name: "No Recipe Available", instructions: "Please try again later.", ingredients: [] };
    }

    const filteredRecipes = activeFilter === "all"
        ? mealRecipes
        : mealRecipes.filter(recipe => recipe.difficulty === activeFilter);

    if (filteredRecipes.length === 0) {
        return { name: "No Recipe Available", instructions: "Please try a different filter.", ingredients: [] };
    }

    return filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
}

// Show recipe popup
function popupMessage(name, recipe, ingredients = []) {
    const recipeTitle = document.getElementById("recipeName");
    const recipeOutput = document.getElementById("recipeOutput");
    const overlay = document.querySelector(".overlay");
    const popupSound = document.getElementById("popup-sound");


    const ingredientsHTML = `<div class="ingredients"><h3>Ingredients:</h3>${ingredients.map((ing) => `<span class="ingredientsSpan">${ing}</span>`).join('')}</div>`;
    const instructionsHTML = `<div class="instructions"><h3>Instructions:</h3><p>${recipe}</p></div>`;

    popupSound.play();
    recipeTitle.textContent = name;
    recipeOutput.innerHTML = `${ingredientsHTML}${instructionsHTML}`;
    overlay.style.display = "flex";
}

// Hide the popup
function hideMenu() {
    document.querySelector(".overlay").style.display = "none";
}

// Apply filter
function applyFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll(".filter-button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === filter);
    });
}

// Spin function
function spin() {
    if (isSpinning) return;

    // Enable transitions for the spin
    chickenRow.style.transition = 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)';

    // Play sound effect
    const clickSound = document.getElementById("click-sound");
    clickSound.currentTime = 0;
    clickSound.play();

    isSpinning = true;
    spinButton.disabled = true;

    // Calculate random ending position
    const spins = 2;
    const randomChicken = Math.floor(Math.random() * totalChickens);
    const finalDistance = -(setWidth * spins + randomChicken * chickenWidth);

    // Apply the animation
    chickenRow.style.transform = `translateX(${finalDistance}px)`;

    // Show recipe after animation
    setTimeout(() => {
        const recipe = getRandomRecipe();
        popupMessage(recipe.name, recipe.instructions, recipe.ingredients);
        isSpinning = false;
        spinButton.disabled = false;

        // Reset position for next spin
        setTimeout(() => {
            chickenRow.style.transition = 'none';
            chickenRow.style.transform = 'translateX(0)';
        }, 1000);
    }, 2500);
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await fetchRecipes();
});

// Event listeners
document.querySelectorAll(".filter-button").forEach(button => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
});
document.getElementById("return").addEventListener("click", hideMenu);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideMenu();
});

// Expose spin function globally
window.spin = spin;