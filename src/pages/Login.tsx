
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Microscope, Sparkles, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Background with futuristic grid pattern */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-futuristic-blue/20 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,8,24,0.85)_0.2px,transparent_0.2px),linear-gradient(90deg,rgba(6,8,24,0.85)_0.2px,transparent_0.2px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_120%,#3e64ff,transparent_65%)]"></div>
          <div className="absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_80%_20%,#7d44ff,transparent_55%)]"></div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center items-center px-6 relative z-10">
        <div className="mx-auto w-full max-w-md">
          <div className="flex flex-col items-center space-y-2 mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-futuristic-blue to-futuristic-purple flex items-center justify-center shadow-lg shadow-futuristic-blue/20">
              <Microscope className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">NVR Diagnostics</h1>
            <p className="text-sm text-slate-300 flex items-center">
              Powered by <Sparkles className="h-3.5 w-3.5 mx-1 text-futuristic-yellow" /> Advanced Diagnostics
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-slate-800/50 p-2.5">
                  <Lock className="h-5 w-5 text-futuristic-purple" />
                </div>
              </div>
              
              <h2 className="mb-6 text-center text-xl font-semibold text-white">
                Log In to NVR Diagnostics
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@nvr.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white pl-10 w-full focus:ring-futuristic-purple focus:border-futuristic-purple"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                      Password
                    </Label>
                    <button type="button" className="text-xs text-futuristic-purple hover:text-futuristic-blue">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white pl-10 w-full focus:ring-futuristic-purple focus:border-futuristic-purple"
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-futuristic-blue to-futuristic-purple hover:from-futuristic-purple hover:to-futuristic-blue text-white font-medium py-2.5 shadow-md shadow-futuristic-purple/20 transition-all duration-300 transform hover:translate-y-[-2px]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Logging in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-xs text-slate-400">
                <p>Default Login: admin@nvr.com / password</p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 text-center text-xs text-slate-400">
            © 2025 NVR Diagnostics. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
