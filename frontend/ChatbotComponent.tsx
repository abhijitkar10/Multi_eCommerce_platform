import React, { useState } from "react";

const ChatbotComponent = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const askQuestion = async () => {
    try {
      const response = await fetch("/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Failed to get a response from the server");
      }

      const data = await response.json();
      setAnswer(data.answer);
      setError("");
    } catch (err) {
      setError(err.message);
      setAnswer("");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask me anything..."
      />
      <button onClick={askQuestion}>Ask</button>
      {answer && <p>Answer: {answer}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
};

export default ChatbotComponent;
