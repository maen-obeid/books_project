const bookListElement = document.getElementById("book-list");
const addBookBoxElement = document.getElementById("add-modal");
const deleteBookBoxElement = document.getElementById("delete-modal");
const backDropElement = document.getElementById("backdrop");
const bookTitle = document.getElementById("title");
const bookImageUrl = document.getElementById("image-url");
const bookRate = document.getElementById("rating");
const emptyListMessageElement = document.getElementById("entry-text");
const paginationBarElement = document.getElementById("pagination-navbar");
const deleteBookElement = document.getElementById("delete_book_yes_op");
const searchElement = document.getElementById('search-input');
const dropdownElement = document.getElementById('number-dropdown');
const pagNumberElement = document.getElementById('page-number');
const addAudio = document.getElementById('addAudio');
const deleteAudio = document.getElementById('deleteAudio');
const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
let itemsPerPage = 3;
let currentPage = 1;


let nameAscSorted;
let rateAscSorted;

let bookList = [];
let tempBookList = [];

let minNavInex = () => ((currentPage * itemsPerPage) + 1);

function pushBookListToLocalStorage() {
    localStorage.setItem('books', JSON.stringify(bookList));
}

function getBookListFromLocalStorage() {
    const books = JSON.parse(localStorage.getItem('books'));
    if (books != null) {
        bookList = books;

        updateItemsPerPage();
        fillDDLItems();

        updatePaginationBar();
    }
}

function updateItemsPerPage() {
    if (bookList.length < 3) {
        itemsPerPage = 1;
        dropdownElement.selectedIndex = 0;
    } else {
        itemsPerPage = 3;
        dropdownElement.selectedIndex = 2;
    }
}

function getNextPage() {
    if (currentPage < (bookList.length / itemsPerPage)) {
        updatePaginationBar(minNavInex());
        currentPage += 1;
        generatePagination(currentPage);
    }
}
function getPrevPage() {
    console.log(currentPage != 1);
    if (currentPage != 1) {
        currentPage -= 1;
        updatePaginationBar(minNavInex() - itemsPerPage);
        generatePagination(currentPage);
    }
}

function updatePaginationBar(fromValue = 1) {
    let toValue = parseInt(fromValue - 1 + itemsPerPage);
    toValue = Math.min(toValue, bookList.length);
    pagNumberElement.innerHTML = `${fromValue} - ${toValue} of ${bookList.length}`;
}

function handleDropdownChange() {
    itemsPerPage = parseInt(dropdownElement.options[dropdownElement.selectedIndex].value);

    updatePaginationBar();

    currentPage = 1;

    generatePagination(currentPage);
}

function fillDDLItems() {

    dropdownElement.innerHTML = '';

    for (let i = 1; i <= bookList.length; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        dropdownElement.appendChild(option);
    }

    dropdownElement.selectedIndex = itemsPerPage - 1;
}

function generatePagination(currentPage) {
    if (bookList.length != 0) {
        bookListElement.innerHTML = '';

        lastActiveIndex = currentPage * itemsPerPage;
        firstActiveIndex = lastActiveIndex - itemsPerPage;

        bookList.forEach((value, index) => {
            addBookToUI(value, (index >= firstActiveIndex && index < lastActiveIndex))
        });

        emptyListMessageElement.style.display = "none";
        paginationBarElement.style.display = "flex";
    }
}

searchElement.addEventListener('keyup', function () {
    const searchValue = (searchElement.value.toString()).trim();
    bookListElement.innerHTML = '';

    if (tempBookList.length == 0) {
        tempBookList = JSON.parse(JSON.stringify(bookList));
    }

    currentPage = 1;

    if (searchValue == "") {
        bookList = JSON.parse(JSON.stringify(tempBookList));
        tempBookList = [];
        updateItemsPerPage();
        updatePaginationBar();
        generatePagination(currentPage);
    } else {
        bookList = bookList.filter(book => book.title.startsWith(searchValue));
        updateItemsPerPage();
        updatePaginationBar();
        generatePagination(currentPage);
    }
});

function sortByName() {
    if (nameAscSorted == true) {

        bookList.sort((a, b) => {
            if (a.title > b.title) {
                return -1;
            }
            if (a.title < b.title) {
                return 1;
            }
            return 0;
        });

        generatePagination(currentPage);
        nameAscSorted = false;

    } else {

        bookList.sort((a, b) => {
            if (a.title < b.title) {
                return -1;
            }
            if (a.title > b.title) {
                return 1;
            }
            return 0;
        });

        generatePagination(currentPage);
        nameAscSorted = true;
    }
}

