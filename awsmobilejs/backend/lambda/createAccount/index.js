var AWS = require('aws-sdk');
var uuid = require('uuid');

var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = (payload, context, callback) => {
    // console.log(payload);
    // console.log(context);

    var acctParams = {
      TableName: 'AccountTable',
      Item: {
        'id': uuid(),
        'createdAt': Date.now().toString(),
        'name': payload.input.name,
        'ownerId': payload.input.ownerId,
        'elders': payload.input.elders
      }
    };

    docClient.put(acctParams, function(err, acctData) {
      if (err) {
        console.log("Failed to create account", acctParams, err);
        callback(err, null);
      } else {
        console.log("Successfully created account", acctParams.Item);

        var membParams = {
          TableName: 'MemberTable',
          Item: {
            'accountId': acctParams.Item.id,
            'userId': payload.input.ownerId,
            'role': payload.input.role
          }
        };

        docClient.put(membParams, function(err, membData) {
          if (err) {
            console.log("Failed to create member", membParams, err);
            callback(err, null);
          } else {
            console.log("Successfully created member", membParams.Item);
            acctParams.Item.members = [ membParams.Item ];
            console.log("Returning new account", acctParams.Item);
            callback(null, acctParams.Item);
          }
        });
      }
    });
};