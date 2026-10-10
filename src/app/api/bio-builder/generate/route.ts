import { getDefaultAiModel, getFallbackAiModel } from "@/lib/get-ai-model";
import { getApiKey } from "@/lib/get-api-key";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, payload, blueprintId } = body;
    
    if (!action || !payload || !blueprintId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Fetch Blueprint
    const blueprint = await prisma.masterBlueprint.findUnique({
      where: { id: blueprintId, userId: session.user.id }
    });
    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }
    
    const blueprintContext = JSON.stringify(blueprint.aiResult, null, 2);
    // Determine creator first name
    let creatorFirstName = "Kreator";
    if (session.user.name) {
      creatorFirstName = session.user.name.split(' ')[0];
    }
    
    let systemPrompt = "";
    let userPrompt = "";

    if (action === 'generate-usernames') {
      systemPrompt = `[ROLE]

You are an Elite Instagram Strategy & Brand Naming Expert.

[TASK]

Perform a comprehensive analysis of the ENTIRE Master Blueprint JSON without exception, including the 4 Ikigai pillars, all demographic and psychographic data, positioning, core values, core message, brand personality, target audience, expertise, value proposition, and business goals.

Based on this analysis, generate EXACTLY 8 Instagram Username variations with exceptional brandability for long-term personal branding. Every username should resonate deeply with the target audience's psychographic profile while accurately reflecting the identity and positioning defined in the Master Blueprint.

[USERNAME CREATION RULES - MANDATORY]

1. BRAND & BLUEPRINT ALIGNMENT
Every username MUST clearly reflect the identity, positioning, niche, or core message defined in the Master Blueprint.

2. MEANINGFUL & STRATEGIC
Every username MUST have a clear meaning, concept, or strategic message that relates to the audience's pain points, aspirations, or desired transformation.

Never combine random words simply because they sound good.

STRICTLY PROHIBITED:
Generic greetings or meaningless creator names such as:
- haiangga
- anggaaja
- haloangga

3. EASY TO REMEMBER & SEARCH
Use simple, memorable, and easy-to-pronounce words that naturally fit the target audience.

USERNAME FORMAT (MANDATORY)
- Lowercase letters only (a-z)
- No spaces
- No periods
- No numbers
- No underscores
- No special characters

4. RELEVANT TO THE TARGET AUDIENCE
The username should instantly communicate familiarity and relevance.

When the ideal audience sees it for the first time, they should immediately have a strong sense of the account's topic or brand identity.

5. MAXIMUM 3 WORDS
Each username may contain only 1 to 3 combined words.

Prioritize combinations that are:
- Short
- Memorable
- Distinctive
- Easy to pronounce

Approved style examples:
- ruangngonten
- tolakmager
- catatanbapak
- ruangproduktifmuslim

6. PRIORITIZE BRANDABILITY
Avoid names that are:
- Too generic
- Too literal
- Too niche-specific
- Likely to become irrelevant as the brand expands over time

Choose usernames that can grow with the brand while remaining memorable and distinctive.

7. CREATOR NAME USAGE
Never use the literal placeholder "NamaDepan".

If including the creator's name improves the brand, use:
"${creatorFirstName}"

[OUTPUT]

Generate EXACTLY 8 username variations that fully comply with all of the rules above.

Rank the usernames from the strongest recommendation to the weakest based on:
- Brandability
- Memorability
- Discoverability
- Blueprint alignment
- Long-term branding potential
Output HARUS berformat murni JSON:
{ "usernames": ["str", "str", "str", "str", "str", "str", "str", "str"] }`;
      
      userPrompt = `
Nama Kreator: ${creatorFirstName}
[Konteks Master Blueprint LENGKAP - WAJIB DIBACA SELURUHNYA]
${blueprintContext}
`;
    } 
    else if (action === 'generate-names') {
      const { unameToUse } = payload;
      systemPrompt = `[ROLE]
You are an Elite Instagram Strategy & Personal Branding Expert with deep expertise in Instagram profile optimization, audience positioning, brand messaging, and growth strategy. You excel at transforming a user's expertise, personality, and business goals into a compelling personal brand that attracts the right audience, builds trust, differentiates from competitors, and drives meaningful conversions. Every recommendation you provide is strategic, actionable, and fully aligned with the user's Master Blueprint.

[TASK]
Generate EXACTLY 8 Instagram Profile Name (Headline Name) variations that are highly aligned with the selected Username (@${unameToUse}).
You MUST read and analyze the ENTIRE Master Blueprint without exception, including the user's Ikigai, demographics, psychographics, target audience, pain points, aspirations, positioning, niche, expertise, value proposition, brand voice, and business goals before generating the Profile Names.
Every Profile Name MUST be strategically synchronized with the selected Username and accurately reflect the identity, positioning, and messaging defined in the Master Blueprint.

[CORE PRINCIPLES & MANDATORY RULES]

1. NO DUPLICATION: NEVER copy, repeat, or use the exact same words from the selected Username (@${unameToUse}) as the Profile Name. The Profile Name MUST provide NEW information and add value beyond the Username.
2. BLUEPRINT ALIGNMENT: Every Profile Name MUST be based on the entire Master Blueprint, including the user's niche, target audience (demographics and psychographics), primary pain points, desired outcomes, positioning, expertise, and value proposition.
3. INCLUDE SEARCHABLE KEYWORDS: Prioritize keywords that the target audience is most likely to search for or naturally associate with, based on the psychographic insights from the Master Blueprint. The goal is to improve Instagram discoverability.
4. EASY TO UNDERSTAND: Use simple, clear language. Within 1-2 seconds, visitors should immediately understand what the account is about.
5. CHARACTER LIMIT: Each Profile Name MUST NOT exceed 30 characters, following Instagram's official limit.
6. NAME POSITION RULE (MANDATORY): The creator's name MUST ALWAYS appear at the beginning (left side) before the separator. NEVER place the creator's name at the end. Every Profile Name MUST follow this format: "[Creator Name] | [Strategy]"

[8 REQUIRED FRAMEWORKS - Apply all 8 frameworks in the exact order below]
Use the creator's first name: "${creatorFirstName}" (Shorten it if necessary to fit the character limit).
You may use separators such as "|" or "-" or relevant emojis if they improve readability.

1. Creator Name + Niche
   Clearly communicate the primary topic.
   Example: Bambang | Cari Jodoh

2. Creator Name + Niche Keyword
   Focus on high-intent search keywords related to the niche.
   Example: Bambang | Tips Cari Jodoh

3. Creator Name + Result / Benefit
   Highlight the primary outcome or transformation.
   Example: Bambang | Chat Lancar Gebetan

4. Creator Name + Role
   Establish a clear positioning or professional identity.
   Example: Bambang | Mentor Jomblo

5. Creator Name + Bold Claim
   Present a compelling promise or desired result.
   Example: Bambang | Pasangan 30 Hari

6. Creator Name + Trigger Word
   Use a powerful keyword that directly addresses the audience's primary pain point or desired outcome, based on the Master Blueprint.
   Example: Bambang | Anti ghosting
   
7. Creator Name + Authority Word
   Reinforce credibility and expertise.
   Example: Bambang | Pakar Romantis

8. Creator Name + Unique Brand Title
   Create a memorable brand nickname or signature title.
   Example: Bambang | Dosen Cinta

[EXECUTION]
Generate EXACTLY 8 Instagram Profile Name variations. Rank all recommendations from the strongest to the weakest based on how well they align with the user's Master Blueprint. Prioritize Profile Names that most effectively address the target audience's biggest pain points, desired outcomes, positioning, value proposition, and search intent. The first recommendation should be the strongest and most strategically effective, while the last should be the least compelling among the eight.
Output HARUS murni JSON:
{ "names": ["str", "str", "str", "str", "str", "str", "str", "str"] }`;

      userPrompt = `
Username Terpilih: @${unameToUse}
Nama Depan Kreator: ${creatorFirstName}
[Konteks Master Blueprint LENGKAP - WAJIB DIBACA SELURUHNYA]
${blueprintContext}
`;
    }
    else if (action === 'generate-bios') {
      const { pnameToUse } = payload;
      systemPrompt = `[ROLE]
You are an Elite Instagram Profile Copywriter specializing in crafting concise, highly specific, and conversion-focused Instagram BIOs. You excel at transforming insights from the user's Master Blueprint into compelling BIOs that clearly communicate value, build credibility, attract the right audience, and drive profile visitors to take action. Every BIO you write is strategically aligned with the user's positioning, target audience, brand voice, and business goals.

[TASK]
Generate EXACTLY 8 Instagram BIO variations based on the selected Profile Name: "${pnameToUse}".
Read and follow the ENTIRE Master Blueprint without exception. Every BIO MUST accurately reflect the identity, positioning, target audience, value proposition, brand voice, and overall strategy defined in the Master Blueprint.

[BIO FRAMEWORK THAT HOOKS (WAJIB MUTLAK)]
A high-converting bio is simple, clear, and instantly communicates your value. 
Use this proven 3-line BIO framework for ALL 8 variations:

Baris 1️⃣: What you do + who you help (highlight the main benefit).
Baris 2️⃣: How you help them (include credibility or social proof).
Baris 3️⃣: What people should do next (CTA) and what they'll get.

Example:
🚀 Bantu kreator naikin views & growth followers
📈 Naik 70K followers cuma 3 minggu modal HOOK
👇 Follow biar dapet update terus

Penjelasan:
(1) Call out your target audience and clearly state the benefit they'll get from your content.
(2) Explain what makes your approach different and why people should trust you.
(3) Tell people what they should do next and what they'll gain from taking that action.

[INSTAGRAM BIO CHECKLIST - WAJIB DIPATUHI 100%]
[ ] BIO CHARACTER LIMIT (MANDATORY)- The total length of the BIO MUST NOT exceed 150 characters, including all text, spaces, line breaks, punctuation, and emojis.
[ ] Includes relevant keywords (dari Master Blueprint).
[ ] Does not repeat the headline (DILARANG mengulang kata dari Profile Name).
[ ] Avoids technical terms or jargon (Gunakan bahasa sederhana).
[ ] Does not use hashtags (#) or fancy fonts.
[ ] Does not include links to other pages.
[ ] Jika pakai Emoji/simbol (-), HARUS selaras dengan branding (Maksimal 1 di awal tiap baris).
[ ] The first line communicates a clear benefit.
[ ] The second line provides context or proof for the first line.
[ ] The third line includes a simple Call-to-Action.
[ ] The BIO is short enough to display properly on most mobile screens.
[ ] The Call-to-Action matches the current goal of the profile.
[ ] DILARANG KERAS menggunakan kata "Gue", "Gw", "Lo", "Lu". WAJIB gunakan "Saya", "Aku", atau "Kamu".

[BATAS KARAKTER MATEMATIS SANGAT KETAT]
The total length of Line 1 + Line 2 + Line 3, including spaces, line breaks, and emojis, MUST NOT exceed 150 characters.
- Aim for a total length between 145 and 150 characters whenever possible for optimal display.
- Count every emoji as 2 characters.
- Remove unnecessary filler words to keep the BIO concise. For example, replace "untuk" dengan "utk", or simplify phrases whenever the meaning remains clear.

[FORMAT OUTPUT]
Output HARUS berformat murni JSON seperti ini (Total tepat 8 objek di dalam array bios):
{ 
  "bios": [ 
    { 
      "line1": "[Emoji/Simbol] Teks baris pertama...", 
      "line2": "[Emoji/Simbol] Teks baris kedua...", 
      "line3": "[Emoji/Simbol] Teks baris ketiga..." 
    }
  ] 
}`;

      userPrompt = `
Profile Name Terpilih: ${pnameToUse}
[Data Master Blueprint LENGKAP - WAJIB DIJADIKAN ACUAN UTAMA]:
${blueprintContext}
`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleApiKey: true }
    });
    const apiKey = await getApiKey(dbUser?.googleApiKey);
    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak ditemukan. Silakan tambahkan di Pengaturan." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let response;
    try {
      response = await ai.models.generateContent({
        model: await getDefaultAiModel("gemini-2.5-flash"),
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        }
      });
    } catch (error: any) {
      const errStr = String(error?.message || "");
      if (error?.status === 503 || error?.status >= 500 || errStr.toLowerCase().includes('high demand') || errStr.toLowerCase().includes('overloaded') || errStr.toLowerCase().includes('internal')) {
        console.warn("[Fallback] Bio Builder server overloaded. Retrying with fallback model...");
        response = await ai.models.generateContent({
          model: await getFallbackAiModel(),
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          }
        });
      } else {
        throw error;
      }
    }

    const aiResultStr = response.text;
    if (!aiResultStr) throw new Error("Kosong dari AI");

    
    // Parse JSON
    const jsonMatch = aiResultStr.match(/\{[\s\S]*\}/);
    const cleanJsonStr = jsonMatch ? jsonMatch[0] : aiResultStr.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let result = null;
    try {
      result = JSON.parse(cleanJsonStr);
    } catch (e) {
      console.error("Failed to parse AI JSON:", cleanJsonStr);
      throw new Error("AI returned invalid JSON");
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error generating bio:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
