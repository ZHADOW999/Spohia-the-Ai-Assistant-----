import  { useState, FormEvent, useRef } from "react";
import { EventSourcePolyfill } from 'event-source-polyfill';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import AppSidebar from "./components/app-sidebar";
import { ModeToggle } from "./components/theme-toggle";
import sendbtn from './assets/icons/send.png';

interface MessagePair {
  prompt: string;
  response: string;
}

interface Chat {
  id: string;
  messages: MessagePair[];
}

function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([{ id: "Chat 1", messages: [] }]);
  const [activeChat, setActiveChat] = useState("Chat 1");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return alert("Please enter a prompt");
    setPrompt("");
    setLoading(true);
    setChats(prevChats => prevChats.map(chat =>
      chat.id === activeChat
        ? { ...chat, messages: [...chat.messages, { prompt, response: "" }] }
        : chat
    ));

    const ev = new EventSourcePolyfill(`http://localhost:3001/api/chat?prompt=${encodeURIComponent(prompt)}`, {
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
      } else {
        const chunk = JSON.parse(e.data);
        const text = chunk.choices?.[0].delta?.content || "";
        if (text) {
          responseText += text;
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
        }
      }
    };
    ev.onerror = (err: Event) => {
      console.error("SSE error", err);
      ev.close();
      setLoading(false);
      eventSourceRef.current = null;
    };
  };

  const handleStop = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setLoading(false);
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
    setChats(prev => [...prev, { id: newChatId, messages: [] }]);
    setActiveChat(newChatId);
    setPrompt("");
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setPrompt("");
  };

  const activeChatObj = chats.find(chat => chat.id === activeChat);
  const activeMessages = activeChatObj ? activeChatObj.messages : [];
  const showFixedForm = loading || (activeMessages && activeMessages.length > 0);

  return (
    <SidebarProvider className="bg-background dark:bg-background-dark text-primary dark:text-primary-dark">
      <AppSidebar
        chats={chats.map(chat => chat.id)}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
        <SidebarTrigger size="lg"
 className="cursor-pointer text-5xl mt-10 !text-primary dark:!text-primary-dark  top-0 "/>
      <div className="w-[90%] mx-auto">
        <header className="mt-10 mx-auto w-[80%] text-center mb-[8vh] flex justify-between items-center ">
          <div className="inline-flex items-center gap-2">
            <h1 className="text-4xl font-bold  font-family-semibold  text-primary dark:text-primary-dark">
              Sophia
            </h1>
          </div>
          <ModeToggle/>
        </header>
        <main className="flex flex-col w-[100%] mx-auto max-w-5xl">
          {/* Intro only if no message and not loading */}
          {(!showFixedForm) && (
            <div className="w-full text-xl lg:text-[42px] font-family-semibold text-center">
              <p>Hi, I'm <span className="bg-gradient-to-l from-accent-300 via-accent-100 w-full to-accent-main bg-clip-text text-transparent font-family-bold">Sophia!</span> <br/>
              Your guide to clear & verified Nigerian education data  </p>
            </div>
          )}
          {/* Chat bubbles for prompt/response pairs */}
          {activeMessages && activeMessages.length > 0 && (
            <div className="flex flex-col gap-4 w-full mb-20">
              {activeMessages.map((msg, idx) => (
                <div key={idx} className="flex mb-10 flex-col gap-10">
                  {/* Prompt bubble */}
                  <div className="self-end max-w-[80%] bg-chat-bubble dark:bg-chat-bubble-dark text-black rounded-b-2xl rounded-l-2xl px-5 py-3 font-family-regular shadow-md">
                    {msg.prompt}
                  </div>
                  {/* Response (markdown) */}
                  {msg.response && (
                    <div className="self-start max-w-[100%] prose  text-primary dark:text-primary-dark rounded-b-2xl rounded-r-2xl px-5 py-3 font-family-regular shadow-md ">
                    {/* <div className="bg-background-secondary self-start max-w-[80%] prose dark:bg-[#1f1f1f] text-primary dark:text-primary-dark rounded-b-2xl rounded-r-2xl px-5 py-3 font-family-regular shadow-md "> */}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.response}</ReactMarkdown>
                    </div>
                  )}
                  {/* If this is the last message and loading, show streaming response */}
                  {loading && idx === activeMessages.length - 1 && !msg.response && (
                    <div className="self-start max-w-[80%] text-primary dark:text-primary-dark   rounded-xl px-5 py-3 font-family-regular border border-gray-800">
                      <span className= "dark:bg-primary  italic  text-primary dark:text-primary-dark   font-family-regular loader"></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
        {/* Form: fixed at bottom-[5%] only if loading or chat has message, else normal flow */}
        <form
          onSubmit={handleSubmit}
          className={`flex mt-10 gap-4 h-auto border-border-color border rounded-[40px] items-center lg:w-[50%] mx-auto px-6 dark:border-border-color-dark bg-background-secondary dark:bg-background-secondary-dark py-3 ${showFixedForm ? 'fixed left-0 w-full bottom-[1%] z-50 max-w-2xl mx-auto' : ''}`}
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
            // disabled={loading || !prompt.trim()}
            className="p-3 rounded-full relative cursor-pointer bg-btn-bg dark:bg-background-dark hover:translate-y-[-2px] active:translate-y-0 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
          >
            
              <span className="relative flex items-center justify-center"  title="Stop generation">
                <svg className="animate-spin size-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-3 rounded-[4px] bg-black"></div>
                </div>
              </span>
             
          </button>) : <button
            type="submit"
            // disabled={loading || !prompt.trim()}
            className="p-3 rounded-full relative cursor-pointer bg-btn-bg dark:bg-background-dark hover:translate-y-[-2px] active:translate-y-0 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
          >
              <img src={sendbtn} className="size-7" alt="send button"/>
            
          </button>}
        </form>
      </div>
    </SidebarProvider>
  );
}

export default Home; 