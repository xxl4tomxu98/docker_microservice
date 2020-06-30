import React from 'react';

import Customers from './components/Customers';
import Products from './components/Products';

function App() {
  return (
    <div>
      <h1>Online Catalog</h1>
      <h2>Customers</h2>
      <Customers />
      <h2>Products</h2>
      <Products />
    </div>
  );
}

export default App;
