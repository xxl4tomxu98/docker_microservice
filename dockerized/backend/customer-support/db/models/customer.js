'use strict';
module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  Customer.associate = function(models) {
    // associations can be defined here
  };
  return Customer;
};