
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useConversationAI = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const startConversation = useCallback(async (scenario: string, language: string) => {
    try {
      // First, request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get conversation URL from our edge function
      const { data, error } = await supabase.functions.invoke('get-conversation-url', {
        body: { scenario, language },
      });

      if (error) throw error;
      if (!data?.conversation_id) {
        throw new Error('No conversation ID received');
      }

      // Initialize conversation
      setStatus('connecting');
      
      // TODO: Implement WebSocket connection and audio handling
      // This will be added in the next iteration when the user confirms the initial setup works

      setStatus('connected');
      
      return data.conversation_id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        variant: 'destructive',
      });
      setStatus('disconnected');
      throw error;
    }
  }, [toast]);

  const endConversation = useCallback(() => {
    setStatus('disconnected');
    // TODO: Implement cleanup logic
  }, []);

  useEffect(() => {
    return () => {
      if (status === 'connected') {
        endConversation();
      }
    };
  }, [status, endConversation]);

  return {
    status,
    isSpeaking,
    startConversation,
    endConversation,
  };
};
