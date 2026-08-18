import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import StoreContextProvider from "./Context.jsx";
import { CartProvider } from "./store/CartContext.jsx";


import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<StoreContextProvider>
		{/* Above the router so a cart survives navigating away to look at
		    something and coming back */}
		<CartProvider>
		<BrowserRouter>
			<App />
		</BrowserRouter>
		</CartProvider>
		</StoreContextProvider>
	</React.StrictMode>
);
