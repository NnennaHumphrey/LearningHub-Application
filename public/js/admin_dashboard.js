// utility function
function togglePopUp(itemId, event) {
  console.log("you clicked", event.target.id);
  const displayPopUp = document.getElementById(itemId);
  displayPopUp.style.display =
    displayPopUp.style.display === "none" ? "flex" : "none";
  if (event && event.target.id.includes("delete-course")) {
    const dynamicId = event.target.id;
    console.log("this is ", dynamicId);
    const deleteCourseBtn = document.getElementById(dynamicId);
    const confirmDelete = document.querySelector(".confirm-btn");
    confirmDelete.addEventListener("click", async function () {
      try {
        const courseData = JSON.parse(deleteCourseBtn.dataset.course);
        const course_title = courseData.course_title;
        const courseId = courseData.courseId;
        //const token = localStorage.getItem("mytoken");
        const response = await fetch("/admin/dashboard/delete-course", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            credentials: "include", // Include the token based on exisiting creadential details
          },
          body: JSON.stringify({ courseId, course_title }), // Include courseId in the request body
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            const htmlContent = await response.json();
            const displayPopUpMessage = document.getElementById(
              "display-pop-up-message"
            );
            const PopUpMessageWrapper = document.getElementById(
              "pop-up-message-wrapper"
            );

            displayPopUpMessage.innerHTML = `<i class="fa-solid fa-check"></i> ${htmlContent.deletedMessage}`;

            // Display the wrapper
            PopUpMessageWrapper.style.display = "flex";

            // Set a timeout to hide the wrapper after 5000 milliseconds (5 seconds)
            setTimeout(() => {
              PopUpMessageWrapper.style.display = "none";
            }, 3000);

            setTimeout(() => {
              location.reload();
            }, 800);

            // Reload the page
          } else {
            // If it's not HTML, log or display a success message
            console.log("Course deleted successfully");
            location.reload();
          }
        } else {
          console.error("Course deletion failed:", response.statusText);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    });
  } else if (event && event.target.id.includes("delete-user")) {
    const dynamicId = event.target.id;
    console.log("user dynamic ", dynamicId);
    const deleteUserBtn = document.getElementById(dynamicId);
    const confirmDelete = document.querySelector(".confirm-btn");
    confirmDelete.addEventListener("click", async function () {
      try {
        console.log("deleteing user");
        const userData = JSON.parse(deleteUserBtn.dataset.user);
        const userId = userData.userId;
        console.log(userId);
        const user_name = userData.full_name;
        console.log(user_name);
        //const token = localStorage.getItem("mytoken");
        const response = await fetch("/admin/dashboard/delete-user", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            credentials: "include", // Include the token based on exisiting creadential details
          },
          body: JSON.stringify({ userId, user_name }), // Include courseId in the request body
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            const htmlContent = await response.json();
            const displayPopUpMessage = document.getElementById(
              "display-pop-up-message"
            );
            const PopUpMessageWrapper = document.getElementById(
              "pop-up-message-wrapper"
            );

            displayPopUpMessage.innerHTML = `<i class="fa-solid fa-check"></i> ${htmlContent.deletedMessage}`;

            // Display the wrapper
            PopUpMessageWrapper.style.backgroundColor = "rgb(8, 207, 88)";
            PopUpMessageWrapper.style.display = "flex";

            // Set a timeout to hide the wrapper after 5000 milliseconds (5 seconds)
            setTimeout(() => {
              PopUpMessageWrapper.style.display = "none";
            }, 3000);

            setTimeout(() => {
              location.reload();
            }, 800);

            // Reload the page
          } else {
            // If it's not HTML, log or display a success message
            console.log("Course deleted successfully");
            location.reload();
          }
        } else {
          console.error("Course deletion failed:", response.statusText);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    });
  } else if (event) {
    event.preventDefault();
  }
}
