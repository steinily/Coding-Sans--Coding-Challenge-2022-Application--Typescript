const TaskCalcTotalBakeableAmount = (bakery) => {
    
    const calc = bakery.recipes.map((element) => {
      let ingredients = element.ingredients.map((elem) => {
        let search = bakery.inventory.find((elems) => elems.name == elem.name);
        let amount = Math.floor(
          Number(search.amount.split(" ")[0]) / Number(elem.amount.split(" ")[0])
        );
        return { name: elem.name, amount: amount };
      });
      return { name: element.name, ingredients };
    });
    let ordered = calc.map((elem) => {
      elem.ingredients.sort((a, b) => a.amount - b.amount);
      return elem;
    });
  
    let maxBakingAmount = ordered.map((elem) => {
      return {
        name: elem.name,
        amount: elem.ingredients[0].amount,
      };
    });
  
    return maxBakingAmount.sort((a, b) => console.log(a));
  };
  
  console.log(TaskCalcTotalBakeableAmount(bakery));