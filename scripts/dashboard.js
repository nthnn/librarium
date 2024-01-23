const showErrorMessage = (id, message)=> {
    $("#" + id + "-error").html(message);
    $("#" + id + "-error").removeClass("d-none");
    $("#" + id + "-error").addClass("d-block");
}, hideErrorMessage = (id)=> {
    $("#" + id + "-error").html("");
    $("#" + id + "-error").removeClass("d-block");
    $("#" + id + "-error").addClass("d-none");
};

$(document).ready(()=> {
    $("#loading-modal").modal("show");
    setTimeout(()=> $("#loading-modal").modal("hide"), 2000);

    Librarium.initDataTable("#recent-data-table", "No recent transaction data found.");
    Librarium.initDataTable("#books-table", "No books found.");
    Librarium.initDataTable("#students-table", "No students found.");
    Librarium.startScanner(()=> {}, ()=> {});

    $("#add-book-btn").click(()=> {
        let title = $("#book-title").val(),
            author = $("#book-author").val(),
            publisher = $("#book-publisher").val(),
            publicationDate = $("#book-publication-date").val(),
            copies = parseInt($("#book-copies").val());

        hideErrorMessage("id");
        if(title == "" || !Librarium.validateBookTitle(title)) {
            showErrorMessage("id", "Invalid book title string.");
            return;
        }

        if(author == "" || !Librarium.validateBookAuthor(author)) {
            showErrorMessage("id", "Invalid book author string.");
            return;
        }

        if(publisher == "" || !Librarium.validateBookPublisher(publisher)) {
            showErrorMessage("id", "Invalid book publisher string.");
            return;
        }

        Librarium.addBook({
            title: title,
            author: author,
            publisher: publisher,
            publicationDate: publicationDate,
            copies: copies,
            error: ()=> showErrorMessage("book", "Something went wrong."),
            success: (uuid)=> {
                $("#add-book-modal").modal("hide");
                $("#book-added-modal").modal("show");

                $("#book-title").val("");
                $("#book-author").val("");
                $("#book-publisher").val("");
                $("#book-publication-date").val("");
                $("#book-copies").val("");

                Librarium.generateQrCode(uuid, title);
            }
        });
    });
});