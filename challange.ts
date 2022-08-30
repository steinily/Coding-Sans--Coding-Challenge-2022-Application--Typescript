const bakery = require('./data/bakery.json')
const wedding = require('./data/cakesForWedding.json')

interface Bakery {
    recipes : {
        name : string;
        price : string;
        lactoseFree : boolean;
        glutenFree : boolean;
        ingredients : {
            name : string;
            amount : string;
        }[]

        }[],
        inventory : {
            name : string;
            amount : string;
        }[],
        salesOfLastWeek:{
            name : string;
            amount : number;
        }[],
        wholesalePrices : {
            name : string;
            amount : string;
            price : number;
        }[]}


interface wedding {
    order:{
    name : string;
    amount : number;
    }[]
}



const TaskSumTotalSales = (bakery : Bakery) => {
    bakery.map(elem : [] =>    )
}