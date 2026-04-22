const { GoogleGenerativeAI } = require("@google/generative-ai");

const askAI = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("API KEY missing");
            return res.status(500).json({ message: "API Key missing" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const { question, contextData } = req.body;

        // ✅ UPDATED MODEL
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash" 
        });

        const prompt = `
        You are "SMS AI", assistant for a School Management System.

        Admin: ${contextData?.adminName || "User"}
        School: ${contextData?.schoolName || "School"}

        Expenses Data:
        ${JSON.stringify(contextData?.expenses?.slice(0, 10) || [])}

        Question:
        ${question}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ answer: text });

    } catch (error) {
        console.error("AI ERROR FULL:", error);
        res.status(500).json({
            message: "AI failed",
            error: error.message
        });
    }
};

module.exports = { askAI };