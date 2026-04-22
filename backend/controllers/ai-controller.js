const { GoogleGenerativeAI } = require("@google/generative-ai");

const askAI = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        console.log("API KEY:", apiKey ? "FOUND" : "MISSING");

        if (!apiKey) {
            return res.status(500).json({ message: "API Key missing in environment" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const { question, contextData } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const prompt = `
You are "SMS AI", an assistant for a School Management System.

Admin: ${contextData?.adminName || "User"}

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
        console.error("FULL AI ERROR:", error); // 🔥 IMPORTANT
        res.status(500).json({
            message: "AI processing failed",
            error: error.message
        });
    }
};

module.exports = { askAI };