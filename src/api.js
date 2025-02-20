// Mapping of language codes to full language names
export const languageMap = {
    en: "English",
    pt: "Portuguese",
    es: "Spanish",
    ru: "Russian",
    tr: "Turkish",
    fr: "French",
  };
  
  // Function to detect the language of the given text
  export async function detectLanguage(text) {
    if (!("ai" in self && "languageDetector" in self.ai)) {
      console.error("Language Detector Model is MISSING.");
      return Promise.reject("Language Detector Model is missing.");
    }
  
    try {
      const languageDetector = await self.ai.languageDetector.create();
      const response = await languageDetector.detect(text);
      if (!response || response.length === 0) {
        throw new Error("No language detected.");
      }
      const highestConfidenceLanguage = response.sort(
        (a, b) => b.confidence - a.confidence
      )[0];
      const languageCode = highestConfidenceLanguage.detectedLanguage;
      return languageMap[languageCode] || languageCode;
    } catch (error) {
      console.error("Language detection failed:", error);
      return Promise.reject(error);
    }
  }
  
  // Function to translate text to a target language
  export async function translateText(text, sourceLanguage, targetLanguage) {
    if (!("ai" in self && "translator" in self.ai)) {
      console.error("Translator Model is MISSING.");
      return Promise.reject("Translator Model is missing.");
    }
  
    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
      const isAvailable = translatorCapabilities.languagePairAvailable(
        sourceLanguage,
        targetLanguage
      );
  
      if (!isAvailable) {
        console.error("Translation pair not available.");
        return Promise.reject("This translation pair is not supported.");
      }
  
      const translator = await self.ai.translator.create({
        sourceLanguage,
        targetLanguage,
      });
      return await translator.translate(text);
    } catch (error) {
      console.error("Translation failed:", error);
      return Promise.reject(error);
    }
  }
  
 

export async function summarizeText(text) {
    if (!("ai" in self && "summarizer" in self.ai)) {
      console.error("Summarizer Model is MISSING.");
      return Promise.reject("Summarizer Model is missing. Please ensure your browser supports Chrome's AI APIs.");
    }
  
    try {
      // Check if the summarizer is available
      const capabilities = await self.ai.summarizer.capabilities();
      const { available } = capabilities;
  
      if (available === "no") {
        return Promise.reject("Summarizer API is not available on this device.");
      } else if (available === "readily") {
       
        const summarizer = await self.ai.summarizer.create();
        const summary = await summarizer.summarize(text);
        return summary;
      } else {
        // Summarizer needs to download the model
        throw new Error("Summarizer model is not installed.");
      }
    } catch (error) {
      console.error("Summarization failed:", error);
      return Promise.reject(`Summarization failed: ${error}`);
    }
  }