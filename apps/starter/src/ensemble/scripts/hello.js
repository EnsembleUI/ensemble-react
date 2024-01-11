console.log("hello data manipulation! check out the response below:");
console.log(response);

ensemble.storage.set("products", response.body.products);
