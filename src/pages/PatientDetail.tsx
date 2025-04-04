
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin, Calendar, Edit, Trash, AlertCircle } from "lucide-react";
import PrintButton from "@/components/PrintButton";
import { format, parseISO } from "date-fns";

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { labData, deletePatient } = useLab();
  const [activeTab, setActiveTab] = useState("reports");
  
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
            <Button size="sm">Add Test</Button>
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
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    report.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {report.status}
                  </div>
                </div>
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
            <Button size="sm">Add Invoice</Button>
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
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    invoice.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {invoice.status}
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
    </Layout>
  );
};

export default PatientDetail;
