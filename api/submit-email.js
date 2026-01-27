export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, question, source } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // 1. Add to MailerLite
        await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.MAILERLITE_API_TOKEN
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

        // 2. If there's a question, send emails
        if (question && question.trim() !== '') {
            
            // Send notification to YOU
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
                },
                body: JSON.stringify({
                    from: 'Wander Glamping <send@gowanderglamping.com>',
                    to: 'info@gowanderglamping.com',
                    reply_to: email,
                    subject: '[Bali Dome] New Question from ' + email,
                    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"><div style="background: #1a3a2e; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0; font-size: 24px;">New Question</h1><p style="margin: 5px 0 0 0; opacity: 0.9;">Bali Dome Landing Page</p></div><div style="padding: 25px;"><p style="margin: 0 0 15px 0;"><strong>From:</strong> <a href="mailto:' + email + '" style="color: #1a3a2e;">' + email + '</a></p><p style="margin: 0 0 10px 0;"><strong>Question:</strong></p><div style="background: #f8f6f1; padding: 15px; border-radius: 8px; border-left: 4px solid #1a3a2e; margin-bottom: 15px;">' + question + '</div><p style="margin: 0; color: #666; font-size: 14px;"><strong>Received:</strong> ' + new Date().toLocaleString("en-US", {timeZone: "America/Chicago", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true}) + ' CT</p></div><div style="background: #f5f5f5; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;"><p style="margin: 0; color: #666; font-size: 14px;">Just reply to this email to respond directly to the guest.</p></div></div>'
                })
            });

            // Send confirmation to THEM
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
                },
                body: JSON.stringify({
                    from: 'Wander Glamping <send@gowanderglamping.com>',
                    to: email,
                    reply_to: 'info@gowanderglamping.com',
                    subject: 'We Got Your Question About the Bali Dome!',
                    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"><div style="background: #1a3a2e; color: white; padding: 30px; text-align: center;"><h1 style="margin: 0; font-size: 28px;">Thanks for reaching out!</h1></div><div style="padding: 30px;"><p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">We received your question about the <strong>Bali Dome</strong>:</p><div style="background: #f8f6f1; padding: 20px; border-radius: 8px; border-left: 4px solid #c17a5c; margin-bottom: 25px; font-style: italic; color: #444;">"' + question + '"</div><p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">We will get back to you within <strong>2 hours</strong> with a thoughtful response.</p><p style="margin: 0 0 10px 0; font-size: 16px;">In the meantime, feel free to explore more:</p><p style="margin: 0;"><a href="https://bali.gowanderglamping.com" style="color: #1a3a2e; font-weight: 600;">bali.gowanderglamping.com</a></p></div><div style="background: #f8f6f1; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;"><p style="margin: 0 0 5px 0; font-weight: 600; color: #1a3a2e;">Wander Glamping</p><p style="margin: 0; color: #666; font-size: 14px;">Paris, Texas &bull; 90 minutes from Dallas</p></div></div>'
                })
            });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to submit' });
    }
}
