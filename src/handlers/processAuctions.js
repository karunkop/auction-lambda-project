import { getEndedAuctions } from "../../helper/getEndedAuctions";
import { closeAuction } from "../../helper/closeAuction";
import createError from "http-errors";

async function processAuctions() {
    try {
        const auctionsToClose = await getEndedAuctions();
        const closePromises = auctionsToClose.map((auction) => closeAuction(auction));
        await Promise.all(closePromises);
        return {
            numberOfClosedAuctions: closePromises.length,
        };
    } catch (err) {
        console.log("err :", err);
        throw new createError.InternalServerError(err);
    }
}

export const handler = processAuctions;
