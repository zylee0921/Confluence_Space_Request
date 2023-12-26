
/********************************************************************
  
                                Constants

********************************************************************/

const API_URL = 'http://localhost:8000/api';  
const tableBody = document.getElementById('spacesTableBody');  
const searchForm = document.getElementById('search-form');  
const resetButton = document.getElementById('reset-button');  
const searchInput = document.getElementById('search');  
const searchButton = document.getElementById('search-button');  
const autocompleteList = document.getElementById('autocomplete-list'); 
const pagination = document.getElementById('pagination');  
const itemsPerPage = 20;   


/********************************************************************
  
                           Gets current user

********************************************************************/

let currentUserInfo = [];

// Fetches the current user's information
function fetchCurrentUser() {
    const endpoint = `${API_URL}/current`

    fetch(endpoint)    
        .then(response => {    
            if (!response.ok) {    
                throw new Error('Network response was not ok');    
            }    
            return response.json();    
        })    
        .then(data => {    
            currentUserInfo = data;  
            console.log(`Username: ${currentUserInfo.username}\nUserkey: ${currentUserInfo.userKey}`)  
        })    
        .catch(error => {    
            console.error('Error fetching current user:', error);    
        });  
}


/********************************************************************
  
                           Gets list of spaces

********************************************************************/

let fetchedSpaces = [];  

let currentSpaces = [];  

// Fetches the list of spaces
function fetchSpaces() {      
    const endpoint = `${API_URL}/spaces`      
      
    fetch(endpoint)      
        .then(response => {      
            if (!response.ok) {      
                throw new Error('Network response was not ok');      
            }      
            return response.json();      
        })      
        .then((data) => {    
            fetchedSpaces = data.results.map((space) => ({ ...space, inCart: false }));    
            currentSpaces = fetchedSpaces;    
            changePage(1);    
            displayCartItems();
            displayPageNumbers(fetchedSpaces.length);
        })   
        .catch(error => {      
            console.error('Error fetching spaces:', error);      
        });      
}    



/********************************************************************
  
                            Updates Table

********************************************************************/

let currentPage = 1;  

// Updates the table with the list of spaces
function updateTable(spaces) {  
    let tableRows = '';  
  
    spaces.forEach((space, index) => {  
        const buttonId = `addToCartButton-${index}`;  
        // const buttonDisabled = space.requested ? ' disabled' : '';  
        let buttonIcon, buttonClass, buttonAction, buttonText;  
  
        // If already in cart
        if (space.inCart) {  
            buttonIcon = 'bi-cart-x';  
            buttonClass = 'btn-danger';  
            buttonAction = `removeFromCart('${space.name}', '${buttonId}')`;  
            buttonText = ' Cancel';  
        // If not request and not in cart
        } else {  
            buttonIcon = 'bi-cart-plus';  
            buttonClass = 'btn-info';  
            buttonAction = `addToCart('${space.name}', '${buttonId}')`;  
            buttonText = ' Add to Cart';  
        }  
  
        tableRows += `  
            <tr>  
                <td>${space.name}</td>  
                <td class="button-column">  
                <button class="btn btn-sm ${buttonClass}" id="${buttonId}" onclick="${buttonAction}">  
                    <i class="bi ${buttonIcon}"></i>${buttonText}  
                </button>  
                </td>  
            </tr>  
        `;  
    });  
  
    tableBody.innerHTML = tableRows;  
  
    // Update the pagination  
    displayPageNumbers(spaces.length);  
}  


/********************************************************************
  
                            Cart Functions

********************************************************************/

let cartItems = [];

// Add space to cart list
function addToCart(spaceName, buttonId) {  
    if (!cartItems.includes(spaceName)) {  
        cartItems.push(spaceName);  
        displayCartItems();  
    
        fetchedSpaces.find((space) => space.name === spaceName).inCart = true; 
        
        const button = document.getElementById(buttonId);  
        button.innerHTML = '<i class="bi bi-cart-x"></i> Cancel';  
        button.classList.remove("btn-info");  
        button.classList.add("btn-danger");  
        button.onclick = () => removeFromCart(spaceName, buttonId);  
    }  
} 

