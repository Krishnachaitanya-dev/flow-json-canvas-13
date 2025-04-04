
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LabProvider } from "./context/LabContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Tests from "./pages/Tests";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import PatientDetail from "./pages/PatientDetail";
import RegisterPatient from "./pages/RegisterPatient";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LabProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/patients" element={
                <PrivateRoute>
                  <Patients />
                </PrivateRoute>
              } />
              
              <Route path="/patients/:id" element={
                <PrivateRoute>
                  <PatientDetail />
                </PrivateRoute>
              } />
              
              <Route path="/register-patient" element={
                <PrivateRoute>
                  <RegisterPatient />
                </PrivateRoute>
              } />
              
              <Route path="/tests" element={
                <PrivateRoute>
                  <Tests />
                </PrivateRoute>
              } />
              
              <Route path="/reports" element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              } />
              
              <Route path="/invoices" element={
                <PrivateRoute>
                  <Invoices />
                </PrivateRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LabProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
