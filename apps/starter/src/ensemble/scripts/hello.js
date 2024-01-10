// eslint-disable-next-line no-console
console.log("hello data manipulation! check out the response below:");
// eslint-disable-next-line no-console, no-undef
console.log(response);

// eslint-disable-next-line no-undef
ensemble.storage.set("products", response.body.products);
