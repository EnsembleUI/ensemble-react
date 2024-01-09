console.log("hello data manipulation! check out the response below:");
console.log(response);

// eslint-disable-next-line no-unused-vars
function callMeAsYouSee() {
  console.log("See ya it works");
}

ensemble.storage.set("products", response.body.products);
