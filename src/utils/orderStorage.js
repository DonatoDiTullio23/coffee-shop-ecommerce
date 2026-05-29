export function saveOrder(order) {
    const existing = JSON.parse(localStorage.getItem("orders")) || [];
    const updated = [...existing, order];
    localStorage.setItem("orders", JSON.stringify(updated));
  }
  
  export function getOrders() {
    return JSON.parse(localStorage.getItem("orders")) || [];
  }
  