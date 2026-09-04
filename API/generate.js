export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { image, prompt, style } = req.body || {};
    if (!image || !prompt) return res.status(400).json({ error: "Image et description obligatoires." });
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY n'est pas configurée dans Vercel." });

    const match = image.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);
    if (!match) return res.status(400).json({ error: "Format d'image non pris en charge." });

    const mime = match[1].replace("jpg", "jpeg");
    const buffer = Buffer.from(match[2], "base64");
    const blob = new Blob([buffer], { type: mime });

    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("image", blob, "photo.png");
    form.append("prompt", `Transforme l'image fournie en une œuvre destinée à être imprimée comme tableau décoratif. Préserve fidèlement la personne et ses caractéristiques visuelles lorsque cela est approprié. Style demandé : ${style}. Demande de l'utilisateur : ${prompt}. Image de haute qualité, composition soignée, sans texte ni watermark.`);
    form.append("size", "1024x1024");
    form.append("quality", "high");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "Erreur OpenAI" });

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return res.status(500).json({ error: "Aucune image n'a été retournée." });
    return res.status(200).json({ image: `data:image/png;base64,${b64}` });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
