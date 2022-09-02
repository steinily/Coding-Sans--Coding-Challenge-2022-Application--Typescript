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
    //Sum ingredients 
    let increaseIng = [];
    const cakes = bakery.salesOfLastWeek.filter(element => {
        const calc = bakery.recipes.map(elem => {
            if (element.name == elem.name) {
                elem.ingredients.map(e => {
                    let amountNum = Number(e.amount.split(" ")[0]);
                    let amountUnit = e.amount.split(" ")[1];
                    e.amount = String(amountNum * element.amount * 2 * 1.1) + " " + amountUnit;
                    return e.amount;
                });
            }
            return elem;
        });
        increaseIng = calc;
    });
    const increaseIngFilter = bakery.salesOfLastWeek.map(e => increaseIng.find(el => e.name == el.name));
    const ingredientsOnlyAndSum = increaseIngFilter.map(e => e.ingredients).flatMap(e => e).reduce((curr, next) => {
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
            let whsale = ingredientsOnlyAndSum[item].map(e => bakery.wholesalePrices.find(el => e.name == el.name));
            let inventory = ingredientsOnlyAndSum[item].map(e => bakery.inventory.find(el => e.name == el.name));
            let invAmountNum = Number(inventory[0].amount.split(" ")[0]);
            let whname = whsale[0].name;
            let whamount = whsale[0].amount;
            let whpirce = whsale[0].price;
            let whamountNum = Number(whamount.split(" ")[0]);
            let oneItem = whpirce / whamountNum;
            let whamountUnit = whamount.split(" ")[1];
            let ingredientsToBuy = Number(ingredientsOnlyAndSum[item][0].amount.split(" ")[0]) - Number(invAmountNum);
            let calc = Math.ceil(Math.ceil(ingredientsToBuy / whamountNum) * whamountNum);
            if (calc * oneItem > 0) {
                listForClerk.push({
                    name: whname,
                    amount: String(calc) + " " + whamountUnit,
                    totalPrice: calc * oneItem
                });
            }
        }
    };
    netxTwoWeekIngredinent();
    let listForClerkSorted = listForClerk.sort((a, b) => b.totalPrice - a.totalPrice);
    console.log(listForClerk);
};
// # Todo 
// Last function prettyfy
// all answer save to resp file
console.log(TaskCalcFutureSales(bakery));
//# sourceMappingURL=challange.js.map