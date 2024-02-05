// preview btn
const previewBtn = document.querySelector(".preview-btn");
previewBtn.addEventListener("click", function (event) {
  event.preventDefault();
  const videoPreviewWrapper = document.querySelector(
    ".course-video-preview-wrapper"
  );
  const sourceVideo = document.getElementById("video_source");
  const sourceFromInput = document.getElementById("course_video_url");

  sourceVideo.src = sourceFromInput.value;
  console.log(sourceVideo.src);
  videoPreviewWrapper.style.display = "flex";
  event.stopPropagation();
});

// cancel button
const cancelButton = document.querySelector(".cancel-btn");
cancelButton.addEventListener("click", function (event) {
  event.preventDefault();
  window.location.assign("/admin/dashboard");
});

// form submission
const form = document.getElementById("update-course-form");
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  try {
    const formData = new FormData(form);
    const response = await fetch("/admin/dashboard/edit-course", {
      method: "POST",
      credentials: "include",

      body: formData,
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

        // displayPopUpMessage.innerHTML = `<i class="fa-solid fa-check"></i> ${htmlContent.createNewCourse}`;
        if (htmlContent.courseUpdateMessage) {
          displayPopUpMessage.innerHTML = `<i class="fa-solid fa-check"></i> ${htmlContent.courseUpdateMessage}`;
          // Display the wrapper
          PopUpMessageWrapper.style.backgroundColor = "rgb(8, 207, 88)";
          PopUpMessageWrapper.style.display = "flex";
          setTimeout(() => {
            PopUpMessageWrapper.style.display = "none";
          }, 3000);
          setTimeout(() => {
            window.location.assign("/admin/dashboard");
          }, 800);
        } else if (htmlContent.zodErrorMessage || htmlContent.sqliteError) {
          console.log("htmlContent:", htmlContent);
          const errorMessage =
            htmlContent.zodErrorMessage ||
            htmlContent.sqliteError ||
            "Unknown error";
          displayPopUpMessage.innerHTML = `<i class="fa-solid fa-x"></i> ${errorMessage}`;
          // Display the wrapper
          PopUpMessageWrapper.style.backgroundColor = "red";
          PopUpMessageWrapper.style.display = "flex";
          setTimeout(() => {
            PopUpMessageWrapper.style.display = "none";
          }, 3000);
        }

        // Set a timeout to hide the wrapper after 5000 milliseconds (5 seconds)

        // Reload the page
      } else {
        // If it's not HTML, log or display a success message
        console.log("oops");
        location.reload();
      }
    } else {
      window.location.assign("/admin/dashboard");
    }
  } catch (error) {}
});
