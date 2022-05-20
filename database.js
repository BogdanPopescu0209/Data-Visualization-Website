"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const AWS = require("aws-sdk");
class Database {
    dynamoDb;
    region;
    accessKeyId;
    secretAccessKey;
    sessionToken;
    constructor(region, accessKeyId, secretAccessKey, sessionToken) {
        this.region = region;
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;
        this.sessionToken = sessionToken;
    }
    connect() {
        AWS.config.update({
            region: this.region,
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
            sessionToken: this.sessionToken
        });
        this.dynamoDb = new AWS.DynamoDB();
    }
    storeData(batch) {
        let params = {
            RequestItems: {
                "flights_tweets": batch
            }
        };
        this.dynamoDb.batchWriteItem(params, function (error, data) {
            if (error) {
                console.error("ERROR uploading data: " + JSON.stringify(error));
            }
            else {
                console.log("Data uploaded successfully: " + JSON.stringify(data));
            }
        });
    }
}
exports.Database = Database;
