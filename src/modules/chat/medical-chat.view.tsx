'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Loader2Icon, MicIcon, MoreVerticalIcon, SquareIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { PromptInput, PromptInputFooter, type PromptInputMessage, PromptInputTextarea } from '@/components/ai-elements/prompt-input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatMedicalAIText } from '@/lib/medical-chat-format.utils';

const WELCOME_TEXT =
  '¡Hola! 👋 Soy tu asistente de cobertura de salud. Para darte tu copago exacto, primero necesito identificarte. ¿Me compartes tu número de cédula?';

const buildWelcomeMessage = () => ({
  id: 'welcome-' + Date.now(),
  role: 'assistant' as const,
  parts: [{ type: 'text' as const, text: WELCOME_TEXT }],
});

export default function MedicalChatView() {
  const [text, setText] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const welcomeInitialized = useRef(false);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat-medical' }),
    onError: (error) => {
      toast.error('Ocurrió un error de conexión con el asistente.');
      console.error(error);
    },
  });

  useEffect(() => {
    if (!welcomeInitialized.current && messages.length === 0) {
      setMessages([buildWelcomeMessage()]);
      welcomeInitialized.current = true;
    }
  }, [messages.length, setMessages]);

  const isLoading = status === 'submitted' || status === 'streaming';
  const isSubmitDisabled = !text.trim() || isLoading || isRecording || isTranscribing;

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');

    try {
      await sendMessage({ text: content });
    } catch (error) {
      console.error('Error al enviar:', error);
      toast.error('Error al procesar el mensaje.');
    }
  }, [sendMessage, text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitDisabled) handleSubmit();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        await handleTranscribeAndSend(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeAndSend = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Error en transcripción');
      const data = await response.json();
      if (data.text) {
        setText(data.text);
      } else {
        toast.error('No se pudo transcribir el audio.');
      }
    } catch {
      toast.error('Error al procesar el audio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const getMessageText = (message: any) => {
    let raw = typeof message.content === 'string' ? message.content : '';
    if (message.parts) {
      raw = (message.parts as any[]).filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    return raw.trim();
  };

  const resetChat = useCallback(() => {
    setMessages([buildWelcomeMessage()]);
  }, [setMessages]);

  const handleNeedsMoreYes = useCallback(async () => {
    try {
      await sendMessage({ text: 'Sí, necesito ayuda con otra cosa.' });
    } catch (error) {
      console.error('Error al continuar:', error);
      toast.error('Error al continuar la consulta.');
    }
  }, [sendMessage]);

  // Mostrar el botón "¿Necesitas más asistencia?" cuando el último mensaje
  // del agente contiene el bloque de resultados (---) y no estamos loading.
  const showAssistanceCTA = useMemo(() => {
    if (isLoading) return false;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return false;
    const text = getMessageText(last);
    return text.includes('---');
  }, [messages, isLoading]);

  return (
    <div className="relative mx-auto flex h-[calc(100vh-100px)] w-full max-w-[760px] flex-col overflow-hidden bg-white font-sans text-[#1A1A18]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#D8D8D5] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar url="/avatar-medical.webp" name="Asistente de Salud" size="md" />
          <div className="flex flex-col">
            <span className="text-[16px] leading-tight font-semibold text-[#1A1A18]">Asistente de Salud</span>
            <span className="text-[13px] font-medium text-[#028090]">En línea</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-gray-200 text-[#4A4A48] hover:bg-gray-50 outline-none">
              <MoreVerticalIcon size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={resetChat} className="cursor-pointer text-red-600 focus:bg-red-50">Reiniciar chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Area de Conversación */}
      <Conversation className="flex-1 overflow-y-auto px-6 pb-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#BEBEBB]">
        <ConversationContent className="flex flex-col gap-3 pt-7 pb-2">
          {messages.map((message) => {
            const msgText = getMessageText(message);
            const isUser = message.role === 'user';

            return (
              <Message key={message.id} from={message.role as 'user' | 'assistant'} className={`animate-in fade-in !flex !w-full duration-300 ${isUser ? '!justify-end' : '!justify-start'}`}>
                <MessageContent className={`max-w-[85%] px-[17px] py-[13px] text-[14.5px] leading-relaxed tracking-wide ${isUser ? 'rounded-[22px] rounded-br-[10px] !bg-[#1A1A18] !text-[#F9F9F7]' : 'rounded-[22px] rounded-bl-[10px] !bg-[#F1F1EE] !text-[#1A1A18]'}`}>
                  {msgText && (isUser ? <span>{msgText}</span> : formatMedicalAIText(msgText))}
                </MessageContent>
              </Message>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 self-start rounded-full bg-[#F1F1EE] px-3.5 py-2 text-[12.5px] text-[#6B6B68]">
              <Loader2Icon size={14} className="animate-spin" />
              <span>Pensando…</span>
            </div>
          )}

          {showAssistanceCTA && (
            <div className="mt-2 flex flex-col items-start gap-2 self-start">
              <span className="text-[12.5px] text-[#6B6B68]">¿Necesitas asistencia con algo más?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleNeedsMoreYes}
                  className="rounded-full bg-[#1A1A18] px-4 py-1.5 text-[12.5px] font-medium text-[#F9F9F7] hover:bg-black"
                >
                  Sí, necesito más
                </button>
                <button
                  type="button"
                  onClick={resetChat}
                  className="rounded-full border border-[#D8D8D5] bg-white px-4 py-1.5 text-[12.5px] font-medium text-[#4A4A48] hover:bg-[#F0F0ED]"
                >
                  No, gracias
                </button>
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Area de Input */}
      <div className="shrink-0 border-t border-[#D8D8D5] bg-white px-6 pt-4 pb-5">
        <PromptInput onSubmit={(m, e) => { e?.preventDefault(); if (!isSubmitDisabled) handleSubmit(); }} className={`flex flex-col rounded-[22px] border-[1.5px] border-[#D8D8D5] shadow-sm focus-within:border-transparent focus-within:shadow-md ${isRecording ? '!border-transparent shadow-[0_0_0_2px_rgba(192,57,43,0.22)]' : ''}`}>
          <PromptInputTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRecording || isTranscribing || isLoading}
            placeholder={isRecording ? 'Grabando — toca para detener…' : isTranscribing ? 'Procesando voz…' : 'Escribe o graba un audio…'}
            className="max-h-[160px] min-h-[52px] w-full resize-none border-none bg-transparent px-4 pt-3.5 pb-1.5 text-[14.5px] outline-none placeholder:text-[#8A8A86]"
          />
          <PromptInputFooter className="flex items-center justify-between px-3 py-2">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing || isLoading}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${isRecording ? 'animate-pulse bg-[#FDF1EF] text-[#C0392B]' : 'text-[#6B6B68] hover:bg-[#F0F0ED]'}`}
            >
              {isTranscribing ? <Loader2Icon size={18} className="animate-spin text-blue-600" /> : isRecording ? <SquareIcon size={15} className="text-[#C0392B]" fill="currentColor" /> : <MicIcon size={18} />}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex h-[34px] items-center gap-1.5 rounded-full bg-[#1A1A18] px-4 text-[13px] font-medium text-[#F9F9F7] hover:bg-black disabled:opacity-30"
            >
              {isLoading ? <><Loader2Icon size={14} className="animate-spin" /> Enviando</> : 'Enviar'}
            </button>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
