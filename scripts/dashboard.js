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
    setTimeout(()=> $("#loading-modal").modal("hide"), 1200);

    Librarium.fetchAllRecords();
    Librarium.fetchAllBooks();
    Librarium.fetchAllStudents();

    Librarium.recentDataTable = Librarium.initDataTable("#recent-data-table", "No recent transaction data found.");
    Librarium.booksTable = Librarium.initDataTable("#books-table", "No books found.");
    Librarium.studentsTable = Librarium.initDataTable("#students-table", "No students found.");

    let recentScanned = null;
    Librarium.startScanner(
        (scanned)=> recentScanned = scanned,
        (_)=> {}
    );

    Librarium.listSerialPort((ports)=> {
        let device = Librarium.openSerialPort(ports.at(-1), (data)=> {
            if(Librarium.bookUuid == null && recentScanned != null) {
                Librarium.bookUuid = recentScanned;
                device.write("1");

                setTimeout(()=> Librarium.bookUuid = null, 5000);
            }
            else if(Librarium.bookUuid != null && Librarium.studentUuid == null && recentScanned != null) {
                Librarium.studentUuid = recentScanned;
                setTimeout(()=> Librarium.studentUuid = null, 5000);
            }

            if(Librarium.bookUuid != null && Librarium.studentUuid != null) {
                let bookUuid = Librarium.bookUuid,
                    studentUuid = Librarium.studentUuid;

                Librarium.processTransaction(
                    bookUuid, studentUuid,
                    async (isReturned)=> {
                        Librarium.bookUuid = null;
                        Librarium.studentUuid = null

                        Librarium.showNotification("Transaction success for book: " +
                            (await Librarium.getBookTitle(bookUuid)) + " [" +
                            (isReturned ? "Returned" : "Borrowed") + "]");
                        device.write("2");

                        Librarium.fetchAllRecords();
                    },
                    (errorMsg)=> Librarium.showNotification(errorMsg)
                );
            }
            recentScanned = null;
        });
    });

    $("#add-book-btn").click(()=> {
        let title = $("#book-title").val(),
            author = $("#book-author").val(),
            publisher = $("#book-publisher").val(),
            publicationDate = $("#book-publication-date").val(),
            copies = parseInt($("#book-copies").val());

        hideErrorMessage("book");
        if(title == "" || !Librarium.validateBookTitle(title)) {
            showErrorMessage("book", "Invalid book title string.");
            return;
        }

        if(author == "" || !Librarium.validateBookAuthor(author)) {
            showErrorMessage("book", "Invalid book author string.");
            return;
        }

        if(publisher == "" || !Librarium.validateBookPublisher(publisher)) {
            showErrorMessage("book", "Invalid book publisher string.");
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
                Librarium.fetchAllBooks();
            }
        });
    });

    $("#add-student-btn").click(()=> {
        let studentNumber = $("#student-number").val(),
            name = $("#student-name").val(),
            department = $("#student-department option:selected").val();

        hideErrorMessage("student");
        if(studentNumber == "" || !Librarium.validateStudentNumber(studentNumber)) {
            showErrorMessage("student", "Invalid student number string.");
            return;
        }

        if(name == "" || !Librarium.validateStudentName(name)) {
            showErrorMessage("student", "Invalid student name string.");
            return;
        }

        Librarium.addStudent({
            studentNumber: studentNumber,
            name: name,
            department: department,
            error: ()=> showErrorMessage("student", "Something went wrong."),
            success: (uuid)=> {
                $("#add-student-modal").modal("hide");
                $("#student-added-modal").modal("show");

                $("#student-number").val("");
                $("#student-name").val("");

                Librarium.generateQrCode(uuid, name);
                Librarium.fetchAllStudents();
            }
        });
    });

    $("#change-username-btn").click(()=> {
        hideErrorMessage("change-username");
        hideErrorMessage("changed-username");

        Librarium.changeUsername(
            $("#new-username").val(),
            $("#change-un-password").val(),
            (err)=> showErrorMessage("change-username", err),
            ()=> showErrorMessage("changed-username", "Username was successfully changed."));
    });

    $("#change-password-btn").click(()=> {
        hideErrorMessage("change-password");
        hideErrorMessage("changed-password");

        Librarium.changePassword(
            $("#old-password").val(),
            $("#new-password").val(),
            $("#confirm-password").val(),
            (err)=> showErrorMessage("change-password", err),
            ()=> showErrorMessage("changed-password", "Password was successfully changed.")
        );
    });
});