function sortByRatign() {
    if (rateAscSorted == true) {

        bookList.sort((a, b) => {
            if (a.rate > b.rate) {
                return -1;
            }
            if (a.rate < b.rate) {
                return 1;
            }
            return 0;
        });

        generatePagination(currentPage);
        rateAscSorted = false;

    } else {

        bookList.sort((a, b) => {
            if (a.rate < b.rate) {
                return -1;
            }
            if (a.rate > b.rate) {
                return 1;
            }
            return 0;
        });

        generatePagination(currentPage);
        rateAscSorted = true;
    }
}

function isValidUrl(url) {
    return urlRegex.test(url);
}

const isValidRating = (rating) => rating >= 0 && rating <= 5;

function editDeletionId(bookId) {
    deleteBookElement.setAttribute('onClick', `deleteBook(${bookId})`);
    invertVisibilityOfDeletionDialog();
}

function deleteBook(bookId) {
    let newList = bookList.filter(book => book.id != bookId);
    bookList = newList;
    document.getElementById(bookId).remove();

    invertVisibilityOfDeletionDialog();

    if ((currentPage - 1) == (bookList.length / itemsPerPage)) {
        currentPage -= 1;
    }

    updatePaginationBar();
    generatePagination(currentPage);
    fillDDLItems();

    if (bookList.length == 0) {
        emptyListMessageElement.style.display = "block";
        paginationBarElement.style.display = "none";
    }

    pushBookListToLocalStorage();

    deleteAudio.play();
}

function addBookToUI(newBook, isActive) {

    let ratingElement = document.createElement('p');
    ratingElement.innerHTML = `${newBook.rate}/5`;
    ratingElement.setAttribute('class', 'image-description');

    let titleElement = document.createElement('h2');
    titleElement.innerHTML = `${newBook.title}`;
    titleElement.setAttribute('class', 'book-eleinfo');

    let bookInfoElement = document.createElement('div');
    bookInfoElement.setAttribute('class', 'book-element__info');
    bookInfoElement.appendChild(titleElement);
    bookInfoElement.appendChild(ratingElement);


    let imageElement = document.createElement('img');
    imageElement.setAttribute('class', 'book-element__image');
    imageElement.setAttribute('src', `${newBook.imageURL}`);


    let li = document.createElement('li');
    li.id = `${newBook.id}`;
    li.setAttribute('class', 'book-element');
    li.setAttribute('onClick', `editDeletionId(${newBook.id})`);
    if (isActive !== true) {
        li.style.display = "none";
    }
    li.appendChild(imageElement);
    li.appendChild(bookInfoElement);

    bookListElement.appendChild(li);
}

function addBook() {

    if (bookTitle.value.toString().trim() == "") {
        alert('The title cannot be empty');
    } else if (!isValidUrl(bookImageUrl.value.toString())) {
        alert('Invalid image URL');
    } else if (bookRate.value != "" && !isValidRating(parseInt(bookRate.value))) {
        alert('Rating must be between (0 - 5)');
    }
    else {
        const newBook = {
            id: Date.now(),
            title: bookTitle.value.toString().trim(),
            imageURL: bookImageUrl.value.toString().trim(),
            rate: parseInt(bookRate.value)
        }

        bookList.push(newBook);

        const isActive = (currentPage >= (bookList.length / itemsPerPage));
        addBookToUI(newBook, isActive);

        invertVisibilityOfAddBookDialog();

        emptyListMessageElement.style.display = "none";
        paginationBarElement.style.display = "flex";

        pushBookListToLocalStorage();

        updatePaginationBar();

        fillDDLItems();

        addAudio.play();
    }
}

function invertVisibilityOfAddBookDialog() {

    if (addBookBoxElement.style.display.toString() == "block") {
        backDropElement.style.display = "none";
        addBookBoxElement.style.display = "none";

        bookTitle.value = "";
        bookImageUrl.value = "";
        bookRate.value = "";
    } else {
        backDropElement.style.display = "block";
        addBookBoxElement.style.display = "block";
    }
}

function invertVisibilityOfDeletionDialog() {

    if (deleteBookBoxElement.style.display.toString() == "block") {
        backDropElement.style.display = "none";
        deleteBookBoxElement.style.display = "none";
    } else {
        backDropElement.style.display = "block";
        deleteBookBoxElement.style.display = "block";
    }
}


getBookListFromLocalStorage();
generatePagination(currentPage);