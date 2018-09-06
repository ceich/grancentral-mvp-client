var AWS = require('aws-sdk');

var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = (payload, context, callback) => {
    // This lambda is called by the findOrCreateUser mutation in two contexts:
    // - at login with input.id === Cognito "sub"
    //   1) no user with id or email matching input - create
    //   2) no user with input.id, but one exists with input.email - update
    //   3) user with input.id exists - return
    // - to invite a user to join an account
    //   4) new user (no item with user's email): create
    //   5) invited, but never logged in - return
    //   6) active user - return
    
    // Eliminate extra level of structure
    var input = payload.input;

    // get by id
    var getParams = {
      TableName: 'UserTable',
      Key: { id: input.id }
    };

    docClient.get(getParams, function(err, userData) {
        if (err) {
            console.log('error in get(id)', getParams, err);
            callback(err, null);
        } else if (userData.Item) {
            // Cases 3 (found by id) and 5 (found by email)
            callback(null, userData.Item);
        } else {
            // query by email
            var queryParams = {
                TableName: 'UserTable',
                IndexName: 'email-index',
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: { ':email': input.email },
            };
            docClient.query(queryParams, function(err, userData) {
                if (err) {
                    console.log('error in query(email)', queryParams, err);
                    callback(err, null);
                } else if (userData.Count) {
                    var user = userData.Items[0];
                    if (input.id === input.email) {
                        // Case 6
                        console.log('Attempt to invite an active user', user);
                        callback(null, user);
                    } else {
                        // Case 2
                        updateUserAndMembers(input, user, callback);
                    }
                } else {
                    // Cases 1 and 4
                    createUser(input, callback);
                }
            });
        }
    });
};

function createUser(input, callback) {
    input.createdAt = Date.now().toString();
    var putParams = {
        TableName: 'UserTable',
        Item: input
    };

    docClient.put(putParams, function(err, userData) {
      if (err) {
        console.log("Failed to put item", putParams.Item, err);
        callback(err, null);
      } else {
        console.log("Successfully created user", putParams.Item);
        callback(null, putParams.Item);
      }
    });
}

// Update user and members having placeholder user id (email)
// to input.id (== UserPool.sub).
function updateUserAndMembers(input, user, callback) {
    var oldId = user.id;
    var queryParams = {
        TableName: 'MemberTable',
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': oldId }
    };
    
    docClient.query(queryParams, function(err, memberData) {
        if (err) {
            console.log("Failed to query members", queryParams, err);
            callback(err, null);
        } else {
            Object.assign(user, input);
            var batchParams = {
                RequestItems: {
                    UserTable: [
                        { DeleteRequest: { Key: { id: oldId } } },
                        { PutRequest: { Item: user } }
                    ]
                }
            };
            if (memberData.Count > 0) {
                var memberOps = [];
                for (let m of memberData.Items) {
                    var key = {
                        accountId: m.accountId,
                        userId: m.userId
                    };
                    var item = {
                        accountId: m.accountId,
                        userId: input.id,
                        role: m.role
                    };
                    memberOps.push(
                        { DeleteRequest: { Key: key } },
                        { PutRequest: { Item: item } }
                    );
                }
                batchParams.RequestItems.MemberTable = memberOps;
            }
            docClient.batchWrite(batchParams, function(err, batchResults) {
                if (err) {
                    console.log("Failed to batchWrite", batchParams, err);
                    callback(err, null);
                } else {
                    console.log("Updated id for user", user);
                    callback(null, user);
                }
            });
        }
    });
}