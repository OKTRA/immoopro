// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Parse the request body
    const { contractData } = await req.json();
    if (!contractData) {
      return new Response(
        JSON.stringify({ error: "Contract data is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Get the DeepSeek API key from environment variables
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "DeepSeek API key not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Prepare the prompt for DeepSeek based on contract data
    const prompt = generateContractPrompt(contractData);

    // Call the DeepSeek API
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are a legal expert specialized in creating detailed and legally sound contracts. Generate a professional contract in HTML format that can be displayed in a web application.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate contract content" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Format the content as HTML if it's not already
    const formattedContent = formatAsHtml(generatedContent);

    return new Response(JSON.stringify({ content: formattedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-contract function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

/**
 * Generate a detailed prompt for the contract based on the provided data
 */
function generateContractPrompt(contractData: any): string {
  const contractTypes: Record<string, string> = {
    lease: "Contrat de location résidentielle",
    commercial: "Bail commercial",
    seasonal: "Location saisonnière",
    custom: "Contrat personnalisé",
  };

  const contractType = contractTypes[contractData.type] || "Contrat";

  return `
Génère un ${contractType} complet et juridiquement valide en français avec les détails suivants:

Titre: ${contractData.title}
Type de contrat: ${contractType}
Date de début: ${contractData.startDate}
Date de fin: ${contractData.endDate}

Clauses additionnelles spécifiées par le client:
${contractData.additionalTerms || "Aucune clause additionnelle spécifiée"}

Le contrat doit inclure:
- Un en-tête professionnel avec le titre du contrat
- Les parties concernées (bailleur et locataire)
- Description détaillée de la propriété
- Durée du contrat avec dates précises
- Conditions financières (loyer, caution, etc.)
- Obligations des parties
- Conditions de résiliation
- Clauses légales standard pour ce type de contrat en droit français
- Les clauses additionnelles spécifiées ci-dessus
- Section pour signatures

Formate le contrat en HTML propre et structuré, avec des balises appropriées pour les titres, paragraphes et sections. N'utilise pas de CSS inline complexe, juste une structure HTML basique et propre.
`;
}

/**
 * Format the content as HTML if it's not already
 */
function formatAsHtml(content: string): string {
  // Check if content already has HTML structure
  if (content.trim().startsWith("<") && content.includes("</")) {
    return content;
  }

  // If it's markdown or plain text, wrap it in basic HTML
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contrat Généré</title>
</head>
<body>
  <div class="contract-content">
    ${content.replace(/\n/g, "<br>")}
  </div>
</body>
</html>
`;
}
