import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
const Index = () => {
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 font-bold text-2xl">Fluenta AI</span>
            </div>
            {user ? <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/practice")}>
                  Practice
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/quiz")}>
                  Quiz
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/tracking")}>
                  Progress
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div> : <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate("/auth")}>
                <User className="h-5 w-5 mr-2" />
                Sign In
              </Button>}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center animate-in">
          <h1 className="font-bold text-gray-900 mb-6 text-8xl">
            Fluenta AI
          </h1>
          <p className="text-gray-600 mb-4 text-4xl">
            Fluency, One Conversation at a Time
          </p>
          <p className="text-xl text-gray-600 mb-8">Practice Conversations, Perfect Pronunciation, and Track Progress with your own Personal tutoring AI.</p>
          <Button onClick={() => navigate("/practice")} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105">
            Start Learning
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => <div key={index} className="floating-card bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>)}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => <div key={index} className="text-center fade-in" style={{
            animationDelay: `${index * 0.2}s`
          }}>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
const features = [{
  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>,
  title: "AI-Powered Conversations",
  description: "Practice real-life scenarios with our advanced AI language model"
}, {
  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
  title: "Progress Tracking",
  description: "Monitor your improvement with detailed statistics and feedback"
}, {
  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
  title: "Visual Learning",
  description: "Learn with AI-generated images and interactive flashcards"
}];
const steps = [{
  title: "Choose Your Scenario",
  description: "Select from various real-life situations and difficulty levels"
}, {
  title: "Practice Speaking",
  description: "Get instant feedback on your pronunciation and fluency"
}, {
  title: "Track Progress",
  description: "Monitor your improvement and unlock new challenges"
}];
export default Index;