console.log("I got her22e");
const form = document.getElementById("login_new_user");

form.addEventListener("submit", async function (event) {
  try {
    event.preventDefault();
    const formData = new FormData(form);
    console.log("I got here us tnow");
    const response = await fetch("/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData),
    });
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      console.log("this is my", contentType);
      if (contentType && contentType.includes("application/json")) {
        const htmlContent = await response.json();
        const displayPopUpMessage = document.getElementById(
          "display-pop-up-message"
        );
        const PopUpMessageWrapper = document.getElementById(
          "pop-up-message-wrapper"
        );

        if (htmlContent.userDetailFromDatabase) {
          displayPopUpMessage.innerHTML = `<i class="fa-solid fa-check"></i> ${htmlContent.userDetailFromDatabase.full_name} successfully logged in`;
          // Display the wrapper
          PopUpMessageWrapper.style.backgroundColor = "rgb(8, 207, 88)";
          PopUpMessageWrapper.style.display = "flex";
          setTimeout(() => {
            PopUpMessageWrapper.style.display = "none";
          }, 3000);
          setTimeout(() => {
            if (htmlContent.userDetailFromDatabase.isAdmin === "null") {
              window.location.assign("/");
            } else {
              window.location.assign("/admin/dashboard");
            }
          }, 800);
        } else if (
          htmlContent.zodErrorMessage ||
          htmlContent.EmailExistError ||
          htmlContent.unknownError
        ) {
          console.log("htmlContent:", htmlContent);
          const errorMessage =
            htmlContent.zodErrorMessage ||
            htmlContent.EmailExistError ||
            htmlContent.unknownError ||
            "Unknown error";
          displayPopUpMessage.innerHTML = `<i class="fa-solid fa-x"></i> ${errorMessage}`;
          // Display the wrapper
          PopUpMessageWrapper.style.backgroundColor = "red";
          PopUpMessageWrapper.style.display = "flex";
          setTimeout(() => {
            PopUpMessageWrapper.style.display = "none";
          }, 3000);
        }
      } else {
        // If it's not HTML, log or display a success message
        console.log("oops");
        location.reload();
      }
    } else {
      console.error("Course deletion failed:", response.statusText);
    }
  } catch (error) {
    console.log("Error signing up", error);
  }
});
