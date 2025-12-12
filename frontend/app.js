let selectedProduct = null;

// Initialize product selection
document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', function() {
        const product = this.closest('.product');
        selectedProduct = {
            id: product.dataset.id,
            name: product.querySelector('h3').textContent,
            price: this.dataset.price
        };
        
        // Show order form
        document.getElementById('orderForm').style.display = 'block';
        document.getElementById('product').value = selectedProduct.name;
        document.getElementById('price').value = selectedProduct.price;
        
        // Scroll to form
        document.getElementById('orderForm').scrollIntoView({ behavior: 'smooth' });
    });
});

// Handle order submission
document.getElementById('submitOrder').addEventListener('click', async function() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    if (!name || !email) {
        alert('Please fill in all fields!');
        return;
    }
    
    const orderData = {
        customerName: name,
        customerEmail: email,
        product: selectedProduct.name,
        price: selectedProduct.price,
        orderId: 'ORD' + Date.now()
    };
    
    // Show loading
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'order-status';
    statusDiv.innerHTML = '⏳ Processing order...';
    
    try {
        // Send to backend
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            statusDiv.className = 'order-status success';
            statusDiv.innerHTML = `✅ Order placed! Order ID: ${orderData.orderId}<br>
                                  📧 Email sent to ${email}`;
            
            // Add to logs
            addToLogs(orderData);
            
            // Reset form
            document.getElementById('orderForm').style.display = 'none';
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
        } else {
            throw new Error(result.error || 'Order failed');
        }
    } catch (error) {
        statusDiv.className = 'order-status error';
        statusDiv.innerHTML = `❌ Error: ${error.message}`;
    }
});

// Add order to logs
function addToLogs(order) {
    const logsDiv = document.getElementById('orderLogs');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <strong>${order.orderId}</strong><br>
        ${order.customerName} - ${order.product}<br>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    
    logsDiv.prepend(logEntry);
    
    // Keep only last 5 orders
    const entries = logsDiv.querySelectorAll('.log-entry');
    if (entries.length > 5) {
        entries[entries.length - 1].remove();
    }
}