import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    const { nodes, edges, systemContext } = await req.json();

    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const nodeMapping = nodes.map((n: any) => `${n.id} is labeled as "${n.data.label}"`).join(", ");

    const prompt = `
      You are an expert Embedded Systems Engineer. 
    
      CONTEXT: ${systemContext}

      MAP: ${nodeMapping}

      TRANSITIONS: ${edges.map((e: any) => `From ${e.source} to ${e.target} on event ${e.label}`).join("; ")}

      TASK:
      Represent this State Machine as a JSON object with two fields:
      1. "c_code": A complete header file (.h) with an example of how to use it. 
      2. "audit": A safety audit of the logic formatted in RICH MARKDOWN. 
        - Use headers (###) for sections.
        - Use bolding for critical warnings.
        - Use bullet points for suggestions.
        - Use backticks for code symbols (e.g. \`STATE_IDLE\`).

      Return ONLY valid JSON.
  `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const cleanedJson = responseText.replace(/```json|```/g, "");
        return new Response(cleanedJson);
        // return new Response(JSON.stringify({output: ""}));
    } catch (error) {
        return new Response(JSON.stringify({ error: "API Key invalid or limit hit" }), { status: 500 });
    }
}
