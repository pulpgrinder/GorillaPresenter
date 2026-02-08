BookPlugin = {
    notFoundImageURL: null,
    retrieveBookInfo: async function (isbn) {
        isbn = isbn.replace(/[^0-9Xx]/g, ''); // Clean ISBN input
        if (!BookPlugin.validateISBN(isbn)) {
            return {
                status: 'invalid isbn'
            };
        }

        let metadata = await BookPlugin.fetchOpenLibraryMetadata(isbn);
        metadata.isbn = isbn;
        if (metadata.status !== 'success') {
            metadata.title = '(book data not found)';
            metadata.authors = [];
            metadata.by_statement = '';
            metadata.image = BookPlugin.notFoundImageURL;
            return metadata;
        }

        let fetchedImage = await BookPlugin.fetchImage(isbn);
        if (fetchedImage) {
            metadata.image = URL.createObjectURL(fetchedImage);

        }
        else {
            metadata.image = BookPlugin.notFoundImageURL;
        }
        return metadata;
    },
    fetchImage: async function (isbn) {
        const imageUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        try {
            const response = await fetch(imageUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),     // optional: 15s timeout (Node 18+ & modern browsers)
            });

            if (!response.ok) {
                console.error(`HTTP ${response.status} — ${response.statusText}`);
                return false;
            }
            const blob = await response.blob();
            return blob;
        }
        catch (error) {
            console.error('Error fetching book image:', error);
            return false;
        }
    },
    fetchOpenLibraryMetadata: async function (isbn) {
        const url = `https://openlibrary.org/isbn/${isbn}.json`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),     // optional: 15s timeout (Node 18+ & modern browsers)
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`HTTP ${response.status} — ${response.statusText}`);
                return { status: 'error fetching book data:' + `HTTP ${response.status} — ${response.statusText}` };
            }

            const data = await response.json();
            data.by_statement = data.by_statement.replace(/\.$/, ''); // Remove trailing period if exists
            return {
                status: 'success',
                title: data.title || '',
                authors: data.authors || [],
                publishers: data.publishers || [],
                publish_date: data.publish_date || '',
                number_of_pages: data.number_of_pages || 0,
                by_statement: data.by_statement || '',
            }
        }
        catch (error) {

            console.error('Error fetching book data:', error);
            return { status: 'error fetching book data: ' + error.message };
        }
    },

    validateISBN: function (isbn) {
        // Remove hyphens and spaces
        const cleaned = isbn.replace(/[-\s]/g, '');
        if (cleaned.length === 10) {
            return BookPlugin.validateISBN10(cleaned);
        } else if (cleaned.length === 13) {
            return BookPlugin.validateISBN13(cleaned);
        } else {
            return false;
        }
    },

    validateISBN10: function (isbn) {
        // ISBN-10 must be 9 digits followed by a digit or 'X'
        if (!/^\d{9}[\dX]$/.test(isbn)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(isbn[i]) * (i + 1);
        }

        // Last character (check digit)
        const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
        sum += checkDigit * 10;

        return sum % 11 === 0;
    },

    validateISBN13: function (isbn) {
        // ISBN-13 must be exactly 13 digits
        if (!/^\d{13}$/.test(isbn)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 13; i++) {
            // Alternate between multiplying by 1 and 3
            const multiplier = i % 2 === 0 ? 1 : 3;
            sum += parseInt(isbn[i]) * multiplier;
        }

        return sum % 10 === 0;
    },

    renderHTML: async function (isbn) {
        if (BookPlugin.notFoundImageURL === null) {
            BookPlugin.notFoundImageURL = URL.createObjectURL(await fs.readBinaryFile("utility images/image not found.jpg"));
        }
        try {
            let metadata = await BookPlugin.retrieveBookInfo(isbn);
            if (metadata.image === -1) {
                metadata.image = BookPlugin.notFoundImageURL;
            }
            let html = `<ul class="gorilla-choice-list">`
            html += `<li class="gorilla-choice-item gorilla-book-header">`
            html += `<div>${metadata.title}</div>`
            html += `<div> <img id="isbn-${isbn}" src="${metadata.image}"></div>`
            // html += `<div>${metadata.authors.join(', ')}</div>`
            if (metadata.by_statement && metadata.by_statement.length > 0) {
                html += `<div>${metadata.by_statement}</div>`;
            }
            html += `</li>`;
            html += `<li class="gorilla-choice-item gorilla-choice-external" data-url="https://openlibrary.org/isbn/${isbn}">Search Open Library</li>`
            html += `<li class="gorilla-choice-item gorilla-choice-external" data-url="https://search.worldcat.org/search?q=bn=${isbn}">Search WorldCat</li>`
            html += `<li class="gorilla-choice-item gorilla-choice-external" data-url="https://www.google.com/search?tbm=bks&q=${isbn}">Search Google Books</li>`

            html += `<li class="gorilla-choice-item gorilla-choice-external" data-url="https://www.amazon.com/s?k=${isbn}">Search Amazon</li>`

            html += `</ul>`;
            return html;
        }
        catch (e) {
            return e.toString();
        }
    },
}

