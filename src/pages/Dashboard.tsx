
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSpreadsheet, Receipt, CheckCircle, TrendingUp, Activity, User } from "lucide-react";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Patients" 
          value={totalPatients} 
          icon={<Users className="h-10 w-10" />} 
          color="bg-gradient-to-br from-futuristic-blue to-futuristic-cyan"
          link="/patients"
        />
        <StatCard 
          title="Pending Reports" 
          value={pendingReports} 
          icon={<FileSpreadsheet className="h-10 w-10" />} 
          color="bg-gradient-to-br from-futuristic-yellow to-futuristic-orange"
          link="/reports"
        />
        <StatCard 
          title="Pending Payments" 
          value={pendingPayments} 
          icon={<Receipt className="h-10 w-10" />} 
          color="bg-gradient-to-br from-futuristic-red to-futuristic-pink"
          link="/invoices"
        />
        <StatCard 
          title="Completed Tests" 
          value={completedTests} 
          icon={<CheckCircle className="h-10 w-10" />} 
          color="bg-gradient-to-br from-futuristic-teal to-futuristic-cyan"
          link="/tests"
        />
      </div>
      
      {/* Recent Patients Section */}
      <Card className="futuristic-card-solid mb-8">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-futuristic-dark flex items-center gap-2">
                <Activity className="h-5 w-5 text-futuristic-purple" /> 
                Recent Patients
              </CardTitle>
              <CardDescription>Recently registered patients</CardDescription>
            </div>
            <Link to="/patients" className="text-futuristic-purple hover:text-futuristic-blue text-sm font-medium hover:underline">
              See All
            </Link>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {recentPatients.map(patient => (
              <Link key={patient.id} to={`/patients/${patient.id}`}>
                <div className="p-4 border rounded-xl hover:shadow-md transition-all duration-300 hover:border-futuristic-purple/30 hover:bg-futuristic-purple/5 flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="rounded-full p-3 bg-futuristic-purple/10 text-futuristic-purple flex items-center justify-center h-10 w-10">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.title} {patient.fullName}</h3>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center">
                        <span>{patient.age} years, {patient.sex}</span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {patient.mobile}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(patient.regDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </Link>
            ))}
            
            {recentPatients.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No patients found. <Link to="/register-patient" className="text-futuristic-purple hover:underline">Add a patient</Link> to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Links Section */}
      <Card className="futuristic-card-solid">
        <CardHeader>
          <CardTitle className="text-xl text-futuristic-dark flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-futuristic-blue" /> 
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickLink 
              title="New Patient" 
              icon={<UserPlus className="h-6 w-6" />} 
              link="/register-patient" 
              color="bg-gradient-to-br from-futuristic-blue to-futuristic-purple"
            />
            <QuickLink 
              title="New Test" 
              icon={<Flask className="h-6 w-6" />} 
              link="/tests" 
              color="bg-gradient-to-br from-futuristic-teal to-futuristic-cyan"
            />
            <QuickLink 
              title="New Report" 
              icon={<FileSpreadsheet className="h-6 w-6" />} 
              link="/reports" 
              color="bg-gradient-to-br from-futuristic-yellow to-futuristic-orange"
            />
            <QuickLink 
              title="New Invoice" 
              icon={<Receipt className="h-6 w-6" />} 
              link="/invoices" 
              color="bg-gradient-to-br from-futuristic-pink to-futuristic-purple"
            />
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const StatCard = ({ title, value, icon, color, link }: StatCardProps) => {
  return (
    <Link to={link}>
      <div className="relative overflow-hidden rounded-2xl shadow-lg h-40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
        <div className={`absolute inset-0 ${color}`}></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-black/5 to-black/30"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <div className="text-white">{icon}</div>
          </div>
        </div>
        <div className="relative z-10 text-white">
          <p className="text-lg font-light text-white/80">{title}</p>
          <h3 className="text-4xl font-bold mt-1">{value}</h3>
        </div>
        <div className="absolute bottom-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
          <div className="text-white transform rotate-12 scale-150">
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
};

interface QuickLinkProps {
  title: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

const QuickLink = ({ title, icon, link, color }: QuickLinkProps) => {
  return (
    <Link to={link}>
      <div className="rounded-xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:shadow-md border border-slate-100 hover:border-transparent group">
        <div className={`p-3 rounded-xl ${color} text-white transform group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
        <span className="mt-2 text-sm font-medium text-gray-700">{title}</span>
      </div>
    </Link>
  );
};

const UserPlus = Users;
const FileSpreadsheet = FileSpreadsheet;
const Receipt = Receipt;
const Flask = Flask;

export default Dashboard;
