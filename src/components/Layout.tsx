
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  LogOut, 
  User, 
  Home, 
  Users, 
  Flask, 
  FileSpreadsheet, 
  Receipt, 
  UserPlus,
  Workflow,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ImportExportButtons from "./ImportExportButtons";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/patients", label: "Patients", icon: Users },
  { path: "/tests", label: "Tests", icon: Flask },
  { path: "/reports", label: "Reports", icon: FileSpreadsheet },
  { path: "/invoices", label: "Invoices", icon: Receipt },
];

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to format the current date
  const formatDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Function to get the active menu item
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-16 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-white shadow-sm z-10">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-futuristic-purple" />
          <div className="font-bold text-xl bg-gradient-to-r from-futuristic-purple to-futuristic-blue bg-clip-text text-transparent">
            {title}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigate("/compact-register")}
                  className="bg-futuristic-purple text-white hover:bg-futuristic-pink border-none rounded-xl"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Register Patient</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ImportExportButtons />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleLogout}
                  className="bg-transparent hover:bg-red-50 text-red-500 hover:text-red-600 border border-red-200 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {title === "Dashboard" && (
          <div className="p-8 bg-gradient-to-r from-futuristic-blue to-futuristic-purple text-white">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              Hello, <span className="ml-2 text-futuristic-yellow">{user?.name}</span>
            </h1>
            <p className="text-white text-opacity-80 font-light">{formatDate()}</p>
          </div>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Bottom navigation (mobile) - now fixed to bottom */}
      <nav className="h-16 border-t grid grid-cols-5 bg-white shadow-lg fixed bottom-0 left-0 right-0 z-50">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isActive(item.path) 
                ? "text-futuristic-purple" 
                : "text-slate-400 hover:text-futuristic-blue"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className={`h-5 w-5 ${isActive(item.path) ? "animate-pulse-glow" : ""}`} />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
