
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Receipt, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { labData } = useLab();
  
  // Calculate statistics
  const totalPatients = labData.patients.length;
  const pendingReports = labData.reports.filter(r => r.status === "Pending").length;
  const pendingPayments = labData.invoices.filter(i => i.status === "Pending").length;
  const completedTests = labData.reports.filter(r => r.status === "Completed").length;
  
  // Get recent patients (last 5)
  const recentPatients = [...labData.patients]
    .sort((a, b) => new Date(b.regDate).getTime() - new Date(a.regDate).getTime())
    .slice(0, 5);

  return (
    <Layout title="Dashboard">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Patients" 
          value={totalPatients} 
          icon={<Users className="h-8 w-8 text-blue-500" />} 
          color="border-l-4 border-blue-500"
        />
        <StatCard 
          title="Pending Reports" 
          value={pendingReports} 
          icon={<FileText className="h-8 w-8 text-yellow-500" />} 
          color="border-l-4 border-yellow-500"
        />
        <StatCard 
          title="Pending Payments" 
          value={pendingPayments} 
          icon={<Receipt className="h-8 w-8 text-red-500" />} 
          color="border-l-4 border-red-500"
        />
        <StatCard 
          title="Completed Tests" 
          value={completedTests} 
          icon={<CheckCircle className="h-8 w-8 text-green-500" />} 
          color="border-l-4 border-green-500"
        />
      </div>
      
      {/* Recent Patients Section */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Patients</h2>
        <Link to="/patients" className="text-primary hover:underline text-sm">
          See All
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentPatients.map(patient => (
          <Link key={patient.id} to={`/patients/${patient.id}`}>
            <div className="p-4 border rounded-lg hover:border-primary transition-colors">
              <h3 className="font-medium">{patient.title} {patient.fullName}</h3>
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                <span>{patient.age} years, {patient.sex}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {patient.mobile}
              </div>
              {patient.address && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {patient.address}
                </div>
              )}
            </div>
          </Link>
        ))}
        
        {recentPatients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No patients found. <Link to="/register-patient" className="text-primary hover:underline">Add a patient</Link> to get started.
          </div>
        )}
      </div>
    </Layout>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 rounded-full bg-gray-50">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
