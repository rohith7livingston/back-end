const axios = require("axios");

const summarizeText = async (text) => {
  const data = JSON.stringify({
    inputs: text,
    parameters: {
      max_length: 100,
      min_length: 30,
    },
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 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",
    },
    data: data,
  };

  try {
    const res = await axios.request(config);
    // Assuming the Hugging Face API returns an array with one object having summary_text
    return res.data[0].summary_text;
  } catch (error) {
    console.log("Summarizer error:", error.message);
    throw error;
  }
};

module.exports = summarizeText;
