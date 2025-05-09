document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const user = { name, email, password };


  localStorage.setItem("user", JSON.stringify(user));
  alert("Registration successful! Please login.");

  window.location.href = "login.html";
});