// Remove space from cart list and updates cancel button in main list
function removeFromCart(spaceName, buttonId) {    
    cartItems = cartItems.filter((item) => item !== spaceName);    
    displayCartItems();    
    
    fetchedSpaces.find((space) => space.name === spaceName).inCart = false;    
    
    if (!buttonId) {    
        // Find the index of the space in the currentSpaces array    
        const spaceIndex = currentSpaces.findIndex((space) => space.name === spaceName);    
    
        // If the space is found in the currentSpaces array, update the button state    
        if (spaceIndex !== -1) {    
            buttonId = `addToCartButton-${spaceIndex}`;    
        }    
    }    
    
    if (buttonId) {  
        const button = document.getElementById(buttonId);  
        // Check if the button exists before updating its properties  
        if (button) {  
            button.innerHTML = '<i class="bi bi-cart-plus"></i> Add to Cart';    
            button.classList.remove("btn-danger");    
            button.classList.add("btn-info");    
            button.onclick = () => addToCart(spaceName, buttonId);  
        }  
    }    
}  
 

// Removes item from cart list for cancel button in cart list
function removeItemFromCart(spaceName, event) {  
    event.stopPropagation();

    removeFromCart(spaceName, null);  
    displayCartItems();
} 

// Creates the display for the cart list
function displayCartItems() {  
    const cartItemsContainer = document.getElementById("cartItemsContainer");  

    let cartItemsHTML = '<div class="cart-items-wrapper">';  
  
    if (cartItems.length === 0) {  
        cartItemsHTML += `  
            <ul class="list-group text-center">  
                <div>  
                    <img src="../icons/empty-cart.png" alt="Empty Cart" class="empty-cart-image" />  
                </div>  
                <br>  
                The cart is currently empty.  
            </ul>`;  
    } else {  
        cartItems.forEach((spaceName) => {  
            cartItemsHTML += `  
                <ul class="list-group">  
                    <div class="cart-item">  
                        ${spaceName}  
                        <button class="btn btn-sm btn-danger float-right" onclick="removeItemFromCart('${spaceName}', event);">  
                            <i class="bi bi-x disabled"></i>  
                        </button>  
                    </div>  
                </ul>`;  
        });  
  
        cartItemsHTML += `  
            <div class="dropdown-divider"></div>  
            <button class="btn btn-sm btn-info w-100 mt-2 mb-1" onclick="requestAccessForCartItems()">  
                Request Access  
            </button>`;  
    }  
  
    cartItemsHTML += '</div>';  
    cartItemsContainer.innerHTML = cartItemsHTML;  
}  


/********************************************************************
  
                           Request Functions

********************************************************************/

// Sends email to the target email
function sendEmail(targetEmail) {  
    const endpoint = `${API_URL}/send_request_email` 

    const requestData = {  
        target_email: targetEmail,  
        username: currentUserInfo.username,  
        cart_items: cartItems.map(item => {  
            const space = fetchedSpaces.find(space => space.name === item);  
            return { name: item, key: space.key };  
        }), 
    };  

    console.log('Request data:', requestData); 

    fetch(endpoint, {  
        method: 'POST',  
        headers: {  
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },  
        body: JSON.stringify(requestData), 
        credentials: 'include', 
    })  
        .then((response) => {  
            console.log("Response received:", response);
            return response.json();  
        })
        .then((data) => {    
            if (data.status === 'success') {    
                console.log('Email sent successfully');  
                displaySuccessMessage();
            } else {    
                console.error('Error sending email:', data.message);    
            }    
        })   
        .catch((error) => {  
            console.error('Error sending email:', error);  
        });  
}  

