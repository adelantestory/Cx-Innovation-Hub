const http = require('http');

const data = JSON.stringify({
  userId: 'user-1',
  content: 'How do I move a task to a different column?',
  screenContext: 'kanban_board'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/help/session/final-test-123/message',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.stringify(JSON.parse(body), null, 2));
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();
