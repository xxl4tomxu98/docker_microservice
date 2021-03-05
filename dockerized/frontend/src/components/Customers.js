import React, { useState, useEffect } from 'react';

import Orders from './Orders';

function Customers() {
  const [customers, setCustomers] = useState([]);
 
  useEffect(() => {
    const fetchCustomers = async () => {
      const result = await fetch(`${process.env.REACT_APP_CUSTOMER_SUPPORT_BASE_URL}/customers`);
 
      const data = await result.json();

      setCustomers(data.customers);
    };
 
    fetchCustomers();
  }, []);

  return (
    <ul>
      {customers.map(customer => (
        <li key={customer.id}>
          {customer.name}
          <Orders orders={customer.orders} />
        </li>
      ))}
    </ul>
  );
}

export default Customers;
