// Product Data
const BurgerData = [
    {
        id: 'burger-1',
        title: 'Royal Cheese Burger with extra Fries',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/burger1.png',
    },
    {
        id: 'burger-2',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/burger2.png',
    },
    {
        id: 'burger-3',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/burger3.png',
    },
    {
        id: 'burger-4',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/burger4.png',
    },
    {
        id: 'burger-5',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/burger5.png',
    },
    {
        id: 'burger-6',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/burger6.png',
    },
];
const friesData = [
    {
        id: 'fries-1',
        title: 'Royal Cheese Burger with extra Fries',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/fries1.png',
    },
    {
        id: 'fries-2',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/fries2.png',
    },
    {
        id: 'fries-3',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/fries3.png',
    },
    {
        id: 'fries-4',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/fries4.png',
    },
    {
        id: 'fries-5',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/fries5.png',
    },
    {
        id: 'fries-6',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/fries6.png',
    },
];
const drinksData = [
    {
        id: 'drink-1',
        title: 'Royal Cheese Burger with extra Fries',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/drink1.png',
    },
    {
        id: 'drink-2',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/drink2.png',
    },
    {
        id: 'drink-3',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/drink3.png',
    },
    {
        id: 'drink-4',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/drink4.png',
    },
    {
        id: 'drink-5',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/drink5.png',
    },
    {
        id: 'drink-6',
        title: 'The classics for 3',
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries, 3 cold drinks',
        price: 'GBP 23.10',
        image: './images/drink6.png',
    },
];

// Navigation 
const navItems = [
    { name: 'Home', path: '#top-of-page' },
    { name: 'Special Offers', path: '#all-offers-section' },
    { name: 'Restaurants', path: '#similar-restaurants-section' },
    { name: 'Track Order', path: '/track-order' } 
];

const menu = document.getElementById('menu');
const mobileNav = document.getElementById('mobile-nav');
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const line3 = document.getElementById('line3');
let selected = 'Home'; 
let isMenuOpen = false;

// Cart 
let cartData = {
    'margherita-pizza': { qty: 1, price: 15.99, title: 'Margherita', image: './images/margherita.png' },
    'polo-pizza': { qty: 1, price: 18.99, title: 'Polo', image: './images/polo.png' },
    'meatfiesta-pizza': { qty: 1, price: 22.99, title: 'Meat Fiesta', image: './images/meat.png' },
    'hawaiian-pizza': { qty: 2, price: 19.99, title: 'Hawaiian', image: './images/hawaiin.png' },
    'toscana-pizza-1': { qty: 1, price: 24.99, title: 'Toscana', image: './images/toscana.png' },
    'toscana-pizza-2': { qty: 1, price: 24.99, title: 'Toscana', image: './images/toscana.png' }
};
let selectedItem = null;
const desktopCart = document.getElementById('desktop-cart');
const mobileCart = document.getElementById('mobile-cart');
const cartModal = document.getElementById('cartModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const takeBackBtn = document.getElementById('takeBackBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const addToPayBtn = document.getElementById('addToPayBtn');
const totalPrice = document.getElementById('totalPrice');

const slider = document.getElementById("slider");
const next = document.getElementById("next");
const prev = document.getElementById("prev");
let sliderIndex = 0;

// Toggle Mobile Menu 
menuBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.remove('scale-y-0', 'opacity-0', 'max-h-0');
        mobileMenu.classList.add('scale-y-100', 'opacity-100', 'max-h-96');
        line1.classList.add('rotate-45', 'translate-y-1');
        line2.classList.add('opacity-0', 'scale-x-0');
        line3.classList.add('-rotate-45', '-translate-y-1');
    } else {
        mobileMenu.classList.remove('scale-y-100', 'opacity-100', 'max-h-96');
        mobileMenu.classList.add('scale-y-0', 'opacity-0', 'max-h-0');
        line1.classList.remove('rotate-45', 'translate-y-1');
        line2.classList.remove('opacity-0', 'scale-x-0');
        line3.classList.remove('-rotate-45', '-translate-y-1');
    }
});

