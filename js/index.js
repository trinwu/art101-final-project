// TheMealDB API configuration
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
let mealRecipes = [];

// Load eggs dynamically
async function loadEggs() {
    const eggContainer = document.getElementById("egg-container");
    eggContainer.innerHTML = ""; // Clear previous eggs

    try {
        await fetchChickenRecipes();

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

async function fetchChickenRecipes() {
    try {
        const response = await fetch(`${BASE_URL}/filter.php?i=chicken`);
        const data = await response.json();

        const detailedRecipes = await Promise.all(
            data.meals.map(async (meal) => {
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
                };
            })
        );

        mealRecipes = detailedRecipes;
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

function getRandomRecipe() {
    return mealRecipes[Math.floor(Math.random() * mealRecipes.length)];
}

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

function hideMenu() {
    document.querySelector(".overlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", loadEggs);
document.getElementById("return").addEventListener("click", hideMenu);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideMenu();
});
