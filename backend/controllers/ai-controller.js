const { GoogleGenerativeAI } = require("@google/generative-ai");

const askAI = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.log("❌ API KEY MISSING");
            return res.status(500).json({ message: "API key missing" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const { question, contextData } = req.body;

        // ✅ LIMIT DATA (VERY IMPORTANT)
        const safeExpenses = contextData?.expenses?.slice(0, 5) || [];

        const prompt = `
You are a School Management AI.

Admin: ${contextData?.adminName}

Expenses:
${JSON.stringify(safeExpenses)}

Question:
${question}
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        // ✅ FIXED CALL (IMPORTANT)
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const text = result.response.text();

        res.status(200).json({ answer: text });

    } catch (error) {
        console.error("🔥 FULL ERROR:", error);

        res.status(500).json({
            message: "AI failed",
            error: error.message
        });
    }
};

module.exports = { askAI };