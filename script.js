document.addEventListener("DOMContentLoaded", () => {
    const entriesContainer = document.getElementById("entries-container");
    const addEntryButton = document.getElementById("add-entry");
    const nextButton = document.getElementById("next-button");

    let entryCount = 0;
    const maxEntries = 50;

    function setupImageUploader() {
        const uploader = document.createElement("div");
        uploader.classList.add("image-uploader");
        uploader.innerHTML = `
            <div class="drag-drop-area">
                <p>Drag and drop images here or</p>
                <button type="button" id="select-images">Select Images</button>
                <input type="file" id="image-input" multiple accept="image/*" style="display: none;" />
            </div>
        `;

        entriesContainer.before(uploader);

        const imageInput = uploader.querySelector("#image-input");
        const selectImagesButton = uploader.querySelector("#select-images");

        selectImagesButton.addEventListener("click", () => {
            imageInput.click();
        });

        uploader.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploader.classList.add("dragging");
        });

        uploader.addEventListener("dragleave", () => {
            uploader.classList.remove("dragging");
        });

        uploader.addEventListener("drop", (e) => {
            e.preventDefault();
            uploader.classList.remove("dragging");
            handleFiles(e.dataTransfer.files);
        });

        imageInput.addEventListener("change", () => {
            handleFiles(imageInput.files);
        });

        function handleFiles(files) {
            Array.from(files).forEach((file) => {
                const fileName = `bingo-image-${Date.now()}-${file.name}`;
                caches.open("bingo-images").then((cache) => {
                    cache.put(fileName, new Response(file));
                    createEntry(fileName, URL.createObjectURL(file));
                });
            });

            // Enable buttons after images are selected
            addEntryButton.disabled = false;
            nextButton.disabled = false;
        }
    }

    function createEntry(imageCacheKey, imageUrl) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("entry");

        entryDiv.innerHTML = `
            <div class="entry-header">
                <span class="entry-number">${entryCount + 1}</span>
                <button type="button" class="close-entry">&times;</button>
            </div>
            <img src="${imageUrl}" alt="Uploaded Image" class="preview-image" />
            <input type="text" placeholder="Title" class="title" />
            <input type="text" placeholder="Author" class="author" />
        `;

        const closeButton = entryDiv.querySelector(".close-entry");
        closeButton.addEventListener("click", () => {
            entryDiv.remove();
            entryCount--;
            updateEntryNumbers();
        });

        entriesContainer.appendChild(entryDiv);
        entryCount++;
    }

    function updateEntryNumbers() {
        const entries = document.querySelectorAll(".entry");
        entries.forEach((entry, index) => {
            const numberSpan = entry.querySelector(".entry-number");
            numberSpan.textContent = index + 1;
        });
    }

    function validateEntries() {
        const entries = document.querySelectorAll(".entry");
        const data = [];

        entries.forEach((entry) => {
            const title = entry.querySelector(".title").value.trim();
            const author = entry.querySelector(".author").value.trim();
            const image = entry.querySelector(".preview-image").src;

            const cacheKey = image.split("blob:")[1]; // Extract cache key from blob URL

            data.push({ title, author, image: cacheKey });
        });

        return data;
    }

    function saveToLocalStorage(data) {
        localStorage.setItem("bingoEntries", JSON.stringify(data));
        alert("Data saved successfully!");
    }

    function populateEntriesFromLocalStorage() {
        const storedEntries = localStorage.getItem("bingoEntries");
        if (storedEntries) {
            entryCount = 0; // Reset entry count
            entriesContainer.innerHTML = ""; // Clear existing entries
            const entries = JSON.parse(storedEntries);
            entries.forEach((entry, index) => {
                const entryDiv = document.createElement("div");
                entryDiv.classList.add("entry");

                let imageUrl = "";
                if (entry.image) {
                    caches.open("bingo-images").then((cache) => {
                        cache.match(entry.image).then((response) => {
                            if (response) {
                                imageUrl = URL.createObjectURL(response.body);
                                const imgElement = document.createElement("img");
                                imgElement.src = imageUrl;
                                imgElement.alt = "Uploaded Image";
                                imgElement.classList.add("preview-image");
                                entryDiv.appendChild(imgElement);
                            }
                        });
                    });
                }

                entryDiv.innerHTML = `
                    <div class="entry-header">
                        <span class="entry-number">${index + 1}</span>
                        <button type="button" class="close-entry">&times;</button>
                    </div>
                    <input type="text" placeholder="Title" class="title" value="${entry.title}" />
                    <input type="text" placeholder="Author" class="author" value="${entry.author}" />
                    <input type="file" accept="image/*" class="image" />
                `;

                const closeButton = entryDiv.querySelector(".close-entry");
                closeButton.addEventListener("click", () => {
                    entryDiv.remove();
                    entryCount--;
                    updateEntryNumbers();
                });

                entriesContainer.appendChild(entryDiv);
                entryCount++;
            });
        }
    }

    addEntryButton.addEventListener("click", () => {
        createEntry();
    });

    nextButton.addEventListener("click", async () => {
        const data = await validateEntries();
        if (data) {
            saveToLocalStorage(data);
        }
    });

    // Call populateEntriesFromLocalStorage on page load
    populateEntriesFromLocalStorage();

    // Initialize the image uploader
    setupImageUploader();

    // Disable buttons initially
    addEntryButton.disabled = true;
    nextButton.disabled = true;
});
