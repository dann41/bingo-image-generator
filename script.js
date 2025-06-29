document.addEventListener("DOMContentLoaded", () => {
    const entriesContainer = document.getElementById("entries-container");
    const addEntryButton = document.getElementById("add-entry");
    const nextButton = document.getElementById("next-button");

    let entryCount = 0;
    const maxEntries = 50;

    function createEntry() {
        if (entryCount >= maxEntries) return;

        const entryDiv = document.createElement("div");
        entryDiv.classList.add("entry");

        entryDiv.innerHTML = `
            <div class="entry-header">
                <span class="entry-number">${entryCount + 1}</span>
                <button type="button" class="close-entry">&times;</button>
            </div>
            <input type="text" placeholder="Title" class="title" />
            <input type="text" placeholder="Author" class="author" />
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

        for (const entry of entries) {
            const title = entry.querySelector(".title").value.trim();
            const author = entry.querySelector(".author").value.trim();
            const image = entry.querySelector(".image").value.trim();

            if (!title && !image) {
                alert("Each entry must have at least a title or an image.");
                return null;
            }

            data.push({ title, author, image });
        }

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

    nextButton.addEventListener("click", () => {
        const data = validateEntries();
        if (data) {
            saveToLocalStorage(data);
        }
    });

    // Initialize with 3 entries
    for (let i = 0; i < 3; i++) {
        createEntry();
    }

    // Call populateEntriesFromLocalStorage on page load
    populateEntriesFromLocalStorage();
});
