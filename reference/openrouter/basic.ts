import OpenRouter from '@openrouter/sdk';

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

async function basicChat() {
  try {
    const response = await client.chat.send({
      model: "google/gemini-2.0-flash-lite-001",
      messages: [
        { role: "system", content: "Anda adalah asisten yang membantu dalam bahasa Indonesia." },
        { role: "user", content: "Jelaskan tentang TypeScript secara singkat." }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

basicChat();
