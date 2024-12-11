let cart = []

async function fetchData() {
    try {
        const response = await fetch("./data.json");
        
        if (!response.ok) {
            console.log("Something went wrong");
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch data:", error);
        return [];
    }
}

async function menuContent() {
    let dessertMenu = document.querySelector('.dessert-menu');
    const data = await fetchData();
    dessertMenu.innerHTML = '';
    data.forEach(item => {
      const serializedItem = encodeURIComponent(JSON.stringify(item))
       dessertMenu.innerHTML += `<div class="dessert-menu__item" data-item="${serializedItem}">
        <div class="add">
          <img src="${item.image.desktop}" class="desktop-image">
          <img src="${item.image.mobile}" class="mobile-image">
          <img src="${item.image.tablet}" class="tablet-image">
          <img src="${item.image.thumbnail}" class="thumbnail-image">
          <button class="dessert-menu__button desert--button"><img src="./assets/images/icon-add-to-cart.svg"><span>Add to Cart</span></button>
          <button class="dessert-menu__button dessert--quantity__button hide-btn">
            <div class="minus-btn"><img src="./assets/images/icon-decrement-quantity.svg"></div>
            <p class="quantity">1</p>
            <div class="increase-btn"><img src="./assets/images/icon-increment-quantity.svg"></div>
          </button>
        </div>
        <div class="dessert-info">
          <p class="dessert-menu__category">${item.category}</p>
          <h3 class="dessert-menu__title">${item.name}</h3>
          <p class="dessert-menu__price">${item.price}</p>
        </div>
      </div>
      `  
    });
    
    attachEventListeners()
}

menuContent()

function attachEventListeners() {
    const dessertMenuItem = document.querySelectorAll(".dessert-menu__item");
    dessertMenuItem.forEach((menu) => {
        const menuButton = menu.querySelector(".desert--button");
        const quantityButton = menu.querySelector(".dessert--quantity__button");
        const minusBtn = menu.querySelector(".minus-btn");
        const increaseBtn = menu.querySelector(".increase-btn")
        const quantity = menu.querySelector(".quantity")
        const itemName = menu.querySelector(".dessert-menu__title").textContent
        menuButton.addEventListener("click", () => {
            reset()
            addToCart(menu);

            menuButton.classList.add("hide-btn");
            quantityButton.classList.remove("hide-btn");
        })
    
        quantityButton.addEventListener("click", (e) => {
            reset()
            quantityButton.classList.add("hide-btn");
            menuButton.classList.remove("hide-btn");
        })
    
        minusBtn.addEventListener("click", (event) => {
            if (quantity.textContent > 0) {
                event.stopPropagation();
                quantity.textContent = parseInt(quantity.textContent) - 1
                updateCartContent(menu, - 1)
            }            
        })
    
        increaseBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            quantity.textContent = parseInt(quantity.textContent) + 1
            updateCartContent(menu, 1)
        })
    })
}

function addToCart(menuItemElement) {
    const menuItem = JSON.parse(decodeURIComponent(menuItemElement.getAttribute('data-item')));
    const name = menuItem.name;
    const price = menuItem.price;
    const image = menuItem.image.thumbnail;
    

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity ++
        
    } else {
        cartItem = {
            name,
            price: parseFloat(price),
            quantity: 1,
            image
        }
        cart.push(cartItem)
    }
    console.log(cart)
    updateCart()
}

function updateCartContent(menuItemElement, change) {
    const menuItem = JSON.parse(decodeURIComponent(menuItemElement.getAttribute('data-item')));
    const itemIndex = cart.findIndex(item => item.name === menuItem.name);
    
    if (itemIndex !== -1) {
        if (!cart[itemIndex].quantity) {
            cart[itemIndex].quantity = 1
        }
        cart[itemIndex].quantity += change

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1)
        }
    }
    console.log(cart)
    updateCart()
}

function updateCart () {
    const emptyCart = document.querySelector(".cart--empty");
    const fullCart = document.querySelector(".cart--full");
    const cartWrapper = document.querySelector(".cart-wrapper");
    const cartItems = document.querySelector(".cart__items");
    const cartLength = document.querySelector(".cart-length");
    const totalPrice = document.querySelector(".cart__total--price")
    
    if (cart.length === 0) {
        emptyCart.classList.remove("hide")
        fullCart.classList.add("hide")
    } else {
        emptyCart.classList.add("hide")
        fullCart.classList.remove("hide")
        cartItems.innerHTML = ""
        let totalLength = 0;
        let total = 0;
        cart.forEach((item, index) => {
            
            cartItems.innerHTML += `
            <div class="cart__item">
              <div class="cart__item--details">
                <h4 class="cart__item--title">${item.name}</h4>
                <p class="cart__item--total"><span class="cart__item--quantity">${item.quantity}x</span><span class="cart__item--price">@ $${(item.price).toFixed(2)}</span><span class="cart__item--total-price">$${(Number(item.price) * item.quantity).toFixed(2)}</span></p>
              </div>
              <div>
                <img src="./assets/images/icon-remove-item.svg" class="cart__item--remove" data-name="${item.name}">
              </div>
            </div>
            <hr>
            `
            totalLength += item.quantity;
            cartLength.innerHTML = totalLength;
            total += item.price * item.quantity
            totalPrice.innerHTML = total.toFixed(2);
        })
    }
}

function removeCartItem(itemName) {
    const itemIndex = cart.findIndex(item => item.name === itemName);
    if (itemIndex !== -1) {
        cart.splice(itemIndex, 1)
        updateCart()
        console.log(cart)
    }
}

document.querySelector(".cart__items").addEventListener("click", (event) => {
    if (event.target.classList.contains("cart__item--remove" )) {
        const itemName = event.target.getAttribute("data-name");
        console.log(itemName)
        removeCartItem(itemName)
    }
})

function reset() {
    const dessertMenuItem = document.querySelectorAll(".dessert-menu__item");
    dessertMenuItem.forEach((menu) => {
        const menuButton = menu.querySelector(".desert--button");
        const quantityButton = menu.querySelector(".dessert--quantity__button");
        const quantity = menu.querySelector(".quantity");
        quantity.textContent = 1
        menuButton.classList.remove("hide-btn");
        quantityButton.classList.add("hide-btn")
    })
}

document.querySelector(".cart__confirm-order").addEventListener("click", () => {


    
    const confirmationWrapper = document.querySelector(".confirmation-wrapper");
    confirmationWrapper.classList.remove("hide");
    
    const confirmedItems = document.querySelector(".confirmed-items-list")
    const orderPrice = document.querySelector(".order-total-price")
    let total = 0;
    confirmedItems.innerHTML = '';
    cart.forEach((item) => {
        total += item.price * item.quantity
        
        confirmedItems.innerHTML += `
        <div class="confirmed-item">
              <img src="${item.image}">
              <div class="confirmed-order">
                <h4>${item.name}</h4>
                <p><span>${item.quantity}x</span><span>@$${(item.price).toFixed(2)}</span></p>
              </div>
              <p class="total">$${(Number(item.price) * item.quantity).toFixed(2)}</p>
            </div>
            <hr>
        `
        orderPrice.innerHTML = '$' + total.toFixed(2);
    })
    
})

document.querySelector(".start-new-order").addEventListener("click", () => {
    const confirmationWrapper = document.querySelector(".confirmation-wrapper");
    confirmationWrapper.classList.add("hide");
    cart = []
    updateCart()
    reset()
})







