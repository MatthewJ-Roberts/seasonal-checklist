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

const addRow = document.getElementById("addRowButton");
const table = document.getElementById("tableBody");

let databaseRef;
// Turns off real-time database updates --> Saves cost
let unsubscribe;

auth.onAuthStateChanged((user) => {

    if (user) {
        
        databaseRef = database.collection("anime");

        addRow.onclick = () => {

            const { serverTimestamp } = firebase.firestore.FieldValue;

            databaseRef.add({
                uid: user.uid,
                Name: "Bleach",
                Studio: "Pierrot",
                Genre: "Action, Adventure, Fantasy",
                Episodes: "13",
                MALRating: "9.11",
                PersonalRating: "8.75",
                Broadcasts: "Mondays",
                createdAt: serverTimestamp()
            });

        }

        unsubscribe = databaseRef
            .where("uid", "==", user.uid)
            .onSnapshot(querySnapshot => {

                const items = querySnapshot.docs.map(doc => {

                    

                })

            })

    } else {
        unsubscribe && unsubscribe();
    }

});