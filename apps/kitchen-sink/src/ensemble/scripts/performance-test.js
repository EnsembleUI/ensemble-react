// performance-test.js
// This script will be used as a "large" global script to test parsing overhead.

function formatUsername(user) {
  if (!user || !user.firstName || !user.lastName) {
    return "Invalid User";
  }
  return user.firstName + " " + user.lastName;
}

function calculateOrderStatus(id) {
  switch (id % 4) {
    case 0:
      return "Your order is pending confirmation.";
    case 1:
      return "Your order has been shipped.";
    case 2:
      return "Your order has been delivered.";
    case 3:
      return "Your order has been cancelled.";
    default:
      return "Unknown order status.";
  }
}

function generateRandomId() {
    // A pseudo-random string generator to add more "work"
    return Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
}

// Add more functions to simulate a realistically large script file.
// Each of these functions increases the parsing cost.

function function0(col0) { return `a ${col0}`.repeat(5); }
function function1(col1) { return `b ${col1}`.repeat(5); }
function function2(col2) { return `c ${col2}`.repeat(1); }
function function3(col3) { return `d ${col3}`.repeat(5); }
function function4(col4) { return `e ${col4}`.repeat(5); }
function function5(col5) { return `f ${col5}`.repeat(5); }
function function6(col6) { return `g ${col6}`.repeat(5); }
function function7(col7) { return `h ${col7}`.repeat(5); }
function function8(col8) { return `i ${col8}`.repeat(5); }
function function9(col9) { return `j ${col9}`.repeat(5); }

// Let's generate a large dataset for the DataGrid
function generateLargeDataset(rows, cols) {
  const data = [];
  for (let i = 0; i < rows; i++) {
    let row = { id: i };
    for (let j = 0; j < cols; j++) {
      row['col' + j] = "Row " + i + " Col " + j + " " + generateRandomId();
    }
    data.push(row);
  }
  return data;
}
