import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const queryString = window.location.search;
console.log("qstring: " + queryString);
const params = new URLSearchParams(queryString);
const uaToken = params.get("token");
const thdID = params.get("threadid");
const udName = params.get("displayname");
console.log("token: " + uaToken + "threadid: " + thdID + "displayname: " + udName );

// Your unique Azure Communication service endpoint
let endpointUrl = 'https://acs-shoom-use1-general.unitedstates.communication.azure.com/';
// The user access token generated as part of the pre-requisites
let userAccessToken = uaToken  ?? 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjIyNmY1NWUzLTE1ZTQtNDZhMS04YzNiLTUzZDVkYzJhZjc3Y18wMDAwMDAyMS0zZTY0LWI0MDItNWIzZC04ZTNhMGQwMDk4OWQiLCJzY3AiOjE3OTIsImNzaSI6IjE3MjA2NDYzMDciLCJleHAiOjE3MjA3MzI3MDcsInJnbiI6ImFtZXIiLCJhY3NTY29wZSI6ImNoYXQiLCJyZXNvdXJjZUlkIjoiMjI2ZjU1ZTMtMTVlNC00NmExLThjM2ItNTNkNWRjMmFmNzdjIiwicmVzb3VyY2VMb2NhdGlvbiI6InVuaXRlZHN0YXRlcyIsImlhdCI6MTcyMDY0NjMwN30.YzN1DCz1b917hRXM9cjeU9ueC6L1b0kcdNm0dglHfTRKG2OaDUPltyEFW6b0VrRxTp1WidlbOnFZD0uTWJvND4DDXlBWbPWcpt5fI4PogaLhDJazShA-CFC_urZ9ZXKssSHSeksgLYQ98lipNlvJgTfKDQSn-GlwlGX4_6uvkh-gmLo671CFZyyZgTAUhIbZI1nRcC6U-ep_jCkft2sBiXb8iq_q6JkNubVyETXhOsUPo-hCRrf_iICRqZlUU5yUrnFhY_kAXHgUE_hvnrtSt4IidpKD6hQGMB7WNR2CVT4Z8cvAeHnY6mCxRfoo4dsWIHoVlzStZB3zS6e1mckaVA';

let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));
console.log('Azure Communication Chat client created!');

async function createChatThread() {
  const createChatThreadRequest = {
    topic: "Test Thread"
  };
  const createChatThreadOptions = {
    participants: [
      // {
        // id: { communicationUserId: '8:acs:226f55e3-15e4-46a1-8c3b-53d5dc2af77c_00000021-24ad-b1ad-5b3d-8e3a0d004d64' },
        // displayName: 'Jack P'
      // },
      // {
        // id: { communicationUserId: '8:acs:226f55e3-15e4-46a1-8c3b-53d5dc2af77c_00000021-19cf-87ac-df68-563a0d00310d' },
        // displayName: 'Stevie P'
      // },
      // {
        // id: { communicationUserId: '8:acs:226f55e3-15e4-46a1-8c3b-53d5dc2af77c_00000021-19fe-b043-b4f1-9c3a0d004057' },
        // displayName: 'Ruth P'
      // }
    ]
  };
  const createChatThreadResult = await chatClient.createChatThread(
    createChatThreadRequest,
    createChatThreadOptions
  );
  const threadId = createChatThreadResult.chatThread.id;
  return threadId;
}

//
async function sendMessageToThread(threadId, message, displayName){
  let chatThreadClient = chatClient.getChatThreadClient(threadId);
	
  const sendMessageRequest =
  {
	content: message
  };
  let sendMessageOptions =
  {
	senderDisplayName : displayName,
	type: 'text',
	metadata: {
      'hasAttachment': 'true',
      'attachmentUrl': 'https://google.com/'
	}
  };
  const sendChatMessageResult = await chatThreadClient.sendMessage(sendMessageRequest, sendMessageOptions);
  const messageId = sendChatMessageResult.id;
  console.log(`Message sent!, message id:${messageId}`);
}

//just dumps all the messages on the thread to the console for testing
async function listMessagesOnThread(threadId){
  let chatThreadClient = chatClient.getChatThreadClient(threadId);

  const participants = chatThreadClient.listParticipants();
  for await (const participant of participants) {
	console.log(participant);
  }	

  const messages = chatThreadClient.listMessages();
  for await (const message of messages) {
	console.log(message);
	console.log(message["senderDisplayName"]);
	console.log(message.content.message);
  }
}

async function addParticipant(threadId, userId, displayName){
  let chatThreadClient = chatClient.getChatThreadClient(threadId);

  const addParticipantsRequest =
  {
	participants: [
      {
		id: { communicationUserId: userId },
		displayName: displayName
      }
    ]
  };

  await chatThreadClient.addParticipants(addParticipantsRequest);
}

if(thdID!=null){
  let chatThreadClient = chatClient.getChatThreadClient(thdID);
  console.log(`Chat Thread client for exiting thread. threadId:${thdID}`);
  cThreadId = thdID;
  
  chatClient.startRealtimeNotifications();

  chatClient.on("chatMessageReceived", async (event) => {
    console.log("Notification chatMessageReceived on existing thread");
	document.getElementById("transcript1").value += event.senderDisplayName + " : " + event.message + "\n";
  });  

}else{

createChatThread().then(async threadId => {
  console.log(`Thread created:${threadId}`);
  cThreadId = threadId

  let chatThreadClient = chatClient.getChatThreadClient(threadId);
  console.log(`Chat Thread client for threadId:${threadId}`);
	
  await chatClient.startRealtimeNotifications();
  chatClient.on("chatMessageReceived", async (event) => {
    console.log("Notification chatMessageReceived!");
	document.getElementById("transcript1").value += event.senderDisplayName + " : " + event.message + "\n";
  });
});

}

document.getElementById("chatbox1").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
	sendMessageToThread(cThreadId, document.getElementById("chatbox1").value, udName ?? "annon")  //this functionshould probably return a success indication
	document.getElementById("chatbox1").value = "";  //this probably shouldnt happen if the message didnt send...
  }
});

document.getElementById("listmess").addEventListener("click", function(event) {
	listMessagesOnThread(cThreadId)
});  
