import { stringify } from "querystring";

const bakery = require('../data/bakery.json')
const wedding = require('../data/cakesForWedding.json')

interface Bakery {
    recipes: {
        name: string;
        price: string;
        lactoseFree: boolean;
        glutenFree: boolean;
        ingredients: Ingredients[]

    }[],
    inventory: {
        name: string;
        amount: string;
    }[],
    salesOfLastWeek: {
        name: string;
        amount: number;
    }[],
    wholesalePrices: {
        name: string;
        amount: string;
        price: number;
    }[]
}

interface Ingredients {
    name: string;
    amount: string;
}

interface IngredientsNum {
    name: string;
    amount: number;
}

interface IngredientsAmountNum {
    name: string;
    ingredients: Ingredients[] | IngredientsNum[]
}

interface Wedding {
    order: {
        name: string;
        amount: number;
    }[]
}

interface Alergies {
    glutenFree: alergiesCake[];
    lactoseFree: alergiesCake[];
    lactoseAndGlutenFree: alergiesCake[];
}

interface alergiesCake {
    name: string;
    price: string;
}

function unitchange(bakery: Bakery): Bakery {
    const unitChange = bakery.recipes.map(elem => {
        elem.ingredients.map(e => {
            switch (e.amount.split(" ")[1]) {
                case 'g':
                    e.amount = String(Number.parseFloat(e.amount.split(" ")[0]) / 1000 + " kg")
                    break;
                case 'ml':
                    e.amount = String(Number.parseFloat(e.amount.split(" ")[0]) / 1000 + " l")
                    break;
                case 'pc':
                    break;
            }
            return e

        })
        return elem
    })
    bakery.recipes = unitChange
    return bakery
}
unitchange(bakery)

const TaskSumTotalSales = (bakery: Bakery): Number => {
    let count = 0
    const calculate = bakery.recipes.map(elem => {

        let { name: recipeName, price: recipePrice } = elem
        let sales = bakery.salesOfLastWeek.find(elems => recipeName === elems.name)
        if (sales?.amount) {
            count += sales.amount * Number(recipePrice.split(" ")[0])
        }
        return count
    })
    return count
}

const Intolerance = (bakery: Bakery): Alergies => {

    function nameAndPrice(value: alergiesCake): alergiesCake {
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

    }

    return alergies
}
const TaskGroupByIntolerance = JSON.stringify(Intolerance(bakery))

const TaskSumTotalProfit = (bakery: Bakery): Number => {
    let invesment = 0
    let ingredientMultiple: Ingredients[] = []

    const calcIngredientUsage: void[] = bakery.salesOfLastWeek.map(element => {
        bakery.recipes.filter(elem => element.name == elem.name).map(elems => {
            let ingredientMul = elems.ingredients.map(e => {
                e.amount = String(Number(e.amount.split(" ")[0]) * Number(element.amount)) + " " + e.amount.split(" ")[1]
                ingredientMultiple.push({
                    name: e.name,
                    amount: e.amount
                })
            })
        })

    })
    const calcIngredientUsagePrice: void[] = ingredientMultiple.map(element => {
        const ingPrice = bakery.wholesalePrices.map(elem => {
            if (element.name == elem.name) {
                invesment += (Number(element.amount.split(" ")[0]) / Number(elem.amount.split(" ")[0])) * Number(elem.price)
            }
        })
    })
    return Number(TaskSumTotalSales(bakery)) - invesment
}

const TaskCalcTotalBakeCakeableAmount = (bakery: Bakery): IngredientsNum[] => {
    const calc: IngredientsAmountNum[] = bakery.recipes.map((element) => {
        let ingredients: IngredientsNum[] = element.ingredients.map((elem) => {
            let search: Ingredients[] = bakery.inventory.filter((elems) => elems.name == elem.name);
            let amount: number = Math.floor(
                Number(search[0].amount.split(" ")[0]) / Number(elem.amount.split(" ")[0])
            );
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
}

const TaskCalcTotalBakeableAmount = JSON.stringify(TaskCalcTotalBakeCakeableAmount(bakery))


const TaskCalcOrderForWedding = (bakery: Bakery, wedding: Wedding): number => {
    let moneyWasted:number = 0

    const ingredientIncrease : void[] = wedding.order.map(elem => {

        let cake : Bakery['recipes'] = bakery.recipes.filter(elems => elem.name == elems.name);

        let cakePrice : Bakery['wholesalePrices'] = cake[0].ingredients.map(element => {
            let ingredientPrice:Bakery['wholesalePrices'] = bakery.wholesalePrices.filter(el => element.name == el.name)
            return {
                name: ingredientPrice[0].name,
                amount: ingredientPrice[0].amount,
                price: ingredientPrice[0].price
            }
        })
        let increasedAmountAndPrices : void[] = cake[0].ingredients.map(e => {
            let priceAmount : Bakery['wholesalePrices'] = cakePrice.filter(ele => e.name == ele.name);

            let incredAmount = Math.round(Number(e.amount.split(" ")[0]) * elem.amount)
            let whamount = Number(priceAmount[0].amount.split(" ")[0])
            let amounts = Math.ceil(incredAmount / whamount);
            moneyWasted += amounts * priceAmount[0].price;

        })
    })
    return moneyWasted
}

const TaskCalcFutureSales = (bakery:Bakery):any => {
    let test:any[]=[] 
    const ingredientIncrease : void[] = bakery.salesOfLastWeek.map(elem => {

        let cake : Bakery['recipes'] = bakery.recipes.filter(elems => elem.name == elems.name);

        let cakePrice : Bakery['wholesalePrices'] = cake[0].ingredients.map(element => {
            let ingredientPrice:Bakery['wholesalePrices'] = bakery.wholesalePrices.filter(el => element.name == el.name)
            return {
                name: ingredientPrice[0].name,
                amount: ingredientPrice[0].amount,
                price: ingredientPrice[0].price
            }
        })
        let increasedAmountAndPrices : void[] = cake[0].ingredients.map(e => {
            let priceAmount : Bakery['wholesalePrices'] = cakePrice.filter(ele => e.name == ele.name);

            let incredAmount = Math.round(Number(e.amount.split(" ")[0]) * elem.amount)
            let whamount = Number(priceAmount[0].amount.split(" ")[0])
            let amounts = (Math.ceil(incredAmount / whamount))*priceAmount[0].price;
            test.push({
                name:e.name,
                amount:incredAmount,
                price:amounts
            })

            
            
        })
    })
    function groupBy(objectArray:any, property:any) {
        return objectArray.reduce((acc:any, obj:any) => {
          const key = obj[property];
          acc[key] ??= [];
          acc[key].push(obj);
          return acc;
        }, {});
      }

      const groupedlist = groupBy(test, 'name')
    // Sum items in groupedluist
      console.log(groupedlist)
}
console.log(TaskCalcFutureSales(bakery))