const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Method not allowed' }) 
        };
    }

    // Get data from form
    const { email, question, source } = JSON.parse(event.body);

    // Validate email exists
    if (!email) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: 'Email is required' }) 
        };
    }

    try {
        // Call MailerLite API (token is hidden in environment variable)
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_TOKEN}`
            },
            body: JSON.stringify({
                email: email,
                groups: [process.env.MAILERLITE_GROUP_ID],
                fields: {
                    source: source,
                    property: 'bali_dome',
                    question: question || 'No question',
                    timestamp: new Date().toISOString()
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true })
            };
        } else {
            throw new Error('MailerLite API error');
        }

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to submit email' })
        };
    }
};
