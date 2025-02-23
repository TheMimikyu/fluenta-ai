
import { useState } from "react";
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

const Tracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock stats (replace with PostHog data later)
  const stats = {
    lessonsCompleted: 12,
    timeSpent: "5h 30m",
    accuracyRate: "85%",
    commonErrors: ["Pronunciation", "Grammar"]
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
                onClick={() => navigate("/quiz")}
              >
                Quiz
              </Button>
              <span className="text-sm text-gray-600">{user?.email}</span>
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
