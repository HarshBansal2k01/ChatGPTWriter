import editIcon from "../assets/editIcon.svg";

// Main content script definition, targeting LinkedIn pages
export default defineContentScript({
  matches: ["*://*.linkedin.com/*"], // Matches LinkedIn domain URLs
  main() {
    console.log("Content script running on LinkedIn");

    // Cache the parent element
    let parentElement: HTMLElement | null = null;

    // Event listener to detect clicks on LinkedIn message input areas
    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if clicked element is a message input area
      if (
        target.matches(".msg-form__contenteditable") ||
        target.closest(".msg-form__contenteditable")
      ) {
        // Store the parent container of the message input area
        parentElement =
          target.closest(".msg-form__container") ||
          target.closest(".msg-form__contenteditable");

        const contentContainer = parentElement?.closest(
          ".msg-form_msg-content-container"
        );

        // Ensure the message form is active and focused
        if (parentElement && contentContainer) {
          contentContainer.classList.add(
            "msg-form_msg-content-container--is-active"
          );
          parentElement.setAttribute("data-artdeco-is-focused", "true");
        }

        // If the edit icon hasn't been added yet, inject it
        if (parentElement && !parentElement.querySelector(".edit-icon")) {
          parentElement.style.position = "relative";

          const icon = document.createElement("img");
          icon.className = "edit-icon";
          icon.src = editIcon; // Set the path to your edit icon
          icon.alt = "Custom Icon";
          icon.style.position = "absolute";
          icon.style.bottom = "5px";
          icon.style.right = "5px";
          icon.style.width = "30px";
          icon.style.height = "30px";
          icon.style.cursor = "pointer";
          icon.style.zIndex = "1000";
          parentElement.appendChild(icon);

          // Add any additional functionality for the icon click here if needed
          icon.addEventListener("click", (e) => {
            e.stopPropagation();
            // Here you can implement whatever functionality you want
            // For example, you can log or display a message
            console.log("Edit icon clicked!");
          });
        }
      } else if (parentElement) {
        // If clicked outside the input area and parentElement is defined, remove the edit icon
        const editIconElement = parentElement.querySelector(".edit-icon");
        if (editIconElement) {
          editIconElement.remove();
        }
        parentElement.removeAttribute("data-artdeco-is-focused"); // Remove focus attribute
      }
    });

    // Additional event listener to handle focus out
    document.addEventListener("focusout", (event: FocusEvent) => {
      if (
        parentElement &&
        !parentElement.contains(event.relatedTarget as HTMLElement)
      ) {
        const editIconElement = parentElement.querySelector(".edit-icon");
        if (editIconElement) {
          editIconElement.remove();
        }
        parentElement.removeAttribute("data-artdeco-is-focused"); // Remove focus attribute
      }
    });
  },
});
