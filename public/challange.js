"use strict";
const bakery = require('../data/bakery.json');
const wedding = require('../data/cakesForWedding.json');
const fs = require('fs');
const path = require('path');
/**
 * It takes a bakery object, maps through the recipes, maps through the ingredients, and changes the
 * unit of measurement from grams to kilograms and milliliters to liters
 * @param {Bakery} bakery - Bakery - the bakery object
 * @returns The bakery object with the recipes array changed to the new unit.
 */
function unitchange(bakery) {
    const unitChange = bakery.recipes.map(elem => {
        elem.ingredients.map(e => {
            switch (String(e.amount).split(" ")[1]) {
                case 'g':
                    e.amount = String(Number(String(e.amount).split(" ")[0]) / 1000 + " kg");
                    break;
                case 'ml':
                    e.amount = String(Number(String(e.amount).split(" ")[0]) / 1000 + " l");
                    break;
                case 'pc':
                    break;
            }
            return e;
        });
        return elem;
    });
    bakery.recipes = unitChange;
    return bakery;
}
unitchange(bakery);
const item = JSON.stringify(bakery);
/**
 * It takes a bakery object, loops through the recipes, finds the sales of the last week, and returns
 * the total sales
 * @param {Bakery} bakery - Bakery
 * @returns The total sales of the bakery
 */
const TaskSumTotalSales = (item) => {
    const bakeryNotMutal = JSON.parse(item);
    let count = 0;
    const calculate = bakeryNotMutal.recipes.map(elem => {
        let { name: recipeName, price: recipePrice } = elem;
        let sales = bakeryNotMutal.salesOfLastWeek.find(elems => recipeName === elems.name);
        if (sales === null || sales === void 0 ? void 0 : sales.amount) {
            count += Number(sales.amount) * Number(recipePrice.split(" ")[0]);
        }
        return count;
    });
    return count;
};
/**
 * It takes a bakery object and returns an object with three properties: glutenFree, lactoseFree and
 * lactoseAndGlutenFree. Each property is an array of objects with name and price properties
 * @param {Bakery} bakery - Bakery
 * @returns {
 *     "glutenFree": [
 *         {
 *             "name": "Chocolate Cake",
 *             "price": "10"
 *         },
 *         {
 *             "name": "Chocolate Cake",
 *             "price": "10"
 *         }
 *     ],
 *     "lactoseFree": [
 *         {
 *             "name": "
 */
const Intolerance = (item) => {
    const bakeryNotMutal = JSON.parse(item);
    function nameAndPrice(value) {
        const { name, price } = value;
        return { name, price };
    }
    const alergies = {
        glutenFree: Object.values(bakeryNotMutal.recipes)
            .filter((recipe) => (recipe.glutenFree && !recipe.lactoseFree))
            .map((glutenFREE) => nameAndPrice(glutenFREE)),
        lactoseFree: Object.values(bakeryNotMutal.recipes)
            .filter((recipe) => (!recipe.glutenFree && recipe.lactoseFree))
            .map((lactoseFREE) => nameAndPrice(lactoseFREE)),
        lactoseAndGlutenFree: Object.values(bakeryNotMutal.recipes)
            .filter((recipe) => (recipe.glutenFree && recipe.lactoseFree))
            .map((alergenFREE) => nameAndPrice(alergenFREE)),
    };
    return alergies;
};
const TaskGroupByIntolerance = JSON.stringify(Intolerance(item));
/**
 * It takes a bakery object, calculates the total sales of the bakery, then calculates the total cost
 * of the ingredients used in the bakery, and returns the difference between the two
 * @param {Bakery} bakery - Bakery
 * @returns The total profit of the bakery
 */
