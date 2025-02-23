
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useConversationAI = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { toast } = useToast();

  const startConversation = useCallback(async (scenario: string, language: string, difficulty: string, nativeLanguage: string) => {
    try {
      console.log('Starting conversation with params:', { scenario, language, difficulty, nativeLanguage });
      
      // First, request microphone access
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

      // Initialize WebSocket connection
      console.log('Connecting to WebSocket...', data.conversation_url);
      setStatus('connecting');
      
      const ws = new WebSocket(data.conversation_url);
      
      // Set up WebSocket event handlers
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setStatus('connected');
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setStatus('disconnected');
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to conversation service.',
          variant: 'destructive',
        });
        setStatus('disconnected');
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);

          if (message.type === 'speech_start') {
            setIsSpeaking(true);
          } else if (message.type === 'speech_end') {
            setIsSpeaking(false);
          }
          // Handle other message types as needed
        } catch (error) {
          console.error('Error handling message:', error);
        }
      };

      setSocket(ws);

      // Set up audio streaming
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (ws.readyState === WebSocket.OPEN && event.data.size > 0) {
          ws.send(event.data);
        }
      };

      // Start recording
      mediaRecorder.start(100); // Send audio data every 100ms

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
    if (socket) {
      socket.close();
    }
    setStatus('disconnected');
    setSocket(null);
  }, [socket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return {
    status,
    isSpeaking,
    startConversation,
    endConversation,
  };
};
