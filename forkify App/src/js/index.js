import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';


const state = {}

//Search Controller

const controlSearch = async () =>{
    //get query from view
    const query = searchView.getInput();
    

    if (query){
        //new search object and add to state
        state.search = new Search(query);
        //prepare UI for results
        searchView.clearInputs();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        //search for recipes
        try {
            await state.search.getResults();
            //Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Something is wrong with the search...');
            clearLoader();
        }
        
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPage.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
}); 


//Recipe Controller


const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    

    if(id){
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        if(state.search) searchView.highlightSelected(id);
        state.recipe = new Recipe(id);  
        try{
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServing();
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
            //console.log(state.recipe);
        }
        catch (err){
            console.log(err)
            alert('Error Processing in Recipe!!');
        }
        
    }
}

;

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//LIST CONTROLLER

const controlList = () => {
    if(!state.list) state.list = new List();

    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}


//LIKE CONTROLLER


const controlLike = () => {

    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

        if(!state.likes.isLiked(currentID)){
            const newLike = state.likes.addLike(
                currentID,
                state.recipe.title,
                state.recipe.author,
                state.recipe.img
            );
            likesView.toggleLikeBtn(true);
            likesView.renderLike(newLike);
            console.log(state.likes);
        }else{
            state.likes.deleteLike(currentID);
            likesView.toggleLikeBtn(false);
            likesView.deleteLike(currentID);
            console.log(state.likes);
        }
        likesView.toggleLikeMenu(state.likes.getNumLikes());
};







//Handle delete & update list item events

elements.shopping.addEventListener('click', e=>{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


//handling liked recipe on page load

window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
})




//handling Recipe Button Clicks

elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec')
            recipeView.updateServingsIngredients(state.recipe);
        } 
    }else if (e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe);
    }else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
    
});

