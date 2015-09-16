Messages = new Mongo.Collection("msgs");

if (Meteor.isServer) {
  // This code only runs on the server
  console.log("I'm the server");
  /*
  Meteor.publish("messages", function () {
    return Messages.find({}, {sort: {createdAt: -1}, limit: 5});
  });
  */
}

if (Meteor.isClient) {
  // This code only runs on the client
  /*
  Meteor.subscribe("messages");
  */
  console.log("I'm the client");

  Template.body.helpers({
    recentMessages: function () {
      return Messages.find({}, {sort: {createdAt: 1}});
    }
  });

  Template.body.events({
    "submit .new-message": function (event) {
      var text = event.target.text.value;

      console.log(text);
      //Meteor.call("sendMessage", text);

      event.target.text.value = "";
      return false;
    }
  });

  // Accounts.ui.config({
  //   passwordSignupFields: "USERNAME_ONLY"
  // });
}

/*
Meteor.methods({
  sendMessage: function (message) {
    // if (! Meteor.userId()) {
    //   throw new Meteor.Error("not-authorized");
    // }

    Messages.insert({
      text: message,
      createdAt: new Date(),
      username: "anonymous"
    });
  }
});
*/
