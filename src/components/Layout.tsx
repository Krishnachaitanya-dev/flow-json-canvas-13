
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Home, Users, FlaskConical, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ImportExportButtons from "./ImportExportButtons";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/patients", label: "Patients", icon: Users },
  { path: "/tests", label: "Tests", icon: FlaskConical },
  { path: "/reports", label: "Reports", icon: FileText },
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
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="h-14 border-b flex items-center justify-between px-4">
        <div className="font-semibold text-lg">{title}</div>
        <div className="flex items-center space-x-4">
          <ImportExportButtons />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleLogout}
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
      <div className="flex-1 flex flex-col">
        {title === "Dashboard" && (
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold mb-1">Hello, {user?.name}</h1>
            <p className="text-muted-foreground">{formatDate()}</p>
          </div>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      <nav className="h-16 border-t grid grid-cols-5 bg-background">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`flex flex-col items-center justify-center ${
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
