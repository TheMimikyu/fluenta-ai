
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
  const [messages, setMessages] = useState<Array<{ text: string, source: 'user' | 'ai' }>>([]);
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

      // Set status to connecting early to show UI feedback
      setStatus('connecting');

      // Get current session
      console.log('Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        console.error('No active session found');
        throw new Error('No active session');
      }
      
      console.log('Session retrieved successfully');
      
      // Get user's profile data
      console.log('Getting user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
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
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
      }
      
      console.log('Edge function response:', data);
      
      if (!data?.agent_id) {
        console.error('No agent ID in response:', data);
        throw new Error('No agent ID received');
      }

      // Initialize conversation using @11labs/client
      console.log('Initializing conversation with agent ID:', data.agent_id);
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
          toast({
            title: 'Connected',
            description: 'Conversation started successfully',
          });
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
          } else {
            console.error('No conversation ID available for saving metrics');
            
            // Try to retrieve conversation ID from accumulated messages
            const potentialIds = messages
              .filter(msg => msg.source === 'ai')
              .map(msg => {
                // Try to extract conversation ID from message text
                const match = msg.text?.match(/conversation_id["|:]?\s*["']?([a-zA-Z0-9-_]+)["']?/i);
                return match ? match[1] : null;
              })
              .filter(Boolean);
            
            if (potentialIds.length > 0) {
              const foundId = potentialIds[0];
              console.log(`Found conversation ID from messages: ${foundId}`);
              try {
                await saveConversationMetrics(foundId);
                toast({
                  title: 'Progress Updated',
                  description: 'Your conversation metrics have been saved',
                });
              } catch (error) {
                console.error('Error saving metrics with extracted ID:', error);
              }
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
          
          // Store message for potential ID extraction later
          if (message?.message) {
            setMessages(prev => [...prev, { 
              text: message.message, 
              source: message.source || 'ai' 
            }]);
          }
          
          // Extract conversation_id from various message formats
          if (message?.conversation_id) {
            console.log(`Setting conversation ID from conversation_id field: ${message.conversation_id}`);
            setConversationId(message.conversation_id);
          } 
          else if (message?.metadata?.conversation_id) {
            console.log(`Setting conversation ID from metadata: ${message.metadata.conversation_id}`);
            setConversationId(message.metadata.conversation_id);
          }
          else if (message?.message && typeof message.message === 'string') {
            // Try to extract ID from message text
            const match = message.message.match(/conversation_id["|:]?\s*["']?([a-zA-Z0-9-_]+)["']?/i);
            if (match && match[1]) {
              console.log(`Extracted conversation ID from message text: ${match[1]}`);
              setConversationId(match[1]);
            }

            // Also look for ID in object format if message might be JSON
            try {
              if (message.message.includes('{') && message.message.includes('}')) {
                const jsonMatch = JSON.parse(message.message);
                if (jsonMatch?.conversation_id) {
                  console.log(`Extracted conversation ID from JSON in message: ${jsonMatch.conversation_id}`);
                  setConversationId(jsonMatch.conversation_id);
                }
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
          
          // Handle speech events
          if (message?.message?.includes('speech_start')) {
            setIsSpeaking(true);
          } else if (message?.message?.includes('speech_end')) {
            setIsSpeaking(false);
          }
        }
      });

      console.log('Conversation instance created successfully');
      setConversation(conv);
      setStatus('connected');
      return conv;
    } catch (error) {
      console.error('Error starting conversation:', error);
      setStatus('disconnected');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start conversation. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, conversationId, messages]);

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
        console.log('Component unmounting, cleaning up conversation');
        conversation.endSession();
      }
    };
  }, [conversation]);

  return {
    status,
    isSpeaking,
    conversationId,
    messages,
    startConversation,
    endConversation,
  };
};
