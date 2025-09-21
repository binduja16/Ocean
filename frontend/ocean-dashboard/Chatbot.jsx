// Chatbot.jsx
import React, { useState } from "react";
import { askAI } from "./api";

const Chatbot = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    if (!question) return;
    const res = await askAI(question);
    setAnswer(res);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Ask the Ocean AI 🌊</h3>
      <input
        type="text"
        placeholder="Type your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ padding: "8px", width: "250px", marginRight: "10px" }}
      />
      <button onClick={handleAsk} style={{ padding: "8px 16px" }}>Ask</button>
      {answer && <p style={{ marginTop: "10px" }}>{answer}</p>}
    </div>
  );
};

export default Chatbot;
