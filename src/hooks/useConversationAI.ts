
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@11labs/client';
import { saveConversationMetrics } from '@/utils/conversationMetrics';

export const useConversationAI = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  const startConversation = useCallback(async (scenario: string, language: string, difficulty: string, nativeLanguage: string) => {
    try {
      console.log('Starting conversation with params:', { scenario, language, difficulty, nativeLanguage });
      
      // First, request microphone access with specific configuration
      console.log('Requesting microphone access...');
      await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('Microphone access granted');

      // Get current session
      console.log('Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session result:', { session, error: sessionError });
      
      if (sessionError || !session) {
        console.error('No active session:', sessionError);
        throw new Error('No active session');
      }

      // Get user's profile data
      console.log('Getting user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      const userName = profile?.full_name || 'Student';
      console.log('Using user name:', userName);

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
      
      if (!data?.agent_id) {
        console.error('No agent ID in response:', data);
        throw new Error('No agent ID received');
      }

      // Initialize conversation using @11labs/client
      console.log('Initializing conversation...');
      const conv = await Conversation.startSession({
        agentId: data.agent_id,
        dynamicVariables: {
          user_name: userName,
          target_language: language,
          environment: scenario,
          difficulty: difficulty,
          native_language: nativeLanguage
        },
        onConnect: () => {
          console.log('Conversation connected');
          setStatus('connected');
        },
        onDisconnect: async () => {
          console.log('Conversation disconnected');
          setStatus('disconnected');
          setConversation(null);
          
          // Save metrics when conversation ends
          if (conversationId) {
            try {
              console.log(`Conversation ended, saving metrics for ID: ${conversationId}`);
              await saveConversationMetrics(conversationId);
              toast({
                title: 'Progress Updated',
                description: 'Your conversation metrics have been saved',
              });
            } catch (error) {
              console.error('Error saving metrics:', error);
              toast({
                title: 'Error',
                description: 'Failed to save conversation metrics',
                variant: 'destructive',
              });
            }
          }
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          toast({
            title: 'Connection Error',
            description: 'Failed to connect to conversation service.',
            variant: 'destructive',
          });
          setStatus('disconnected');
        },
        onMessage: (message: any) => {
          console.log('Received message:', message);
          // Store conversation ID when received
          if (message?.conversation_id && !conversationId) {
            console.log(`Setting conversation ID: ${message.conversation_id}`);
            setConversationId(message.conversation_id);
          }
          // Handle speech events
          if (message?.message?.includes('speech_start')) {
            setIsSpeaking(true);
          } else if (message?.message?.includes('speech_end')) {
            setIsSpeaking(false);
          }
        }
      });

      setConversation(conv);
      setStatus('connected');
      return conv;
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
  }, [toast, conversationId]);

  const endConversation = useCallback(() => {
    console.log('Ending conversation...');
    if (conversation) {
      conversation.endSession();
      setConversation(null);
    }
    setStatus('disconnected');
  }, [conversation]);

  useEffect(() => {
    return () => {
      if (conversation) {
        conversation.endSession();
      }
    };
  }, [conversation]);

  return {
    status,
    isSpeaking,
    conversationId,
    startConversation,
    endConversation,
  };
};
