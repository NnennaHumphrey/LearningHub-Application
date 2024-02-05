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

const add_course_form = document.getElementById("add-new-course-form");
add_course_form.addEventListener("submit", async function (event) {
  //const clickedButton = event.explicitOriginalTarget || document.activeElement;
  try {
    event.preventDefault();
    const formData = new FormData(add_course_form);
    console.log("The", formData)
      const response = await fetch("/admin/dashboard/add-new-course", {
      method: "POST",
      credentials: "include",
      body: formData, //note that if headers{ Content-type: "application/json", there's need to JSON.stringify(formData, else the form will be sent as "multipart/form-data")}
      });
      console.log("my request",)
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
        if (htmlContent.createNewCourse) {
          displayPopUpMessage.innerHTML = `<i class="fa-solid fa-check"></i> ${htmlContent.createNewCourse}`;
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
      console.log("course addition fail", response);
    }
  } catch (error) {
    console.log("The error is", error);
  }
});
