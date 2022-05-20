"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csv = require('csv-parser');
const fs = require('fs');
const database_1 = require("./database");
class Main {
    database;
    constructor() {
        this.database = new database_1.Database('us-east-1', 'ASIAT4XI3T3QM5PTEKU3', 'NbP6uq3t5j6x7Z0ceTxMvq8Rxw6zU2wdqUZFBBsh', 'FwoGZXIvYXdzEHsaDHkrW1YKWIfdlHzaISK/ASMP9ngsdZ3K/K7ycBrxKgpwaIdZMNsDVQGJK0wcWrFw9HSnWQ7dkwfNHUUIWTxc57sFCmg7s+FtreQY7JadKrg4/C05d7/j5wJp8EB/7aj2HvZVTeNIRQEVC0NZI9/vzAgLPBzZdPPXi6IRfVyBLIodSqYtd2/YynAU59+TMYFVLnNLYGzjHAS/ks+O0EeiPbIE561cnsc5jSVLj2MYpFiQd2eLBZoAoI/+ygt5HkgUozRyGm0rObHucZCgulFRKISskpIGMi1peer4d/FL6rAGcNW23WW4kCiLRg9oSu/vkpWTs9d/okgRupuu8dbczXjE2iA=');
    }
    batch = [];
    count = 0;
    date = [];
    checkDate = "";
    timeStamp = [];
    generateTimeStamp = new Date();
    FL_DATE = "";
    OP_CARRIER = "";
    DEP_DELAY = 0;
    CANCELLED = 0;
    newObject = {
        FL_TIMESTAMP: 0,
        OP_CARRIER: "",
        FL_DATE: "",
        DEP_DELAY: 0,
        CANCELLED: 0
    };
    async loadDatabase(dataset, OP_CARRIER) {
        this.database.connect();
        fs.createReadStream(dataset)
            .pipe(csv())
            .on('data', (data) => {
            if (data.OP_CARRIER === OP_CARRIER) {
                if (this.date.length < 10) {
                    if (this.date.length === 0) {
                        this.date.push(data.FL_DATE);
                        this.checkDate = data.FL_DATE;
                        this.FL_DATE = data.FL_DATE;
                    }
                    if (this.date[0] === data.FL_DATE) {
                        this.date.push(data.FL_DATE);
                        this.OP_CARRIER = data.OP_CARRIER;
                        if (data.DEP_DELAY.length != 0) {
                            this.DEP_DELAY += parseInt(data.DEP_DELAY);
                        }
                        else {
                            this.DEP_DELAY = 0;
                        }
                        this.CANCELLED += parseInt(data.CANCELLED);
                        this.timeStamp = this.FL_DATE.split("-");
                        this.generateTimeStamp = new Date(this.timeStamp[1] + " " + this.timeStamp[2] + " " + this.timeStamp[0]);
                        this.newObject = {
                            FL_TIMESTAMP: this.generateTimeStamp.valueOf(),
                            OP_CARRIER: this.OP_CARRIER,
                            FL_DATE: this.FL_DATE,
                            DEP_DELAY: this.DEP_DELAY / 10,
                            CANCELLED: this.CANCELLED / 10
                        };
                    }
                }
                if (this.date.length === 10) {
                    if (this.checkDate != data.FL_DATE) {
                        let params = {
                            PutRequest: {
                                Item: {
                                    "FL_TIMESTAMP": { "N": this.newObject.FL_TIMESTAMP.toString() },
                                    "OP_CARRIER": { "S": this.newObject.OP_CARRIER },
                                    "FL_DATE": { "S": this.newObject.FL_DATE },
                                    "DEP_DELAY": { "N": this.newObject.DEP_DELAY.toString() },
                                    "CANCELLED": { "N": this.newObject.CANCELLED.toString() },
                                }
                            }
                        };
                        this.batch.push(params);
                        this.newObject = {
                            FL_TIMESTAMP: 0,
                            OP_CARRIER: "",
                            FL_DATE: "",
                            DEP_DELAY: 0,
                            CANCELLED: 0
                        };
                        this.date = [];
                        this.DEP_DELAY = 0;
                        this.CANCELLED = 0;
                        this.count = 0;
                    }
                }
            }
            if (this.batch.length === 25) {
                this.database.storeData(this.batch);
                this.batch = [];
            }
        })
            .on('end', () => {
            this.database.storeData(this.batch);
            console.log("Database loaded successfully!");
        });
    }
}
let main = new Main();

main.loadDatabase("2017.csv", "AA");
main.loadDatabase("2018.csv", "AA");
main.loadDatabase("2017.csv", "B6");
main.loadDatabase("2018.csv", "B6");
main.loadDatabase("2017.csv", "NK");
main.loadDatabase("2018.csv", "NK");
