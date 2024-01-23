$(document).ready(()=> {
    Librarium.initDataTable("#recent-data-table", "No recent transaction data found.");
    Librarium.initDataTable("#books-table", "No books found.");
    Librarium.initDataTable("#students-table", "No students found.");

    Librarium.startScanner(()=> {}, ()=> {});
});