// Gets the CSRF token from the cookie
function getCookie(name) {  
    let cookieValue = null;  
    if (document.cookie && document.cookie !== '') {  
        const cookies = document.cookie.split(';');  
        for (let i = 0; i < cookies.length; i++) {  
            const cookie = cookies[i].trim();  
            if (cookie.substring(0, name.length + 1) === name + '=') {  
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));  
                break;  
            }  
        }  
    }  
    return cookieValue;  
} 

// Request access for the spaces in the cart
function requestAccessForCartItems() {  
    const targetEmail = 'zhiyolee@amd.com';  
    sendEmail(targetEmail);  
  
    cartItems.forEach((spaceName) => {    
        console.log(`The user, ${currentUserInfo.username}, with the user key, ${currentUserInfo.userKey}, has requested access to the space: ${spaceName}.`);    
    
        // Find the space in fetchedSpaces and set its requested property to true    
        fetchedSpaces.find((space) => space.name === spaceName).requested = true;    
    
        // Remove the item from the cart list    
        removeFromCart(spaceName, null);    
    });    
    
    // Update the main list to show the disabled buttons    
    changePage(currentPage); // Call changePage with the current page number  
    
    // Clear the cart list    
    cartItems = [];    
    displayCartItems();    
}  

// Displays a success message upon requesting access
function displaySuccessMessage() {  
    const successMessageContainer = document.getElementById("successMessageContainer");  
  
    let successMessageHTML = `  
        <div class="alert alert-success" role="alert" style="position: fixed; top: -100px; left: 50%; transform: translateX(-50%); z-index: 9999; animation: slide-down 1s forwards, slide-up 1s 4s forwards;">  
            Email sent successfully!  
        </div>  
        <style>  
            @keyframes slide-down {  
                0% { top: -100px; }  
                100% { top: 20px; }  
            }  
            @keyframes slide-up {  
                0% { top: 20px; }  
                100% { top: -100px; }  
            }  
        </style>  
    `;  
  
    successMessageContainer.innerHTML = successMessageHTML;  
  
    // Remove the success message after 5 seconds  
    setTimeout(() => {  
        successMessageContainer.innerHTML = '';  
    }, 5000);  
}


/********************************************************************
  
                              Pagination

********************************************************************/

// Function used to create pagination buttons
function createPaginationButton(text, disabled, clickHandler) {  
    const button = document.createElement('button');  
    button.textContent = text;  
    button.classList.add('pagination-btn');  
    button.disabled = disabled;  
    button.addEventListener('click', clickHandler);  
    return button;  
}  
  
// Function use to create and display the pagination buttons
function displayPageNumbers(totalCount) {  
    const totalPages = Math.ceil(totalCount / itemsPerPage);  
    const pageNumbersDiv = pagination;  
    pageNumbersDiv.innerHTML = '';  

    // "First Page" button  
    const firstPageButton = createPaginationButton('<<', currentPage === 1, () => {  
        changePage(1);  
    });  
    pageNumbersDiv.appendChild(firstPageButton);  
    
    // "Previous Page" button  
    const prevPageButton = createPaginationButton('<', currentPage === 1, () => {  
        if (currentPage > 1) {  
            changePage(currentPage - 1);  
        }  
    });  
    pageNumbersDiv.appendChild(prevPageButton);  

    // Other Pages
  
    let startPage = Math.max(currentPage - 3, 1);  
    let endPage = Math.min(startPage + 6, totalPages);  
    startPage = Math.max(endPage - 6, 1);  
  
    for (let i = startPage; i <= endPage; i++) {  
        const pageNumberButton = document.createElement('button');  
        pageNumberButton.textContent = i;  
        pageNumberButton.classList.add('pagination-btn');  
        if (i === currentPage) {  
            pageNumberButton.classList.add('active'); // Highlight the current page number  
        }  
        pageNumberButton.addEventListener('click', () => {  
            currentPage = i;  
            changePage(i);  
        });  
        pageNumbersDiv.appendChild(pageNumberButton);  
    }  

    // "Next Page" button  
    const nextPageButton = createPaginationButton('>', currentPage === totalPages, () => {  
        if (currentPage < totalPages) {  
            changePage(currentPage + 1);  
        }  
    });  
    pageNumbersDiv.appendChild(nextPageButton);  
    
    // "Last Page" button  
    const lastPageButton = createPaginationButton('>>', currentPage === totalPages, () => {  
        changePage(totalPages);  
    });  
    pageNumbersDiv.appendChild(lastPageButton);
}  

