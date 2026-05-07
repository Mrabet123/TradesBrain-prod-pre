import { useState, useCallback } from 'react';
import { Message, JobSession } from '../types/session';
import { SESSION_SOFT_CAP, SESSION_WARNING_AT } from '../constants/limits';

export function useRexSession() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<JobSession | null>(null);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSoftCapWarning, setShowSoftCapWarning] = useState(false);

  const messageCount = messages.filter(m => m.role === 'user').length;

  const checkSoftCap = useCallback(() => {
    if (messageCount >= SESSION_WARNING_AT) {
      setShowSoftCapWarning(true);
    }
    return messageCount >= SESSION_SOFT_CAP;
  }, [messageCount]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return {
    messages, session, currentStage, isStreaming, showSoftCapWarning,
    messageCount, setMessages, setSession, setCurrentStage, setIsStreaming,
    checkSoftCap, addMessage,
  };
}
