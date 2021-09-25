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

  const requestBody = event.body ? JSON.parse(event.body) : null;
  var queryString = event.queryStringParameters;
  console.log(queryString);
  console.log("Request Body: ", requestBody);

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
  const param = {
    TableName: hardwareStateTableName,
    Key: {
      hardwareId: hardwareId,
    },
  };

  return await dynamodb
    .get(param)
    .promise()
    .then(
      (response) => {
        return response.Item;
      },
      (error) => {
        console.error("Error: ", error);
      }
    );
};

let updateHardwareState = async function (hardwareState) {
  // try {
  //   let existingHardwareState = await getHardwareState(
  //     hardwareState.hardwareId,
  //     true
  //   );

  //   if (existingHardwareState) {
  //     await deleteHardwareState(hardwareState.hardwareId);
  //   }
  // } catch (error) {
  //   console.log("Error in updateHardwareState: ", error);
  // }

  await createHardwareState(hardwareState);
};

let deleteHardwareState = async function (hardwareId) {
  let params = {
    TableName: hardwareStateTableName,
    Key: {
      hardwareId: hardwareId,
    },
  };
  return await dynamodb.delete(params).promise();
};

let createHardwareState = async function (hardwareState) {
  let params = {
    TableName: hardwareStateTableName,
    Item: hardwareState,
  };
  return await dynamodb
    .put(params)
    .promise()
    .then(
      () => {
        const body = {
          Operation: "SAVE",
          Message: "SUCCESS",
          Item: hardwareState,
        };
      },
      (error) => {
        console.error("Error: ", error);
      }
    );
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
