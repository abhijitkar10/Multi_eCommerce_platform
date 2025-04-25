document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/sale-products")
    .then(response => response.json())
    .then(products => {
      const container = document.getElementById("sale-products");
      products.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.textContent = `${product.name} - ${product.price}`;
        container.appendChild(productDiv);
      });
    })
    .catch(error => console.error("Failed to load sale products:", error));
});
