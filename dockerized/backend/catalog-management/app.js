const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { products } = require('./data');

const app = express();

app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Catalog Management service!' });
});

app.get('/products', (req, res) => {
  res.json({ products });
});

const port = process.env.PORT || 8081;

app.listen(port, () => console.log(`Listening for connections on port ${port}...`));
