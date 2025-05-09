document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (!savedUser) {
    alert("No registered user found.");
    return;
  }

  if (email === savedUser.email && password === savedUser.password) {
    localStorage.setItem("loggedInUser", JSON.stringify(savedUser));
    alert("Login successful!");
    window.location.href = "index.html"; 
  } else {
    alert("Invalid email or password.");
  }
});
