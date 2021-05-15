import middy from "@middy/core";
import httpJsonBodyParse from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";

export default (handler) => middy(handler).use([httpJsonBodyParse(), httpEventNormalizer(), httpErrorHandler()]);
