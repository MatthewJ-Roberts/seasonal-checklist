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

var userRef;
var newRef;
// Turns off real-time database updates --> Saves cost
let unsubscribe;

auth.onAuthStateChanged((user) => {

    if (user) {
        
        // Create the "anime" collection
        userRef = database.collection('users').doc(user.uid).collection("anime");

        const animeList = document.getElementById('animeList');
        const searchInput = document.getElementById('searchInput');

        var selectedYear = document.getElementById("selectedYear");
        var selectedSeason = document.getElementById("selectedSeason");

        const dropdownYear = document.getElementById("yearDropdown");
        const dropdownSeason = document.getElementById("seasonDropdown");
        
        dropdownYear.addEventListener('click', event => {

            selectedYear.innerHTML = event.target.textContent;
            pullFromDB(user, selectedSeason, selectedYear);
        })

        dropdownSeason.addEventListener('click', event => {

            selectedSeason.innerHTML = event.target.textContent;
            pullFromDB(user, selectedSeason, selectedYear);
        })
        
        searchInput.addEventListener('input', event => {
            event.preventDefault(); // Prevent form submission from reloading the page

            const searchQuery = searchInput.value;

            fetch(`https://api.jikan.moe/v4/anime?q=${searchQuery}`)
                .then(response => response.json())
                .then(data => {
                    animeList.innerHTML = ''; // Clear the dropdown content

                    data.data.forEach(anime => {
                        const option = document.createElement('a');
                        option.classList.add('dropdown-item');
                        option.textContent = anime.title;
                        option.setAttribute('data-anime', JSON.stringify(anime));
                        animeList.appendChild(option);
                    });

                    // Show the dropdown menu
                    animeList.classList.add('show');
                })
                .catch(error => {
                    console.error(error);
                });
            
        });

        // Hide the dropdown menu when the user clicks outside of it
        document.addEventListener('click', event => {
            if (!event.target.closest('.dropdown')) {
                animeList.classList.remove('show');
            }
        });
        
        // Update the search input value when the user clicks on a dropdown item
        animeList.addEventListener('click', event => {
            if (event.target.classList.contains('dropdown-item')) {
                const { serverTimestamp } = firebase.firestore.FieldValue;
                searchInput.value = event.target.textContent;
                const anime = JSON.parse(event.target.getAttribute('data-anime'));
                animeList.classList.remove('show');
                animeList.innerHTML = ''; // Clear the dropdown content

                const genres = anime.genres.map(genre => genre.name).join(', ');
                const studios = anime.studios.map(studio => studio.name).join(', ');

                var animeData = {
                    uid: user.uid,
                    Name: anime.title + " (" + anime.title_english + ")",
                    Studio: studios,
                    Genre: genres,
                    Episodes: anime.episodes,
                    MALRating: anime.score,
                    PersonalRating: "N/A",
                    Broadcasts: anime.broadcast.string,
                    Season: anime.season,
                    Year: anime.year,
                    createdAt: serverTimestamp()
                }
                console.log(animeData);

                pushToDB(user, animeData);
                pullFromDB(user, selectedSeason, selectedYear);
            }
        });

        searchInput.addEventListener('click', event => {
            if (event.target.closest('.dropdown') && searchInput.value != "") {
                animeList.classList.add('show');
            }
        })

        pullFromDB(user, selectedSeason, selectedYear);

    } 

});

function pushToDB(user, data) {
    newRef = database.collection('users').doc(user.uid).collection("anime").doc(data.Name);
    newRef.set(data)
    .then(function() {
        console.log('Document added!');
    })
}

function pullFromDB(user, selectedSeason, selectedYear) {
    clearTable();

    const table = document.getElementById("seasonalTable").getElementsByTagName('tbody')[0];
    var rowCount = 1;

    database.collection('users').doc(user.uid).collection("anime").get()
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if ((data.Year == selectedYear.innerHTML && data.Season == selectedSeason.innerHTML) || 
            (data.Year == selectedYear.innerHTML && selectedSeason.innerHTML == "All") || 
            (selectedYear.innerHTML == "All" && data.Season == selectedSeason.innerHTML) || 
            (selectedYear.innerHTML == "All" && selectedSeason.innerHTML == "All")) {
                
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
            }
        
        });
    })

}

function clearTable() {
    const table = document.getElementById("seasonalTable").getElementsByTagName('tbody')[0];
    table.innerHTML = "";
}