export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Méthode non autorisée." },
        { status: 405 }
      );
    }

    try {
      const formData = await request.formData();

      const image = formData.get("image");
      const prompt = formData.get("prompt");

      if (!image || typeof image === "string") {
        return Response.json(
          { error: "Aucune image valide reçue." },
          { status: 400 }
        );
      }

      if (!prompt || !prompt.trim()) {
        return Response.json(
          { error: "Veuillez écrire une description." },
          { status: 400 }
        );
      }

      if (!process.env.OPENAI_API_KEY) {
        return Response.json(
          { error: "OPENAI_API_KEY n'est pas configurée." },
          { status: 500 }
        );
      }

      const openaiFormData = new FormData();

      openaiFormData.append("model", "gpt-image-2");
      openaiFormData.append("prompt", prompt.trim());

      openaiFormData.append(
        "image",
        image,
        image.name || "image.png"
      );

      openaiFormData.append(
        "size",
        "1024x1024"
      );

      const response = await fetch(
        "https://api.openai.com/v1/images/edits",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: openaiFormData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur OpenAI :", data);

        return Response.json(
          {
            error:
              data?.error?.message ||
              "Erreur lors de la génération de l'image."
          },
          {
            status: response.status
          }
        );
      }

      const generatedImage = data?.data?.[0]?.b64_json;

      if (!generatedImage) {
        console.error("Réponse OpenAI :", data);

        return Response.json(
          {
            error: "OpenAI n'a pas retourné d'image."
          },
          { status: 500 }
        );
      }

      return Response.json({
        image: `data:image/png;base64,${generatedImage}`
      });

    } catch (error) {
      console.error("Erreur serveur :", error);

      return Response.json(
        {
          error:
            error?.message ||
            "Erreur serveur inconnue."
        },
        { status: 500 }
      );
    }
  }
};
