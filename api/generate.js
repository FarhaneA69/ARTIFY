export default {

  async fetch(request) {

    if (request.method !== "POST") {

      return Response.json(
        {
          error: "Méthode non autorisée."
        },
        {
          status: 405
        }
      );

    }


    try {


      const formData =
        await request.formData();


      const image =
        formData.get("image");


      const prompt =
        formData.get("prompt");



      if (!image) {

        return Response.json(
          {
            error: "Aucune image reçue."
          },
          {
            status: 400
          }
        );

      }



      if (!prompt) {

        return Response.json(
          {
            error: "Aucun prompt reçu."
          },
          {
            status: 400
          }
        );

      }



      if (
        !process.env.OPENAI_API_KEY
      ) {

        return Response.json(
          {
            error:
              "La clé OpenAI n'est pas configurée sur Vercel."
          },
          {
            status: 500
          }
        );

      }



      const openaiFormData =
        new FormData();



      openaiFormData.append(

        "model",

        "gpt-image-1.5"

      );



      openaiFormData.append(

        "image",

        image,

        image.name || "image.png"

      );



      openaiFormData.append(

        "prompt",

        prompt

      );



      openaiFormData.append(

        "quality",

        "medium"

      );



      openaiFormData.append(

        "size",

        "auto"

      );



      openaiFormData.append(

        "input_fidelity",

        "high"

      );



      const response =
        await fetch(

          "https://api.openai.com/v1/images/edits",

          {

            method: "POST",

            headers: {

              "Authorization":

                `Bearer ${process.env.OPENAI_API_KEY}`

            },

            body:
              openaiFormData

          }

        );



      const data =
        await response.json();



      if (!response.ok) {

        console.error(
          data
        );


        return Response.json(

          {

            error:

              data?.error?.message ||

              "Erreur OpenAI."

          },

          {

            status:
              response.status

          }

        );

      }



      const base64Image =

        data?.data?.[0]?.b64_json;



      if (!base64Image) {

        return Response.json(

          {

            error:

              "OpenAI n'a pas retourné d'image."

          },

          {

            status: 500

          }

        );

      }



      return Response.json(

        {

          image:

            `data:image/png;base64,${base64Image}`

        }

      );


    }


    catch (error) {


      console.error(
        error
      );


      return Response.json(

        {

          error:

            error.message ||

            "Erreur serveur."

        },

        {

          status: 500

        }

      );


    }


  }


};
