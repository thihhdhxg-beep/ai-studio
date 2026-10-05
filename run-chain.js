const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { command } = req.body;
    
    const keyNexus = process.env.NEXUS_KEY;
    const keyCipher = process.env.CIPHER_KEY;
    const keyGlitch = process.env.GLITCH_KEY;

    if (!keyNexus || !keyCipher || !keyGlitch) {
        return res.status(500).json({ error: "Vercel এনভায়রনমেন্ট ভেরিয়েবলে এপিআই কি সেট করা নেই, বস!" });
    }

    try {
        const res1 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyNexus}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `You are Nexus, a manager. Address user strictly as "বস" in Bengali. Acknowledge: "${command}". Give a short plan.` }] }] })
        });
        const d1 = await res1.json();
        const nexusText = d1.candidates[0].content.parts[0].text;

        const res2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyCipher}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `You are Cipher, an elite web coder. The Boss wants: "${command}". Write a FULL, gorgeous, responsive HTML & CSS webpage layout. Wrap the ENTIRE HTML code inside markdown code blocks (\`\`\`html ... \`\`\`).` }] }] })
        });
        const d2 = await res2.json();
        const cipherReply = d2.candidates[0].content.parts[0].text;
        const match = cipherReply.match(/```(?:html)?([\s\S]*?)```/);
        const websiteCode = (match && match[1]) ? match[1] : cipherReply;

        const res3 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyGlitch}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `You are Glitch, QA tester. Review briefly in Bengali addressing user as "বস".` }] }] })
        });
        const d3 = await res3.json();
        const glitchText = d3.candidates[0].content.parts[0].text;

        res.status(200).json({
            nexus: nexusText,
            glitch: glitchText,
            code: websiteCode
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "এপিআই প্রসেসিং এ সমস্যা হয়েছে, বস!" });
    }
};
