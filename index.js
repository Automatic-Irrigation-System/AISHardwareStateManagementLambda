"use strict";

let common = require("./common");
const { Constants } = require("./constants");
const AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-south-1",
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const hardwareStateTableName = "hardware-state";

exports.handler = async (event) => {
  let response;
  let statusCode;

  const requestBody = event.body ? JSON.parse(event.body) : null;
  var queryString = event.queryStringParameters;

  switch (true) {
    case event.httpMethod === Constants.GetMethod &&
      event.path === Constants.APIEntryPath:
      response = await getHardwareState(
        event.queryStringParameters.hardwareId,
        event.queryStringParameters.needCurrent
      );
      statusCode = 200;
      break;
    case event.httpMethod === Constants.PatchMethod &&
      event.path === Constants.APIEntryPath:
      response = await updateHardwareState(requestBody);
      statusCode = 201;
      break;
  }
  let finalResponse = buildResponse(statusCode, response);
  console.log(finalResponse);
  return finalResponse;
};

let getHardwareState = async function (hardwareId, needCurrent = false) {
  const params = {
    TableName: hardwareStateTableName,
    Key: {
      hardwareId: hardwareId,
    },
  };

  return await common.getFromDB(dynamodb, params);
};

let updateHardwareState = async function (hardwareState) {
  let params = {
    TableName: hardwareStateTableName,
    Item: hardwareState,
  };
  return await common.putInDB(dynamodb, params);
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
