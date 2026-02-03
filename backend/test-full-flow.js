const http = require('http');

async function testFullFlow() {
  console.log('Testing full help flow...\n');

  // Step 1: Send a message
  console.log('Step 1: Sending message...');
  const sessionId = 'test-flow-' + Date.now();

  const sendData = JSON.stringify({
    userId: 'user-1',
    content: 'Hello, can you help me with Taskify?',
    screenContext: 'project_list'
  });

  const sendOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/help/session/${sessionId}/message`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': sendData.length
    }
  };

  const sendResult = await new Promise((resolve, reject) => {
    const req = http.request(sendOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse response: ' + body));
        }
      });
    });
    req.on('error', reject);
    req.write(sendData);
    req.end();
  });

  console.log('Send message response:');
  console.log('  User message:', sendResult.userMessage ? sendResult.userMessage.content : 'null');
  console.log('  AI message:', sendResult.aiMessage.content.substring(0, 100) + '...');
  console.log('  Error:', sendResult.error || 'none');
  console.log('');

  // Step 2: Get messages
  console.log('Step 2: Retrieving all messages for session...');
  await new Promise(resolve => setTimeout(resolve, 500));

  const getOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/help/session/${sessionId}`,
    method: 'GET'
  };

  const getResult = await new Promise((resolve, reject) => {
    const req = http.request(getOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse response: ' + body));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

  console.log('Get messages response:');
  console.log('  Total messages:', getResult.messages ? getResult.messages.length : 0);
  if (getResult.messages) {
    getResult.messages.forEach((msg, i) => {
      console.log(`  Message ${i + 1}: [${msg.sender}] ${msg.content.substring(0, 50)}...`);
    });
  }
  console.log('');
  console.log('Test complete!');
}

testFullFlow().catch(console.error);
