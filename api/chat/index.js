module.exports = async function (context, req) {
  const userMessage = req.body && req.body.message;
  if (!userMessage) {
    context.res = { status: 400, body: { error: "Missing 'message' in request body" } };
    return;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
     headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
  "User-Agent": "TaskTrackerApp/1.0"
},
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful assistant inside a personal task tracker app." },
          { role: "user", content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      context.res = { status: 502, body: { error: "AI service error", details: errText } };
      return;
    }

    const data = await response.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message.content;
    context.res = { body: { reply: reply || "Sorry, I couldn't generate a response." } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "AI error: " + err.message } };
  }
};
