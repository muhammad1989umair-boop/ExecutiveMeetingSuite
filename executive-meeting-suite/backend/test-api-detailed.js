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
        const headsResponse = JSON.parse(headsData);
        console.log('\n=== FULL RESPONSE ===');
        console.log('Total users:', headsResponse.total);
        console.log('\nFirst 3 users:');
        headsResponse.users.slice(0, 3).forEach((u, i) => {
          console.log(`\n${i+1}. ${u.full_name}`);
          console.log(`   Email: ${u.email}`);
          console.log(`   Division ID: ${u.division_id}`);
          console.log(`   Division Name: ${u.division_name}`);
          console.log(`   Company: ${u.company}`);
        });
        process.exit(0);
      });
    });
    req.end();
  });
});

loginReq.write(loginData);
loginReq.end();
