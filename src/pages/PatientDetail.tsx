
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin, Calendar, Edit, Trash, AlertCircle, Check, X, Printer, Plus } from "lucide-react";
import PrintButton from "@/components/PrintButton";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReportPrintView from "@/components/ReportPrintView";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { labData, deletePatient, updateReport, updateInvoice, addReport, addInvoice } = useLab();
  const [activeTab, setActiveTab] = useState("reports");
  
  // State for report editing
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [reportResults, setReportResults] = useState<any[]>([]);
  const [isPrintView, setIsPrintView] = useState(false);
  
  // State for invoice viewing/editing
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMode: "Cash" as "Cash" | "Card" | "UPI" | "Insurance",
    amountPaid: "0",
    balanceAmount: "0",
    status: "Pending" as "Pending" | "Paid"
  });
  
  // State for adding new test/invoice
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  
  // Find patient by ID
  const patient = labData.patients.find(p => p.id === id);
  
  // If patient not found, show error
  if (!patient) {
    return (
      <Layout title="Patient Detail">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The patient you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/patients")}>
            Back to Patients
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Get patient-related data
  const patientReports = labData.reports.filter(r => r.patientId === id);
  const patientInvoices = labData.invoices.filter(i => i.patientId === id);
  
  // Handle patient deletion
  const handleDeletePatient = () => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      deletePatient(id!);
      navigate("/patients");
    }
  };

  // Handle report edit
  const handleEditReport = (report: any) => {
    const test = labData.tests.find(t => t.id === report.testId);
    
    // Create default results if they don't exist
    let initialResults = report.results || [];
    if (initialResults.length === 0 && test) {
      // Create empty results based on number of parameters
      for (let i = 0; i < test.parameters; i++) {
        initialResults.push({
          parameter: `Parameter ${i+1}`,
          value: "",
          referenceRange: "",
          unit: ""
        });
      }
    }
    
    setCurrentReport(report);
    setReportResults(initialResults);
    setIsEditingReport(true);
  };
  
  // Handle saving report results
  const handleSaveReport = () => {
    if (currentReport) {
      const updatedReport = {
        ...currentReport,
        results: reportResults,
        status: "Completed"
      };
      
      updateReport(updatedReport);
      setIsEditingReport(false);
      setCurrentReport(null);
      toast.success("Report updated successfully");
    }
  };
  
  // Handle changes to report result values
  const handleResultChange = (index: number, field: string, value: string) => {
    const updatedResults = [...reportResults];
    updatedResults[index] = { ...updatedResults[index], [field]: value };
    setReportResults(updatedResults);
  };
  
  // Handle invoice selection for viewing or editing
  const handleInvoiceSelect = (invoice: any) => {
    setSelectedInvoice(invoice.id);
    setPaymentData({
      paymentMode: invoice.paymentMode,
      amountPaid: invoice.amountPaid.toString(),
      balanceAmount: invoice.balanceAmount.toString(),
      status: invoice.status
    });
    setIsEditingInvoice(false);
  };
  
  // Update invoice payment
  const handleUpdateInvoice = () => {
    if (selectedInvoice) {
      const invoice = labData.invoices.find(i => i.id === selectedInvoice);
      if (invoice) {
        const amountPaid = parseFloat(paymentData.amountPaid);
        const updatedInvoice = {
          ...invoice,
          amountPaid: amountPaid,
          balanceAmount: invoice.netAmount - amountPaid,
          paymentMode: paymentData.paymentMode,
          status: amountPaid >= invoice.netAmount ? "Paid" : "Pending" as "Paid" | "Pending"
        };
        
        updateInvoice(updatedInvoice);
        setSelectedInvoice(null);
        toast.success("Invoice updated successfully");
      }
    }
  };
  
  // Get invoice details
  const getInvoiceDetails = (invoiceId: string) => {
    const invoice = labData.invoices.find(i => i.id === invoiceId);
    if (!invoice) return null;
    
    const testsDetails = invoice.tests.map(t => {
      const testInfo = labData.tests.find(test => test.id === t.testId);
      return { ...t, name: testInfo?.name || "Unknown Test" };
    });
    
    return { invoice, testsDetails };
  };
  
  // Handle adding a new test
  const handleAddTest = () => {
    if (selectedTestId) {
      // Create new report
      const newReport = {
        testId: selectedTestId,
        patientId: id!,
        date: new Date().toISOString().split('T')[0],
        status: "Pending" as "Pending" | "Completed"
      };
      
      // Create new invoice for the test
      const selectedTest = labData.tests.find(t => t.id === selectedTestId);
      if (selectedTest) {
        const newInvoice = {
          patientId: id!,
          tests: [{ testId: selectedTestId, price: selectedTest.price }],
          totalAmount: selectedTest.price,
          discountPercentage: 0,
          discountAmount: 0,
          netAmount: selectedTest.price,
          paymentMode: "Cash" as "Cash" | "Card" | "UPI" | "Insurance",
          amountPaid: 0,
          balanceAmount: selectedTest.price,
          date: new Date().toISOString().split('T')[0],
          status: "Pending" as "Pending" | "Paid",
        };
        
        addReport(newReport);
        addInvoice(newInvoice);
        
        setIsAddingTest(false);
        setSelectedTestId("");
        toast.success("Test added successfully");
      }
    } else {
      toast.error("Please select a test");
    }
  };

  // Handle print view for reports
  const handlePrintView = (report: any) => {
    setCurrentReport(report);
    setIsPrintView(true);
  };

  // Handle printing reports
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <Layout title={patient.fullName}>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/patients")}>
          Back
        </Button>
        <div className="flex space-x-2">
          <PrintButton />
          <Button variant="outline" onClick={handleDeletePatient}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Patient Info Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{patient.title} {patient.fullName}</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                <span>{patient.age} years, {patient.sex}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{patient.mobile}</span>
            </div>
            
            {patient.email && (
              <div className="flex items-center text-sm">
                <svg className="h-4 w-4 mr-2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>{patient.email}</span>
              </div>
            )}
            
            {patient.address && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{patient.address}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Registered on {format(parseISO(patient.regDate), "d MMMM yyyy")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Reports and Invoices */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="reports">
            Reports ({patientReports.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({patientInvoices.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">Test Reports</h3>
            <Button size="sm" onClick={() => setIsAddingTest(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </div>
          
          {patientReports.map(report => {
            const test = labData.tests.find(t => t.id === report.testId);
            return (
              <div key={report.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{test?.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(parseISO(report.date), "d MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      report.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {report.status}
                    </div>
                    
                    {report.status === "Completed" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePrintView(report)}
                      >
                        View
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditReport(report)}
                    >
                      {report.status === "Completed" ? "Edit Results" : "Enter Results"}
                    </Button>
                  </div>
                </div>
                
                {report.results && report.status === "Completed" && (
                  <div className="mt-4 border-t pt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parameter</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Reference Range</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.results.map((result: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{result.parameter}</TableCell>
                            <TableCell>{result.value} {result.unit}</TableCell>
                            <TableCell>{result.referenceRange}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrintView(report)}
                        className="flex items-center"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {patientReports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No reports found for this patient.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">Billing Information</h3>
            <Button size="sm" onClick={() => setIsAddingTest(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Invoice
            </Button>
          </div>
          
          {patientInvoices.map(invoice => {
            return (
              <div key={invoice.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Invoice #{invoice.id.replace('i', '')}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(parseISO(invoice.date), "d MMM yyyy")}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      ₹{invoice.netAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {invoice.status}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleInvoiceSelect(invoice)}
                    >
                      {invoice.status === "Paid" ? "View" : "Update Payment"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {patientInvoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found for this patient.
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Report Edit Dialog */}
      <Dialog open={isEditingReport} onOpenChange={setIsEditingReport}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentReport?.status === "Completed" ? "Edit Report" : "Enter Test Results"}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {currentReport && (
              <>
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{labData.tests.find(t => t.id === currentReport.testId)?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(currentReport.date), "d MMM yyyy")}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full h-fit ${
                    currentReport.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {currentReport.status}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {reportResults.map((result, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Parameter</Label>
                        <Input 
                          value={result.parameter} 
                          onChange={(e) => handleResultChange(index, 'parameter', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input 
                          value={result.value} 
                          onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Reference Range</Label>
                        <Input 
                          value={result.referenceRange} 
                          onChange={(e) => handleResultChange(index, 'referenceRange', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input 
                          value={result.unit} 
                          onChange={(e) => handleResultChange(index, 'unit', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="flex items-center justify-end">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditingReport(false)}>
                Cancel
              </Button>
              
              <Button onClick={handleSaveReport} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Save & Mark Completed
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Test Dialog */}
      <Dialog open={isAddingTest} onOpenChange={setIsAddingTest}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="test">Select Test</Label>
                <Select 
                  value={selectedTestId} 
                  onValueChange={setSelectedTestId}
                >
                  <SelectTrigger id="test">
                    <SelectValue placeholder="Select a test" />
                  </SelectTrigger>
                  <SelectContent>
                    {labData.tests.map(test => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.name} - ₹{test.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTest(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTest}>
              Add Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Invoice Dialog */}
      <Dialog open={selectedInvoice !== null} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingInvoice ? "Update Invoice Payment" : "Invoice Details"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && getInvoiceDetails(selectedInvoice) && (
            <div className="py-4">
              <div className="text-center font-bold text-2xl mb-4">
                {isEditingInvoice ? "Update Payment" : "INVOICE"}
              </div>
              
              {/* Invoice details */}
              {!isEditingInvoice && (
                <div className="print-container">
                  <div className="flex justify-between mb-6">
                    <div>
                      <p className="font-bold">NVR DIAGNOSTICS</p>
                      <p>Santharam Hospital, Dowlaiswaram, Rajamahendravaram - 7780377630</p>
                      <p>Phone: +91 99089 91881, 81214 38888</p>
                      <p>Email: info@nvrdiagnostics.com</p>
                    </div>
                    <div className="text-right">
                      <img 
                        src="/lovable-uploads/852c0452-f823-44bb-a2b4-9cccd3034379.png" 
                        alt="NVR Diagnostics" 
                        className="h-12 ml-auto" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border-b pb-2">
                      <p className="font-bold">Invoice Number: </p>
                      <p>#{selectedInvoice.replace('i', '')}</p>
                    </div>
                    <div className="border-b pb-2 text-right">
                      <p className="font-bold">Status: </p>
                      <p className={`inline-block px-2 py-1 rounded-full ${
                        getInvoiceDetails(selectedInvoice)?.invoice?.status === "Paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {getInvoiceDetails(selectedInvoice)?.invoice?.status}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">Date: </p>
                      <p>{format(parseISO(getInvoiceDetails(selectedInvoice)?.invoice?.date || new Date().toISOString()), "d MMMM yyyy")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Payment Method: </p>
                      <p>{getInvoiceDetails(selectedInvoice)?.invoice?.paymentMode}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2">Patient Information</h3>
                    <div className="mb-4">
                      <p className="font-bold">Name: </p>
                      <p>{patient.fullName}</p>
                    </div>
                    <div>
                      <p className="font-bold">Patient ID: </p>
                      <p>{patient.id.replace('p', '')}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2">Tests</h3>
                    <table className="w-full border-collapse mb-4">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-4 py-2 text-left">Test Description</th>
                          <th className="border px-4 py-2 text-left">Code</th>
                          <th className="border px-4 py-2 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getInvoiceDetails(selectedInvoice)?.testsDetails.map((test, index) => {
                          const fullTest = labData.tests.find(t => t.id === test.testId);
                          return (
                            <tr key={index}>
                              <td className="border px-4 py-2">{fullTest?.name}</td>
                              <td className="border px-4 py-2">{fullTest?.code}</td>
                              <td className="border px-4 py-2 text-right">₹{test.price.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    <div className="flex justify-end">
                      <div className="w-64">
                        <div className="flex justify-between py-2">
                          <span>Subtotal:</span>
                          <span>₹{getInvoiceDetails(selectedInvoice)?.invoice?.totalAmount.toFixed(2)}</span>
                        </div>
                        {getInvoiceDetails(selectedInvoice)?.invoice?.discountAmount > 0 && (
                          <div className="flex justify-between py-2">
                            <span>Discount:</span>
                            <span>₹{getInvoiceDetails(selectedInvoice)?.invoice?.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b">
                          <span>Total:</span>
                          <span className="font-bold">₹{getInvoiceDetails(selectedInvoice)?.invoice?.netAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span>Paid:</span>
                          <span>₹{getInvoiceDetails(selectedInvoice)?.invoice?.amountPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span>Balance:</span>
                          <span className={getInvoiceDetails(selectedInvoice)?.invoice?.balanceAmount > 0 ? "text-red-500" : ""}>
                            ₹{getInvoiceDetails(selectedInvoice)?.invoice?.balanceAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment update form */}
              {isEditingInvoice && (
                <div className="space-y-4">
                  <div>
                    <Label>Total Amount</Label>
                    <Input 
                      value={getInvoiceDetails(selectedInvoice)?.invoice?.netAmount.toFixed(2)} 
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <Label>Payment Mode</Label>
                    <Select
                      value={paymentData.paymentMode}
                      onValueChange={(value) => setPaymentData(prev => ({ 
                        ...prev, 
                        paymentMode: value as "Cash" | "Card" | "UPI" | "Insurance" 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Amount Paid</Label>
                    <Input
                      type="number"
                      value={paymentData.amountPaid}
                      onChange={(e) => {
                        const paid = parseFloat(e.target.value) || 0;
                        const total = getInvoiceDetails(selectedInvoice)?.invoice?.netAmount || 0;
                        setPaymentData(prev => ({ 
                          ...prev, 
                          amountPaid: e.target.value,
                          balanceAmount: (total - paid).toFixed(2),
                          status: paid >= total ? "Paid" : "Pending"
                        }));
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label>Balance Amount</Label>
                    <Input
                      value={paymentData.balanceAmount}
                      disabled
                      className={`${parseFloat(paymentData.balanceAmount) > 0 ? 'text-red-500' : 'text-green-500'} bg-gray-50`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {!isEditingInvoice && getInvoiceDetails(selectedInvoice)?.invoice?.status !== "Paid" && (
              <Button 
                variant="outline" 
                className="mr-auto"
                onClick={() => setIsEditingInvoice(true)}
              >
                Update Payment
              </Button>
            )}
            
            {!isEditingInvoice && (
              <PrintButton />
            )}
            
            {isEditingInvoice ? (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsEditingInvoice(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateInvoice}>
                  Update Payment
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Report Print View Dialog */}
      <Dialog open={isPrintView} onOpenChange={setIsPrintView}>
        <DialogContent className="max-w-4xl print:p-0 print:border-0 print:shadow-none print:bg-white">
          <DialogHeader className="print:hidden">
            <DialogTitle>Lab Report</DialogTitle>
          </DialogHeader>
          
          {currentReport && (
            <div className="print:p-0">
              <ReportPrintView
                report={currentReport}
                patient={patient}
                test={labData.tests.find(t => t.id === currentReport.testId)!}
              />
              
              <div className="flex justify-end mt-4 print:hidden">
                <Button 
                  variant="default" 
                  onClick={handlePrint}
                  className="flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PatientDetail;
