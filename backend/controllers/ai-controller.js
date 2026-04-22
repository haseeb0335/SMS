const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access the key from process.env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askAI = async (req, res) => {
    try {
        const { question, contextData } = req.body;
        
        // Initialize the Gemini Pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Prepare a prompt that gives the AI the "context" of your school
        const prompt = `
            You are "SMS AI", an intelligent assistant for a School Management System.
            
            Current Context:
            - Admin User: ${contextData?.adminName || "Admin"}
            - Total Expenses Found: ${contextData?.expenses?.length || 0}
            - Data Preview: ${JSON.stringify(contextData?.expenses?.slice(0, 20))}

            User Question: "${question}"

            Instructions:
            1. If the user asks about total spending, calculate it from the data.
            2. Be professional and concise.
            3. If you don't have enough data to answer, politely let the user know.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.status(200).json({ answer: text });
    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ 
            message: "The AI is having trouble processing that request.", 
            error: error.message 
        });
    }
};

module.exports = { askAI };