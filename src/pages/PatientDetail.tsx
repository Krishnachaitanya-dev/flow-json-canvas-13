
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Edit, Trash2, Mail, Phone, Home, FilePlus, FileEdit, User, Calendar } from "lucide-react";
import ReportPrintView from "@/components/ReportPrintView";
import { Test, Report } from "@/context/LabContext";
import EditTestDialog from "@/components/EditTestDialog";

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { labData, updateReport, deleteReport } = useLab();
  
  const [activeTab, setActiveTab] = useState<"reports" | "invoices">("reports");
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
      {/* Patient Information Header - Using the UI from the images provided */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-blue-600 text-2xl font-bold mr-4">
              {patient.fullName.charAt(0)}
            </div>
            <div className="flex flex-col md:flex-row w-full justify-between">
              <div>
                <h1 className="text-2xl font-bold">{patient.title} {patient.fullName}</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <User className="h-4 w-4 mr-1" /> {patient.age} years, {patient.sex}
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-600 flex items-center">
                    <Phone className="h-4 w-4 mr-2" /> {patient.mobile}
                  </p>
                  {patient.email && (
                    <p className="text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> {patient.email}
                    </p>
                  )}
                  {patient.address && (
                    <p className="text-gray-600 flex items-center">
                      <Home className="h-4 w-4 mr-2" /> {patient.address}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 space-y-1">
                <p className="text-gray-600 flex items-center justify-end">
                  <Mail className="h-4 w-4 mr-2" /> {patient.email}
                </p>
                <p className="text-gray-600 flex items-center justify-end">
                  <Calendar className="h-4 w-4 mr-2" /> Registered on {format(new Date(patient.regDate), "dd MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tab Navigation - Simplified to just reports and invoices */}
      <div className="mb-6">
        <div className="border-b">
          <div className="flex -mb-px">
            <button
              className={`mr-8 py-2 px-1 border-b-2 ${
                activeTab === "reports" 
                  ? "border-blue-500 text-blue-600 font-medium" 
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("reports")}
            >
              Reports ({reports.length})
            </button>
            <button
              className={`py-2 px-1 border-b-2 ${
                activeTab === "invoices" 
                  ? "border-blue-500 text-blue-600 font-medium" 
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("invoices")}
            >
              Invoices ({invoices.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Test Reports</h2>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <FilePlus className="h-4 w-4 mr-2" /> Add Test
            </Button>
          </div>
          
          {/* Reports List */}
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map(report => {
                const test = labData.tests.find(t => t.id === report.testId);
                return (
                  <div 
                    key={report.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{test?.name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(report.date), "d MMM yyyy")}
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
                        {report.status === "Completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            Edit Results
                          </Button>
                        )}
                        {report.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditReport(report)}
                            className="h-8 w-8 text-blue-600"
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConfirm(report.id)}
                          className="h-8 w-8 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No reports available for this patient.
            </div>
          )}
        </div>
      )}
      
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Billing Information</h2>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <FilePlus className="h-4 w-4 mr-2" /> Add Invoice
            </Button>
          </div>
          
          {/* Invoices List */}
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div 
                  key={invoice.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Invoice #{invoice.id.replace('i', '')}</h3>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(invoice.date), "d MMM yyyy")}
                      </p>
                      <p className="font-medium mt-1">₹{invoice.netAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === "Paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {invoice.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No invoices available for this patient.
            </div>
          )}
        </div>
      )}
      
      {/* Report View Dialog - Removed print button */}
      <Dialog 
        open={selectedReportForView !== null} 
        onOpenChange={(open) => { if (!open) setSelectedReportForView(null); }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Report</h2>
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
