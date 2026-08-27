const http = require('http');

// First login
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
    console.log('\n✓ Login successful');
    
    // Now get divisional heads
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
        const headsResponse = JSON.parse(headsData);
        console.log('\n✓ Divisional Heads API Response (First 3):');
        console.log(JSON.stringify(headsResponse.users.slice(0, 3), null, 2));
        process.exit(0);
      });
    });
    req.end();
  });
});

loginReq.write(loginData);
loginReq.end();
