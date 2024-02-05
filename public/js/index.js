const profileIconWrapper = document.querySelector(".profile-icon-wrapper");
const userDetailDisplayWrapper = document.querySelector(
  ".user-detail-display-wrapper"
);
const arrowDown = document.querySelector(".arrow-down");

let leaveTimeout;

function handleMouseEnter() {
  clearTimeout(leaveTimeout);
  userDetailDisplayWrapper.style.display = "block";
  arrowDown.style.transform = "rotate(180deg)";
}

function handleMouseLeave() {
  leaveTimeout = setTimeout(() => {
    userDetailDisplayWrapper.style.display = "none";
    arrowDown.style.transform = "rotate(0deg)";
  }, 200); // Adjust the delay as needed
}

function handleDetailMouseEnter() {
  clearTimeout(leaveTimeout);
  userDetailDisplayWrapper.style.display = "block";
}

function handleDetailMouseLeave() {
  leaveTimeout = setTimeout(() => {
    userDetailDisplayWrapper.style.display = "none";
  }, 200); // Adjust the delay as needed
}

profileIconWrapper.addEventListener("mouseenter", handleMouseEnter);
profileIconWrapper.addEventListener("mouseleave", handleMouseLeave);
userDetailDisplayWrapper.addEventListener("mouseenter", handleDetailMouseEnter);
userDetailDisplayWrapper.addEventListener("mouseleave", handleDetailMouseLeave);
