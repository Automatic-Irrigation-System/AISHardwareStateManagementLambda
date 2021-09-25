module.exports = {
  putInDB: async function (dynamodb, params) {
    return await dynamodb
      .put(params)
      .promise()
      .then(
        () => {
          const body = {
            Operation: "SAVE",
            Message: "SUCCESS",
            Item: params.Item,
          };
        },
        (error) => {
          console.error("Error: ", error);
        }
      );
  },

  getFromDB: async function (dynamodb, params) {
    return await dynamodb
      .get(params)
      .promise()
      .then(
        (response) => {
          return response.Item;
        },
        (error) => {
          console.error("Error: ", error);
        }
      );
  },
};
