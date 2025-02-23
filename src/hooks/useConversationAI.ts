
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useConversationAI = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const startConversation = useCallback(async (scenario: string, language: string, difficulty: string, nativeLanguage: string) => {
    try {
      console.log('Starting conversation with params:', { scenario, language, difficulty, nativeLanguage });
      
      // First, request microphone access
      console.log('Requesting microphone access...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');

      // Get current session
      console.log('Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session result:', { session, error: sessionError });
      
      if (sessionError || !session) {
        console.error('No active session:', sessionError);
        throw new Error('No active session');
      }

      // Get conversation URL from our edge function
      console.log('Calling get-conversation-url function...');
      const { data, error } = await supabase.functions.invoke('get-conversation-url', {
        body: { 
          scenario, 
          language,
          difficulty,
          nativeLanguage
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (!data?.conversation_url) {
        console.error('No conversation URL in response:', data);
        throw new Error('No conversation URL received');
      }

      // Initialize conversation
      console.log('Setting status to connecting...');
      setStatus('connecting');
      
      // TODO: Implement WebSocket connection and audio handling
      // This will be added in the next iteration when the user confirms the initial setup works
      console.log('Received conversation URL:', data.conversation_url);

      setStatus('connected');
      
      return data.conversation_url;
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
    console.log('Ending conversation...');
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
