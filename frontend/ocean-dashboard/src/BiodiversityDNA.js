// BiodiversityDNA.js
import React, { useState } from "react";

export default function BiodiversityDNA() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const uploadDNA = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/biodiversity/classify", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="card">
      <h3>DNA Classification</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadDNA}>Classify DNA</button>
      {result && (
        <div>
          <p>Snippet: {result.sequence_snippet}</p>
          <p>Predicted Species: {result.predicted_species}</p>
        </div>
      )}
    </div>
  );
}
