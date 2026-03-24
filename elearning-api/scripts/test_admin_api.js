const http = require('http');

const data = JSON.stringify({ email: 'admin@company.com', password: 'admin123' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const json = JSON.parse(body);
    const token = json.token;
    console.log("Admin Token acquired.");
    
    // Fetch courses
    http.get('http://localhost:5000/api/admin/courses', {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res2) => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => console.log("Admin Courses:", body2));
    });
  });
});

req.write(data);
req.end();
