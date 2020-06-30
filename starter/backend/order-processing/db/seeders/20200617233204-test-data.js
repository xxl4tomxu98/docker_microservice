'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Orders', [
      {
        customerId: 1,
        placedOn: new Date(2020, 5, 1, 8, 12),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        customerId: 1,
        placedOn: new Date(2020, 5, 11, 10, 34),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        customerId: 2,
        placedOn: new Date(2020, 3, 5, 14, 44),
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Orders', null, {});
  }
};
