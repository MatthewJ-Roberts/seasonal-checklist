// Source: https://www.youtube.com/watch?v=q5J5ho7YUhA&t=0s

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