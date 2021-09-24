"use strict";

const { Constants } = require("./constants");
const AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-south-1",
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const hardwareStateTableName = "hardware-state";

exports.handler = async (event, param2) => {
  console.log("Event: ", event);
  console.log("Param2: ", param2);

  let response;
  let statusCode;
  if (event.path !== Constants.APIEntryPath) {
    console.log(
      "Miss configuration in API Gateway. Got: ",
      event.path,
      " Expected: ",
      Constants.APIEntryPath
    );
    return;
  }
  const requestBody = event.body ? JSON.parse(event.body) : null;
  var queryString = event.queryStringParameters;
  console.log(queryString);

  switch (true) {
    case event.httpMethod === Constants.GetMethod:
      response = getHardwareState(
        event.queryStringParameters.hardwareId,
        event.queryStringParameters.needCurrent
      );
      statusCode = 200;
      break;
    case event.httpMethod === Constants.PatchMethod:
      response = "Added";
      statusCode = 201;
      break;
  }
  return buildResponse(statusCode, response);
};

let getHardwareState = function (hardwareId, needCurrent = false) {
  return {
    LastPingTime: Date.now(),
    HardwareId: hardwareId,
    LastIrrigationTime: Date.now(),
  };
};

let buildResponse = function (statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};
