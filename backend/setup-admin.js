const http = require('http');

const createAdminAccount = () => {
    const data = JSON.stringify({
        username: 'admin',
        email: 'admin@milksystem.com',
        password: 'admin123'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register-admin',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 201 || res.statusCode === 200) {
                console.log('✅ Admin account created successfully!');
                console.log('Username: admin');
                console.log('Password: admin123');
                console.log('\nYou can now login at http://localhost:5173');
            } else if (res.statusCode === 400) {
                console.log('⚠️  Admin account already exists');
                console.log('Username: admin');
                console.log('Password: admin123');
                console.log('\nYou can login at http://localhost:5173');
            } else {
                console.error('❌ Error:', responseData);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error creating admin account:', error.message);
        console.error('Make sure the backend server is running on port 5000');
    });

    req.write(data);
    req.end();
};

createAdminAccount();
