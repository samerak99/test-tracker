module.exports = async function (context, req) {
  const userMessage = req.body && req.body.message;
  if (!userMessage) {
    context.res = { status: 400, body: { error: "Missing 'message' in request body" } };
    return;
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are a helpful assistant inside a personal task tracker app." }]
          },
          contents: [
            { role: "user", parts: [{ text: userMessage }] }
          ]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      context.res = { status: 502, body: { error: "AI service error", details: errText } };
      return;
    }

    const data = await response.json();
    const reply = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text;
    context.res = { body: { reply: reply || "Sorry, I couldn't generate a response." } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "AI error: " + err.message } };
  }
};
