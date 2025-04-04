
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import PrintButton from "@/components/PrintButton";

const Reports = () => {
  const { labData } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  // Filter reports based on search query
  const filteredReports = labData.reports.filter(report => {
    const query = searchQuery.toLowerCase();
    const patient = labData.patients.find(p => p.id === report.patientId);
    const test = labData.tests.find(t => t.id === report.testId);
    
    return (
      patient?.fullName.toLowerCase().includes(query) ||
      test?.name.toLowerCase().includes(query) ||
      report.id.toLowerCase().includes(query)
    );
  });
  
  // Get report details
  const getReportDetails = (reportId: string) => {
    const report = labData.reports.find(r => r.id === reportId);
    if (!report) return null;
    
    const patient = labData.patients.find(p => p.id === report.patientId);
    const test = labData.tests.find(t => t.id === report.testId);
    
    return { report, patient, test };
  };
  
  // Handle print report
  const handlePrintReport = () => {
    // The PrintButton component will handle this
  };

  return (
    <Layout title="Reports">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports by ID or patient name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredReports.map(report => {
          const patient = labData.patients.find(p => p.id === report.patientId);
          const test = labData.tests.find(t => t.id === report.testId);
          
          return (
            <div 
              key={report.id} 
              className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{test?.name}</h3>
                  <p className="text-sm mt-1">{patient?.fullName}</p>
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
        
        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery 
              ? "No reports match your search criteria" 
              : "No reports found."}
          </div>
        )}
      </div>
      
      {/* Report View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">Lab Report</h2>
                <div className="flex space-x-2">
                  <PrintButton />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedReport(null)}
                  >
                    &times;
                  </Button>
                </div>
              </div>
              
              {selectedReport && getReportDetails(selectedReport) && (
                <div className="print-container">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold">Lab Report</h2>
                    </div>
                    <div className="text-right">
                      <img 
                        src="/lovable-uploads/77794296-1445-47b0-9505-0bf52f9b1685.png" 
                        alt="NVR Diagnostics" 
                        className="h-12" 
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <p className="font-semibold">Patient Name:</p>
                      <p>{getReportDetails(selectedReport)?.patient?.fullName}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Date:</p>
                      <p>{format(parseISO(getReportDetails(selectedReport)?.report?.date || new Date().toISOString()), "d MMMM yyyy")}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Patient ID:</p>
                      <p>{getReportDetails(selectedReport)?.patient?.id}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Gender:</p>
                      <p>{getReportDetails(selectedReport)?.patient?.sex}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Doctor:</p>
                      <p>Dr. Not Specified</p>
                    </div>
                    <div>
                      <p className="font-semibold">Age:</p>
                      <p>{getReportDetails(selectedReport)?.patient?.age} years</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{getReportDetails(selectedReport)?.test?.category}</h3>
                    <h4 className="font-medium mb-4">{getReportDetails(selectedReport)?.test?.name}</h4>
                    
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-4 py-2 text-left">Test Name</th>
                          <th className="border px-4 py-2 text-left">Result</th>
                          <th className="border px-4 py-2 text-left">Reference Range</th>
                          <th className="border px-4 py-2 text-left">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getReportDetails(selectedReport)?.report?.results ? (
                          getReportDetails(selectedReport)?.report?.results?.map((result, index) => (
                            <tr key={index}>
                              <td className="border px-4 py-2">{result.parameter}</td>
                              <td className="border px-4 py-2">{result.value}</td>
                              <td className="border px-4 py-2">{result.referenceRange}</td>
                              <td className="border px-4 py-2">{result.unit}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="border px-4 py-2 text-center">
                              This report is {getReportDetails(selectedReport)?.report?.status}.
                              {getReportDetails(selectedReport)?.report?.status === "Pending" && " Results will be updated soon."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-12 border-t pt-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>
                        <p>NVR DIAGNOSTICS</p>
                        <p>Santharam Hospital, Dowlaiswaram, Rajamahendravaram - 7780377630</p>
                      </div>
                      <div className="text-right">
                        <p>Printed on: {format(new Date(), "d/M/yyyy h:mm a")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Reports;
