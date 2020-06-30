import React from 'react';

function Orders({ orders }) {
  return (
    <ul>
      {orders.map(order => (
        <li key={order.id}>
          Order placed on: {new Date(order.placedOn).toLocaleString()}
        </li>
      ))}
    </ul>
  );
}

export default Orders;
