        // Calculator state
        const calculator = {
            bill: 0,
            tipPercentage: 0,
            numberOfPeople: 0,
            customTip: 0,
            currency: 'USD', // Default currency code
            currencySymbol: '$' // Default currency symbol
        };

        // DOM elements
        const billInput = document.getElementById('bill');
        const customTipInput = document.getElementById('custom-tip');
        const peopleInput = document.getElementById('people');
        const tipButtons = document.querySelectorAll('.tip-btn');
        const tipAmountDisplay = document.getElementById('tip-amount');
        const totalAmountDisplay = document.getElementById('total-amount');
        const resetButton = document.getElementById('reset-btn');
        const billError = document.getElementById('bill-error');
        const peopleError = document.getElementById('people-error');
        const customTipError = document.getElementById('custom-tip-error');
        const celebrationSound = document.getElementById('celebration-sound');
        const currencySelector = document.getElementById('currency-selector'); // New: Currency selector
        const currencySymbolBill = document.getElementById('currency-symbol-bill'); // New: Bill input currency symbol

        // Utility functions
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: calculator.currency, // Use selected currency code
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        };

        const updateCurrencySymbol = () => {
            switch (calculator.currency) {
                case 'USD':
                    calculator.currencySymbol = '$';
                    break;
                case 'EUR':
                    calculator.currencySymbol = '€';
                    break;
                case 'GBP':
                    calculator.currencySymbol = '£';
                    break;
                case 'JPY':
                    calculator.currencySymbol = '¥';
                    break;
                default:
                    calculator.currencySymbol = '$';
            }
            currencySymbolBill.textContent = calculator.currencySymbol; // Update bill input symbol
        };

        const validateInput = (input, errorElement, canBeZero = false, maxValue = null) => {
            const value = parseFloat(input.value);
            const isValid = !isNaN(value) && (canBeZero ? value >= 0 : value > 0) && (maxValue ? value <= maxValue : true);
            if (!isValid && input.value !== '') {
                input.classList.add('error');
                errorElement.classList.remove('hidden');
                return false;
            } else {
                input.classList.remove('error');
                errorElement.classList.add('hidden');
                return true;
            }
        };

        // Confetti function (using pure JS/CSS)
        const shootConfetti = (tipValue) => {
            console.log('Attempting to shoot confetti for tip:', tipValue);
            if (tipValue <= 0) return;
            const baseCount = 30; // Minimum confetti particles
            const maxCount = 150; // Maximum confetti particles to prevent performance issues
            // Scale confetti count based on tip value, up to a max
            const count = Math.min(baseCount + Math.floor(tipValue * 5), maxCount);
            const colors = ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a', // Bright, vibrant colors
                            '#FFD700', '#C0C0C0', '#ADD8E6', '#90EE90', '#FF69B4', // Gold, Silver, Light Blue, Light Green, Hot Pink
                            '#FFA500', '#8A2BE2', '#00CED1' // Orange, Blue Violet, Dark Cyan
                        ];
            const shapes = ['circle', 'square']; // Simple shapes for confetti
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.classList.add('confetti-particle');
                // Random color
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                // Random shape
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                if (shape === 'square') {
                    particle.style.borderRadius = '0';
                } else { // circle
                    particle.style.borderRadius = '50%';
                }
                // Random size
                const size = Math.random() * 8 + 5; // 5px to 13px
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                // Random initial position (top of the screen, spread horizontally)
                const startX = Math.random() * window.innerWidth;
                const startY = -50; // Start 50px above the viewport
                const endX = startX + (Math.random() - 0.5) * 400; // Spread horizontally
                const endY = window.innerHeight + 50; // Fall off screen
                const startRot = Math.random() * 360;
                const endRot = startRot + (Math.random() > 0.5 ? 1 : -1) * (720 + Math.random() * 720); // Multiple spins
                // Set CSS variables for animation
                particle.style.setProperty('--start-x', `${startX}px`);
                particle.style.setProperty('--start-y', `${startY}px`);
                particle.style.setProperty('--start-rot', `${startRot}deg`);
                particle.style.setProperty('--end-x', `${endX}px`);
                particle.style.setProperty('--end-y', `${endY}px`);
                particle.style.setProperty('--end-rot', `${endRot}deg`);
                // Random animation duration and delay
                const duration = Math.random() * 2 + 2; // 2s to 4s
                const delay = Math.random() * 0.5; // 0s to 0.5s
                particle.style.animationDuration = `${duration}s`;
                particle.style.animationDelay = `${delay}s`;
                document.body.appendChild(particle);
                // Remove particle after animation to clean up DOM
                particle.addEventListener('animationend', () => {
                    particle.remove();
                });
            }
        };

        const calculateTip = () => {
            // Validate inputs
            const billValid = validateInput(billInput, billError);
            const peopleValid = validateInput(peopleInput, peopleError);
            if (!billValid || !peopleValid || calculator.bill <= 0 || calculator.numberOfPeople <= 0) {
                tipAmountDisplay.textContent = formatCurrency(0); // Use formatCurrency for $0.00
                totalAmountDisplay.textContent = formatCurrency(0); // Use formatCurrency for $0.00
                resetButton.disabled = true;
                return;
            }

            // Calculate tip and total per person
            const tipAmount = (calculator.bill * calculator.tipPercentage) / 100;
            const tipPerPerson = tipAmount / calculator.numberOfPeople;
            const totalPerPerson = (calculator.bill + tipAmount) / calculator.numberOfPeople;

            // Update display
            tipAmountDisplay.textContent = formatCurrency(tipPerPerson);
            totalAmountDisplay.textContent = formatCurrency(totalPerPerson);

            // Enable reset button if there are values
            resetButton.disabled = false;

            // Trigger confetti and sound if tip amount is positive
            if (tipAmount > 0) {
                shootConfetti(tipAmount);
                // Play celebration sound
                if (celebrationSound) {
                    celebrationSound.currentTime = 0; // Rewind to start if already playing
                    celebrationSound.play().catch(e => console.error("Error playing sound:", e));
                }
            }
        };

        const resetCalculator = () => {
            calculator.bill = 0;
            calculator.tipPercentage = 0;
            calculator.numberOfPeople = 0;
            calculator.customTip = 0;
            calculator.currency = 'USD'; // Reset currency
            calculator.currencySymbol = '$'; // Reset currency symbol

            billInput.value = '';
            customTipInput.value = '';
            peopleInput.value = '';
            currencySelector.value = 'USD'; // Reset currency selector

            // Remove active states from tip buttons
            tipButtons.forEach(btn => btn.classList.remove('active'));

            // Reset displays
            updateCurrencySymbol(); // Update symbol before formatting
            tipAmountDisplay.textContent = formatCurrency(0);
            totalAmountDisplay.textContent = formatCurrency(0);

            // Disable reset button
            resetButton.disabled = true;

            // Clear errors
            billInput.classList.remove('error');
            peopleInput.classList.remove('error');
            customTipInput.classList.remove('error');
            billError.classList.add('hidden');
            peopleError.classList.add('hidden');
            customTipError.classList.add('hidden');
        };

        // Event listeners
        billInput.addEventListener('input', (e) => {
            calculator.bill = parseFloat(e.target.value) || 0;
            calculateTip();
        });

        customTipInput.addEventListener('input', (e) => {
            const customValue = parseFloat(e.target.value) || 0;
            // Validate custom tip input
            const isValidCustomTip = validateInput(customTipInput, customTipError, true, 100);
            if (isValidCustomTip) {
                calculator.customTip = customValue;
                calculator.tipPercentage = customValue;
                // Remove active state from preset buttons when custom is used
                if (e.target.value !== '') {
                    tipButtons.forEach(btn => btn.classList.remove('active'));
                }
                calculateTip();
            }
        });

        peopleInput.addEventListener('input', (e) => {
            calculator.numberOfPeople = parseInt(e.target.value) || 0;
            calculateTip();
        });

        // Tip button event listeners
        tipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tipValue = parseInt(e.target.dataset.tip);
                if (tipValue) {
                    calculator.tipPercentage = tipValue;
                    // Update active state
                    tipButtons.forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');

                    // Add and remove feedback pulse class
                    e.target.classList.add('feedback-pulse');
                    e.target.addEventListener('animationend', () => {
                        e.target.classList.remove('feedback-pulse');
                    }, { once: true });

                    // Clear custom input
                    customTipInput.value = '';
                    calculator.customTip = 0;
                    calculateTip();
                }
            });
        });

        // Currency selector event listener
        currencySelector.addEventListener('change', (e) => {
            calculator.currency = e.target.value;
            updateCurrencySymbol(); // Update the symbol displayed
            calculateTip(); // Recalculate to update formatted amounts
        });

        // Reset button event listener
        resetButton.addEventListener('click', resetCalculator);

        // Input validation on blur
        billInput.addEventListener('blur', () => {
            validateInput(billInput, billError);
        });
        peopleInput.addEventListener('blur', () => {
            validateInput(peopleInput, peopleError);
        });
        customTipInput.addEventListener('blur', () => {
            validateInput(customTipInput, customTipError, true, 100);
        });

        // Prevent negative values
        [billInput, customTipInput, peopleInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                // Allow: backspace, delete, tab, escape, enter
                if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right, down, up
                    (e.keyCode >= 35 && e.keyCode <= 40)) {
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
        });

        // Initialize calculator on page load
        document.addEventListener('DOMContentLoaded', () => {
            updateCurrencySymbol(); // Set initial symbol
            calculateTip();
        });