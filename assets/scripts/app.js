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
const menu = document.getElementById('dropdown-menu');
const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
let itemsPerPage = 3;
let currentPage = 1;
let textColor = "";


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

function exportToExcel() {

    if (bookList.length != 0) {
        const jsonData = JSON.stringify(bookList, null, 2);
        const worksheet = XLSX.utils.json_to_sheet(bookList);

        // Create a new workbook and add the worksheet to it
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Write the workbook to a file
        XLSX.writeFile(workbook, 'output.xlsx');

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

    if (itemsPerPage > bookList.length && itemsPerPage != 1) {
        itemsPerPage -= 1;
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

        var bookElements = document.querySelectorAll('.book-element h2');
        changeElementsColor(bookElements);

        emptyListMessageElement.style.display = "none";
        paginationBarElement.style.display = "flex";
    }
}

searchElement.addEventListener('keyup', function () {
    const searchValue = (searchElement.value.toString()).trim().toLowerCase();
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
        bookList = bookList.filter(book => book.title.toLowerCase().includes(searchValue));
        updateItemsPerPage();
        updatePaginationBar();
        generatePagination(currentPage);
    }
});

bookRate.addEventListener('input', function (e) {
    this.value = this.value.replace(/[^0-5]/g, '');
    if (this.value.length > 1) {
        this.value = this.value.slice(0, 1);
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

    if (currentPage != 1 && (currentPage - 1) == (bookList.length / itemsPerPage)) {
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

    var bookElements = document.querySelectorAll('.book-element h2');

    bookElements[bookElements.length - 1].style.color = textColor;
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
        // backDropElement.style.display = "none";
        // document.querySelector('.backdrop').style.display = 'none';
        backDropElement.classList.remove('visible');
        addBookBoxElement.style.display = "none";

        bookTitle.value = "";
        bookImageUrl.value = "";
        bookRate.value = "";
    } else {
        // backDropElement.style.display = "block";
        // document.querySelector('.backdrop').style.display = 'block';
        backDropElement.classList.add('visible');
        addBookBoxElement.style.display = "block";
    }
}

function invertVisibilityOfDeletionDialog() {

    if (deleteBookBoxElement.style.display.toString() == "block") {
        // backDropElement.style.display = "none";
        // document.querySelector('.backdrop').style.display = 'none';
        backDropElement.classList.remove('visible');
        deleteBookBoxElement.style.display = "none";
    } else {
        // backDropElement.style.display = "block";
        // document.querySelector('.backdrop').style.display = 'block';
        backDropElement.classList.add('visible');
        deleteBookBoxElement.style.display = "block";
    }
}

function changeElementsColor(allElement) {
    allElement.forEach(function (element) {
        element.style.color = textColor;
    });
}

function toggleDarkMode() {
    var body = document.body;
    var toggle = document.getElementById('dark-mode-toggle');
    var bookElements = document.querySelectorAll('.book-element h2');
    var textElements = document.querySelectorAll('.modal__content label');
    if (toggle.checked) {
        body.classList.add('dark-mode');
        deleteBookBoxElement.classList.add('dark-mode');
        addBookBoxElement.classList.add('dark-mode');
        textColor = '#fff';// Light text color for dark mode
        changeElementsColor(bookElements);
        changeElementsColor(textElements);
    } else {
        body.classList.remove('dark-mode');
        deleteBookBoxElement.classList.remove('dark-mode');
        addBookBoxElement.classList.remove('dark-mode');
        textColor = '#383838'; // Default text color for light mode
        changeElementsColor(bookElements);
        changeElementsColor(textElements);
    }

    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
    }
}

function toggleMenu() {
    menu.classList.toggle('show');
}

function closeMenuIfClickedOutside(event) {
    var menuIcon = document.querySelector('.menu-icon');
    var isClickInside = menu.contains(event.target) || menuIcon.contains(event.target);

    if (!isClickInside && menu.classList.contains('show')) {
        menu.classList.remove('show');
    }
}

function changeFontSize(size) {
    var body = document.body;
    var newFontSize;

    switch (size) {
        case 'smaller':
            newFontSize = 12;
            break;
        case 'normal':
            newFontSize = 16; // Assuming the default font size is  16px
            break;
        case 'bigger':
            newFontSize = 20;
            break;
        default:
            return;
    }

    body.style.fontSize = newFontSize + 'px';

    generatePagination(currentPage);
}


document.addEventListener('click', closeMenuIfClickedOutside);


getBookListFromLocalStorage();
generatePagination(currentPage);