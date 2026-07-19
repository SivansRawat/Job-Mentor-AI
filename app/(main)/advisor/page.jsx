"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Send, Loader2, Sparkles, MessageSquare, Trash2,
  FileText, Upload, AlertCircle, Award, User, Bot
} from "lucide-react";
import { uploadAndEmbedDocument, clearAllDocuments, chatAdvisor } from "@/actions/rag";
import ReactMarkdown from "react-markdown";

const SUGGESTIONS = [
  "Based on my resume, what are my biggest skill gaps for high-paying roles?",
  "Draft a 30-second elevator pitch summarizing my top professional achievements.",
  "Write a professional email asking for a referral based on my background.",
  "Critique my resume profile. What metrics or action verbs should I add?"
];

export default function AICareerAdvisorPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [embeddedDocs, setEmbeddedDocs] = useState([]);
  
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your AI Career Advisor. Upload your resume or target job descriptions on the left, and ask me anything about your career paths, skill audits, or interview preparation."
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll chat log to bottom when messages update
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatLoading]);

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf" && selectedFile.type !== "text/plain") {
      toast.error("Please upload PDF or TXT files only.");
      return;
    }
    setFile(selectedFile);
    toast.success(`Selected file: ${selectedFile.name}`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
  });

  const handleEmbedDocument = async () => {
    if (!file) {
      toast.error("Please upload a file first.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64File = reader.result.split(",")[1];
        const res = await uploadAndEmbedDocument(base64File, file.name, file.type);
        if (res.success) {
          setEmbeddedDocs((prev) => [...prev, file.name]);
          setFile(null);
          toast.success("Document embedded into your vector profile successfully!");
          
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `System update: I have successfully chunked and embedded "${file.name}" into your semantic memory profile. You can now reference this document in your questions!`
            }
          ]);
        } else {
          toast.error(res.error || "Failed to embed document.");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to embed document.");
      } finally {
        setUploading(false);
      }
    };
  };

  const handleClearDocuments = async () => {
    try {
      const res = await clearAllDocuments();
      if (res.success) {
        setEmbeddedDocs([]);
        toast.success("Semantic document memory cleared.");
        setMessages([
          {
            role: "assistant",
            content: "Semantic memory cleared. I no longer have access to your previous custom documents, but I'm still here to offer general career coaching!"
          }
        ]);
      } else {
        toast.error(res.error || "Failed to clear documents.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear documents.");
    }
  };

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setChatLoading(true);

    try {
      // Package chat logs to maintain context history
      // Keep last 6 messages to keep tokens optimal
      const history = messages.slice(-6);
      const res = await chatAdvisor(textToSend, history);
      
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.responseText }
        ]);
      } else {
        toast.error(res.error || "Failed to send message.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send message.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-title">
          💬 AI Career Advisor (RAG)
        </h1>
        <p className="text-muted-foreground">
          Upload career documents, resumes, or target job postings, and chat with an advisor equipped with vector semantic search.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Context Files Management */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 shadow-lg h-full flex flex-col">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-md flex items-center gap-1.5">
                <FileText className="h-5 w-5 text-primary" /> Document Memory
              </CardTitle>
              <CardDescription>Embed PDF/TXT files into AI context</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-6">
              {/* Dropzone */}
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    {file ? (
                      <>
                        <FileText className="h-8 w-8 text-primary" />
                        <span className="text-xs font-semibold truncate max-w-[120px]">
                          {file.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {isDragActive ? "Drop file" : "Drag PDF/TXT here"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {file && (
                  <Button
                    className="w-full text-xs"
                    onClick={handleEmbedDocument}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Embedding...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        Embed text segments
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Embedded Document Log list */}
              <div className="space-y-4 flex-1 pt-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Active Context Files ({embeddedDocs.length})
                </span>
                {embeddedDocs.length > 0 ? (
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {embeddedDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="text-xs flex items-center justify-between bg-primary/5 p-2 rounded border border-primary/10"
                      >
                        <span className="truncate max-w-[140px] font-mono">{doc}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    No documents embedded in current session. Upload your resume to begin semantic chat.
                  </p>
                )}
              </div>

              {/* Clear memory trigger */}
              {embeddedDocs.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full border-red-500/20 text-red-500 hover:bg-red-500/5 text-xs"
                  onClick={handleClearDocuments}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear Document Memory
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Semantic Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="border-2 shadow-xl flex flex-col h-[550px]">
            {/* Scrollable message screen */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border text-foreground"
                    }`}
                  >
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed border ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground border-primary"
                        : msg.content.includes("System update:")
                        ? "bg-primary/5 text-primary border-primary/20 italic"
                        : "bg-card text-foreground"
                    }`}
                  >
                    {msg.role === "model" || msg.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-4" {...props} />,
                          h4: ({ node, ...props }) => <h4 className="text-sm font-bold mb-2 mt-3" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-start gap-3 flex-row">
                  <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-card text-foreground max-w-[75%] rounded-2xl p-4 text-sm border flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground animate-pulse">Retrieving vector contexts & thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* suggestion prompts chips */}
            {messages.length === 1 && !chatLoading && (
              <div className="px-6 pb-2 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase block">Suggested Prompts</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      className="text-left text-xs bg-muted/40 hover:bg-muted/80 p-2.5 rounded-lg border transition-colors flex items-center justify-between"
                      onClick={() => handleSendMessage(sug)}
                    >
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input form */}
            <div className="p-4 border-t bg-muted/5 flex items-center gap-3">
              <Input
                placeholder={
                  embeddedDocs.length > 0
                    ? "Ask a question about your embedded resume or profile..."
                    : "Upload documents on the left, or ask a general career question..."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !chatLoading) handleSendMessage();
                }}
                disabled={chatLoading}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={chatLoading || !inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Small helper import if missing from UI package
function CheckCircle2(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
