export class IterableValueConverter {
  toView(obj) {
    // Create a temporary array to populate with object keys
    let temp = [];

    // A basic for..in loop to get object properties
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...in
    for (let prop in obj) {
        temp.push(prop);
    }
    return temp;
  }
}
