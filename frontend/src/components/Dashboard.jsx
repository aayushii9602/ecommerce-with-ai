import React, { useState, useEffect } from "react";
import { searchProducts } from "../api/productApi";
import MyCart from "./MyCart";

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [cartQuantities, setCartQuantities] = useState({});
  const [showCart, setShowCart] = useState(false);

  const fetchProducts = async (q) => {
    const results = await searchProducts(q);
    setProducts(results);

    const initialCart = {};
    results.forEach((p) => {
      initialCart[p._id] = cartQuantities[p._id] || 0;
    });
    setCartQuantities(initialCart);
  };

  useEffect(() => {
    fetchProducts(query);
  }, [query]);

  const incrementItem = (product) => {
    setCartQuantities((prev) => {
      const currentQty = prev[product._id] || 0;
      if (currentQty < product.quantityAvailable) {
        return { ...prev, [product._id]: currentQty + 1 };
      }
      return prev;
    });
  };

  const decrementItem = (productId) => {
    setCartQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
  };

  const toggleCart = () => {
    setShowCart((prev) => !prev);
  };

  const cartItems = products.filter(
    (product) => cartQuantities[product._id] > 0
  );

  const removeItemFromCart = (productId) => {
  setCartQuantities((prev) => {
    const copy = { ...prev };
    delete copy[productId];
    return copy;
  });
};

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h2>{showCart ? "🧺 My Cart" : "📦 Product Dashboard"}</h2>

      <button
        onClick={toggleCart}
        style={{
          marginBottom: "1rem",
          padding: "0.6rem 1rem",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {showCart ? "➕ Add More Items" : `🧺 View Cart (${cartItems.length})`}
      </button>

      {/* Cart View */}
      {showCart ? (
        <MyCart cartItems={cartItems} cartQuantities={cartQuantities}  onRemoveItem={removeItemFromCart}/>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: "0.6rem",
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginBottom: "1rem",
              display: "block",
            }}
          />

          {products.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f4f4f4" }}>
                  <th style={thStyle}></th>
                  <th style={thStyle}>Product Name</th>
                  <th style={thStyle}>Supplier</th>
                  <th style={thStyle}>Available</th>
                  <th style={thStyle}>Price ($)</th>
                  <th style={thStyle}>Oversell</th>
                  <th style={thStyle}>Add to Cart</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const currentQty = cartQuantities[product._id] || 0;
                  const maxReached = currentQty >= product.quantityAvailable;

                  return (
                    <tr key={product._id}>
                      <td style={tdStyle}>🛒</td>
                      <td style={tdStyle}>{product.productName}</td>
                      <td style={tdStyle}>{product.supplierName}</td>
                      <td style={tdStyle}>{product.quantityAvailable}</td>
                      <td style={tdStyle}>{product.price}</td>
                      <td style={tdStyle}>{product.oversell ? "Yes" : "No"}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => decrementItem(product._id)}
                          disabled={currentQty === 0}
                          style={buttonStyle("#dc3545", currentQty === 0)}
                        >
                          −
                        </button>
                        <span style={{ margin: "0 8px" }}>{currentQty}</span>
                        <button
                          onClick={() => incrementItem(product)}
                          disabled={maxReached}
                          style={buttonStyle("#28a745", maxReached)}
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No products found</p>
          )}
        </>
      )}
    </div>
  );
};

const buttonStyle = (color, disabled) => ({
  background: color,
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "4px 10px",
  cursor: disabled ? "not-allowed" : "pointer",
  marginRight: "4px",
  opacity: disabled ? 0.5 : 1,
});

const thStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

export default Dashboard;
