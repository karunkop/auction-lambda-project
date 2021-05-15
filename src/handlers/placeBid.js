import AWS from "aws-sdk";
import commonMiddleware from "../../middlewares/commonMiddlewares";
import createError from "http-errors";
import { getAuctionById } from "./getAuction";
import validator from "@middy/validator";
import placeBidSchema from "../../schemas/placeBidSchema";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;

    const { email: bidderEmail } = event.requestContext.authorizer;

    const auction = await getAuctionById(id);

    if (auction.seller === bidderEmail) throw new createError.Forbidden("You cannot bid on your own product!");

    if (auction.highestBid.bidder === bidderEmail) throw new createError.Forbidden("Your's is already the highest bid till now!");

    if (auction.status != "OPEN") throw new createError.Forbidden("You cannot bid on closed Auctions!");

    if (amount <= auction.highestBid.amount) {
        throw new createError.Forbidden(`You cannot bid lower than ${auction.highestBid.amount} ! `);
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: "set highestBid.amount = :amount , highestBid.bidder = :bidder",
        ExpressionAttributeValues: {
            ":amount": amount,
            ":bidder": bidderEmail,
        },
        ReturnValues: "ALL_NEW",
    };

    let updatedAuction;
    try {
        const result = await dynamoDb.update(params).promise();
        updatedAuction = result.Attributes;
    } catch (error) {
        console.log("error :", error);
        throw new createError.InternalServerError(error);
    }
    return {
        statusCode: 201,
        body: JSON.stringify({ updatedAuction }),
    };
}

export const handler = commonMiddleware(placeBid).use(validator({ inputSchema: placeBidSchema }));
