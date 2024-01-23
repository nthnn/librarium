const sqlite3 = require("sqlite3");
const md5 = require("md5");

let db = new sqlite3.Database("librarium.db");
window.jQuery = window.$ = require("jquery");

const Librarium = {
    initDataTable: (tableId, emptyMessage)=> {
        return $(tableId).dataTable({
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
            db.run("INSERT INTO books (title, author, publisher, publication_date, num_copies) VALUES(\"" +
                    title + "\", \"" + author + "\", \"" +
                    publisher + "\", \"" + publicationDate + "\", " +
                    copies + ")",
                (res, err)=> {
                if(err == null) {
                    success();
                    return;
                }

                error();
            });
        });
    },

    deleteBook: (title, error, success)=> {
        db.serialize(()=> {
            db.run("DELETE FROM books WHERE title=\"" + title + "\"", (res, err)=> {
                if(err == null) {
                    success();
                    return;
                }

                error();
            });
        });
    }
};