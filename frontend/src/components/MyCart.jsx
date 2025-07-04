import React, { useState } from "react";
const PORT = process.env.BACKEND_PORT
const HOST = process.env.HOST
const MyCart = ({ cartItems, cartQuantities, onRemoveItem }) => {
  const [loading, setLoading] = useState(false);
  const userId = "60d0fe4f5311236168a109cb"; // Hardcoded user ID

  // Calculate total bill
  const totalBill = cartItems.reduce((sum, item) => {
    const qty = cartQuantities[item._id] || 0;
    return sum + qty * item.price;
  }, 0);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add some items before placing an order.");
      return;
    }

    setLoading(true);

    try {
      for (const item of cartItems) {
        const response = await fetch(`http://${HOST}:${BACKEND_PORT}/api/v1/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: item._id,
            quantity: cartQuantities[item._id],
            user_id: userId,
            seller_name: item.supplierName,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to place order for ${item.productName}`);
        }
      }

      alert("Order placed successfully! 🎉");
      // Optionally clear cart or notify parent to reset cart here
    } catch (error) {
      alert(`Error placing order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "#fafafa",
        maxWidth: "600px",
      }}
    >
      <h3 style={{ marginBottom: "1rem" }}>🧺 My Cart</h3>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cartItems.map((item) => (
              <li
                key={item._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div>
                  <strong>{item.productName}</strong> <br />
                  <small>Supplier: {item.supplierName}</small> <br />
                  <small>Quantity: {cartQuantities[item._id]}</small> <br />
                  <small>Price per unit: ${item.price.toFixed(2)}</small>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={() => onRemoveItem(item._id)}
                    style={{
                      background: "#dc3545",
                      border: "none",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    aria-label={`Remove ${item.productName} from cart`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: "1.5rem",
              textAlign: "right",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            Total Bill: ${totalBill.toFixed(2)}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1.2rem",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              opacity: loading ? 0.6 : 1,
              float: "right",
            }}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </>
      )}
    </div>
  );
};

export default MyCart;
