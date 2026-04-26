const { GoogleGenerativeAI } = require("@google/generative-ai");

const askAI = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "API Key missing" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const { question, contextData } = req.body;

        if (!question) {
            return res.status(400).json({ message: "Question is required" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const prompt = `
You are SMS AI, assistant for a School Management System.

Admin: ${contextData?.adminName || "User"}
School: ${contextData?.schoolName || "School"}

Expenses:
${JSON.stringify(contextData?.expenses?.slice(0, 5) || [])}

Question:
${question}
`;

        const result = await model.generateContent(prompt);

        // ✅ SAFE extraction
        const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text 
                  || "No response from AI";

        return res.status(200).json({ answer: text });

    } catch (error) {
        console.error("AI ERROR:", error);

        return res.status(500).json({
            message: "AI failed",
            error: error.message
        });
    }
};

module.exports = { askAI };