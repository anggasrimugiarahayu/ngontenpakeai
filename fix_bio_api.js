const fs = require('fs');
const file = 'src/app/api/bio-builder/generate/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import \{ generateGeminiContent \} from "@\/lib\/gemini";/, 'import { GoogleGenAI } from "@google/genai";');

// Before: const aiResultStr = await generateGeminiContent(userPrompt, systemPrompt);
// We replace it with the GoogleGenAI initialization and call
const callRegex = /const aiResultStr = await generateGeminiContent\(userPrompt, systemPrompt\);/;
const replacement = `
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleApiKey: true }
    });
    const apiKey = dbUser?.googleApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak ditemukan. Silakan tambahkan di Pengaturan." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      }
    });

    const aiResultStr = response.text;
    if (!aiResultStr) throw new Error("Kosong dari AI");
`;
code = code.replace(callRegex, replacement);

fs.writeFileSync(file, code);
