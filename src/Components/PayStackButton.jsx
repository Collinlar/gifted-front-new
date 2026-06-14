import React from 'react';
// import logo from './logo.svg';
import { usePaystackPayment } from 'react-paystack';
// import './App.css';

const config = {
    reference: (new Date()).getTime().toString(),
    email: "jamesewoenam7@gmail.com",
    amount: 250, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    publicKey: 'pk_test_a756d96759cd9c70be3be85f1b281f11ef97f988', 
};



// you can call this function anything
const onSuccess = (reference) => {
  // Implementation for whatever you want to do with reference and after success call.
  console.log(reference);
};

// you can call this function anything
const onClose = () => {
  // implementation for  whatever you want to do when the Paystack dialog closed.
  console.log('closed')
}

export const PaystackHookExample = () => {
    const initializePayment = usePaystackPayment(config);
    return (
      <div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600" onClick={() => {
              initializePayment(onSuccess, onClose)
          }}></button>
      </div>
    );
};