// Change Page Function
function changePage(page) {  
    currentPage = page;  
    const startIndex = (currentPage - 1) * itemsPerPage;  
    const endIndex = startIndex + itemsPerPage;  
    const paginatedSpaces = currentSpaces.slice(startIndex, endIndex);
    updateTable(paginatedSpaces);  
    displayPageNumbers(currentSpaces.length); 
} 


/********************************************************************
  
                           Search Functions

********************************************************************/

// Searches for spaces
function searchSpaces(searchInput) {  
    return fetchedSpaces.filter(space => {  
        return space.name.toLowerCase().includes(searchInput.toLowerCase());  
    });  
}  
 
// Searches for spaces when you hit the "Enter" key
searchForm.addEventListener('submit', (event) => {  
    event.preventDefault();  
    const searchInput = document.getElementById('search').value;  
    const filteredSpaces = searchSpaces(searchInput);  
    updateTable(filteredSpaces);  
}); 

// Searches for spaces when you click the "Search" button
function applySearch() {  
    const searchValue = searchInput.value;  
    filteredSpaces = fetchedSpaces.filter(space => {  
        return space.name.toLowerCase().includes(searchValue.toLowerCase());  
    });  
    currentSpaces = filteredSpaces;
    changePage(1, filteredSpaces);  
}  

// Shows auto-complete suggestions when writing in search bar
searchInput.addEventListener('input', showAutocompleteSuggestions);  

// Closes auto-complete suggestions when you hit the "Enter" key
searchInput.addEventListener('keydown', (event) => {  
    if (event.key === 'Enter') {  
        event.preventDefault();  
        applySearch(); // Call applySearch here  
        autocompleteList.innerHTML = '';  
    }  
});  

// Closes auto-complete suggestions when you click the "Search" button
searchButton.addEventListener('click', (event) => {  
    event.preventDefault();  
    applySearch(); // Call applySearch here  
    autocompleteList.innerHTML = '';  
});   


/********************************************************************
  
                            Reset Search

********************************************************************/

// Resets the search bar
resetButton.addEventListener('click', () => {  
    document.getElementById('search').value = '';  
    autocompleteList.innerHTML = '';  
    currentSpaces = fetchedSpaces;
    updateTable(fetchedSpaces);  
});  


/********************************************************************
  
                      Autocomplete Sugggestions

********************************************************************/

// Shows autocomplete suggestions
function showAutocompleteSuggestions() {  
    const searchValue = searchInput.value;  
    if (searchValue === '') {  
        autocompleteList.innerHTML = '';  
        return;  
    }  
  
    const suggestions = fetchedSpaces.filter(space => {  
        return space.name.toLowerCase().includes(searchValue.toLowerCase());  
    });  
  
    let suggestionsHTML = '';  
    suggestions.forEach(space => {  
        suggestionsHTML += `<div onclick="selectSuggestion(event)">${space.name}</div>`;  
    });  
  
    autocompleteList.innerHTML = suggestionsHTML;  
}  
  
// Selects the suggestion
function selectSuggestion(event) {  
    searchInput.value = event.target.textContent;  
    autocompleteList.innerHTML = '';  
}  

/********************************************************************
  
                           Initial Functions

********************************************************************/

// Initial Fetch  
fetchSpaces();
fetchCurrentUser();

// Syncs the list of spaces update with the one in Confluence every 300000ms
// setInterval(fetchSpaces, 300000);  

