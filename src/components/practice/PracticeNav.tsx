
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PracticeNavProps {
  onSignOut: () => Promise<void>;
}

export const PracticeNav = ({ onSignOut }: PracticeNavProps) => {
  const navigate = useNavigate();

  return (
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
            <span className="text-blue-600 font-bold text-2xl">Practice</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tracking")}
            >
              Progress
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
