// Source: https://www.youtube.com/watch?v=q5J5ho7YUhA&t=0s

// User Auth starts here

const auth = firebase.auth();

const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");

const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");

const userName = document.getElementById("dropdownIdUser");

const provider = new firebase.auth.GoogleAuthProvider();

signInButton.onclick = () => auth.signInWithPopup(provider);

signOutButton.onclick = () => auth.signOut();

auth.onAuthStateChanged((user) => {

    if (user) {
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        userName.innerHTML = user.displayName;
    } else {
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
    }

});

// User auth ends here

// Database updating starts here

const database = firebase.firestore();

const table = document.getElementById("tableBody");
const searchButton = document.getElementById("searchButton");

var userRef;
var newRef;
// Turns off real-time database updates --> Saves cost
let unsubscribe;

auth.onAuthStateChanged((user) => {

    if (user) {
        
        // Create the "anime" collection
        userRef = database.collection('users').doc(user.uid).collection("anime");

        const searchForm = document.getElementById('searchForm');
        const animeList = document.getElementById('animeList');

        searchForm.addEventListener('submit', event => {
            event.preventDefault(); // Prevent form submission from reloading the page

            const searchInput = document.getElementById('searchInput');
            const searchQuery = searchInput.value;

            fetch(`https://api.jikan.moe/v4/anime?q=${searchQuery}`)
                .then(response => response.json())
                .then(data => {
                    animeList.innerHTML = ''; // Clear the datalist
                    console.log(data);
                    data.data.forEach(anime => {
                        const option = document.createElement('option');
                        option.text = anime.title;
                        console.log(option); // Log the option to the console
                        animeList.appendChild(option);
                    });

                    // Open the datalist
                    searchInput.focus();
                    searchInput.click();
                })
                .catch(error => {
                    console.error(error);
                });
            
            pushToDB(user);
            pullFromDB(user);
        });

        pullFromDB(user);

    } 

});

function pushToDB(user) {
    const { serverTimestamp } = firebase.firestore.FieldValue;

    var data = {
        uid: user.uid,
        Name: "test",
        Studio: "Pierrot",
        Genre: "Action, Adventure, Fantasy",
        Episodes: "13",
        MALRating: "9.11",
        PersonalRating: "8.75",
        Broadcasts: "Mondays",
        createdAt: serverTimestamp()
    }

    newRef = database.collection('users').doc(user.uid).collection("anime").doc(data.Name);
    newRef.set(data)
    .then(function() {
        console.log('Document added!');
    })
}

function pullFromDB(user) {
    clearTable();

    const table = document.getElementById("seasonalTable").getElementsByTagName('tbody')[0];
    var rowCount = 1;

    database.collection('users').doc(user.uid).collection("anime").get()
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
        const data = doc.data();
        const tr = document.createElement('tr');
        const rowTd = document.createElement('td');
        const nameTd = document.createElement('td');
        const studioTd = document.createElement('td');
        const genreTd = document.createElement('td');
        const episodesTd = document.createElement('td');
        const malTd = document.createElement('td');
        const personalTd = document.createElement('td');
        const broadcastTd = document.createElement('td');
        
        rowTd.appendChild(document.createTextNode(rowCount));
        nameTd.appendChild(document.createTextNode(data.Name));
        studioTd.appendChild(document.createTextNode(data.Studio));
        genreTd.appendChild(document.createTextNode(data.Genre));
        episodesTd.appendChild(document.createTextNode(data.Episodes));
        malTd.appendChild(document.createTextNode(data.MALRating));
        personalTd.appendChild(document.createTextNode(data.PersonalRating));
        broadcastTd.appendChild(document.createTextNode(data.Broadcasts));
        
        tr.appendChild(rowTd);
        tr.appendChild(nameTd);
        tr.appendChild(studioTd);
        tr.appendChild(genreTd);
        tr.appendChild(episodesTd);
        tr.appendChild(malTd);
        tr.appendChild(personalTd);
        tr.appendChild(broadcastTd);
    
        table.appendChild(tr);
        rowCount++;
        });
    })

}

function clearTable() {
    const table = document.getElementById("seasonalTable").getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    for (let i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}