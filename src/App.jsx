import React, { useState, useEffect, useRef } from "react";
import { detectLanguage, translateText, summarizeText, languageMap } from "./api";
import "./App.css";


const languageOptions = [
  { label: "English", value: "en" },
  { label: "Portuguese", value: "pt" },
  { label: "Spanish", value: "es" },
  { label: "Russian", value: "ru" },
  { label: "Turkish", value: "tr" },
  { label: "French", value: "fr" },
];

function App() {
  const [inputText, setInputText] = useState(""); 
  const [messages, setMessages] = useState([]); // Chat messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null); // Track which message's dropdown is active
  const errorRef = useRef(null); 
  const outputAreaRef = useRef(null); 


  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [error]);

  // Function to handle text submission
  const handleTextSubmit = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const detectedLang = await detectLanguage(inputText);

      // Add user message to chat
      const newMessage = {
        id: Date.now(), // Unique ID for each message
        text: inputText,
        type: "user",
        language: detectedLang,
        timestamp: new Date().toLocaleTimeString(),
        translatedText: null, // Store translated text here
        summarizedText: null, // Store summarized text here
      };
      setMessages((prev) => [...prev, newMessage]);

      // Reset input text
      setInputText("");
    } catch (error) {
      setError(error + ". The Chrome inbuilt AI is not available on your browser or your device does not support it!");
    }

    setLoading(false);
  };

  // Function to handle translation
  const handleTranslate = async (messageId, targetLanguage) => {
    setLoading(true);
    setError("");

    try {
      const messageToTranslate = messages.find((msg) => msg.id === messageId);
      if (!messageToTranslate) return;

      const translation = await translateText(
        messageToTranslate.text,
        Object.keys(languageMap).find(
          (key) => languageMap[key] === messageToTranslate.language
        ) || "en",
        targetLanguage
      );

      // Update the message with the translated text
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, translatedText: translation } : msg
        )
      );
    } catch (error) {
      setError("Failed to translate. " + error);
    }

    setLoading(false);
    setActiveDropdownIndex(null); // Close the dropdown after translation
  };

  // Function to handle summarization
  const handleSummarize = async (messageId) => {
    setLoading(true);
    setError("");

    try {
      const messageToSummarize = messages.find((msg) => msg.id === messageId);
      if (!messageToSummarize) return;

      const summary = await summarizeText(messageToSummarize.text);

      // Update the message with the summarized text
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, summarizedText: summary } : msg
        )
      );
    } catch (error) {
      setError(error); // Display the error message to the user
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <h1 className="app-title">AI Text Processor</h1>
      <div className="chat-box">
        <div className="output-area" ref={outputAreaRef}>
          {messages.map((message, index) => (
            <div key={message.id} className="message-container">
              {message.type === "user" ? (
                <div className="message-bubble user">
                  <p>{message.text}</p>
                  <small>
                    {message.language} | {message.timestamp}
                  </small>
                  <div className="action-buttons">
                    {message.text.length > 150 && message.language === "English" && (
                      <button
                        className="action-button summarize-button"
                        onClick={() => handleSummarize(message.id)}
                        disabled={loading}
                        aria-label="Summarize"
                      >
                        Summarize
                      </button>
                    )}
                    <div className="translate-dropdown">
                      <button
                        className="action-button translate-button"
                        onClick={() =>
                          setActiveDropdownIndex(activeDropdownIndex === index ? null : index)
                        }
                        disabled={loading}
                        aria-label="Translate"
                      >
                        Translate
                      </button>
                      {activeDropdownIndex === index && (
                        <div className="language-dropdown">
                          {languageOptions.map((lang) => (
                            <div
                              key={lang.value}
                              className="language-option"
                              onClick={() => handleTranslate(message.id, lang.value)}
                              role="button"
                              tabIndex={0}
                              aria-label={`Translate to ${lang.label}`}
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleTranslate(message.id, lang.value)
                              }
                            >
                              {lang.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {message.translatedText && (
                    <div className="nested-message bot">
                      <p>{message.translatedText}</p>
                      <small>Translated</small>
                    </div>
                  )}
                  {message.summarizedText && (
                    <div className="nested-message bot">
                      <p>{message.summarizedText}</p>
                      <small>Summary</small>
                    </div>
                  )}
                </div>
              ) : (
                <div className="message-bubble bot">
                  <p>{message.text}</p>
                  <small>
                    {message.language} | {message.timestamp}
                  </small>
                </div>
              )}
            </div>
          ))}
          {error && (
            <div className="error-message" ref={errorRef}>
              {error}
            </div>
          )}
        </div>
        <div className="input-area">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your text here..."
            disabled={loading}
            aria-label="Input text"
          ></textarea>
          <button
            onClick={handleTextSubmit}
            disabled={loading || !inputText.trim()}
            aria-label="Send"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;