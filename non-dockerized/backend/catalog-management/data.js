const faker = require('faker');

const products = [...Array(10)].map(() => ({
  id: faker.random.uuid(),
  name: faker.commerce.productName(),
  price: faker.commerce.price(),
}));

module.exports = {
  products,
};
