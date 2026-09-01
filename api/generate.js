export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Méthode non autorisée." },
        { status: 405 }
      );
    }

    try {
      // Récupérer la photo et le prompt envoyés par index.html
      const formData = await request.formData();

      const image = formData.get("image");
      const prompt = formData.get("prompt");

      if (!image) {
        return Response.json(
          { error: "Aucune image reçue." },
          { status: 400 }
        );
      }

      if (!prompt || !prompt.trim()) {
        return Response.json(
          { error: "Veuillez écrire une description." },
          { status: 400 }
        );
      }

      // Vérifier la clé OpenAI
      if (!process.env.OPENAI_API_KEY) {
        return Response.json(
          {
            error:
              "OPENAI_API_KEY n'est pas configurée dans Vercel."
          },
          { status: 500 }
        );
      }

      // Créer les données à envoyer à OpenAI
      const openaiFormData = new FormData();

      openaiFormData.append(
        "model",
        "gpt-image-2"
      );

      openaiFormData.append(
        "image",
        image,
        image.name || "photo.png"
      );

      openaiFormData.append(
        "prompt",
        prompt
      );

      openaiFormData.append(
        "size",
        "1024x1024"
      );

      openaiFormData.append(
        "quality",
        "medium"
      );

      openaiFormData.append(
        "input_fidelity",
        "high"
      );

      // Envoyer la photo + prompt à OpenAI
      const response = await fetch(
        "https://api.openai.com/v1/images/edits",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${process.env.OPENAI_API_KEY}`
          },

          body: openaiFormData
        }
      );

      const data = await response.json();

      // Si OpenAI retourne une erreur
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

      // Récupérer l'image générée
      const generatedImage =
        data?.data?.[0]?.b64_json;

      if (!generatedImage) {
        console.error(data);

        return Response.json(
          {
            error:
              "OpenAI n'a pas retourné d'image."
          },
          { status: 500 }
        );
      }

      // Renvoyer l'image au site
      return Response.json({
        image:
          `data:image/png;base64,${generatedImage}`
      });

    } catch (error) {
      console.error("Erreur serveur :", error);

      return Response.json(
        {
          error:
            error.message ||
            "Erreur serveur."
        },
        { status: 500 }
      );
    }
  }
};
