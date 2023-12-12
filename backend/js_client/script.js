
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
  
const USERNAME = 'confadmin';  
const PASSWORD = '17n3e0o';  


/********************************************************************
  
                           Gets list of spaces

********************************************************************/

let fetchedSpaces = [];  
  
function fetchSpaces() {  
    const endpoint = `${API_URL}/spaces`  
    const headers = new Headers();  
    headers.set('Authorization', 'Basic ' + btoa(USERNAME + ":" + PASSWORD));  
  
    fetch(endpoint, { headers })  
        .then(response => {  
            if (!response.ok) {  
                throw new Error('Network response was not ok');  
            }  
            return response.json();  
        })  
        .then(data => {  
            fetchedSpaces = data.results;  
            updateTable(fetchedSpaces);  
        })  
        .catch(error => {  
            console.error('Error fetching spaces:', error);  
        });  
}  


/********************************************************************
  
                            Updates Table

********************************************************************/

let currentPage = 1;  
  
function updateTable(spaces) {  
    let tableRows = '';  
  
    spaces.forEach(space => {  
        tableRows += `  
            <tr>  
                <td>${space.name}</td>  
                <td>${space.owner}</td>  
                <td class="button-column">  
                    <button class="btn btn-sm btn-info" onclick="logOwnerName('${space.owner}')">  
                        <i class="bi bi-envelope"></i> Request
                    </button>  
                </td> 
            </tr>  
        `;  
    });  
  
    tableBody.innerHTML = tableRows;  
  
    // Update the pagination  
    displayPageNumbers(spaces.length);  
}  

function logOwnerName(ownerName) {  
    console.log(ownerName);  
}  
  
function displayPageNumbers(totalCount) {  
    const totalPages = Math.ceil(totalCount / itemsPerPage);  
    const pageNumbersDiv = pagination;  
    pageNumbersDiv.innerHTML = '';  

    // "First Page" button  
    const firstPageButton = document.createElement('button');  
    firstPageButton.textContent = '<<';  
    firstPageButton.classList.add('pagination-btn');  
    firstPageButton.disabled = currentPage === 1;  
    firstPageButton.addEventListener('click', () => {  
        changePage(1);  
    });  
    pageNumbersDiv.appendChild(firstPageButton); 

    // "Previous Page" button  
    const prevPageButton = document.createElement('button');  
    prevPageButton.textContent = '<';  
    prevPageButton.classList.add('pagination-btn');  
    prevPageButton.disabled = currentPage === 1;  
    prevPageButton.addEventListener('click', () => {  
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
    const nextPageButton = document.createElement('button');  
    nextPageButton.textContent = '>';  
    nextPageButton.classList.add('pagination-btn');  
    nextPageButton.disabled = currentPage === totalPages;  
    nextPageButton.addEventListener('click', () => {  
        if (currentPage < totalPages) {  
            changePage(currentPage + 1);  
        }  
    });  
    pageNumbersDiv.appendChild(nextPageButton); 

    // Add "Last Page" button  
    const lastPageButton = document.createElement('button');  
    lastPageButton.textContent = '>>';  
    lastPageButton.classList.add('pagination-btn');  
    lastPageButton.disabled = currentPage === totalPages;  
    lastPageButton.addEventListener('click', () => {  
        changePage(totalPages);  
    });  
    pageNumbersDiv.appendChild(lastPageButton); 
}  

// Change Page Function
function changePage(page) {  
    currentPage = page;  
    const startIndex = (currentPage - 1) * itemsPerPage;  
    const endIndex = startIndex + itemsPerPage;  
    const paginatedSpaces = fetchedSpaces.slice(startIndex, endIndex);  
    updateTable(paginatedSpaces);  
    displayPageNumbers(fetchedSpaces.length);
} 


/********************************************************************
  
                           Search Functions

********************************************************************/
  
function searchSpaces(searchInput) {  
    return fetchedSpaces.filter(space => {  
        return space.name.toLowerCase().includes(searchInput.toLowerCase());  
    });  
}  
  
searchForm.addEventListener('submit', (event) => {  
    event.preventDefault();  
    const searchInput = document.getElementById('search').value;  
    const filteredSpaces = searchSpaces(searchInput);  
    updateTable(filteredSpaces);  
}); 


/********************************************************************
  
                            Reset Search

********************************************************************/
  
resetButton.addEventListener('click', () => {  
    document.getElementById('search').value = '';  
    autocompleteList.innerHTML = ''; // Add this line to close the autocomplete dropdown list  
    updateTable(fetchedSpaces);  
}); 


/********************************************************************
  
                      Autocomplete Sugggestions

********************************************************************/

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
  
function selectSuggestion(event) {  
    searchInput.value = event.target.textContent;  
    autocompleteList.innerHTML = '';  
}  

// Shows auto-complete suggestions when writing in search bar
searchInput.addEventListener('input', showAutocompleteSuggestions);  

// Closes auto-complete suggestions when you hit the "Enter" key
searchInput.addEventListener('keydown', (event) => {  
    if (event.key === 'Enter') {  
        event.preventDefault();  
        const searchValue = searchInput.value;  
        const filteredSpaces = fetchedSpaces.filter(space => {  
            return space.name.toLowerCase().includes(searchValue.toLowerCase());  
        });  
        updateTable(filteredSpaces);  
        autocompleteList.innerHTML = '';
    }  
});  

// Closes auto-complete suggestions when you click the "Search" button
searchButton.addEventListener('click', (event) => {  
    event.preventDefault();  
    const searchValue = searchInput.value;  
    const filteredSpaces = fetchedSpaces.filter(space => {  
        return space.name.toLowerCase().includes(searchValue.toLowerCase());  
    });  
    updateTable(filteredSpaces);  
    displayPageNumbers(filteredSpaces.length);
    autocompleteList.innerHTML = '';
});  


/********************************************************************
  
                            Main Functions

********************************************************************/

// Initial Fetch  
fetchSpaces();

// Syncs the list of spaces update with the one in Confluence every 300000ms
setInterval(fetchSpaces, 300000);  

displayPageNumbers(fetchedSpaces.length);

