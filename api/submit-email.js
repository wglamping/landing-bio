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
        // 1. Add to MailerLite
        const mailerliteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
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
                    timestamp: new Date().toISOString()
                }
            })
        });

        // 2. If there's a question, send notification emails
        if (question && question.trim() !== '') {
            
            // Send notification to YOU
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: 'Wander Glamping <onboarding@resend.dev>',
                    to: 'info@gowanderglamping.com',
                    subject: `New Question from ${email}`,
                    html: `
                        <h2>New Question from Landing Page</h2>
                        <p><strong>From:</strong> ${email}</p>
                        <p><strong>Question:</strong></p>
                        <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">${question}</p>
                        <p><strong>Source:</strong> ${source || 'questions_form'}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
                        <hr>
                        <p><a href="mailto:${email}">Click here to reply directly</a></p>
                    `
                })
            });

            // Send confirmation to THEM
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: 'Wander Glamping <onboarding@resend.dev>',
                    to: email,
                    subject: 'We Got Your Question!',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #1a3a2e;">Thanks for reaching out!</h2>
                            <p>We received your question:</p>
                            <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; font-style: italic;">"${question}"</p>
                            <p>We'll get back to you within 2 hours with a thoughtful response.</p>
                            <p>In the meantime, feel free to explore more about the Bali Dome:</p>
                            <p><a href="https://bali.gowanderglamping.com" style="color: #1a3a2e;">bali.gowanderglamping.com</a></p>
                            <br>
                            <p>Warmly,<br>The Wander Glamping Team</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #888;">Paris, Texas · 90 minutes from Dallas</p>
                        </div>
                    `
                })
            });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to submit' });
    }
}
