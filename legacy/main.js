document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Cart functionality & UI
    let cart = [];
    const cartCountElement = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    // Sidebar elements
    const cartTrigger = document.querySelector('.cart-trigger');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.cart-total');

    // Open/Close Cart
    function toggleCart() {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }

    cartTrigger.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Add to Cart & Product Card Controls
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;

            const controlsEl = e.target.closest('.add-to-cart, .in-cart-controls');
            if (!controlsEl) return;
            const id = controlsEl.getAttribute('data-id');
            
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                const title = card.querySelector('.product-title').textContent;
                const priceText = card.querySelector('.product-price').textContent;
                const price = parseFloat(priceText.replace('$', ''));
                const img = card.querySelector('img').src;

                cart.push({ id, title, price, img, quantity: 1 });
                updateCartUI();
                
                // Pop animation for cart icon
                cartTrigger.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    cartTrigger.style.transform = 'scale(1)';
                }, 200);

                if (!cartSidebar.classList.contains('active')) {
                    toggleCart();
                }
            } else if (e.target.classList.contains('product-qty-plus') || e.target.closest('.product-qty-plus')) {
                const item = cart.find(i => i.id === id);
                if (item) item.quantity++;
                updateCartUI();
            } else if (e.target.classList.contains('product-qty-minus') || e.target.closest('.product-qty-minus')) {
                const item = cart.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    item.quantity--;
                } else if (item && item.quantity === 1) {
                    cart = cart.filter(i => i.id !== id);
                }
                updateCartUI();
            }
        });
    }

    // Update Cart UI
    function updateCartUI() {
        // Update count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;

        // Render items
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is currently empty.</div>';
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.title}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                            <button class="remove-item" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        // Update total
        cartTotalElement.textContent = `$${total.toFixed(2)}`;

        // Attach event listeners to new buttons
        attachCartItemEvents();
        renderProductCards();
    }

    function attachCartItemEvents() {
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const item = cart.find(i => i.id === id);
                if (item) item.quantity++;
                updateCartUI();
            });
        });

        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const item = cart.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    item.quantity--;
                } else if (item && item.quantity === 1) {
                    cart = cart.filter(i => i.id !== id);
                }
                updateCartUI();
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                cart = cart.filter(i => i.id !== id);
                updateCartUI();
            });
        });
    }

    function renderProductCards() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const actionContainer = card.querySelector('.product-bottom');
            const controlsEl = actionContainer.querySelector('[data-id]');
            if (!controlsEl) return;
            
            const id = controlsEl.getAttribute('data-id');
            const item = cart.find(i => i.id === id);
            
            if (item) {
                if (controlsEl.classList.contains('in-cart-controls')) {
                    controlsEl.querySelector('span').textContent = item.quantity;
                } else {
                    const controls = document.createElement('div');
                    controls.className = 'in-cart-controls';
                    controls.setAttribute('data-id', id);
                    controls.innerHTML = `
                        <button class="product-qty-minus">&minus;</button>
                        <span>${item.quantity}</span>
                        <button class="product-qty-plus">+</button>
                    `;
                    controlsEl.replaceWith(controls);
                }
            } else {
                if (!controlsEl.classList.contains('add-to-cart')) {
                    const btn = document.createElement('button');
                    btn.className = 'add-to-cart';
                    btn.setAttribute('data-id', id);
                    btn.textContent = 'Add to Cart';
                    controlsEl.replaceWith(btn);
                }
            }
        });
    }

    // Reveal animations on scroll for product cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(40px)';
        card.style.transition = `all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${index * 0.15}s`;
        observer.observe(card);
    });
});
