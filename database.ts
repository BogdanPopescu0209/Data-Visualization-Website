const AWS = require("aws-sdk");

export class Database {

    dynamoDb: any;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;

    constructor(region: string, accessKeyId: string, secretAccessKey: string, sessionToken: string) {

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

    storeData(batch: Array<Object>) {

        let params: Object = {

            RequestItems: {

                "flights_tweets": batch

            }
        }

        this.dynamoDb.batchWriteItem(params, function (error: Object, data: Object) {

            if (error) {

                console.error("ERROR uploading data: " + JSON.stringify(error));

            } else {

                console.log("Data uploaded successfully: " + JSON.stringify(data));

            }
        });

    }
}