const TaskSumTotalProfit = (item) => {
    const bakeryNotMutal = JSON.parse(item);
    let invesment = 0;
    let ingredientMultiple = [];
    const calcIngredientUsage = bakeryNotMutal.salesOfLastWeek.map(element => {
        bakeryNotMutal.recipes.filter(elem => element.name == elem.name).map(elems => {
            let ingredientMul = elems.ingredients.map(e => {
                e.amount = String(Number(String(e.amount).split(" ")[0]) * Number(element.amount)) + " " + String(e.amount).split(" ")[1];
                ingredientMultiple.push({
                    name: e.name,
                    amount: e.amount
                });
            });
        });
    });
    const calcIngredientUsagePrice = ingredientMultiple.map(element => {
        const ingPrice = bakeryNotMutal.wholesalePrices.map(elem => {
            if (element.name == elem.name) {
                invesment += (Number(String(element.amount).split(" ")[0]) / Number(String(elem.amount).split(" ")[0])) * Number(elem.price);
            }
        });
    });
    return Number(TaskSumTotalSales(item)) - invesment;
};
const answerThree = TaskSumTotalProfit(item);
/**
 * It takes the bakery object, and returns an array of objects, which contains the name of the cake,
 * and the amount of cakes that can be baked with the current inventory
 * @param {Bakery} bakery - Bakery = {
 * @returns [
 *     {
 *         "name": "Cake",
 *         "amount": 1
 *     },
 *     {
 *         "name": "Cupcake",
 *         "amount": 2
 *     },
 *     {
 *         "name": "Donut",
 *         "amount": 2
 *     },
 *     {
 *         "name": "Muffin",
 */
const TaskCalcTotalBakeCakeableAmount = (item) => {
    const bakeryNotMutal = JSON.parse(item);
    const calc = bakeryNotMutal.recipes.map((element) => {
        let ingredients = element.ingredients.map((elem) => {
            let search = bakeryNotMutal.inventory.filter((elems) => elems.name == elem.name);
            let amount = Math.floor(Number(String(search[0].amount).split(" ")[0]) / Number(String(elem.amount).split(" ")[0]));
            return { name: elem.name, amount: amount };
        });
        return { name: element.name, ingredients };
    });
    let ordered = calc.map((elem) => {
        elem.ingredients.sort((a, b) => Number(a.amount) - Number(b.amount));
        return elem;
    });
    let maxBakingAmount = ordered.map((elem) => {
        return {
            name: String(elem.name),
            amount: Number(elem.ingredients[0].amount),
        };
    });
    return maxBakingAmount.sort((a, b) => a.name.localeCompare(b.name, "hu"));
};
const TaskCalcTotalBakeableAmount = JSON.stringify(TaskCalcTotalBakeCakeableAmount(item));
/**
 * It takes a bakery and a wedding and returns the amount of money wasted on ingredients for the
 * wedding
 * @param {Bakery} bakery - Bakery
 * @param {Wedding} wedding - {
 * @returns The amount of money wasted on ingredients for the wedding.
 */
const TaskCalcOrderForWedding = (item, wedding) => {
    const bakeryNotMutal = JSON.parse(item);
    let moneyWasted = 0;
    const ingredientIncrease = wedding.order.map(elem => {
        let cake = bakeryNotMutal.recipes.filter(elems => elem.name == elems.name);
        let cakePrice = cake[0].ingredients.map(element => {
            let ingredientPrice = bakeryNotMutal.wholesalePrices.filter(el => element.name == el.name);
            return {
                name: ingredientPrice[0].name,
                amount: ingredientPrice[0].amount,
                price: ingredientPrice[0].price
            };
        });
        let increasedAmountAndPrices = cake[0].ingredients.map(e => {
            let priceAmount = cakePrice.filter(ele => e.name == ele.name);
            let incredAmount = Math.round(Number(String(e.amount).split(" ")[0]) * Number(elem.amount));
            let whamount = Number(String(priceAmount[0].amount).split(" ")[0]);
            let amounts = Math.ceil(incredAmount / whamount);
            moneyWasted += amounts * priceAmount[0].price;
        });
    });
    return moneyWasted;
};
const answerFive = TaskCalcOrderForWedding(item, wedding);
/**
 * It takes the bakery object and returns a list of ingredients that need to be bought for the next two
 * weeks
 * @param {Bakery} bakery - The bakery object
 */
