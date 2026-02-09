const axios = require('axios');

const createAdminAccount = async () => {
    // Get URL from command line arg or default to localhost
    const baseURL = process.argv[2] || 'http://localhost:5000';
    console.log(`Connecting to: ${baseURL}`);

    const adminData = {
        username: 'admin',
        email: 'admin@milksystem.com',
        password: 'admin123'
    };

    try {
        const response = await axios.post(`${baseURL}/api/auth/register-admin`, adminData);

        if (response.status === 201 || response.status === 200) {
            console.log('✅ Admin account created successfully!');
            console.log('Username: admin');
            console.log('Password: admin123');
        }
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                console.log('⚠️  Admin account already exists');
                console.log('Username: admin');
                console.log('Password: admin123');
            } else {
                console.error('❌ Error:', error.response.data.message || error.message);
            }
        } else {
            console.error('❌ Error connecting to server:', error.message);
        }
    }
};

createAdminAccount();
