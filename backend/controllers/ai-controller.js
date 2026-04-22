const { GoogleGenerativeAI } = require("@google/generative-ai");

const askAI = async (req, res) => {
    try {
        // 1. Check if key exists in environment
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error("Backend Error: GEMINI_API_KEY is missing from environment variables.");
            return res.status(500).json({ message: "Server configuration error: API Key missing." });
        }

        // 2. Initialize inside the request handler
        const genAI = new GoogleGenerativeAI(apiKey);
        const { question, contextData } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            You are "SMS AI", an intelligent assistant for a School Management System.
            Admin: ${contextData?.adminName || "User"}
            Context: ${JSON.stringify(contextData?.expenses?.slice(0, 15) || [])}
            
            Question: "${question}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.status(200).json({ answer: text });
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ message: "AI processing failed", error: error.message });
    }
};

module.exports = { askAI };