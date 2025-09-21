import React, { useState } from "react";

function Chatbot() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/ask_ai?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setAnswer("Ocean AI cannot respond right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Ask Ocean AI</h3>
      <input
        type="text"
        placeholder="Ask about fishing or biodiversity"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "8px", width: "300px", marginRight: "10px" }}
      />
      <button onClick={handleAsk} style={{ padding: "8px 16px" }}>
        Ask
      </button>
      {loading && <p>Loading...</p>}
      {answer && <p style={{ marginTop: "10px" }}>{answer}</p>}
    </div>
  );
}

export default Chatbot;
