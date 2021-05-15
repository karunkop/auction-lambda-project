import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const closeAuction = async (auctionToClose) => {
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auctionToClose.id },
        UpdateExpression: "set #status = :status",
        ExpressionAttributeValues: {
            ":status": "CLOSED",
        },
        ExpressionAttributeNames: {
            "#status": "status",
        },
    };

    const result = await dynamoDb.update(params).promise();
    return result;
};
