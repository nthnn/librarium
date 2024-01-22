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
    }
}