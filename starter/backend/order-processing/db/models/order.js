'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    placedOn: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {});
  Order.associate = function(models) {
    // associations can be defined here
  };
  return Order;
};