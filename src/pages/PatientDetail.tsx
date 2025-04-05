
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Mail, Phone, Home, FilePlus, FileEdit, Printer, User } from "lucide-react";
import ReportPrintView from "@/components/ReportPrintView";
import PrintButton from "@/components/PrintButton";
import { Test, Report } from "@/context/LabContext";
import EditTestDialog from "@/components/EditTestDialog";

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { labData, updateReport, deleteReport } = useLab();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedReportForView, setSelectedReportForView] = useState<string | null>(null);
  const [selectedReportForEdit, setSelectedReportForEdit] = useState<Report | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  // For test editing
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  
  const patient = labData.patients.find(p => p.id === id);
  
  if (!patient) {
    return (
      <Layout title="Patient Details">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground mb-4">The patient you are looking for does not exist.</p>
          <Link to="/patients">
            <Button>Back to Patients</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  // Get patient reports
  const reports = labData.reports.filter(r => r.patientId === patient.id);
  
  // Get patient invoices
  const invoices = labData.invoices.filter(i => i.patientId === patient.id);
  
  // Get tests associated with the patient
  const tests = labData.tests.filter(test => 
    reports.some(report => report.testId === test.id)
  );
  
  // Handle view report
  const handleViewReport = (reportId: string) => {
    setSelectedReportForView(reportId);
  };
  
  // Handle edit report
  const handleEditReport = (report: Report) => {
    setSelectedReportForEdit(report);
  };
  
  // Handle delete report confirmation
  const handleDeleteConfirm = (reportId: string) => {
    setReportToDelete(reportId);
    setIsDeleteConfirmOpen(true);
  };
  
  // Handle delete report
  const handleDeleteReport = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete);
      setIsDeleteConfirmOpen(false);
      setReportToDelete(null);
    }
  };
  
  // Handle test edit
  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
  };
  
  // Get selected report data
  const getSelectedReportData = () => {
    if (!selectedReportForView) return null;
    
    const report = reports.find(r => r.id === selectedReportForView);
    if (!report) return null;
    
    const test = labData.tests.find(t => t.id === report.testId);
    if (!test) return null;
    
    return { report, test };
  };
  
  // Selected report data for viewing
  const selectedReportData = getSelectedReportData();

  return (
    <Layout title="Patient Details">
      {/* Patient Information Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold mb-1">{patient.title} {patient.fullName}</h1>
              <div className="flex items-center text-muted-foreground gap-6">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" /> {patient.age} years, {patient.sex}
                </span>
                <span className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" /> {patient.mobile}
                </span>
              </div>
              {patient.email && (
                <div className="mt-2 flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-1" /> {patient.email}
                </div>
              )}
              {patient.address && (
                <div className="mt-2 flex items-center text-muted-foreground">
                  <Home className="h-4 w-4 mr-1" /> {patient.address}
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-right">
                <span className="text-muted-foreground">Patient ID: </span>
                <span className="font-medium">{patient.id.replace('p', '')}</span>
              </div>
              <div className="text-sm text-right">
                <span className="text-muted-foreground">Registration Date: </span>
                <span className="font-medium">{format(new Date(patient.regDate), "dd MMM yyyy")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="tests">Tests ({tests.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Most recent test reports</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.slice(0, 3).map(report => {
                      const test = labData.tests.find(t => t.id === report.testId);
                      return (
                        <div key={report.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{test?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(report.date), "dd MMM yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              report.status === "Completed" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {report.status}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(report.id)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {reports.length > 3 && (
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab("reports")}
                        className="mt-2 p-0 h-auto"
                      >
                        View all reports
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reports available</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Most recent payment details</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.slice(0, 3).map(invoice => (
                      <div key={invoice.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Invoice #{invoice.id.replace('i', '')}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(invoice.date), "dd MMM yyyy")}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              invoice.status === "Paid" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {invoice.status}
                            </span>
                            <p className="font-medium">₹{invoice.netAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {invoices.length > 3 && (
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab("invoices")}
                        className="mt-2 p-0 h-auto"
                      >
                        View all invoices
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No invoices available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Test Reports</h2>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium">
                <FilePlus className="h-4 w-4 mr-2" /> Add New Report
              </Button>
            </div>
            
            <div>
              {reports.length > 0 ? (
                reports.map(report => {
                  const test = labData.tests.find(t => t.id === report.testId);
                  return (
                    <div 
                      key={report.id} 
                      className="p-4 border rounded-lg mb-4 hover:border-primary transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{test?.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(report.date), "dd MMM yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            report.status === "Completed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {report.status}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(report.id)}
                            >
                              View
                            </Button>
                            {report.status === "Pending" && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditReport(report)}
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <FileEdit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteConfirm(report.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No reports available for this patient.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tests">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tests</h2>
            {tests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map(test => (
                  <Card key={test.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{test.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{test.category}</p>
                            <p className="text-sm mt-2">
                              <span className="font-medium">Code:</span> {test.code}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Parameters:</span> {test.parameters}
                            </p>
                            <p className="text-md font-medium mt-2">₹{test.price.toFixed(2)}</p>
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTest(test)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No tests associated with this patient.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="invoices">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Invoices</h2>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div 
                    key={invoice.id} 
                    className="p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Invoice #{invoice.id.replace('i', '')}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(parseISO(invoice.date), "d MMM yyyy")}
                        </p>
                        <div className="mt-2">
                          {invoice.tests.map((test, idx) => {
                            const testInfo = labData.tests.find(t => t.id === test.testId);
                            return (
                              <div key={`${invoice.id}-${idx}`} className="text-sm">
                                {testInfo?.name} - ₹{test.price.toFixed(2)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {invoice.status}
                        </div>
                        <p className="text-md font-medium mt-2 text-right">
                          ₹{invoice.netAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 text-right">
                          {invoice.paymentMode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No invoices available for this patient.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="text-center py-12 text-muted-foreground">
            Patient history will be available soon.
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Report View Dialog */}
      <Dialog 
        open={selectedReportForView !== null} 
        onOpenChange={(open) => { if (!open) setSelectedReportForView(null); }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 print-hidden">
            <h2 className="text-xl font-semibold">Report</h2>
            <PrintButton />
          </div>
          
          {selectedReportData && (
            <ReportPrintView
              report={selectedReportData.report}
              patient={patient}
              test={selectedReportData.test}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Test Dialog */}
      <EditTestDialog
        test={selectedTest}
        open={selectedTest !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTest(null);
        }}
      />
      
      {/* Report Edit Dialog */}
      <Dialog 
        open={selectedReportForEdit !== null}
        onOpenChange={(open) => { if (!open) setSelectedReportForEdit(null); }}
      >
        <DialogContent className="max-w-lg">
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-4">Update Report Status</h2>
            {selectedReportForEdit && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reportStatus">Status</Label>
                  <Select
                    value={selectedReportForEdit.status}
                    onValueChange={(value) => {
                      setSelectedReportForEdit(prev => 
                        prev ? { ...prev, status: value as "Pending" | "Completed" } : null
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReportForEdit(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedReportForEdit) {
                        updateReport(selectedReportForEdit);
                        setSelectedReportForEdit(null);
                      }
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default PatientDetail;
