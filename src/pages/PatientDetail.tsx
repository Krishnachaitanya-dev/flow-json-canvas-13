
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab, Patient, Report, Test, Invoice } from "@/context/LabContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Receipt, 
  Plus, 
  FileSpreadsheet,
  Clock,
  Check,
  Pen,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import AddTestDialog from "@/components/AddTestDialog";

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { labData, updateReport } = useLab();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientReports, setPatientReports] = useState<Report[]>([]);
  const [patientInvoices, setPatientInvoices] = useState<Invoice[]>([]);
  const [addTestDialogOpen, setAddTestDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundPatient = labData.patients.find(p => p.id === id);
      if (foundPatient) {
        setPatient(foundPatient);
        
        // Get patient's reports
        const reports = labData.reports.filter(r => r.patientId === id);
        setPatientReports(reports);
        
        // Get patient's invoices
        const invoices = labData.invoices.filter(i => i.patientId === id);
        setPatientInvoices(invoices);
      } else {
        toast.error("Patient not found");
        navigate("/patients");
      }
    }
  }, [id, labData, navigate]);
  
  // Function to get the test name from testId
  const getTestName = (testId: string) => {
    const test = labData.tests.find(t => t.id === testId);
    return test ? test.name : "Unknown Test";
  };
  
  // Function to mark report as completed
  const markReportAsCompleted = (reportId: string) => {
    const report = patientReports.find(r => r.id === reportId);
    if (report) {
      updateReport({
        ...report,
        status: "Completed"
      });
      
      toast.success("Report marked as completed");
      
      // Update local state
      setPatientReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: "Completed" } : r
      ));
    }
  };
  
  // Function to handle new test added
  const handleTestAdded = () => {
    // Refresh the reports
    if (id) {
      const reports = labData.reports.filter(r => r.patientId === id);
      setPatientReports(reports);
      
      // Refresh the invoices
      const invoices = labData.invoices.filter(i => i.patientId === id);
      setPatientInvoices(invoices);
    }
  };
  
  if (!patient) {
    return (
      <Layout title="Patient Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-futuristic-purple border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading patient details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Patient Details">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information Card */}
        <Card className="futuristic-card-solid lg:col-span-1">
          <CardHeader className="bg-gradient-to-r from-futuristic-purple/10 to-futuristic-blue/10 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-futuristic-purple" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-futuristic-blue to-futuristic-purple flex items-center justify-center text-white text-3xl font-semibold mb-4">
                {patient.fullName.charAt(0)}
              </div>
              <h2 className="text-xl font-semibold">{patient.title} {patient.fullName}</h2>
              <p className="text-slate-500">Patient ID: {patient.id.replace('p', '')}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-3 mt-1 text-futuristic-purple">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Registration Date</p>
                  <p className="font-medium">{format(new Date(patient.regDate), 'PPP')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 mt-1 text-futuristic-purple">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Age & Sex</p>
                  <p className="font-medium">{patient.age} years, {patient.sex}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 mt-1 text-futuristic-purple">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Mobile</p>
                  <p className="font-medium">{patient.mobile}</p>
                </div>
              </div>
              
              {patient.email && (
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-futuristic-purple">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
              )}
              
              {patient.address && (
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-futuristic-purple">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex space-x-3">
              <Button
                variant="outline"
                className="w-full border-futuristic-purple/30 text-futuristic-purple hover:bg-futuristic-purple/5"
                onClick={() => navigate(`/register-patient?edit=${patient.id}`)}
              >
                <Pen className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Tests & Invoices Tabs */}
        <Card className="futuristic-card-solid lg:col-span-2">
          <Tabs defaultValue="tests" className="w-full">
            <CardHeader className="bg-gradient-to-r from-futuristic-blue/10 to-futuristic-teal/10 pb-3">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-xl">Medical Records</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setAddTestDialogOpen(true)}
                    className="bg-futuristic-purple hover:bg-futuristic-purple/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Test
                  </Button>
                </div>
              </div>
              <TabsList className="grid grid-cols-2 bg-slate-100">
                <TabsTrigger value="tests" className="data-[state=active]:bg-white data-[state=active]:text-futuristic-purple">
                  <FileText className="h-4 w-4 mr-2" /> Tests & Reports
                </TabsTrigger>
                <TabsTrigger value="invoices" className="data-[state=active]:bg-white data-[state=active]:text-futuristic-purple">
                  <Receipt className="h-4 w-4 mr-2" /> Invoices
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-4">
              <TabsContent value="tests" className="mt-0 space-y-4">
                {patientReports.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {patientReports.map(report => {
                      const test = labData.tests.find(t => t.id === report.testId);
                      return (
                        <div 
                          key={report.id} 
                          className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{getTestName(report.testId)}</h3>
                              <div className="text-sm text-slate-500 flex items-center mt-1">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {format(new Date(report.date), 'PPP')}
                              </div>
                            </div>
                            <div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                report.status === 'Completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {report.status === 'Completed' ? (
                                  <div className="flex items-center">
                                    <Check className="h-3 w-3 mr-1" />
                                    Completed
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <div className="text-xs text-slate-500">
                              {test && (
                                <span className="bg-slate-100 px-2 py-1 rounded">
                                  {test.category}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {report.status === 'Pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={() => markReportAsCompleted(report.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" /> Mark Complete
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => navigate(`/reports?id=${report.id}`)}
                              >
                                <FileSpreadsheet className="h-3 w-3 mr-1" /> View Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No tests or reports found for this patient</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setAddTestDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Test
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="invoices" className="mt-0 space-y-4">
                {patientInvoices.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {patientInvoices.map(invoice => (
                      <div 
                        key={invoice.id} 
                        className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Invoice #{invoice.id.replace('i', '')}</h3>
                            <div className="text-sm text-slate-500 flex items-center mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {format(new Date(invoice.date), 'PPP')}
                            </div>
                          </div>
                          <div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'Paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {invoice.status}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-500">Tests</span>
                              <span>{invoice.tests.length}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-500">Total Amount</span>
                              <span>₹{invoice.totalAmount.toFixed(2)}</span>
                            </div>
                            {invoice.discountAmount > 0 && (
                              <div className="flex justify-between mb-1">
                                <span className="text-slate-500">Discount ({invoice.discountPercentage}%)</span>
                                <span>-₹{invoice.discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between mb-1 font-medium">
                              <span>Net Amount</span>
                              <span>₹{invoice.netAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Payment Mode</span>
                              <span>{invoice.paymentMode}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <div className="text-xs">
                            {invoice.balanceAmount > 0 && (
                              <span className="text-red-500 font-medium">
                                Balance: ₹{invoice.balanceAmount.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => navigate(`/invoices?id=${invoice.id}`)}
                          >
                            <Receipt className="h-3 w-3 mr-1" /> View Invoice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Receipt className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No invoices found for this patient</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setAddTestDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Test & Create Invoice
                    </Button>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Add Test Dialog */}
      <AddTestDialog
        patientId={id || ""}
        open={addTestDialogOpen}
        onOpenChange={setAddTestDialogOpen}
        onTestAdded={handleTestAdded}
      />
    </Layout>
  );
};

export default PatientDetail;
