import  { useState, FormEvent, useRef,useEffect } from "react";
import { EventSourcePolyfill } from 'event-source-polyfill';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SidebarProvider, SidebarTrigger, useSidebar } from "./components/ui/sidebar";
import AppSidebar from "./components/app-sidebar";
import { ModeToggle } from "./components/theme-toggle";
import sendbtn from './assets/icons/send.png';
import SuggestionBtns from "./components/suggestionBtns";
import TypingEffect from "./components/typing-effect";

interface MessagePair {
  prompt: string;
  response: string;
}

interface Chat {
  id: string;
  sessionId: string;
  messages: MessagePair[];
  createdAt: number;
}

// Local storage key
const CHATS_STORAGE_KEY = 'sophia_chats';

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Local storage utilities
const saveChatsToStorage = (chats: Chat[]) => {
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Failed to save chats to localStorage:', error);
  }
};

const loadChatsFromStorage = (): Chat[] => {
  try {
    const stored = localStorage.getItem(CHATS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load chats from localStorage:', error);
  }
  return [];
};

function HomeContent() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const { open: sidebarOpen } = useSidebar();

  // Load chats from localStorage on component mount
  useEffect(() => {
    const storedChats = loadChatsFromStorage();
    if (storedChats.length > 0) {
      setChats(storedChats);
      setActiveChat(storedChats[0].id);
    } else {
      // Create initial chat if no stored chats
      const initialChat: Chat = {
        id: "Chat 1",
        sessionId: generateSessionId(),
        messages: [],
        createdAt: Date.now()
      };
      setChats([initialChat]);
      setActiveChat(initialChat.id);
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      saveChatsToStorage(chats);
    }
  }, [chats]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);
    setStreamingText("");

    // Add the new message to the chat
    setChats(prevChats => prevChats.map(chat =>
      chat.id === activeChat
        ? { ...chat, messages: [...chat.messages, { prompt: currentPrompt, response: "" }] }
        : chat
    ));

    const activeChatObj = chats.find(chat => chat.id === activeChat);
    if (!activeChatObj) {
      setError("Active chat not found");
      setLoading(false);
      return;
    }

    try {
      // First, send the POST request to the new API endpoint
      const response = await fetch('https://sophia-api-l0ai.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentPrompt,
          session_id: activeChatObj.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response data
      const data = await response.json();
      
      // Check if the API returned a direct response (no streaming)
      if (data.response || data.message || data.content) {
        const responseText = data.response || data.message || data.content;
        
        // Simulate streaming by typing out the response character by character
        let currentText = "";
        for (let i = 0; i < responseText.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10)); // 30ms delay between characters
          currentText += responseText[i];
          setStreamingText(currentText);
        }
        
        // Update the chat with the complete response
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === activeChat) {
            const updatedMessages = [...chat.messages];
            updatedMessages[updatedMessages.length - 1] = {
              ...updatedMessages[updatedMessages.length - 1],
              response: responseText
            };
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        }));
        setStreamingText("");
        setLoading(false);
        return;
      }
      
      // Handle different SSE URL formats
      let sseUrl: string;
      if (data.sse_url) {
        sseUrl = data.sse_url;
      } else if (data.stream_url) {
        sseUrl = data.stream_url;
      } else {
        // Fallback to a default SSE endpoint
        sseUrl = `https://sophia-api-l0ai.onrender.com/chat/stream?session_id=${activeChatObj.sessionId}`;
      }

      // Connect to SSE for streaming response
      const ev = new EventSourcePolyfill(sseUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      eventSourceRef.current = ev;
      let responseText = "";
      
      ev.onmessage = (e: MessageEvent) => {
        if (e.data === "[DONE]") {
          ev.close();
          setLoading(false);
          eventSourceRef.current = null;
          setStreamingText("");
          // Update the chat with the complete response
          setChats(prevChats => prevChats.map(chat => {
            if (chat.id === activeChat) {
              const updatedMessages = [...chat.messages];
              updatedMessages[updatedMessages.length - 1] = {
                ...updatedMessages[updatedMessages.length - 1],
                response: responseText
              };
              return { ...chat, messages: updatedMessages };
            }
            return chat;
          }));
        } else {
          try {
            const chunk = JSON.parse(e.data);
            const text = chunk.choices?.[0].delta?.content || chunk.content || chunk.text || "";
            if (text) {
              responseText += text;
              setStreamingText(responseText);
            }
          } catch (err) {
            // If parsing fails, treat the data as plain text
            if (e.data && e.data !== "[DONE]") {
              responseText += e.data;
              setStreamingText(responseText);
            }
          }
        }
      };
      
      ev.onerror = (err: Event) => {
        console.error("SSE error", err);
        setError("A connection error occurred. Please try again.");
        ev.close();
        setLoading(false);
        eventSourceRef.current = null;
        setStreamingText("");
      };
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to connect to server. Please try again later.");
      setLoading(false);
      setStreamingText("");
    }
  };

  const handleStop = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setLoading(false);
      setStreamingText("");
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleNewChat = () => {
    const newChatId = `Chat ${chats.length + 1}`;
    const newChat: Chat = {
      id: newChatId,
      sessionId: generateSessionId(),
      messages: [],
      createdAt: Date.now()
    };
    setChats(prev => [...prev, newChat]);
    setActiveChat(newChatId);
    setPrompt("");
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setPrompt("");
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      if (filtered.length === 0) {
        // Create a new chat if all chats are deleted
        const newChat: Chat = {
          id: "Chat 1",
          sessionId: generateSessionId(),
          messages: [],
          createdAt: Date.now()
        };
        setActiveChat(newChat.id);
        return [newChat];
      }
      // Set the first remaining chat as active if the deleted chat was active
      if (chatId === activeChat) {
        setActiveChat(filtered[0].id);
      }
      return filtered;
    });
  };

  const activeChatObj = chats.find(chat => chat.id === activeChat);
  const activeMessages = activeChatObj ? activeChatObj.messages : [];
  const showFixedForm = loading || (activeMessages && activeMessages.length > 0);

  return (
    <>
      <AppSidebar
        chats={chats.map(chat => ({ id: chat.id, title: chat.id }))}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
        {/* <SidebarTrigger
          size="lg"
          className="cursor-pointer text-5xl mt-10 !text-primary dark:!text-primary-dark z-10  top-0 absolute left-5"
        /> */}
      <div className="w-[90%] mx-auto my-5 relative">
        <header className="mt-10 mx-auto w-[90%] text-center mb-[8vh] flex justify-between items-center ">
          <div className="inline-flex items-center gap-2">
            <h1 className="text-4xl  font-family-bold   text-primary dark:text-primary-dark">
              Sophia
            </h1>
             <SidebarTrigger
          size="lg"
          className="cursor-pointer text-5xl  !text-primary dark:!text-primary-dark z-10  "
        />
          </div>
          <ModeToggle/>
        </header>
        <main>
          <div className="flex relative flex-col w-[100%] mx-auto max-w-5xl">
            {/* Error message */}
            {error && (
              <div className="self-start bg-[#9e4042] p-4 rounded-b-2xl rounded-r-2xl text-white w-auto mb-4">
                {error}
              </div>
            )}
  
            {/* Intro only if no message and not loading */}
            {(!showFixedForm) && (
              <div className="w-full text-xl dark:text-white text-primary lg:text-[42px] font-family-semibold font-semibold text-center">
                {/* <p>Hi, I'm <span className="bg-gradient-to-l from-accent-300 via-accent-100 w-full to-accent-main bg-clip-text text-transparent font-family-bold">Sophia!</span> <br/>
                Your guide to clear & verified Nigerian education data  </p> */}
                <p>Let’s get you the answers you need</p>
              </div>
            )}
            {/* Chat bubbles for prompt/response pairs */}
            {activeMessages && activeMessages.length > 0 && (
              <div className="flex flex-col gap-4 w-full mb-30">
                {activeMessages.map((msg, idx) => (
                  <div key={idx} className="flex mb-10 flex-col gap-10 px-5">
                    {/* Prompt bubble */}
                    <div className="self-end max-w-[80%] h-auto bg-chat-bubble dark:bg-chat-bubble-dark text-black rounded-b-2xl rounded-l-2xl px-5 py-3 font-family-regular shadow-md">
                      {msg.prompt}
                    </div>
                    {/* Response (markdown) */}
                    {msg.response || (loading && idx === activeMessages.length - 1) ? (
                      <div className="self-start max-w-[100%] prose  text-primary dark:text-primary-dark rounded-b-2xl rounded-r-2xl md:px-5 px-0  py-3 font-family-regular shadow-md ">
                        {loading && idx === activeMessages.length - 1 ? (
                          <div>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText || msg.response}</ReactMarkdown>
                            <span className="typing-cursor"></span>
                          </div>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.response}</ReactMarkdown>
                        )}
                      </div>
                    ) : null}
                    {/* If this is the last message and loading, show streaming response */}
                    {loading && idx === activeMessages.length - 1 && !msg.response && (
                      <div className="self-start max-w-[80%] text-primary dark:text-primary-dark rounded-xl px-5 py-3 font-family-regular border border-gray-800">
                        <span className="dark:bg-primary italic text-primary dark:text-primary-dark font-family-regular loader"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div> 
            )}
          </div>
          {/* Form: fixed at bottom-[5%] only if loading or chat has message, else normal flow */}
          <div 
          className={`lg:w-[70%]  mx-auto ${showFixedForm ? 'fixed right-0 sm:w-[70%] w-[90%] lg:w-full bottom-[1%] z-50 max-w-2xl mx-auto' : ''}`}
          style={showFixedForm && sidebarOpen ? { left: '255px' } : showFixedForm ? { left: 0 } : {}}
          >
            <form
              onSubmit={handleSubmit}
              className={`flex flex-col justify-end items-end mt-10 h-auto border-border-color border rounded-xl   px-6 dark:border-border-color-dark bg-background-secondary dark:bg-background-secondary-dark py-3 `}
              // className={`flex flex-col justify-end items-end mt-10 gap-4 h-auto border-border-color border rounded-xl   px-6 dark:border-border-color-dark bg-background-secondary dark:bg-background-secondary-dark py-3 ${showFixedForm ? 'fixed left-0 w-full bottom-[1%] z-50 max-w-2xl mx-auto' : ''}`}
              style={showFixedForm ? {right: 0, left: 0, margin: '0 auto'} : {}}
            >
              <textarea
                ref={textareaRef}
                value={prompt}
                name="prompt"
                onChange={handlePromptChange}
                placeholder="Ask me anything you'd like to know..."
                className="inline-flex items-center w-full text-primary resize-none dark:text-primary-dark font-family-regular focus:outline-none focus:border-0 outline-none border-0 h-full bg-background-secondary dark:bg-background-secondary-dark "
                rows={1}
                style={{overflow: 'hidden'}}
                disabled={loading}
              />
              {loading ? (<button
              onClick={handleStop}
                type="button"
                className="p-2 rounded-full relative cursor-pointer bg-btn-bg dark:bg-background-dark hover:translate-y-[-2px] active:translate-y-0 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
              >
                
                  <span className="relative flex items-center justify-center"  title="Stop generation">
                    <svg className="animate-spin size-7 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path className="opacity-75 " fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-2.5 rounded-[0px] bg-black"></div>
                    </div>
                  </span>
                 
              </button>) : <button
                type="submit"
                disabled={!prompt.trim()}
                className={`p-2.5 rounded-full relative cursor-pointer bg-btn-bg  hover:translate-y-[-2px] active:translate-y-0 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2 ${prompt.trim() ? 'bg-primary ' : 'cursor-not-allowed'}`}
              >
                  <img src={sendbtn} className="size-6" alt="send button"/>
                
              </button>}
            </form>
            {!showFixedForm && <SuggestionBtns/>}
          </div>
        </main>
      </div>
    </>
  );
}

function Home() {
  return (
    <SidebarProvider className=" bg-background dark:bg-background-dark text-primary dark:text-primary-dark">
      <HomeContent />
    </SidebarProvider>
  );
}

export default Home; 