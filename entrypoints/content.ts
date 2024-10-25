// Import the necessary icon
import editIcon from "../assets/editIcon.svg";
import insertIcon from "../assets/insertIcon.svg";
import generateIcon from "../assets/Generate.svg";
import regenerateIcon from "../assets/RegenerateIcon.svg";

// Main content script definition
export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  main() {
    const modalHtml = `
    <div id="custom-modal" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); display: none; justify-content: center; align-items: center; z-index: 4000;">
        <div id="modal-content" style="background: #EAECEE; border-radius: 8px; width: 100%; max-width: 570px; padding: 10px; box-shadow: 0px 4px 6px -1px #0000001A, 0px 2px 4px -2px #0000001A; margin-top: 10px;"> <!-- Adjusted margin-top here -->
            <div id="messages" style="margin-top: 0; max-height: 200px; overflow-y: auto; padding: 10px; display: flex; flex-direction: column;"></div>
            <div style="margin-bottom: 0; margin-top: -10px;"> 
                <input id="input-text" type="text" placeholder="Your prompt" style="width: 100%; height: 40px; padding: 12px; background: #FFFFFF; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0px 2px 4px 0px #0000000F inset;"/>
            </div>

            <div style="text-align: right; margin-bottom: 5px;">
                <button id="insert-btn" style="display: none; cursor: pointer; margin-right: 10px;">
                    <img src="${insertIcon}" alt="Insert" style="vertical-align: middle; margin-right: 2px; width: 90px; height: 35px; margin-top: 10px">
                </button>
                <button id="generate-btn" style="cursor: pointer;">
                    <img src="${generateIcon}" alt="Generate" style="vertical-align: middle; width: 120px; height: 50px;">
                </button>
            </div>    
        </div>
    </div>
`;

    // Append modal to document body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Get references to modal and buttons
    const modal = document.getElementById("custom-modal") as HTMLDivElement;
    const generateBtn = document.getElementById(
      "generate-btn"
    ) as HTMLButtonElement;
    const insertBtn = document.getElementById(
      "insert-btn"
    ) as HTMLButtonElement;
    const inputText = document.getElementById("input-text") as HTMLInputElement;
    const messagesDiv = document.getElementById("messages") as HTMLDivElement;

    // Store the last generated message
    let lastGeneratedMessage = "";
    let parentElement: HTMLElement | null = null;

    // Detect clicks on LinkedIn message input areas
    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.matches(".msg-form__contenteditable") ||
        target.closest(".msg-form__contenteditable")
      ) {
        // Capture parent container
        parentElement =
          target.closest(".msg-form__container") ||
          target.closest(".msg-form__contenteditable");

        if (parentElement) {
          // Ensure message input area gets focused
          const contentContainer = parentElement.closest(
            ".msg-form_msg-content-container"
          );
          if (contentContainer) {
            contentContainer.classList.add(
              "msg-form_msg-content-container--is-active"
            );
            parentElement.setAttribute("data-artdeco-is-focused", "true");
          }

          // Inject edit icon if not already present
          if (!parentElement.querySelector(".edit-icon")) {
            const icon = document.createElement("img");
            icon.className = "edit-icon";
            icon.src = editIcon;
            icon.alt = "Custom Icon";
            icon.style.position = "absolute";
            icon.style.bottom = "5px";
            icon.style.right = "5px";
            icon.style.width = "30px";
            icon.style.height = "30px";
            icon.style.cursor = "pointer";
            icon.style.zIndex = "1000";
            parentElement.appendChild(icon);

            // Open modal when icon is clicked
            icon.addEventListener("click", (e) => {
              e.stopPropagation();
              modal.style.display = "flex";
            });
          }
        }
      }
    });

    // Function to generate a default message
    const generateMessage = () => {
      const messages = [
        "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.",
      ];
      return messages[0];
    };

    // Event listener for 'Generate' button
    generateBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const inputValue = inputText.value.trim();
      if (!inputValue) return;

      // Display user's message
      const userMessageDiv = document.createElement("div");
      userMessageDiv.textContent = inputValue;
      Object.assign(userMessageDiv.style, {
        backgroundColor: "#DFE1E7",
        color: "#666D80",
        borderRadius: "12px",
        padding: "10px",
        marginBottom: "15px",
        textAlign: "right",
        maxWidth: "80%",
        alignSelf: "flex-end",
        marginLeft: "auto",
      });
      messagesDiv.appendChild(userMessageDiv);

      generateBtn.disabled = true;
      generateBtn.textContent = "Loading...";

      setTimeout(() => {
        lastGeneratedMessage = generateMessage();
        const generatedMessageDiv = document.createElement("div");
        generatedMessageDiv.textContent = lastGeneratedMessage;
        Object.assign(generatedMessageDiv.style, {
          backgroundColor: "#DBEAFE",
          color: "#666D80",
          borderRadius: "12px",
          padding: "10px",
          marginBottom: "15px",
          textAlign: "left",
          maxWidth: "80%",
          alignSelf: "flex-start",
          marginRight: "auto",
        });
        messagesDiv.appendChild(generatedMessageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        generateBtn.disabled = false;
        generateBtn.innerHTML = `<img src="${regenerateIcon}" alt="Regenerate" style="vertical-align: middle;margin-top:10px">`;
        inputText.value = "";
        insertBtn.style.display = "inline-block"; // Show the insert button after generation
      }, 500);
    });

    // Insert generated message into the message input area
    insertBtn.addEventListener("click", () => {
      if (lastGeneratedMessage && parentElement) {
        // Safeguard against null values
        if (!parentElement) {
          console.error("Parent element is not available.");
          return;
        }

        let existingParagraph = parentElement.querySelector("p");

        if (!existingParagraph) {
          existingParagraph = document.createElement("p");
          parentElement.appendChild(existingParagraph);
        }

        existingParagraph.textContent = lastGeneratedMessage;
        modal.style.display = "none";
      } else {
        console.warn("No generated message or parent element is missing.");
      }
    });

    // Close modal if clicking outside of it
    document.addEventListener("click", (event: MouseEvent) => {
      if (modal.style.display === "flex") {
        const target = event.target as HTMLElement;
        if (target === modal) {
          modal.style.display = "none";
        }
      }
    });
  },
});
