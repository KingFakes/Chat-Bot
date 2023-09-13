 const optionButton = document.getElementById("option-btn");
 const dropdownContent = document.getElementById("dropdown-content");
 const chatInput = document.querySelector("#chat-input");
 const sendButton = document.querySelector("#send-btn");
 const chatContainer = document.querySelector(".chat-container");
 const themeButton = document.querySelector("#theme-btn");
 const deleteButton = document.querySelector("#delete-btn");
 const customAlert = document.getElementById("custom-alert");
 const confirmDelete = document.getElementById("confirm-delete");
 const cancelDelete = document.getElementById("cancel-delete")
 const hamburgerButton = document.getElementById("hamburger-button");
 const offcanvas = document.getElementById("offcanvas");
 const closeOffcanvasButton = document.getElementById("close-offcanvas");
 const menuButtons = document.querySelectorAll(".menu-button");
 const popup = document.getElementById("popup");
 const musikOption = document.getElementById("musik-option");
 const bokepOption = document.getElementById("bokep-option");

 // Toggle Offcanvas
 hamburgerButton.addEventListener("click", () => {
     offcanvas.classList.add("show");
 });

 closeOffcanvasButton.addEventListener("click", () => {
     offcanvas.classList.remove("show");
 });

 // Toggle Submenu
 menuButtons.forEach((button) => {
     button.addEventListener("click", () => {
         const submenu = button.nextElementSibling;
         submenu.classList.toggle("show");
     });
 });


 chatInput.addEventListener("input", (e) => {
     const inputValue = chatInput.value.trim();

     // Menampilkan popup jika input dimulai dengan '/'
     if (inputValue.startsWith("/")) {
         popup.style.display = "flex";
         const command = inputValue.substring(1); // Menghilangkan karakter '/'

         if (command === "musik") {
             musikOption.style.display = "block";
             bokepOption.style.display = "none";
         } else if (command === "bokep") {
             musikOption.style.display = "none";
             bokepOption.style.display = "block";
         } else {
             // Jika perintah tidak cocok, tampilkan kedua opsi
             musikOption.style.display = "block";
             bokepOption.style.display = "block";
         }
     } else {
         popup.style.display = "none"; // Menyembunyikan popup jika input tidak dimulai dengan '/'
     }
 });

 musikOption.addEventListener("click", () => {
     chatInput.value = "/musik ";
     popup.style.display = "none";
     chatInput.focus();
 });

 bokepOption.addEventListener("click", () => {
     chatInput.value = "/bokep ";
     localStorage.setItem("selectedOption", "Bokep");
     popup.style.display = "none";
     chatInput.focus();
 });

 let userText = null;

 const loadDataFromLocalstorage = () => {
     // Load saved chats and theme from local storage and apply/add on the page
     const themeColor = localStorage.getItem("themeColor");

     document.body.classList.toggle("light-mode", themeColor === "light_mode");
     themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

     const defaultText = `<div class="default-text">
    <h1>ChatBot</h1>
    <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
</div>`

     chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
     chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
 }

 const createChatElement = (content, className) => {
     // Create new div and apply chat, specified class and set html content of div
     const chatDiv = document.createElement("div");
     chatDiv.classList.add("chat", className);
     chatDiv.innerHTML = content;
     return chatDiv; // Return the created chat div
 }

 const getChatResponse = async (incomingChatDiv) => {
     const pElement = document.createElement("p");
     let userId = localStorage.getItem('userId');
     if (!userId) {
         userId = Math.floor(Math.random() * 1000000); // Nilai acak sebagai userId
         localStorage.setItem('userId', userId);
     }
     const storedOption = localStorage.getItem("selectedOption");
     if (storedOption === "Chat") {
         try {
             const response = await fetch('https://chat.dicodingbot.site/chat', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({
                     message: userText,
                     userId: userId
                 }),
             });

             const data = await response.json();
             pElement.textContent = data.response.trim();
         } catch (error) { // Add error class to the paragraph element and set error text
             pElement.classList.add("error");
             pElement.textContent =
                 "Oops! Something went wrong while retrieving the response. Please try again.";
         }

     } else if (storedOption === "Picture") {
         try {
             const response = await fetch('https://chat.dicodingbot.site/images', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({
                     message: userText,
                 }),
             });

             const data = await response.json();
             pElement.innerHTML = `<img src="${data.response}" class="img-thumbnail img-api"
                             alt="${userText}">`
         } catch (error) { // Add error class to the paragraph element and set error text
             pElement.classList.add("error");
             pElement.textContent =
                 "Oops! Something went wrong while retrieving the response. Please try again.";
         }

     } else if (storedOption === "Bokep") {
         try {
             const response = await
             fetch('https://api.zahwazein.xyz/randomasupan/discord18?apikey=zenzkey_64e4a7a6f307', {
                 method: 'GET',

             });

             const data = await response.json();
             pElement.innerHTML = ` 
                <div class="video-container"><video controls>
                    <source src="${data.result}" type="video/mp4">
                    Your browser does not support the video tag.
                </video></div>
                `
         } catch (error) { // Add error class to the paragraph element and set error text
             pElement.classList.add("error");
             pElement.textContent =
                 "Oops! Something went wrong while retrieving the response. Please try again.";
         }

     }
     incomingChatDiv.querySelector(".typing-animation").remove();
     incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
     localStorage.setItem("all-chats", chatContainer.innerHTML);
     chatContainer.scrollTo(0, chatContainer.scrollHeight);
 }

 const copyResponse = (copyBtn) => {
     // Copy the text content of the response to the clipboard
     const reponseTextElement = copyBtn.parentElement.querySelector("p");
     navigator.clipboard.writeText(reponseTextElement.textContent);
     copyBtn.textContent = "done";
     setTimeout(() => copyBtn.textContent = "content_copy", 1000);
 }

 const showTypingAnimation = () => {
     // Display the typing animation and call the getChatResponse function
     const html = `<div class="chat-content">
    <div class="chat-details">
        <img src="https://static.vecteezy.com/system/resources/previews/014/194/216/non_2x/avatar-icon-human-a-person-s-badge-social-media-profile-symbol-the-symbol-of-a-person-vector.jpg"
            alt="chatbot-img">
        <div class="typing-animation">
            <div class="typing-dot" style="--delay: 0.2s"></div>
            <div class="typing-dot" style="--delay: 0.3s"></div>
            <div class="typing-dot" style="--delay: 0.4s"></div>
        </div>
    </div>
    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
</div>`;
     // Create an incoming chat div with typing animation and append it to chat container
     const incomingChatDiv = createChatElement(html, "incoming");
     chatContainer.appendChild(incomingChatDiv);
     chatContainer.scrollTo(0, chatContainer.scrollHeight);
     getChatResponse(incomingChatDiv);
 }

 const handleOutgoingChat = () => {
     userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
     if (!userText) return; // If chatInput is empty return from here

     // Clear the input field and reset its height
     chatInput.value = "";
     chatInput.style.height = `${initialInputHeight}px`;

     const html = `<div class="chat-content">
    <div class="chat-details">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0cqPHAdnAIqzYvcH7lolCkguuEfL6yxtVuRIu27rN2SLX9qpqeaTlpJ7vdcLBSm-r3Qc&usqp=CAU"
            alt="user-img">
        <p>${userText}</p>
    </div>
</div>`;

     // Create an outgoing chat div with user's message and append it to chat container
     const outgoingChatDiv = createChatElement(html, "outgoing");
     chatContainer.querySelector(".default-text")?.remove();
     chatContainer.appendChild(outgoingChatDiv);
     chatContainer.scrollTo(0, chatContainer.scrollHeight);
     setTimeout(showTypingAnimation, 500);
 }
 confirmDelete.addEventListener("click", () => {
     localStorage.removeItem("all-chats");
     loadDataFromLocalstorage();
     clearChat();
     checkChatExistence();
     customAlert.style.display = "none";
 });

 cancelDelete.addEventListener("click", () => {
     customAlert.style.display = "none";
 });

 deleteButton.addEventListener("click", () => {
     // Remove the chats from local storage and call loadDataFromLocalstorage function
     customAlert.style.display = "flex";
 });
 async function clearChat() {
     let userId = localStorage.getItem('userId');
     try {
         const response = await fetch('https://chat.dicodingbot.site/clear', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                 userId: userId,
             }),
         });

         const data = await response.json();

         console.log(data.message); // Output pesan dari server
     } catch (error) {
         console.error('Error:', error);
     }
 }

 themeButton.addEventListener("click", () => {
     // Toggle body's class for the theme mode
     document.body.classList.toggle("light-mode");

     // Simpan status tema yang diperbarui ke Local Storage
     localStorage.setItem("themeColor", document.body.classList.contains("light-mode") ?
         "light_mode" : "dark_mode");

     // Toggle ikon tema antara "light_mode" dan "dark_mode"
     themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" :
         "light_mode";
 });

 // Fungsi untuk memeriksa preferensi tema perangkat
 function checkDeviceDarkMode() {
     const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

     const previousThemeDevice = localStorage.getItem("themeDevice");

     if (darkModeMediaQuery.matches) {
         localStorage.setItem("themeDevice", "dark_mode");
     } else {
         localStorage.setItem("themeDevice", "light_mode");
     }

     const currentThemeDevice = localStorage.getItem("themeDevice");

     if (previousThemeDevice === "light_mode" && currentThemeDevice === "dark_mode") {
         // Theme sebelumnya adalah light_mode, sedangkan sekarang adalah dark_mode
         document.body.classList.remove("light-mode");
         document.body.classList.add("dark-mode");
         themeButton.innerText = "dark_mode";
         localStorage.setItem("themeColor", "dark_mode");
     } else if (previousThemeDevice === "dark_mode" && currentThemeDevice === "light_mode") {
         // Theme sebelumnya adalah dark_mode, sedangkan sekarang adalah light_mode
         document.body.classList.remove("dark-mode");
         document.body.classList.add("light-mode");
         themeButton.innerText = "light_mode";
         localStorage.setItem("themeColor", "light_mode");
     } else if (!previousThemeDevice) {
         // Tidak ada tema sebelumnya (pertama kali pengguna mengakses)
         if (currentThemeDevice === "light_mode") {
             document.body.classList.add("light-mode");
             themeButton.innerText = "light_mode";
             localStorage.setItem("themeColor", "light_mode");
         } else {
             document.body.classList.add("dark-mode");
             themeButton.innerText = "dark_mode";
             localStorage.setItem("themeColor", "dark_mode");
         }
     }
 }

 // Panggil fungsi untuk memeriksa preferensi tema perangkat saat halaman dimuat
 checkDeviceDarkMode();

 // Tambahkan event listener untuk memantau perubahan preferensi tema perangkat
 window.matchMedia("(prefers-color-scheme: dark)").addListener(checkDeviceDarkMode);


 const initialInputHeight = chatInput.scrollHeight;

 chatInput.addEventListener("input", () => {
     // Adjust the height of the input field dynamically based on its content
     chatInput.style.height = `${initialInputHeight}px`;
     chatInput.style.height = `${chatInput.scrollHeight}px`;
 });

 chatInput.addEventListener("keydown", (e) => {
     // If the Enter key is pressed without Shift and the window width is larger
     // than 800 pixels, handle the outgoing chat
     if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
         e.preventDefault();
         handleOutgoingChat();
     }
 });

 loadDataFromLocalstorage();
 sendButton.addEventListener("click", handleOutgoingChat);

 function addToLocalStorage(selectedOption) {
     localStorage.setItem("selectedOption", selectedOption);
 }

 optionButton.addEventListener("click", () => {
     dropdownContent.classList.toggle("show");
 });

 dropdownContent.addEventListener("click", (event) => {
     if (event.target.tagName === "DIV") {
         const selectedOption = event.target.textContent;
         addToLocalStorage(selectedOption);
         if (selectedOption === "Picture") {
             chatInput.placeholder = "Enter a prompt for picture here";
         } else if (selectedOption === "Chat") {
             // Kembalikan placeholder ke nilai default jika opsi lain dipilih
             chatInput.placeholder = "Enter a prompt here";
         }
         dropdownContent.classList.remove("show");
     }
 });

 // Cek Local Storage saat halaman dimuat
 window.addEventListener("load", () => {
     localStorage.setItem("selectedOption", "Chat");
     const storedOption = localStorage.getItem("selectedOption");
     if (storedOption === "Chat") {
         chatInput.placeholder = "Enter a prompt here";
     } else if (storedOption === "Picture") {
         chatInput.placeholder = "Enter a prompt for picture here";
     }
     checkChatExistence();
 });

 function checkChatExistence() {
     const allChats = localStorage.getItem("all-chats");
     const deleteButton = document.getElementById("delete-btn");

     if (allChats && allChats.length > 0) {
         // Jika ada chat, aktifkan tombol delete dan buat ikon merah
         deleteButton.classList.remove("disabled");
         deleteButton.classList.add("active");
     } else {
         // Jika tidak ada chat, nonaktifkan tombol delete
         deleteButton.classList.remove("active");
         deleteButton.classList.add("disabled");
     }
 }

 // Close the dropdown if the user clicks outside of it
 document.addEventListener("click", (event) => {
     if (!optionButton.contains(event.target) && !dropdownContent.contains(event.target)) {
         dropdownContent.classList.remove("show");
     }
 });