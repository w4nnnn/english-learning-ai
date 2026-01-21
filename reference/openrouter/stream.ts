import OpenRouter from '@openrouter/sdk';

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

async function streamingChat() {
  try {
    const stream = await client.chat.send({
      model: "google/gemini-2.0-flash-lite-001",
      messages: [
        { role: "user", content: "Ceritakan sebuah dongeng pendek tentang kucing yang pintar." }
      ],
      stream: true,
      temperature: 0.8
    });

    console.log("Streaming response:");
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
      }
    }
    console.log("\n\nStreaming selesai.");
  } catch (error) {
    console.error("Error:", error);
  }
}

streamingChat();
