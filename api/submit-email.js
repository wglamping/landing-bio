export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get data from request body
    const { email, question, source } = req.body;

    // Validate email exists
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Call MailerLite API
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
                    source: source || 'website',
                    property: 'bali_dome',
                    question: question || 'No question',
                    timestamp: new Date().toISOString()
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, data });
        } else {
            console.error('MailerLite error:', data);
            return res.status(500).json({ error: 'MailerLite API error', details: data });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to submit email' });
    }
}
