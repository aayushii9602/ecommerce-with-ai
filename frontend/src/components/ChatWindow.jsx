import React, { useState, useRef, useEffect } from 'react';

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! Welcome to our store. How can I help you today?",
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT;
const HOST = import.meta.env.VITE_HOST;

  // API Functions
  const sendChatMessage = async (message, chatId = null) => {
    try {
      const url = chatId 
        ? `http://${HOST}:${BACKEND_PORT}/api/v1/chat/${chatId}`
        : `http://${HOST}:${BACKEND_PORT}/api/v1/chat`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error("Send message failed:", err);
      throw new Error("Failed to send message");
    }
  };

  const getChatHistory = async (chatId) => {
    try {
      const response = await fetch(`http://${HOST}:${BACKEND_PORT}/api/v1/chat/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      if (response.status === 304) {
        console.log('304 Not Modified - trying to handle anyway');
        // Return empty result to trigger fallback
        return { chats: { messages: [] } };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error("Get chat history failed:", err);
      throw new Error("Failed to load chat history");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing chat when chat window opens
  useEffect(() => {
    if (isOpen && !chatId) {
      // Load chat history with your test ID
      const testChatId = "9b07f11b-3877-44bc-bccd-513d74a3cd9b";
      console.log('Chat window opened - loading history for:', testChatId);
      loadChatHistory(testChatId);
    }
  }, [isOpen]);

  const loadChatHistory = async (chatId) => {
    try {
      setIsLoading(true);
      // Use the provided chatId or fallback to your test ID
      const targetChatId = chatId || "9b07f11b-3877-44bc-bccd-513d74a3cd9b";
      console.log('Loading chat history for ID:', targetChatId);
      
      const chatHistory = await getChatHistory(targetChatId);
      console.log('Chat history response:', chatHistory);
      
      // Handle your specific API response format
      let historyMessages = [];
      
      if (chatHistory && chatHistory.chats && chatHistory.chats.messages && Array.isArray(chatHistory.chats.messages)) {
        historyMessages = chatHistory.chats.messages;
      } else if (chatHistory && chatHistory.messages && Array.isArray(chatHistory.messages)) {
        historyMessages = chatHistory.messages;
      } else if (Array.isArray(chatHistory)) {
        historyMessages = chatHistory;
      }
      
      if (historyMessages.length > 0) {
        // Keep the welcome message and add chat history
        const welcomeMessage = {
          id: 1,
          text: "Hi there! Welcome to our store. How can I help you today?",
          sender: 'support',
          timestamp: new Date()
        };
        
        const formattedMessages = historyMessages.map((msg, index) => {
          // Handle different message formats
          let messageText = "";
          let messageSender = "support";
          
          // Parse the content
          if (msg.content) {
            if (msg.role === 'user') {
              messageText = msg.content;
              messageSender = 'user';
            } else if (msg.role === 'AI') {
              // Parse AI response which contains JSON string
              try {
                const parsedContent = JSON.parse(msg.content);
                if (parsedContent.products && Array.isArray(parsedContent.products)) {
                  const products = parsedContent.products;
                  messageText = `I found ${products.length} product(s) for you:\n\n`;
                  products.forEach((product, idx) => {
                    messageText += `${idx + 1}. ${product.productName}\n`;
                    messageText += `   Supplier: ${product.supplierName}\n`;
                    messageText += `   Price: ${product.price}\n`;
                    messageText += `   Available: ${product.quantityAvailable} units\n`;
                    if (product.oversell) messageText += `   ✓ Oversell available\n`;
                    messageText += '\n';
                  });
                } else if(parsedContent.order_details) {
                    console.log("msg.conetent",msg.content)
                    const order_details=parsedContent.order_details;
                messageText += `Hello 👋, I found your order details. Your order Id  ${order_details.order_id}.The current status of your order is ${order_details.status}. Would you like me to help you with tracking this order or making any changes to it?`;

                console.log("messageText",messageText)
                }
                else{
                    messageText=msg.content
                }
              } catch (e) {
                messageText = msg.content;
              }
              messageSender = 'support';
            } else {
              messageText = msg.content;
            }
          } else if (msg.text) {
            messageText = msg.text;
          } else {
            messageText = JSON.stringify(msg);
          }
          
          return {
            id: index + 2,
            text: messageText,
            sender: messageSender,
            timestamp: new Date(msg.createdAt || msg.timestamp || Date.now())
          };
        });
        
        setMessages([welcomeMessage, ...formattedMessages]);
        setChatId(targetChatId);
        console.log('Loaded', formattedMessages.length, 'messages from history');
      } else {
        console.log('No messages found in chat history');
        // Just keep the welcome message
        setMessages([{
          id: 1,
          text: "Hi there! Welcome to our store. How can I help you today?",
          sender: 'support',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // On error, just show welcome message
      setMessages([{
        id: 1,
        text: "Hi there! Welcome to our store. How can I help you today?",
        sender: 'support',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageToAPI = async (message, currentChatId = null) => {
    try {
      console.log('Sending message:', message);
      console.log('Chat ID:', currentChatId);
      
      const result = await sendChatMessage(message, currentChatId);
      console.log('API Response:', result);
      
      // If this is a new chat, save the chatId in component state
      if (!currentChatId && result.chatId) {
        setChatId(result.chatId);
      }

      // Handle different possible response formats
      let responseText = "";
      
      if (result.response) {
        // If response is an object (like {products: [...]})
        if (typeof result.response === 'object' && result.response !== null) {
          if (result.response.products) {
            // Handle product search results
            const products = result.response.products;
            if (Array.isArray(products) && products.length > 0) {
              responseText = `I found ${products.length} product(s) for you:\n\n`;
              products.slice(0, 3).forEach((product, index) => {
                responseText += `${index + 1}. ${product.name || product.title || 'Product'}\n`;
                if (product.price) responseText += `   Price: ${product.price}\n`;
                if (product.description) responseText += `   ${product.description.substring(0, 100)}...\n`;
                responseText += '\n';
              });
              if (products.length > 3) {
                responseText += `... and ${products.length - 3} more products.`;
              }
            } else {
              responseText = "I couldn't find any products matching your search.";
            }
          } else {
            // Handle other object responses
            responseText = JSON.stringify(result.response, null, 2);
          }
        } else {
          // Response is a string
          responseText = result.response;
        }
      } else if (result.message) {
        responseText = typeof result.message === 'string' ? result.message : JSON.stringify(result.message);
      } else if (result.reply) {
        responseText = typeof result.reply === 'string' ? result.reply : JSON.stringify(result.reply);
      } else if (result.answer) {
        responseText = typeof result.answer === 'string' ? result.answer : JSON.stringify(result.answer);
      } else if (typeof result === 'string') {
        responseText = result;
      } else {
        responseText = "I'm here to help! Could you please provide more details?";
      }

      return {
        text: responseText,
        chatId: result.chatId || currentChatId
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        chatId: currentChatId
      };
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Send message to API
      const apiResponse = await sendMessageToAPI(messageToSend, chatId);
      
      // Update chatId if it's a new chat
      if (apiResponse.chatId && !chatId) {
        setChatId(apiResponse.chatId);
      }

      // Add support response - use the actual API response
      const supportResponse = {
        id: Date.now() + 1,
        text: apiResponse.text,
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, supportResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 2,
        text: "Sorry, something went wrong. Please try again.",
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Reset chat function
  const startNewChat = () => {
    setChatId(null);
    setMessages([{
      id: 1,
      text: "Hi there! Welcome to our store. How can I help you today?",
      sender: 'support',
      timestamp: new Date()
    }]);
  };

  const chatButtonStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
  };

  const chatButtonHoverStyle = {
    backgroundColor: '#1d4ed8',
    transform: 'scale(1.1)',
  };

  const notificationBadgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  const chatWindowStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    width: '320px',
    height: isMinimized ? '48px' : '384px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  };

  const headerStyle = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  };

  const statusDotStyle = {
    width: '12px',
    height: '12px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    marginRight: '8px',
  };

  const buttonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    marginLeft: '8px',
    transition: 'background-color 0.2s',
    fontSize: '18px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const newChatButtonStyle = {
    ...buttonStyle,
    fontSize: '14px',
    width: 'auto',
    padding: '4px 8px',
    marginRight: '8px',
  };

  const messagesAreaStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const userMessageStyle = {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    borderBottomRightRadius: '2px',
    maxWidth: '240px',
    wordWrap: 'break-word',
  };

  const supportMessageStyle = {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    color: '#374151',
    padding: '8px 12px',
    borderRadius: '8px',
    borderBottomLeftRadius: '2px',
    border: '1px solid #e5e7eb',
    maxWidth: '240px',
    wordWrap: 'break-word',
  };

  const timestampStyle = {
    fontSize: '11px',
    marginTop: '4px',
    opacity: 0.7,
  };

  const typingIndicatorStyle = {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    borderBottomLeftRadius: '2px',
    padding: '8px 12px',
    display: 'flex',
    gap: '4px',
  };

  const dotStyle = {
    width: '8px',
    height: '8px',
    backgroundColor: '#9ca3af',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out',
  };

  const inputAreaStyle = {
    borderTop: '1px solid #e5e7eb',
    padding: '16px',
    display: 'flex',
    gap: '8px',
  };

  const inputStyle = {
    flex: 1,
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 12px',
    outline: 'none',
    fontSize: '14px',
  };

  const sendButtonStyle = {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
    minWidth: '40px',
  };

  const sendButtonDisabledStyle = {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '16px',
    color: '#6b7280',
    fontSize: '14px',
  };

  if (!isOpen) {
    return (
      <div style={chatButtonStyle}>
        <button
          onClick={() => setIsOpen(true)}
          style={chatButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = chatButtonHoverStyle.backgroundColor;
            e.target.style.transform = chatButtonHoverStyle.transform;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'scale(1)';
          }}
        >
          💬
          <div style={notificationBadgeStyle}>1</div>
        </button>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            } 40% {
              transform: scale(1);
            }
          }
          
          .typing-dot-1 { animation-delay: -0.32s; }
          .typing-dot-2 { animation-delay: -0.16s; }
          .typing-dot-3 { animation-delay: 0s; }
          
          .chat-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .chat-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          .chat-scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          
          .chat-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}
      </style>
      
      <div style={chatWindowStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={statusDotStyle}></div>
            <span style={{ fontWeight: '600' }}>Customer Support</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={startNewChat}
              style={newChatButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              title="Start new chat"
            >
              New
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={buttonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              −
            </button>
            <button
              onClick={() => setIsOpen(false)}
              style={buttonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div style={messagesAreaStyle} className="chat-scrollbar">
              {isLoading && (
                <div style={loadingStyle}>Loading chat history...</div>
              )}
              
              {!isLoading && messages.map((message) => (
                <div key={message.id}>
                  <div style={message.sender === 'user' ? userMessageStyle : supportMessageStyle}>
                    <div style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </div>
                    <p style={{
                      ...timestampStyle,
                      color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#6b7280'
                    }}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={typingIndicatorStyle}>
                  <div style={{ ...dotStyle }} className="typing-dot-1"></div>
                  <div style={{ ...dotStyle }} className="typing-dot-2"></div>
                  <div style={{ ...dotStyle }} className="typing-dot-3"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={inputAreaStyle}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendMessage();
                  }
                }}
                placeholder={isLoading ? "Please wait..." : "Type your message..."}
                disabled={isLoading}
                style={{
                  ...inputStyle,
                  opacity: isLoading ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  if (!isLoading) {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSendMessage();
                }}
                disabled={inputMessage.trim() === '' || isLoading}
                style={{
                  ...sendButtonStyle,
                  ...(inputMessage.trim() === '' || isLoading ? sendButtonDisabledStyle : {})
                }}
                onMouseEnter={(e) => {
                  if (inputMessage.trim() !== '' && !isLoading) {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (inputMessage.trim() !== '' && !isLoading) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatWindow;