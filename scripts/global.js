window.jQuery = window.$ = require("jquery");

const sqlite3 = require("sqlite3");
const md5 = require("md5");
const Instascan = require("instascan");
const Qrious = require("qrious");

let db = new sqlite3.Database("librarium.db");
let tobeDeletedBook = null,
    tobeDeletedStudent = null;

const Librarium = {
    recentDataTable: null,
    booksTable: null,
    studentsTable: null,

    generateUuid: ()=> {
        const getRandomHexDigit = ()=> Math.floor(Math.random() * 16).toString(16),
            getRandomHexBlock = ()=> (
                getRandomHexDigit() +
                getRandomHexDigit() +
                getRandomHexDigit() +
                getRandomHexDigit()
            );

        return (
            getRandomHexBlock() + getRandomHexBlock() + "-" +
            getRandomHexBlock() + "-4" +
            getRandomHexDigit() + getRandomHexBlock().substring(1) + "-" +
            getRandomHexBlock() + getRandomHexBlock() + getRandomHexBlock()
        );
    },

    generateQrCode: (text, fileName)=> {
        let dummyElem = document.createElement("a");
        dummyElem.classList.add("d-none");
        dummyElem.download = fileName.replace(/ /g, "_").replace(/[^\w.-]/g, "") + ".jpg";
        dummyElem.href = new Qrious({value: text}).toDataURL("image/jpeg");

        document.body.appendChild(dummyElem);
        dummyElem.click();
        document.body.removeChild(dummyElem);
    },

    initDataTable: (tableId, emptyMessage)=> {
        return $(tableId).DataTable({
            "language": {
                "emptyTable": emptyMessage,
                "zeroRecords": emptyMessage
            },
            "responsive": true
        });
    },

    validateUsername: (username)=>
        /^[a-zA-Z0-9_]+$/.test(username),

    login: (username, password, errEvent, successEvent)=> {
        db.serialize(()=> {
            let encPassword = md5(password);
            db.all("SELECT username, password FROM admin WHERE username=\"" + username + "\" AND password=\"" + encPassword + "\" LIMIT 1", (err, rows)=> {
                if(!err && rows.length >= 1 && encPassword == rows[0].password) {
                    successEvent();
                    return;
                }
                errEvent();
            })
        });
    },

    validateBookTitle: (title)=> title.length > 1 && title.length < 100,
    validateBookAuthor: (author)=> /^[A-Za-z\s.'-]+$/.test(author),
    validateBookPublisher: (publisher)=> /^[a-zA-Z0-9\s]+$/.test(publisher),

    addBook: ({title, author, publisher, publicationDate, copies, error, success})=> {
        db.serialize(()=> {
            let uuid = Librarium.generateUuid();
            db.run("INSERT INTO books (title, author, publisher, publication_date, num_copies, uuid) VALUES(\"" +
                    title + "\", \"" + author + "\", \"" +
                    publisher + "\", \"" + publicationDate + "\", " +
                    copies + ", \"" + uuid + "\")",
                (_, err)=> {
                if(err == null) {
                    success(uuid);
                    return;
                }

                error();
            });
        });
    },

    deleteBook: (uuid, error, success)=> {
        db.serialize(()=> {
            db.run("DELETE FROM books WHERE uuid=\"" + uuid + "\"", (_, err)=> {
                if(err == null) {
                    success();
                    return;
                }

                error();
            });
        });
    },

    confirmDeleteBook: (uuid)=> {
        $("#confirm-book-delete-modal").modal("show");
        tobeDeletedBook = uuid;
    },

    confirmedDeleteBook: ()=> {
        Librarium.deleteBook(
            tobeDeletedBook,
            ()=> {},
            ()=> {
                $("#book-delete-success-modal").modal("show");
                Librarium.fetchAllBooks();
            }
        );
    },

    fetchAllBooks: ()=> {
        db.serialize(()=> {
            db.all("SELECT title, author, publisher, publication_date, num_copies, uuid FROM books", (err, rows)=> {
                if(Librarium.booksTable != null) {
                    Librarium.booksTable.destroy();
                    $("#books-tbody").empty();
                }

                if(!err && rows.length >= 1) {
                    let bookTbody = "";
                    rows.forEach((row)=> {
                        bookTbody += "<tr><td>" + row.title +
                            "</td><td>" + row.author +
                            "</td><td>" + row.publisher +
                            "</td><td>" + row.publication_date +
                            "</td><td>" + row.num_copies +
                            "</td><td><button type=\"button\" class=\"btn btn-outline-primary btn-sm text-primary\" onclick=\"Librarium.confirmDeleteBook('" +
                            row.uuid + "')\"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"currentColor\" width=\"20\" height=\"20\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0\" /></svg></button>" +
                            "<button type=\"button\" class=\"btn btn-outline-warning btn-sm text-warning mx-2\" onclick=\"Librarium.generateQrCode('" +
                            row.uuid + "', '" + row.title + "')\"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"currentColor\" width=\"20\" height=\"20\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z\" /></svg></button></td></tr>";
                    });

                    $("#books-tbody").html(bookTbody);
                }

                Librarium.booksTable = Librarium.initDataTable("#books-table", "No books found.");
            });
        });
    },

    validateStudentName: (name)=> /^[A-Za-z\s.'-]+$/.test(name),
    validateStudentNumber: (number)=> /^\d{3}-\d{5}[Mm]$/.test(number),

    addStudent: ({studentNumber, name, department, error, success})=> {
        db.serialize(()=> {
            let uuid = Librarium.generateUuid();
            db.run("INSERT INTO students (student_number, name, department, uuid) VALUES(\"" +
                studentNumber + "\", \"" + name + "\", \"" + department + "\", \"" + uuid + "\")",
                (_, err)=> {
                if(err == null) {
                    success(uuid);
                    return;
                }

                error();
            });
        });
    },

    deleteStudent: (uuid, error, success)=> {
        db.serialize(()=> {
            db.run("DELETE FROM students WHERE uuid=\"" + uuid + "\"", (_, err)=> {
                if(err == null) {
                    success();
                    return;
                }

                error();
            });
        });
    },

    confirmDeleteStudent: (uuid)=> {
        $("#confirm-student-delete-modal").modal("show");
        tobeDeletedStudent = uuid;
    },

    confirmedDeleteStudent: ()=> {
        Librarium.deleteStudent(
            tobeDeletedStudent,
            ()=> {},
            ()=> {
                $("#student-delete-success-modal").modal("show");
                Librarium.fetchAllStudents();
            }
        );
    },

    fetchAllStudents: ()=> {
        db.serialize(()=> {
            db.all("SELECT student_number, name, department, uuid FROM students", (err, rows)=> {
                if(Librarium.studentsTable != null) {
                    Librarium.studentsTable.destroy();
                    $("#students-tbody").empty();
                }

                if(!err && rows.length >= 1) {
                    let studentTbody = "";
                    rows.forEach((row)=> {
                        studentTbody += "<tr><td>" + row.student_number +
                            "</td><td>" + row.name +
                            "</td><td>" + row.department +
                            "</td><td><button type=\"button\" class=\"btn btn-outline-primary btn-sm text-primary\" onclick=\"Librarium.confirmDeleteStudent('" +
                            row.uuid + "')\"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"currentColor\" width=\"20\" height=\"20\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0\" /></svg></button>" +
                            "<button type=\"button\" class=\"btn btn-outline-warning btn-sm text-warning mx-2\" onclick=\"Librarium.generateQrCode('" +
                            row.uuid + "', '" + row.name + "')\"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1\" stroke=\"currentColor\" width=\"20\" height=\"20\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z\" /></svg></button></td></tr>";
                    });

                    $("#students-tbody").html(studentTbody);
                }

                Librarium.studentsTable = Librarium.initDataTable("#students-table", "No students found.");
            });
        });
    },

    startScanner: (scanEvt, errorEvt)=> {
        let args = {video: document.getElementById("preview")};
        window.URL.createObjectURL = (stream) => {
            args.video.srcObject = stream;
            return stream;
        };

        let scanner = new Instascan.Scanner(args);
        scanner.addListener("scan", (content)=> scanEvt(content));

        let cameraObjs = [];
        Instascan.Camera.getCameras().then((cameras)=> {
            if(cameras.length > 0) {
                cameraObjs = cameras;
                return;
            }

            errorEvt('No cameras found.');
        }).then(()=> {
            let cameraList = "", idx = 0;
            cameraObjs.forEach((cam)=> {
                cameraList += "<option value=\"" + idx + "\">" + cam.name + "</option>"
                idx++;
            });

            $("#available-cameras").html(cameraList);
            $("#available-cameras option").last().attr("selected", "selected");

            scanner.start(cameraObjs.at(-1));
        }).catch((e)=> errorEvt(e));

        $("#available-cameras").on("change", ()=> {
            let selectedCamera = $("#available-cameras option:selected").val();

            scanner.stop().then(()=> scanner.start(cameraObjs[parseInt(selectedCamera)]));
        });
    },

    validatePassword: (password)=> password.length > 4,

    changeUsername: (username, password, errEvent, successEvent)=> {
        if(!Librarium.validateUsername(username)) {
            errEvent("Invalid new username string.");
            return;
        }

        if(!Librarium.validatePassword(password)) {
            errEvent("Invalid password string.");
            return;
        }

        db.serialize(()=> {
            db.all("UPDATE admin SET username=\"" + username + "\"", (err, _)=> {
                if(!err) {
                    successEvent();
                    return;
                }

                errEvent("Something went wrong.");
            });
        });
    },

    changePassword: (oldPassword, newPassword, confirmPassword, errEvent, successEvent)=> {
        if(!Librarium.validatePassword(oldPassword)) {
            errEvent("Invalid old password string.");
            return;
        }

        if(!Librarium.validatePassword(newPassword)) {
            errEvent("Invalid new password string.");
            return;
        }

        if(!Librarium.validatePassword(confirmPassword)) {
            errEvent("Invalid confirmation password string.");
            return;
        }

        if(newPassword != confirmPassword) {
            errEvent("New password and confirmation password did not match.");
            return;
        }

        db.serialize(()=> {
            db.all("UPDATE admin SET password=\"" + md5(newPassword) + "\" WHERE password=\"" + md5(oldPassword) + "\"",
                (err, _)=> {
                if(!err) {
                    successEvent();
                    return;
                }

                errEvent("Something went wrong.");
            });
        });
    }
};