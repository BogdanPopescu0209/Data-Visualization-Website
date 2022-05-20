const csv = require('csv-parser');
const fs = require('fs')

import { Database } from './database'; 

interface FlightObject {

    FL_DATE: string;
    OP_CARRIER: string;
    OP_CARRIER_FL_NUM: string;
    ORIGIN: string;
    DEST: string;
    CRS_DEP_TIME: string;
    DEP_TIME: string;
    DEP_DELAY: string;
    TAXI_OUT: string;
    WHEELS_OFF: string;
    WHEELS_ON: string;
    TAXI_IN: string;
    CRS_ARR_TIME: string;
    ARR_TIME: string;
    ARR_DELAY: string;
    CANCELLED: string;
    CANCELLATION_CODE: string;
    DIVERTED: string;
    CRS_ELAPSED_TIME: string;
    ACTUAL_ELAPSED_TIME: string;
    AIR_TIME: string;
    DISTANCE: string;
    CARRIER_DELAY: string;
    WEATHER_DELAY: string;
    NAS_DELAY: string;
    SECURITY_DELAY: string;
    LATE_AIRCRAFT_DELAY: string;

}

interface NewFlightObject {

    FL_TIMESTAMP: number,
    FL_DATE: string,
    OP_CARRIER: string,
    DEP_DELAY: number,
    CANCELLED: number

}

class Main {

    database: Database;

    constructor() {

        this.database = new Database(

            'us-east-1',
            'ASIAT4XI3T3QDIGPABHM',
            'BC9I2ur9QSpFEUYjOIkg4+BIT2Etc0QnrimHTWtP',
            'FwoGZXIvYXdzEM7//////////wEaDJd2Y+dDveKtP5i17CK/AdgzAMib3+bAmqlBZB9Ccg8FKUN7L6J9ymXjkcaO3IWwYBskCgRTzNXfBn3I2XZ4GFEcbERnviH8v3e9BA6hZZOGWkfiAgNqL6eJAR8r1fX6FAuxbdwblnJ/6zNMDZdK781xXgTNHTQ+qhI+Qy5mdpStSiXyJkZdz2Otr7EqgXHHaluA/JyWeKkG6vRUgElRvbWmvepWH9syhq/sQ+VLKPlpu96WjhtT6eOL214/w5mQbnGOTaoWAfe9lT++fpgXKI7Sw5AGMi3Gh5eSkrZNRRjg/CuBA5p3ZF+ZKpK0Lf9rTGqXRqbt44D0U0dOxUeCUgPmaV0='
        )
    }

    batch: Array<any> = [];
    count: number = 0;
    date: Array<string> = [];
    checkDate: string = "";
    timeStamp: Array<string> = [];
    generateTimeStamp: Date = new Date();
    FL_DATE: string = "";
    OP_CARRIER: string = "";
    DEP_DELAY: number = 0;
    CANCELLED: number = 0;

    newObject: NewFlightObject = {

        FL_TIMESTAMP: 0,
        OP_CARRIER: "",
        FL_DATE: "",
        DEP_DELAY: 0,
        CANCELLED: 0

    }

    async loadDatabase(dataset: string, OP_CARRIER: string) {

        this.database.connect();

        fs.createReadStream(dataset)
            .pipe(csv())
            .on('data', (data: FlightObject) => {

                if (data.OP_CARRIER === OP_CARRIER) {

                    if (this.date.length < 10) {

                        if (this.date.length === 0) {

                            this.date.push(data.FL_DATE)
                            this.checkDate = data.FL_DATE
                            this.FL_DATE = data.FL_DATE

                        }

                        if (this.date[0] === data.FL_DATE) {

                            this.date.push(data.FL_DATE)

                            this.OP_CARRIER = data.OP_CARRIER;

                            if (data.DEP_DELAY.length != 0) {

                                this.DEP_DELAY += parseInt(data.DEP_DELAY);

                            } else {

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

                            }

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

                            }


                            this.batch.push(params);

                            this.newObject = {

                                FL_TIMESTAMP: 0,
                                OP_CARRIER: "",
                                FL_DATE: "",
                                DEP_DELAY: 0,
                                CANCELLED: 0

                            }

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

let main: Main = new Main();

main.loadDatabase("2017.csv", "AA");
main.loadDatabase("2018.csv", "AA");

main.loadDatabase("2017.csv", "B6");
main.loadDatabase("2018.csv", "B6");

main.loadDatabase("2017.csv", "NK");
main.loadDatabase("2018.csv", "NK");






