"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require('dotenv');
const Twitter = require('twitter');
dotenv.config();
const database_1 = require("./database");
const client = new Twitter({
    consumer_key: 'CPl5Wbip7J6CIp9mEzWR4sltQ',
    consumer_secret: 'LgduVglLtfJib6maPOIa4DowEgKDi1hCeXaR00VLFENGOkUk6F',
    access_token_key: '1232271208856637441-g30KfrfRyjiq8qMoN3FxjJTDUgFs8N',
    access_token_secret: 'WqkgzdgxmcN65imqmbBKBPrW5fO9pesGvKiW1gUO5fHYw'
});
class Main {
    database;
    constructor() {
        this.database = new database_1.Database('us-east-1', 'ASIAT4XI3T3QKRTVKE6J', 'bdxZRBQd8NWwz6yB9AXVNHYoD0Yut2aHNg0Q0q3+', 'FwoGZXIvYXdzEB8aDNCgKz0iKAp1gzVzHyK/Aena2+60xb2dOSh6TvGSWeoGrMRzIRkqROsyP0zlV5rQNQGtb4sDfKbxGEQ0iYSZStEKuWnheU9OyeZMAujvXieHhHQhchIjbhQxM46MPvjMxObevh6NhnGSeAaU0oJjz/C9P+93EVCzu+Fwc4pKAP+gAi4rMDDyGJrbbrLplT4QIhIAIn7tlEiInyrrdXSc07zgCc2MU8ai/pCJ8AnHQaWRAeqqm6i1v9z/2kFNJWTUCJO+vmVsFINTlCxRhZDJKMqntpIGMi2knZ2/+xoNIm4sCDTep29YEOtB8UklBr4E2Rfdzx1Bhs0oGh5I8wOpvP3wXT4=');
    }
    arrayTweets = [];
    async storeTweets(keyword) {
        this.database.connect();
        try {
            let searchParams = {
                q: keyword,
                count: 100,
                lang: 'en',
                tweet_mode: 'extended'
            };
            let twitterResult = await client.get('search/tweets', searchParams);
            for (let i = 0; i < twitterResult.statuses.length; i++) {
                let newObject = {
                    TWEET_ID: twitterResult.statuses[i].id,
                    TWEET_CARRIER: keyword,
                    TWEET_TIMESTAMP: new Date(twitterResult.statuses[i].created_at).valueOf(),
                    TWEET_DATE: twitterResult.statuses[i].created_at,
                    TWEET_TEXT: twitterResult.statuses[i].full_text
                };
                let params = {
                    PutRequest: {
                        Item: {
                            "TWEET_ID": { "N": newObject.TWEET_ID.toString() },
                            "TWEET_CARRIER": { "S": newObject.TWEET_CARRIER },
                            "TWEET_TIMESTAMP": { "N": newObject.TWEET_TIMESTAMP.toString() },
                            "TWEET_DATE": { "S": newObject.TWEET_DATE },
                            "TWEET_TEXT": { "S": newObject.TWEET_TEXT },
                        }
                    }
                };
                this.arrayTweets.push(params);
                if (this.arrayTweets.length === 25) {
                    this.database.storeData(this.arrayTweets);
                    this.arrayTweets = [];
                }
            }
        }
        catch (error) {
        }
    }
}
let main = new Main();

main.storeTweets("AmericanAir");
main.storeTweets("JetBlue");
main.storeTweets("SpiritAirlines");
