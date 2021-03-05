'use strict';

const faker = require('faker');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Customers', [
      {
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Customers', null, {});
  }
};
