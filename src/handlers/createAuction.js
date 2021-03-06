import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../../middlewares/commonMiddlewares";
import createError from "http-errors";
import validator from "@middy/validator";
import createAuctionSchema from "../../schemas/createAuctionSchema";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
    const { title } = event.body;
    const { email } = event.requestContext.authorizer;
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + 1);

    const auction = {
        id: uuid(),
        title,
        status: "OPEN",
        createdAt: now.toISOString(),
        endingAt: endDate.toISOString(),
        highestBid: {
            amount: 0,
            bidder: "",
        },
        seller: email,
    };

    try {
        await dynamoDb
            .put({
                TableName: process.env.AUCTIONS_TABLE_NAME,
                Item: auction,
            })
            .promise();
    } catch (err) {
        console.log("err :", err);
        throw new createError.InternalServerError(err);
    }

    return {
        statusCode: 201,
        body: JSON.stringify({ auction }),
    };
}

export const handler = commonMiddleware(createAuction).use(validator({ inputSchema: createAuctionSchema }));
