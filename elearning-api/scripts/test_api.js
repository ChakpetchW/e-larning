const http = require('http');

const data = JSON.stringify({ email: 'user@company.com', password: 'user123' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const json = JSON.parse(body);
    const token = json.token;
    console.log("Token acquired.");
    
    // Fetch courses
    http.get('http://localhost:5000/api/user/courses', {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res2) => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => console.log("Courses:", body2));
    });
    
    // Fetch categories
    http.get('http://localhost:5000/api/user/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res3) => {
      let body3 = '';
      res3.on('data', d => body3 += d);
      res3.on('end', () => console.log("Categories:", body3));
    });

  });
});

req.write(data);
req.end();