document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target) && isMenuOpen) {
        isMenuOpen = false;
        mobileMenu.classList.remove('scale-y-100', 'opacity-100', 'max-h-96');
        mobileMenu.classList.add('scale-y-0', 'opacity-0', 'max-h-0');
        line1.classList.remove('rotate-45', 'translate-y-1');
        line2.classList.remove('opacity-0', 'scale-x-0');
        line3.classList.remove('-rotate-45', '-translate-y-1');
    }
});

desktopCart.addEventListener('click', openCart);
mobileCart.addEventListener('click', openCart);
closeModal.addEventListener('click', closeCart);
takeBackBtn.addEventListener('click', closeCart);
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal || e.target === modalOverlay) {
        closeCart();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !cartModal.classList.contains('hidden')) {
        closeCart();
    }
});

// Buttons
addToPayBtn.addEventListener('click', () => {
    alert('Proceeding to payment...');
});
nextStepBtn.addEventListener('click', () => {
    alert('Moving to next step...');
});

function parsePrice(priceString) {
    return parseFloat(priceString.replace('GBP ', ''));
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = ''; 
    for (const itemId in cartData) {
        const item = cartData[itemId];
        const itemHtml = `
            <div id="${itemId}-item" class="flex items-center justify-between p-2 sm:p-3 mb-2 sm:mb-3 bg-gray-100 rounded-lg transition-colors cursor-pointer cart-item product-card-hover cart-item-hover" onclick="toggleItemSelection('${itemId}')">
                <div class="flex items-center space-x-2 sm:space-x-3">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden">
                        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
                    </div>
                    <span class="font-medium text-gray-800 text-xs sm:text-sm md:text-base">${item.title}</span>
                </div>
                <div class="flex items-center space-x-2 sm:space-x-3">
                    <button aria-label="Decrease quantity" onclick="event.stopPropagation(); updateQuantity('${itemId}', -1)" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:bg-gray-200 transition-colors btn-animate">
                        <i class="fas fa-minus text-xs text-gray-600"></i>
                    </button>
                    <span id="${itemId}-qty" class="w-6 sm:w-7 md:w-8 text-center font-semibold text-gray-800 text-xs sm:text-sm md:text-base">${item.qty}</span>
                    <button aria-label="Increase quantity" onclick="event.stopPropagation(); updateQuantity('${itemId}', 1)" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:bg-gray-200 transition-colors btn-animate">
                        <i class="fas fa-plus text-xs text-gray-600"></i>
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    }
    setupHoverListeners(); 
    if (selectedItem && document.getElementById(selectedItem + '-item')) {
        toggleItemSelection(selectedItem);
    }
}

function addItemToCart(id, title, priceString, image) {
    const price = parsePrice(priceString);
    if (cartData[id]) {
        cartData[id].qty++;
    } else {
        cartData[id] = {
            qty: 1,
            price: price,
            title: title,
            image: image
        };
    }
    renderCartItems(); 
    updateTotal();
    showNotification(`${title} added to cart!`);
    const plusButton = event.currentTarget;
    plusButton.classList.add('plus-button-bounce');
    plusButton.addEventListener('animationend', () => {
        plusButton.classList.remove('plus-button-bounce');
    }, { once: true });
}

function updateQuantity(itemId, change) {
    if (cartData[itemId]) {
        cartData[itemId].qty += change;
        if (cartData[itemId].qty <= 0) {
            delete cartData[itemId];
            if (selectedItem === itemId) {
                selectedItem = null;
            }
        }
    }
    renderCartItems(); 
    updateTotal();
}

function showNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        console.error('Notification container not found!');
        return;
    }
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    }, 3000); 
}

function createNav(linkContainer, isMobile = false) {
    linkContainer.innerHTML = '';
    navItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.path; 
        link.textContent = item.name; 
        let classes = 'whitespace-nowrap px-3 py-2 rounded-full transition-all duration-300 ease-in-out nav-link-underline ';
        if (isMobile) {
            classes += 'text-sm font-medium ';
        } else {
            classes += 'text-xs sm:text-sm lg:text-base xl:text-lg font-medium ';
        }
        if (item.name === selected) { 
            classes += 'bg-[#FC8A06] text-white shadow-md selected';
        } else {
            classes += 'text-black hover:text-[#FC8A06] hover:bg-orange-50 hover:scale-105 secondary-nav-link-hover'; 
        }
        link.className = classes;
        link.addEventListener('click', e => {
            if (item.path.startsWith('#')) {
                e.preventDefault(); 
                const targetElement = document.querySelector(item.path);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            selected = item.name; 
            renderMenus();
            if (isMobile && isMenuOpen) {
                isMenuOpen = false;
                mobileMenu.classList.remove('scale-y-100', 'opacity-100', 'max-h-96');
                mobileMenu.classList.add('scale-y-0', 'opacity-0', 'max-h-0');
                line1.classList.remove('rotate-45', 'translate-y-1');
                line2.classList.remove('opacity-0', 'scale-x-0');
                line3.classList.remove('-rotate-45', '-translate-y-1');
            }
        });
        linkContainer.appendChild(link);
    });
}

function renderMenus() {
    createNav(menu);
    createNav(mobileNav, true);
}

// Cart Functions
function openCart() {
    cartModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        modalOverlay.classList.remove('opacity-0');
        modalOverlay.classList.add('opacity-100');
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
    setupHoverListeners();
}

function closeCart() {
    modalOverlay.classList.remove('opacity-100');
    modalOverlay.classList.add('opacity-0');
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        cartModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 300);
}

function setupHoverListeners() {
    const cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.classList.remove('bg-gray-100');
                this.classList.add('bg-gray-200');
            }
        });
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.classList.remove('bg-gray-200');
                this.classList.add('bg-gray-100');
            }
        });
    });
}

function toggleItemSelection(itemId) {
    if (selectedItem) {
        const prevItem = document.getElementById(selectedItem + '-item');
        if (prevItem) { 
            prevItem.classList.remove('bg-gray-800', 'text-white', 'selected');
            prevItem.classList.add('bg-gray-100');
            const prevSpan = prevItem.querySelector('span');
            if (prevSpan) { prevSpan.classList.remove('text-orange-300'); prevSpan.classList.add('text-gray-800'); }
            const prevButtons = prevItem.querySelectorAll('button');
            prevButtons.forEach(btn => {
                btn.classList.remove('border-gray-500', 'hover:bg-gray-700');
                btn.classList.add('border-gray-400', 'hover:bg-gray-200');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('text-gray-600');
                    icon.classList.add('text-gray-300');
                }
            });
            const prevQty = prevItem.querySelector('[id$="-qty"]');
            if (prevQty) { prevQty.classList.remove('text-white'); prevQty.classList.add('text-gray-800'); }
        }
    }

    selectedItem = itemId;
    const item = document.getElementById(itemId + '-item');
    if (item) { 
        item.classList.remove('bg-gray-100', 'bg-gray-200'); 
        item.classList.add('bg-gray-800', 'text-white', 'selected');
        const span = item.querySelector('span');
        if (span) { span.classList.remove('text-gray-800'); span.classList.add('text-orange-300'); }
        const buttons = item.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.classList.remove('border-gray-400', 'hover:bg-gray-200');
            btn.classList.add('border-gray-500', 'hover:bg-gray-700');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('text-gray-600');
                icon.classList.add('text-gray-300');
            }
        });
        const qty = item.querySelector('[id$="-qty"]');
        if (qty) { qty.classList.remove('text-gray-800'); qty.classList.add('text-white'); }
    }
}

function updateTotal() {
    let total = 0;
    Object.keys(cartData).forEach(itemId => {
        if (cartData[itemId]) { 
            total += cartData[itemId].qty * cartData[itemId].price;
        }
    });
    totalPrice.textContent = `£${total.toFixed(2)}`;
}

// Slider Functions
function getVisibleCards() {
    if (window.innerWidth < 640) return 1;
    else if (window.innerWidth < 1024) return 2;
    else return 3;
}

function updateSliderPosition() {
    const visible = getVisibleCards();
    const card = slider.children[0];
    if (!card) return; 
    const cardWidth = card.offsetWidth;
    const gap = parseInt(getComputedStyle(slider).gap) || 0;
    const moveX = sliderIndex * (cardWidth + gap);
    slider.style.transform = `translateX(-${moveX}px)`;
    applyAnimationToVisibleCards();
}

function applyAnimationToVisibleCards() {
    const visible = getVisibleCards();
    const start = sliderIndex;
    const end = sliderIndex + visible;
    [...slider.children].forEach((card, i) => {
        card.classList.remove("card-animate");
        if (i >= start && i < end) {
            setTimeout(() => card.classList.add("card-animate"), 10);
        }
    });
}

function slideTo(i) {
    const visible = getVisibleCards();
    const maxIndex = slider.children.length - visible;
    if (i > maxIndex) sliderIndex = 0;
    else if (i < 0) sliderIndex = maxIndex;
    else sliderIndex = i;
    updateSliderPosition();
}

next.addEventListener("click", () => slideTo(sliderIndex + 1));
prev.addEventListener("click", () => slideTo(sliderIndex - 1));

window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isMenuOpen) {
        isMenuOpen = false;
        mobileMenu.classList.remove('scale-y-100', 'opacity-100', 'max-h-96');
        mobileMenu.classList.add('scale-y-0', 'opacity-0', 'max-h-0');
        line1.classList.remove('rotate-45', 'translate-y-1');
        line2.classList.remove('opacity-0', 'scale-x-0');
        line3.classList.remove('-rotate-45', '-translate-y-1');
    }
    updateSliderPosition(); 
});


const animateOnScrollElements = document.querySelectorAll('.reveal-on-scroll');
const observerOptions = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.1 
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible'); 
            const staggeredChildren = entry.target.querySelectorAll('.stagger-animate-child');
            staggeredChildren.forEach((child, index) => {
                child.style.animationDelay = `${index * 0.1}s`; 
                child.classList.add('is-animated'); 
            });
            observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    renderMenus(); 
    renderCartItems(); 
    updateTotal(); 
    setupHoverListeners(); 

    // Trigger Hero Section Animations
    document.querySelectorAll('.hero-text-animate').forEach((el) => {
        const delay = parseFloat(el.dataset.animationDelay);
        el.style.animationDelay = delay + 's';
        el.classList.add('animate-fade-in-up');
    });
    document.querySelectorAll('.hero-image-animate').forEach((el) => {
        const delay = parseFloat(el.dataset.animationDelay);
        el.style.animationDelay = delay + 's';
        el.classList.add('animate-scale-in-fade');
    });
    document.querySelectorAll('.hero-status-bar-animate').forEach((el) => {
        const delay = parseFloat(el.dataset.animationDelay);
        el.style.animationDelay = delay + 's';
        el.classList.add('animate-slide-in-left');
    });

    // Render product cards
    const burgerContainer = document.getElementById('burger-container');
    if (burgerContainer) {
        burgerContainer.innerHTML = BurgerData.map(product => `
            <div class="relative bg-white rounded-xl shadow-md p-4 flex items-center justify-between border border-gray-100 product-card-hover stagger-animate-child">
                <div class="flex flex-col pr-4">
                    <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight">
                        ${product.title}
                    </h3>
                    <p class="text-sm text-gray-600 mb-4 leading-snug">
                        ${product.description}
                    </p>
                    <span class="text-lg font-bold text-gray-900">
                        ${product.price}
                    </span>
                </div>
                <div class="relative flex-shrink-0">
                    <img
                        src="${product.image}"
                        alt="${product.title}"
                        width="150"
                        height="150"
                        class="rounded-lg object-cover"
                    />
                    <div class="absolute -bottom-2 -right-2 w-18 h-18 plus-button-hover plus-button-glow-hover"
                        onclick="event.stopPropagation(); addItemToCart('${product.id}', '${product.title}', '${product.price}', '${product.image}')">
                        <div class="relative w-full h-full">
                            <img
                                src="./images/plusbg.png"
                                alt="Circle background"
                                class="w-full h-full object-contain"
                            />
                            <img
                                src="./images/Plus.png"
                                alt="Plus icon"
                                class="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const friesContainer = document.getElementById('fries-container');
    if (friesContainer) {
        friesContainer.innerHTML = friesData.map(product => `
            <div class="relative bg-white rounded-xl shadow-md p-4 flex items-center justify-between border border-gray-100 product-card-hover stagger-animate-child">
                <div class="flex flex-col pr-4">
                    <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight">
                        ${product.title}
                    </h3>
                    <p class="text-sm text-gray-600 mb-4 leading-snug">
                        ${product.description}
                    </p>
                    <span class="text-lg font-bold text-gray-900">
                        ${product.price}
                    </span>
                </div>
                <div class="relative flex-shrink-0">
                    <img
                        src="${product.image}"
                        alt="${product.title}"
                        width="150"
                        height="150"
                        class="rounded-lg object-cover"
                    />
                    <div class="absolute -bottom-2 -right-2 w-18 h-18 plus-button-hover plus-button-glow-hover"
                        onclick="event.stopPropagation(); addItemToCart('${product.id}', '${product.title}', '${product.price}', '${product.image}')">
                        <div class="relative w-full h-full">
                            <img
                                src="./images/plusbg.png"
                                alt="Circle background"
                                class="w-full h-full object-contain"
                            />
                            <img
                                src="./images/Plus.png"
                                alt="Plus icon"
                                class="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const drinksContainer = document.getElementById('drinks-container');
    if (drinksContainer) {
        drinksContainer.innerHTML = drinksData.map(product => `
            <div class="relative bg-white rounded-xl shadow-md p-4 flex items-center justify-between border border-gray-100 product-card-hover stagger-animate-child">
                <div class="flex flex-col pr-4">
                    <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight">
                        ${product.title}
                    </h3>
                    <p class="text-sm text-gray-600 mb-4 leading-snug">
                        ${product.description}
                    </p>
                    <span class="text-lg font-bold text-gray-900">
                        ${product.price}
                    </span>
                </div>
                <div class="relative flex-shrink-0">
                    <img
                        src="${product.image}"
                        alt="${product.title}"
                        width="150"
                        height="150"
                        class="rounded-lg object-cover"
                    />
                    <div class="absolute -bottom-2 -right-2 w-18 h-18 plus-button-hover plus-button-glow-hover"
                        onclick="event.stopPropagation(); addItemToCart('${product.id}', '${product.title}', '${product.price}', '${product.image}')">
                        <div class="relative w-full h-full">
                            <img
                                src="./images/plusbg.png"
                                alt="Circle background"
                                class="w-full h-full object-contain"
                            />
                            <img
                                src="./images/Plus.png"
                                alt="Plus icon"
                                class="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateSliderPosition(); 

    animateOnScrollElements.forEach(el => observer.observe(el));

//  Know more about us
    const tabButtons = document.querySelectorAll('#know-more-about-us-section .tab-button');
    const tabContents = document.querySelectorAll('#know-more-about-us-section .tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            button.classList.add('active');
            const target = button.dataset.tab;
            document.getElementById(target).classList.remove('hidden');
        });
    });
});


const scrollProgressBar = document.getElementById('scrollProgressBar');
function updateScrollProgressBar() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
    scrollProgressBar.style.width = `${scrollPercent}%`;
}
window.addEventListener('scroll', updateScrollProgressBar);
window.addEventListener('resize', updateScrollProgressBar);
document.addEventListener('DOMContentLoaded', updateScrollProgressBar); 
