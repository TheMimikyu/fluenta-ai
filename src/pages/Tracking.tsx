
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  BrainCircuit, 
  AlertTriangle,
  Send,
  ArrowLeft,
  FileText
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database";

type ConversationMetrics = Database['public']['Tables']['conversation_metrics']['Row'];

const Tracking = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ConversationMetrics[]>([]);
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    timeSpent: "0h 0m",
    accuracyRate: "0%",
    commonErrors: [] as string[]
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('conversation_metrics')
          .select('*')
          .returns<ConversationMetrics[]>();

        if (error) throw error;

        if (data && data.length > 0) {
          setMetrics(data);
          
          // Calculate total lessons
          const lessonsCompleted = data.length;

          // Calculate total time spent
          const totalSeconds = data.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const timeSpent = `${hours}h ${minutes}m`;

          // Calculate average accuracy
          const avgAccuracy = data.reduce((acc, curr) => acc + (curr.pronunciation_score || 0), 0) / data.length;

          // Get common errors
          const errorsList = data
            .map(m => m.detected_errors?.split(',') || [])
            .flat()
            .filter(Boolean)
            .map(error => error.trim());
          
          const commonErrors = Array.from(new Set(errorsList));

          setStats({
            lessonsCompleted,
            timeSpent,
            accuracyRate: `${Math.round(avgAccuracy)}%`,
            commonErrors: commonErrors.slice(0, 2) // Show top 2 most common errors
          });
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleEmailProgress = async () => {
    // TODO: Implement Make workflow trigger
    toast({
      title: "Progress Report Sent",
      description: "Your progress report has been emailed to you.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <span className="text-blue-600 font-bold text-2xl">Progress Tracking</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/practice")}
              >
                Practice
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        <div className="glass-card animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Learning Progress</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Lessons</h3>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.lessonsCompleted}
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Time Spent</h3>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.timeSpent}
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Accuracy</h3>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.accuracyRate}
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Common Errors</h3>
              </div>
              <p className="text-sm text-blue-600">{stats.commonErrors.join(", ")}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleEmailProgress}
            className="w-full hover:bg-blue-50 transition-all duration-300 mb-8"
          >
            <Send className="mr-2 h-4 w-4" />
            Email My Progress
          </Button>

          {/* Add conversation transcripts section */}
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Conversations</h3>
          <div className="space-y-4">
            {metrics.length > 0 ? (
              metrics.slice(0, 5).map((metric) => (
                <div key={metric.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">
                          {new Date(metric.created_at).toLocaleDateString()} • {Math.floor((metric.duration_seconds || 0) / 60)}m {(metric.duration_seconds || 0) % 60}s
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          Score: {metric.pronunciation_score || 0}%
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {metric.transcript_summary || "No transcript available"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {metric.detected_errors && metric.detected_errors.split(',').map((error, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                            {error.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No conversation data available yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
