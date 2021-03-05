import React, { useState, useEffect } from 'react';

function Products() {
  const [products, setProducts] = useState([]);
 
  useEffect(() => {
    const fetchProducts = async () => {
      const result = await fetch(`${process.env.REACT_APP_CATALOG_MANAGEMENT_BASE_URL}/products`);
 
      const data = await result.json();

      setProducts(data.products);
    };
 
    fetchProducts();
  }, []);

  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          {product.name} - ${product.price}
        </li>
      ))}
    </ul>
  );
}

export default Products;
