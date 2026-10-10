import re

def patch_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Add import
    content = content.replace(
        'getDefaultAiModel',
        'getDefaultAiModel, getFallbackAiModel'
    )
    
    if "master-blueprint" in filepath:
        response_code = """
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
      if (error.status === 503 || error.status >= 500 || (error.message && (error.message.toLowerCase().includes('high demand') || error.message.toLowerCase().includes('overloaded') || error.message.toLowerCase().includes('internal')))) {
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
        response_code = """
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
      if (error.status === 503 || error.status >= 500 || (error.message && (error.message.toLowerCase().includes('high demand') || error.message.toLowerCase().includes('overloaded') || error.message.toLowerCase().includes('internal')))) {
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
    
    # regex to replace the generateContent block
    if "master-blueprint" in filepath:
        pattern = r"const response = await ai\.models\.generateContent\(\{\s*model: await getDefaultAiModel\(\"gemini-2\.5-flash\"\),\s*contents: userPrompt,\s*config: \{\s*systemInstruction,\s*responseMimeType: 'application/json',\s*\}\s*\}\);"
    else:
        pattern = r"const response = await ai\.models\.generateContent\(\{\s*model: await getDefaultAiModel\(\"gemini-2\.5-flash\"\),\s*contents: userPrompt,\s*config: \{\s*systemInstruction: systemPrompt,\s*responseMimeType: 'application/json',\s*\}\s*\}\);"

    content = re.sub(pattern, response_code.strip(), content)

    with open(filepath, "w") as f:
        f.write(content)


patch_file("src/app/api/ai/master-blueprint/route.ts")
patch_file("src/app/api/bio-builder/generate/route.ts")
print("Routes patched")
