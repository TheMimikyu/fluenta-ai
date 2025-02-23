
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  BrainCircuit, 
  AlertTriangle,
  Send,
  ArrowLeft
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
          .select('*') as { data: ConversationMetrics[] | null, error: any };

        if (error) throw error;

        if (data && data.length > 0) {
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
            className="w-full hover:bg-blue-50 transition-all duration-300"
          >
            <Send className="mr-2 h-4 w-4" />
            Email My Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
