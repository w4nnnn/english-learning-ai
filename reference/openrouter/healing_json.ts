import OpenRouter from '@openrouter/sdk';

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

async function jsonResponseWithHealing() {
  try {
    const response = await client.chat.send({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: "Buatkan data produk dengan nama, harga, dan deskripsi untuk sebuah laptop gaming"
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "Product",
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Nama produk"
              },
              price: {
                type: "number",
                description: "Harga dalam Rupiah"
              },
              description: {
                type: "string",
                description: "Deskripsi produk"
              },
              category: {
                type: "string",
                description: "Kategori produk"
              }
            },
            required: ["name", "price", "description"]
          }
        }
      },
      plugins: [
        { id: "response-healing" }
      ],
      stream: false
    });

    const content = response.choices[0].message.content;
    if (content) {
      const product = JSON.parse(content);
      console.log("Data Produk:");
      console.log(`Nama: ${product.name}`);
      console.log(`Harga: Rp ${product.price.toLocaleString('id-ID')}`);
      console.log(`Deskripsi: ${product.description}`);
      console.log(`Kategori: ${product.category || 'Tidak disebutkan'}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

jsonResponseWithHealing();
