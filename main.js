document.addEventListener('DOMContentLoaded', function() {

    // --- SLIDESHOW LOGIC ---
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slideshow .slide');
    
    function showSlides() {
        if (slides.length === 0) return;
        slides.forEach(slide => slide.style.opacity = '0');
        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        slides[slideIndex - 1].style.opacity = '1';
        setTimeout(showSlides, 6000); // Change image every 6 seconds
    }
    showSlides();

    // --- SHOPPING CART LOGIC ---
    const cartCountElement = document.querySelector('.cart-count');
    let cart = JSON.parse(localStorage.getItem('chocoBlissCart')) || [];

    function updateCartCount() {
        if (!cartCountElement) return;
        cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function saveCart() {
        localStorage.setItem('chocoBlissCart', JSON.stringify(cart));
        updateCartCount();
    }

    function addToCart(id, name, price, image) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }
        saveCart();
        showNotification(name);
    }

    function showNotification(productName) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = `${productName} was added to your cart!`;
        document.body.appendChild(notification);
        setTimeout(() => { notification.classList.add('visible'); }, 10);
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => { notification.remove(); }, 500);
        }, 2500);
    }

    document.body.addEventListener('click', e => {
        if (e.target && e.target.classList.contains('add-to-cart-btn')) {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            const image = e.target.dataset.image;
            addToCart(id, name, price, image);
        }
    });

    // --- CART PAGE LOGIC ---
    const cartItemsContainer = document.querySelector('.cart-items');
    if (cartItemsContainer) {
        const cartTotalElement = document.querySelector('.cart-total-amount');
        const checkoutButton = document.getElementById('whatsapp-checkout-btn');

        function renderCartPage() {
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is currently empty.</p>';
                checkoutButton.disabled = true;
                // Update both total amount displays
                document.querySelectorAll('.cart-total-amount').forEach(el => el.textContent = '₹0.00');
                return;
            }
            let total = 0;
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
            });
            // Update both total amount displays
            document.querySelectorAll('.cart-total-amount').forEach(el => el.textContent = `₹${total.toFixed(2)}`);
            checkoutButton.disabled = false;
        }

        function updateQuantity(id, change) {
            const item = cart.find(item => item.id === id);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    cart = cart.filter(cartItem => cartItem.id !== id);
                }
                saveCart();
                renderCartPage();
            }
        }

        cartItemsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('quantity-btn')) {
                updateQuantity(e.target.dataset.id, parseInt(e.target.dataset.change));
            }
            if (e.target.classList.contains('remove-item-btn')) {
                cart = cart.filter(item => item.id !== e.target.dataset.id);
                saveCart();
                renderCartPage();
            }
        });

        checkoutButton.addEventListener('click', () => {
            const customerName = document.getElementById('customer-name').value.trim();
            const customerAddress = document.getElementById('customer-address').value.trim();
            const customerPhone = document.getElementById('customer-phone').value.trim();
            if (!customerName || !customerAddress || !customerPhone) {
                alert('Please fill in all your details before placing the order.');
                return;
            }
            let message = `*New Chocolate Order from Choco Bliss Website*\n\n`;
            message += `*Customer:* ${customerName}\n`;
            message += `*Address:* ${customerAddress}\n`;
            message += `*Phone:* ${customerPhone}\n\n*Order Details:*\n`;
            let total = 0;
            cart.forEach(item => {
                message += `- ${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}\n`;
                total += item.price * item.quantity;
            });
            message += `\n*Total Amount:* ₹${total.toFixed(2)}`;
            // IMPORTANT: Replace with the brand's actual WhatsApp number
            const brandWhatsAppNumber = "911234567890"; 
            const whatsappUrl = `https://wa.me/${brandWhatsAppNumber}?text=${encodeURIComponent(message)}`;
            
            // Clear cart and redirect
            localStorage.removeItem('chocoBlissCart');
            window.open(whatsappUrl, '_blank');
            window.location.href = 'success.html';
        });

        renderCartPage();
    }
    
    updateCartCount();
});
