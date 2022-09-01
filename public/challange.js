"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bakery = require('../data/bakery.json');
const wedding = require('../data/cakesForWedding.json');
function unitchange(bakery) {
    const unitChange = bakery.recipes.map(elem => {
        elem.ingredients.map(e => {
            switch (e.amount.split(" ")[1]) {
                case 'g':
                    e.amount = String(Number.parseFloat(e.amount.split(" ")[0]) / 1000 + " kg");
                    break;
                case 'ml':
                    e.amount = String(Number.parseFloat(e.amount.split(" ")[0]) / 1000 + " l");
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
const TaskSumTotalSales = (bakery) => {
    let count = 0;
    const calculate = bakery.recipes.map(elem => {
        let { name: recipeName, price: recipePrice } = elem;
        let sales = bakery.salesOfLastWeek.find(elems => recipeName === elems.name);
        if (sales === null || sales === void 0 ? void 0 : sales.amount) {
            count += sales.amount * Number(recipePrice.split(" ")[0]);
        }
        return count;
    });
    return count;
};
const Intolerance = (bakery) => {
    function nameAndPrice(value) {
        const { name, price } = value;
        return { name, price };
    }
    const alergies = {
        glutenFree: Object.values(bakery.recipes)
            .filter((recipe) => (recipe.glutenFree && !recipe.lactoseFree))
            .map((glutenFREE) => nameAndPrice(glutenFREE)),
        lactoseFree: Object.values(bakery.recipes)
            .filter((recipe) => (!recipe.glutenFree && recipe.lactoseFree))
            .map((lactoseFREE) => nameAndPrice(lactoseFREE)),
        lactoseAndGlutenFree: Object.values(bakery.recipes)
            .filter((recipe) => (recipe.glutenFree && recipe.lactoseFree))
            .map((alergenFREE) => nameAndPrice(alergenFREE)),
    };
    return alergies;
};
const TaskGroupByIntolerance = JSON.stringify(Intolerance(bakery));
const TaskSumTotalProfit = (bakery) => {
    let invesment = 0;
    let ingredientMultiple = [];
    const calcIngredientUsage = bakery.salesOfLastWeek.map(element => {
        bakery.recipes.filter(elem => element.name == elem.name).map(elems => {
            let ingredientMul = elems.ingredients.map(e => {
                e.amount = String(Number(e.amount.split(" ")[0]) * Number(element.amount)) + " " + e.amount.split(" ")[1];
                ingredientMultiple.push({
                    name: e.name,
                    amount: e.amount
                });
            });
        });
    });
    const calcIngredientUsagePrice = ingredientMultiple.map(element => {
        const ingPrice = bakery.wholesalePrices.map(elem => {
            if (element.name == elem.name) {
                invesment += (Number(element.amount.split(" ")[0]) / Number(elem.amount.split(" ")[0])) * Number(elem.price);
            }
        });
    });
    return Number(TaskSumTotalSales(bakery)) - invesment;
};
const TaskCalcTotalBakeCakeableAmount = (bakery) => {
    const calc = bakery.recipes.map((element) => {
        let ingredients = element.ingredients.map((elem) => {
            let search = bakery.inventory.filter((elems) => elems.name == elem.name);
            let amount = Math.floor(Number(search[0].amount.split(" ")[0]) / Number(elem.amount.split(" ")[0]));
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
const TaskCalcTotalBakeableAmount = JSON.stringify(TaskCalcTotalBakeCakeableAmount(bakery));
const TaskCalcOrderForWedding = (bakery, wedding) => {
    let moneyWasted = 0;
    const ingredientIncrease = wedding.order.map(elem => {
        let cake = bakery.recipes.filter(elems => elem.name == elems.name);
        let cakePrice = cake[0].ingredients.map(element => {
            let ingredientPrice = bakery.wholesalePrices.filter(el => element.name == el.name);
            return {
                name: ingredientPrice[0].name,
                amount: ingredientPrice[0].amount,
                price: ingredientPrice[0].price
            };
        });
        let increasedAmountAndPrices = cake[0].ingredients.map(e => {
            let priceAmount = cakePrice.filter(ele => e.name == ele.name);
            let incredAmount = Math.round(Number(e.amount.split(" ")[0]) * elem.amount);
            let whamount = Number(priceAmount[0].amount.split(" ")[0]);
            let amounts = Math.ceil(incredAmount / whamount);
            moneyWasted += amounts * priceAmount[0].price;
        });
    });
    return moneyWasted;
};
const TaskCalcFutureSales = (bakery) => {
    let test = [];
    const ingredientIncrease = bakery.salesOfLastWeek.map(elem => {
        let cake = bakery.recipes.filter(elems => elem.name == elems.name);
        let cakePrice = cake[0].ingredients.map(element => {
            let ingredientPrice = bakery.wholesalePrices.filter(el => element.name == el.name);
            return {
                name: ingredientPrice[0].name,
                amount: ingredientPrice[0].amount,
                price: ingredientPrice[0].price
            };
        });
        let increasedAmountAndPrices = cake[0].ingredients.map(e => {
            let priceAmount = cakePrice.filter(ele => e.name == ele.name);
            let incredAmount = Math.round(Number(e.amount.split(" ")[0]) * elem.amount);
            let whamount = Number(priceAmount[0].amount.split(" ")[0]);
            let amounts = (Math.ceil(incredAmount / whamount)) * priceAmount[0].price;
            test.push({
                name: e.name,
                amount: incredAmount,
                price: amounts
            });
        });
    });
    function groupBy(objectArray, property) {
        return objectArray.reduce((acc, obj) => {
            var _a;
            const key = obj[property];
            (_a = acc[key]) !== null && _a !== void 0 ? _a : (acc[key] = []);
            acc[key].push(obj);
            return acc;
        }, {});
    }
    const groupedlist = groupBy(test, 'name');
    // Sum items in groupedluist
    console.log(groupedlist);
};
console.log(TaskCalcFutureSales(bakery));
//# sourceMappingURL=challange.js.map