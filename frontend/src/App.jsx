// App.jsx
import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hey there! How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('purple'); // 'purple', 'blue', 'green', 'dark'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to the bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Focus input field when component mounts
    inputRef.current?.focus();
  }, [messages]);

  // Theme configurations
  const themes = {
    purple: {
      gradient: "from-purple-600 via-indigo-600 to-blue-500",
      primary: "bg-purple-600",
      secondary: "bg-indigo-500",
      accent: "bg-blue-600",
      user: "bg-indigo-600",
      bot: "bg-gray-200",
      userText: "text-white",
      botText: "text-gray-800"
    },
    blue: {
      gradient: "from-blue-500 via-cyan-500 to-teal-400",
      primary: "bg-blue-600",
      secondary: "bg-cyan-500",
      accent: "bg-teal-500",
      user: "bg-blue-600",
      bot: "bg-gray-200",
      userText: "text-white",
      botText: "text-gray-800"
    },
    green: {
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      primary: "bg-green-600",
      secondary: "bg-emerald-500",
      accent: "bg-teal-500",
      user: "bg-green-600",
      bot: "bg-gray-200",
      userText: "text-white",
      botText: "text-gray-800"
    },
    dark: {
      gradient: "from-gray-800 via-gray-900 to-black",
      primary: "bg-gray-900",
      secondary: "bg-gray-700",
      accent: "bg-gray-800",
      user: "bg-gray-800",
      bot: "bg-gray-600",
      userText: "text-white",
      botText: "text-gray-200"
    }
  };

  const currentTheme = themes[theme];

  // Change theme function
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Sends a new user message along with the conversation context
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    setError('');

    // Create a new user message and add it to the conversation history
    const newUserMessage = { role: 'user', text: inputValue };
    const updatedConversation = [...messages, newUserMessage];
    // Update state with new message before sending context
    setMessages(updatedConversation);
    setInputValue('');

    // Build the payload with the full conversation context
    const payload = { conversation: updatedConversation };

    try {
      // Show typing indicator immediately
      setMessages((prev) => [...prev, { role: 'bot-typing', text: '' }]);

      const res = await fetch('http://localhost:3000/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data = await res.json();
      const botReply = data.generatedText || 'No response generated.';
      
      // Replace typing indicator with actual message
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.role !== 'bot-typing');
        return [...filtered, { role: 'bot', text: botReply }];
      });
      
    } catch (err) {
      setError(err.message);
      // Remove typing indicator and show error
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.role !== 'bot-typing');
        return [...filtered, { role: 'bot', text: `Error: ${err.message}` }];
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Ctrl+Enter to send message
    if (e.ctrlKey && e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Function to render the avatar based on role
  const renderAvatar = (role) => {
    if (role === 'user') {
      return (
        <div className={`w-8 h-8 rounded-full ${currentTheme.user} shadow-lg flex items-center justify-center text-white font-bold transition-all duration-300 hover:scale-110`}>
          U
        </div>
      );
    } else {
      return (
        <div className={`w-8 h-8 rounded-full ${currentTheme.primary} shadow-lg flex items-center justify-center text-white font-bold transition-all duration-300 hover:scale-110`}>
          G
        </div>
      );
    }
  };

  // Function to render typing indicator
  const renderTypingIndicator = () => {
    return (
      <div className="flex space-x-1 p-2">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
      </div>
    );
  };

  // Format the message text to handle links, code blocks, etc.
  const formatMessageText = (text) => {
    // Convert **bold** to <strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Link detection
    formattedText = formattedText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="text-blue-500 underline" target="_blank">$1</a>');
    
    // Newlines to <br>
    return formattedText.replace(/\n/g, '<br>');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center p-4 transition-all duration-500`}>
      
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[950px] max-w-full md:max-w-6xl mx-2 md:mx-4 flex flex-col overflow-hidden transition-all duration-300">
        <div className={`${currentTheme.secondary} p-4 flex items-center justify-between transition-all duration-300`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${currentTheme.primary} flex items-center justify-center shadow-md transition-all duration-300`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Doctor Asst.</h1>
              <div className="flex items-center">
                <span className="bg-green-400 w-2 h-2 rounded-full mr-2"></span>
                <span className="text-xs text-white opacity-80">Model: Gemini 2.0 Flash</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme selector buttons */}
            <div className="flex space-x-1">
              <button 
                onClick={() => changeTheme('purple')} 
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-600 transition-all duration-300 ${theme === 'purple' ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
              ></button>
              <button 
                onClick={() => changeTheme('blue')} 
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 transition-all duration-300 ${theme === 'purple' ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
              ></button>
              <button 
                onClick={() => changeTheme('green')} 
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-600 transition-all duration-300 ${theme === 'purple' ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
              ></button>
              <button 
                onClick={() => changeTheme('dark')} 
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-600 transition-all duration-300 ${theme === 'purple' ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
              ></button>
            </div>
            
            <button className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className={`flex flex-col space-y-4 p-2 md:p-4 bg-gray-50 dark:bg-gray-900 h-[70vh] md:h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
            Today, {new Date().toLocaleDateString()}
          </div>

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
              {msg.role !== 'user' && msg.role !== 'bot-typing' && 
                <div className="flex-shrink-0 mr-2">
                  {renderAvatar(msg.role)}
                </div>
              }
              
              {msg.role === 'bot-typing' ? (
                <div className={`ml-2 ${currentTheme.bot} rounded-lg rounded-tl-none p-3 shadow-md`}>
                  {renderTypingIndicator()}
                </div>
              ) : (
                <div 
                className={`max-w-[85%] md:max-w-md p-2 md:p-3 text-sm md:text-base rounded-lg shadow-md transition-all duration-300 transform group-hover:scale-[1.01] ${
                    msg.role === 'user' 
                      ? `${currentTheme.user} ${currentTheme.userText} rounded-br-none ml-2` 
                      : `${currentTheme.bot} ${currentTheme.botText} rounded-tl-none mr-2`
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                />
              )}
              
              {msg.role === 'user' && 
                <div className="flex-shrink-0 ml-2">
                  {renderAvatar(msg.role)}
                </div>
              }
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 my-2 rounded shadow-md transition-all duration-300 animate-pulse">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold">Request Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="px-6 pt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Ctrl+Enter to send
        </div>

        {/* Input Field and Send Button */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex relative">
            <input
              ref={inputRef}
              type="text"
              className={`flex-grow p-2 md:p-3 pl-3 md:pl-4 pr-10 md:pr-12 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme === 'dark' ? 'gray' : theme}-500 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 transition-all duration-300`}
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                loading || !inputValue.trim() 
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                  : `${currentTheme.accent} hover:bg-opacity-90`
              } text-white transition-all duration-300`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className={`${currentTheme.secondary} bg-opacity-90 p-3 flex items-center justify-between text-white transition-all duration-300`}>
          <div className="flex items-center space-x-2 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Data is only up to Oct 2023 and the AI models can make mistakes.</p>
          </div>
          <div className="text-xs opacity-80">
            Powered by Gemini 2.0 Flash
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;