const TaskCalcFuture = (item) => {
    const bakeryNotMutal = JSON.parse(item);
    let increaseIng = [];
    const cakes = bakeryNotMutal.salesOfLastWeek.filter(element => {
        const calc = bakeryNotMutal.recipes.map(elem => {
            if (element.name == elem.name) {
                elem.ingredients.map(e => {
                    let amountNum = Number(String(e.amount).split(" ")[0]);
                    let amountUnit = String(e.amount).split(" ")[1];
                    e.amount = String(amountNum * Number(element.amount) * 2 * 1.1) + " " + amountUnit;
                    return e.amount;
                });
            }
            return elem;
        });
        increaseIng = calc;
    });
    const increaseIngFilter = bakeryNotMutal.salesOfLastWeek.map((e) => increaseIng.find(el => e.name == el.name));
    const ingredientsOnlyAndSum = increaseIngFilter.map((e) => e.ingredients).flatMap(e => e).reduce((curr, next) => {
        var _a;
        const { name, amount } = next;
        let amountNum = Number(amount.split(" ")[0]);
        let amountUnit = amount.split(" ")[1];
        if (curr[name] == null) {
            (_a = curr[name]) !== null && _a !== void 0 ? _a : (curr[name] = []);
            curr[name].push({
                name: name,
                amount: String(amountNum) + " " + amountUnit
            });
        }
        else {
            let old = Number(curr[name][0].amount.split(" ")[0]);
            curr[name][0].amount = String(Number(old) + Number(amountNum)) + " " + amountUnit;
        }
        return curr;
    }, {});
    let listForClerk = [];
    const netxTwoWeekIngredinent = () => {
        for (let item of Object.keys(ingredientsOnlyAndSum)) {
            let whsale = ingredientsOnlyAndSum[item].map((e) => bakeryNotMutal.wholesalePrices.find(el => e.name == el.name));
            let inventory = ingredientsOnlyAndSum[item].map((e) => bakeryNotMutal.inventory.find(el => e.name == el.name));
            let invAmountNum = Number(inventory[0].amount.split(" ")[0]);
            let { name, amount, price } = whsale[0];
            let oneItem = price / Number(String(amount).split(" ")[0]);
            let ingredientsToBuy = Number(ingredientsOnlyAndSum[item][0].amount.split(" ")[0]) - Number(invAmountNum);
            let calc = Math.ceil(Math.ceil(ingredientsToBuy / Number(String(amount).split(" ")[0])) * Number(String(amount).split(" ")[0]));
            if (calc * oneItem > 0) {
                listForClerk.push({
                    name: name,
                    amount: String(calc) + " " + String(amount).split(" ")[1],
                    totalPrice: calc * oneItem
                });
            }
        }
    };
    netxTwoWeekIngredinent();
    listForClerk.sort((a, b) => b.totalPrice - a.totalPrice);
    return listForClerk;
};
const TaskCalcFutureSales = TaskCalcFuture(item);
function answerTojson(data, filename) {
    fs.writeFileSync(path.resolve(__dirname, '../answers', filename), JSON.stringify(data));
}
console.log(`Answer for Challange Two : ${TaskSumTotalSales(item)}`);
answerTojson(TaskSumTotalSales(item), 'AnswerForChallangeOneTS.json');
console.log('-------------');
console.log(`Answer for Challange Two : ${TaskGroupByIntolerance}`);
answerTojson(Intolerance(item), 'AnswerForChallangeTwoTS.json');
console.log('-------------');
console.log(`Answer for Challange Three : ${answerThree}`);
answerTojson(answerThree, 'AnswerForChallangeThreeTS.json');
console.log('-------------');
console.log(`Answer for Challange Four : ${TaskCalcTotalBakeableAmount}`);
answerTojson(TaskCalcTotalBakeCakeableAmount(item), 'AnswerForChallangeFourTS.json');
console.log('-------------');
console.log(`Answer for Challange Five : ${answerFive}`);
answerTojson(answerFive, 'AnswerForChallangeFiveTS.json');
console.log('-------------');
console.log(`Answer for Challange Six : ${JSON.stringify(TaskCalcFutureSales)}`);
answerTojson(TaskCalcFuture(item), 'AnswerForChallangeSixTS.json');
console.log('-------------');
//# sourceMappingURL=challange.js.map