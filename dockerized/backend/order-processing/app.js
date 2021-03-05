const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const db = require('./db/models');
const { environment } = require('./config');

const app = express();

app.use(morgan('dev'));
app.use(cors());

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Order Processing service!' });
});

app.get('/orders', asyncHandler(async (req, res) => {
  const orders = await db.Order.findAll({ attributes: ['id', 'placedOn'], order: [['placedOn', 'DESC']] });
  res.json({ orders });
}));

app.get('/orders/:customerId(\\d+)', asyncHandler(async (req, res) => {
  const customerId = parseInt(req.params.customerId, 10);
  const orders = await db.Order.findAll({ attributes: ['id', 'placedOn'], where: { customerId }, order: [['placedOn', 'DESC']] });
  res.json({ orders });
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
