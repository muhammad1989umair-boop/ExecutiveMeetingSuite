const http = require('http');

const loginData = JSON.stringify({
  email: 'umair.ilyas@gatronova.com',
  password: 'demo123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const response = JSON.parse(data);
    const token = response.token;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/divisional-heads',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = http.request(options, (res) => {
      let headsData = '';
      res.on('data', (chunk) => { headsData += chunk; });
      res.on('end', () => {
        console.log('\n=== RAW JSON RESPONSE ===');
        const parsed = JSON.parse(headsData);
        // Print raw first user object
        console.log('\nFirst user raw object:');
        console.log(JSON.stringify(parsed.users[0], null, 2));
        process.exit(0);
      });
    });
    req.end();
  });
});

loginReq.write(loginData);
loginReq.end();
