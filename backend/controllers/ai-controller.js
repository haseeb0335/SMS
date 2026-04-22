const { GoogleGenerativeAI } = require("@google/generative-ai");

// Make sure to add GEMINI_API_KEY to your Vercel/Local .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askAI = async (req, res) => {
    try {
        const { question, contextData } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            You are "SMS AI", an expert school management assistant.
            
            CONTEXT DATA:
            - Admin Name: ${contextData.adminName}
            - School: ${contextData.schoolName}
            - Recent Expenses: ${JSON.stringify(contextData.expenses)}
            
            USER QUESTION: "${question}"
            
            INSTRUCTIONS:
            1. Use the data above to answer specifically.
            2. If asked about total expenses, sum the "amount" fields.
            3. Be professional, concise, and helpful.
            4. If the data isn't there, say you don't have that specific record.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.status(200).json({ answer: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "AI processing failed", error: error.message });
    }
};

module.exports = { askAI };