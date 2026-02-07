const https = require('https');

const data = JSON.stringify({
    email: 'bakery@christuniversity.in',
    password: 'vendor123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = require('http').request(options, (res) => {
    let responseData = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('\nResponse:');
        console.log(responseData);
        try {
            const json = JSON.parse(responseData);
            console.log('\n✅ Login Success:', json.success);
            console.log('✅ Token:', json.token ? 'Present ✓' : 'Missing ✗');
            console.log('✅ User:', json.user?.name || 'Missing');
            console.log('✅ Role:', json.user?.role || 'Missing');
            console.log('✅ Vendor Data:', json.vendor ? 'Present ✓' : 'Not included');
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

req.write(data);
req.end();
