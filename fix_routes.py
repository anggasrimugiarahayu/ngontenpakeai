import re

def fix_file(filepath, feature):
    with open(filepath, "r") as f:
        content = f.read()

    # Fix the typo first
    content = content.replace(
        'await getDefaultAiModel, getFallbackAiModel("gemini-2.5-flash")',
        'await getDefaultAiModel("gemini-2.5-flash")'
    )
    
    # We need to replace the generateContent block with try-catch
    # Let's use a simpler string replacement
    
    if feature == "master-blueprint":
        old_block = """
    const response = await ai.models.generateContent({
      model: await getDefaultAiModel("gemini-2.5-flash"),
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });
"""
        new_block = """
    let response;
    try {
      response = await ai.models.generateContent({
        model: await getDefaultAiModel("gemini-2.5-flash"),
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        }
      });
    } catch (error: any) {
      const errStr = String(error?.message || "");
      if (error?.status === 503 || error?.status >= 500 || errStr.toLowerCase().includes('high demand') || errStr.toLowerCase().includes('overloaded') || errStr.toLowerCase().includes('internal')) {
        console.warn("[Fallback] Master Blueprint server overloaded. Retrying with fallback model...");
        response = await ai.models.generateContent({
          model: await getFallbackAiModel(),
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          }
        });
      } else {
        throw error;
      }
    }
"""
    else:
        old_block = """
    const response = await ai.models.generateContent({
      model: await getDefaultAiModel("gemini-2.5-flash"),
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      }
    });
"""
        new_block = """
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
"""
    
    # Strip trailing newlines just in case
    content = content.replace(old_block.strip(), new_block.strip())
    
    with open(filepath, "w") as f:
        f.write(content)

fix_file("src/app/api/ai/master-blueprint/route.ts", "master-blueprint")
fix_file("src/app/api/bio-builder/generate/route.ts", "bio-builder")

print("Files fixed")
