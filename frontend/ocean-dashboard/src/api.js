export const askAI = async (query) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/ask_ai?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.answer || data.error;
  } catch (err) {
    return `Error: ${err.message}`;
  }
};
