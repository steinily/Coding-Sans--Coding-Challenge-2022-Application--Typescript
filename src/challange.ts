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
interface IngredientsNum{
    name:string;
    amount:number;
}
interface IngredientsAmountNum  {
    name : string;
    ingredients : Ingredients[]|IngredientsNum
}

interface wedding {
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

    function nameAndPrice(value: alergiesCake) {
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

    const calcIngredientUsage : void[] = bakery.salesOfLastWeek.map(element => {
        bakery.recipes.filter(elem => element.name == elem.name).map(elems => {
            let ingredientMul = elems.ingredients.map(e => {
                e.amount = String(Number(e.amount.split(" ")[0]) * element.amount) + " " + e.amount.split(" ")[1]
                ingredientMultiple.push({
                    name: e.name,
                    amount: e.amount
                })
            })
        })

    })
    const calcIngredientUsagePrice :void[] = ingredientMultiple.map(element => {
        const ingPrice = bakery.wholesalePrices.map(elem => {
            if (element.name == elem.name) {
                invesment += (Number(element.amount.split(" ")[0]) / Number(elem.amount.split(" ")[0])) * elem.price
            }
        })
    })
    return Number(TaskSumTotalSales(bakery)) - invesment
}

const TaskCalcTotalBakeableAmount = (bakery: Bakery) : any => {
    let freedomeOfChoiceCalc: IngredientsAmountNum[] = []
    let freedomeOfChoice: IngredientsAmountNum[] = []
    const calc : void[] = bakery.inventory.map(element =>{
            bakery.recipes.map(elem => elem.ingredients.map(e => {
                if(e.name == element.name){
                    let amounts= Number(element.amount.split(" ")[0]) / Number(e.amount.split(" ")[0])
                    freedomeOfChoiceCalc.push({
                        name:elem.name,
                        ingredients:{
                            name : e.name,
                            amount: amounts
                        }
                    }
                    )
                }
            }))
        } )
        const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
        arr.reduce((groups, item) => {
          (groups[key(item)] ||= []).push(item);
          return groups;
        }, {} as Record<K, T[]>);

        const results = groupBy(freedomeOfChoiceCalc, i => i.name);

        for(let i of Object.keys(results)){
            console.log(results[i])
        }
} 

TaskCalcTotalBakeableAmount(bakery)