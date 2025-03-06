// Function to generate a random CAPTCHA
function generateCaptcha() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars[Math.floor(Math.random() * chars.length)];
  }
  const captchaTextElement = document.getElementById("captchaText");
  if (captchaTextElement) {
    captchaTextElement.textContent = captcha;
  } else {
    console.error("CAPTCHA text element not found.");
  }
}

// Generate CAPTCHA on page load
window.onload = generateCaptcha;

// Function to validate CNIC format
function validateCNIC(cnic) {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/; // Format: XXXXX-XXXXXXX-X
  return cnicRegex.test(cnic);
}

// Function to handle login form submission
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    // Get input values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const captchaInput = document.getElementById("captchaInput").value;
    const captchaText = document.getElementById("captchaText").textContent;

    // Validate email and password
    if (email === "abc@duhs.edu.pk" && password === "abc1234") {
      // Validate CAPTCHA
      if (captchaInput === captchaText) {
        alert("Login successful! Redirecting to home page...");
        window.location.href = "homePage.html"; // Redirect to home page
      } else {
        alert("Wrong CAPTCHA. Please try again.");
        generateCaptcha(); // Regenerate CAPTCHA
      }
    } else {
      alert("Invalid email or password. Please try again.");
      generateCaptcha(); // Regenerate CAPTCHA
    }

    // Reset CAPTCHA input field
    document.getElementById("captchaInput").value = "";
  });
} else {
  console.error("Login form not found.");
}

// Function to enable editing for a field
function enableEdit(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.removeAttribute("readonly");
    field.focus();
  } else {
    console.error(`Field with ID ${fieldId} not found.`);
  }
}

// Function to save changes (for demonstration purposes)
function saveChanges() {
  alert("Changes forwarded to the admin successfully!");
  // You can add logic here to send updated data to the server
}

// Function to add a course
function addCourse(courseCode) {
  alert(`Added course: ${courseCode}`);
  // You can add logic here to update the student's course list on the server
}

// Function to drop a course
function dropCourse(courseCode) {
  alert(`Dropped course: ${courseCode}`);
  // You can add logic here to update the student's course list on the server
}

// Function to handle recheck request
function requestRecheck() {
  alert("Request has been filed.");
  // You can add logic here to send the recheck request to the server
}

// Function to handle forgot password form submission
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    // Get input values
    const cnic = document.getElementById("cnic").value;
    const email = document.getElementById("email").value;
    const captchaInput = document.getElementById("captchaInput").value;
    const captchaText = document.getElementById("captchaText").textContent;

    // Validate CNIC format
    if (!validateCNIC(cnic)) {
      alert("Invalid CNIC format. Please enter a valid CNIC in the format: XXXXX-XXXXXXX-X.");
      return;
    }

    // Validate email format
    if (!email.endsWith("@duhs.edu.pk")) {
      alert("Please enter a valid DUHS email address (ending with @duhs.edu.pk).");
      return;
    }

    // Validate CAPTCHA
    if (captchaInput !== captchaText) {
      alert("Wrong CAPTCHA. Please try again.");
      generateCaptcha(); // Regenerate CAPTCHA
      return;
    }

    // If all validations pass
    alert(`Activation link sent to ${email}`);
    generateCaptcha(); // Regenerate CAPTCHA for next use

    // Clear form fields
    document.getElementById("cnic").value = "";
    document.getElementById("email").value = "";
    document.getElementById("captchaInput").value = "";
  });
} else {
  console.error("Forgot password form not found.");
}

// Function to disable the back button
function disableBackButton() {
  // Push a new state to the history stack
  history.pushState(null, document.title, location.href);

  // Listen for the popstate event (triggered when the user tries to navigate back)
  window.addEventListener("popstate", function (event) {
    // Push the current state again to prevent back navigation
    history.pushState(null, document.title, location.href);
    alert("You cannot go back.");
  });
}

// Function to handle logout
function logout(event) {
  event.preventDefault(); // Prevent default link behavior
  alert("You have been logged out.");
  disableBackButton(); // Disable the back button
  window.location.href = "index.html"; // Redirect to the login page
}

// Attach the logout function to the logout link
const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
  logoutLink.addEventListener("click", logout);
} else {
  console.error("Logout link not found.");
}