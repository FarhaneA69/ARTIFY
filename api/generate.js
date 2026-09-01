export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Méthode non autorisée."
    });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return response.status(500).json({
        error: "La clé OPENAI_API_KEY n'est pas configurée."
      });
    }

    const formData = await request.formData();

    const image = formData.get("image");
    const prompt = formData.get("prompt");

    if (!image || typeof image === "string") {
      return response.status(400).json({
        error: "Aucune image valide reçue."
      });
    }

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return response.status(400).json({
        error: "Veuillez écrire une description."
      });
    }

    const openaiFormData = new FormData();

    openaiFormData.append("model", "gpt-image-2");

    openaiFormData.append(
      "image",
      image,
      image.name || "photo.png"
    );

    openaiFormData.append(
      "prompt",
      prompt.trim()
    );

    openaiFormData.append(
      "size",
      "1024x1024"
    );

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: openaiFormData
      }
    );

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("Erreur OpenAI:", data);

      return response.status(openaiResponse.status).json({
        error:
          data?.error?.message ||
          "Erreur lors de la génération."
      });
    }

    const generatedImage = data?.data?.[0]?.b64_json;

    if (!generatedImage) {
      console.error("Réponse OpenAI inattendue:", data);

      return response.status(500).json({
        error: "L'IA n'a pas retourné d'image."
      });
    }

    return response.status(200).json({
      image: `data:image/png;base64,${generatedImage}`
    });

  } catch (error) {
    console.error("Erreur serveur:", error);

    return response.status(500).json({
      error:
        error?.message ||
        "Erreur interne du serveur."
    });
  }
}
