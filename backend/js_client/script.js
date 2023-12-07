const API_URL = 'http://localhost:8000/api/spaces';  
const tableBody = document.getElementById('spacesTableBody');  
  
const USERNAME = 'confadmin';  
const PASSWORD = '17n3e0o';  


// Fetches the spaces from Confluence Space Directory
function fetchSpaces() {  
    const headers = new Headers();  
    headers.set('Authorization', 'Basic ' + btoa(USERNAME + ":" + PASSWORD));  
  
    fetch(API_URL, { headers })  
        .then(response => {  
            if (!response.ok) {  
                throw new Error('Network response was not ok');  
            }  
            return response.json();  
        })  
        .then(data => {  
            updateTable(data.results);  
        })  
        .catch(error => {  
            console.error('Error fetching spaces:', error);  
        });  
}  

// Keeps the table updated
function updateTable(spaces) {  
    let tableRows = '';  
  
    spaces.forEach(space => {  
        tableRows += `  
            <tr>  
                <td>${space.name}</td>  
                <td>${space.type}</td>  
            </tr>  
        `;  
    });  
  
    tableBody.innerHTML = tableRows;  
}  

// Fetch spaces and update the table every 5 minutes (300000 ms)  
fetchSpaces();  
setInterval(fetchSpaces, 300000);  