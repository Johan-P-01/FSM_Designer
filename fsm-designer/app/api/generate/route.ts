import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    const { nodes, edges } = await req.json();

    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
    You are an expert Embedded Systems Engineer. 
    I have a State Machine with the following states and transitions:
    States: ${nodes.map((n: any) => n.data.label).join(", ")}
    Transitions: ${edges.map((e: any) => `From ${e.source} to ${e.target} on event ${e.label}`).join("; ")}

    Please generate:
    1. A C header file (.h) using an ENUM for states and a switch-case state machine pattern.
    2. An 'Audit' section: Point out missing safety states (like ERROR or TIMEOUT) or logical dead-ends.
    
    Use a professional firmware style (MISRA-C leaning).

    Return a JSON obect with the following format {"c_code" : ..., "audit" : ..., "}
  `;

    try {
        const result = await model.generateContent(prompt);
        return new Response(JSON.stringify({ output: result.response.text() }));
    } catch (error) {
        return new Response(JSON.stringify({ error: "API Key invalid or limit hit" }), { status: 500 });
    }
}
