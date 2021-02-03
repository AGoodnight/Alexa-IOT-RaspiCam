const _ = require('lodash');
const Alexa = require('alexa-sdk');


const MENU_ITEMS = [{
  name:'Three Cheese Kale Bake',
  ingredients:[
    'Cheese',
    'Kale',
    'Milk',
    'Butter',
    'Egg Noodles',
    'Tomatoes or Parmessian'
  ]
}]

function getRandomMenuItem(){
  let _index = Math.floor(Math.random(MENU_ITEMS.length-1));
  return decideOn(MENU_ITEMS);
}

function getMenuItem(){
  return 'Make some '+queryIngredients(['cheese','kale']);
}

function queryIngredients(keyWords){
  let candidates = [];
  if(keyWords.kength){
    for (let dishes of MENU_ITEMS){
      candidates.push(_.filter(dishes['ingredients'],(ingredient)=>{
        return ingredient = true
      }));
      return decide(candidates);
    }
  }else{
    return 'Undefined';
  }
}

function decideOn(candidates){
  let _index = Math.floor(Math.random(candidates.length-1));
  return candidates[_index];
}
