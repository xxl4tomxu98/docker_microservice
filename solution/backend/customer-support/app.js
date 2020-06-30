const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { map } = require('p-iteration');
const fetch = require('node-fetch');

const db = require('./db/models');
const { environment, orderProcessingBaseUrl } = require('./config');

const app = express();

app.use(morgan('dev'));
app.use(cors());

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Customer Support service!' });
});

app.get('/customers', asyncHandler(async (req, res) => {
  const customers = await db.Customer.findAll({ order: [['name', 'ASC']] });

  const customersWithOrders = await map(customers, async (customer) => {
    const result = await fetch(`${orderProcessingBaseUrl}/orders/${customer.id}`);
    const data = await result.json();
    return {
      id: customer.id,
      name: customer.name,
      orders: data.orders,
    };
  });

  // const customersWithOrders = [];

  // const customers = await db.Customer.findAll({ order: [['name', 'ASC']] });

  // for (const customer of customers) {
  //   const result = await fetch(`${orderProcessingBaseUrl}/orders/${customer.id}`);
  //   const data = await result.json();
  //   customersWithOrders.push({
  //     id: customer.id,
  //     name: customer.name,
  //     orders: data.orders,
  //   });
  // }

  res.json({ customers: customersWithOrders });
}));

// Catch unhandled requests and forward to error handler.
app.use((req, res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.status = 404;
  next(err);
});

// Generic error handler.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500);
  const isProduction = environment === "production";
  res.json({
    title: err.title || "Server Error",
    message: err.message,
    stack: isProduction ? null : err.stack,
  });
});

module.exports = app;
