
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import PrintButton from "@/components/PrintButton";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Reports = () => {
  const { labData, updateReport } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [reportResults, setReportResults] = useState<any[]>([]);
  const [isEditingReport, setIsEditingReport] = useState(false);
  
  // Filter reports based on search query
  const filteredReports = labData.reports.filter(report => {
    const query = searchQuery.toLowerCase();
    const patient = labData.patients.find(p => p.id === report.patientId);
    const test = labData.tests.find(t => t.id === report.testId);
    
    return (
      patient?.fullName.toLowerCase().includes(query) ||
      test?.name.toLowerCase().includes(query)
    );
  });

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

  return (
    <Layout title="Reports">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports by patient or test"
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
            <div key={report.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {patient?.fullName} - {test?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(report.date), "d MMMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    report.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {report.status}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditReport(report)}
                  >
                    {report.status === "Completed" ? "View" : "Enter Results"}
                  </Button>
                </div>
              </div>
              
              {report.results && report.status === "Completed" && (
                <div className="mt-4 border-t pt-2">
                  <h4 className="text-sm font-medium mb-2">Results:</h4>
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
                </div>
              )}
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

      {/* Report Edit Dialog */}
      <Dialog open={isEditingReport} onOpenChange={setIsEditingReport}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentReport?.status === "Completed" ? "View Report" : "Enter Test Results"}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {currentReport && (
              <>
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-medium">
                      {labData.tests.find(t => t.id === currentReport.testId)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(currentReport.date), "d MMM yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Patient: {labData.patients.find(p => p.id === currentReport.patientId)?.fullName}
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
                          disabled={currentReport.status === "Completed"}
                        />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input 
                          value={result.value} 
                          onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                          disabled={currentReport.status === "Completed"}
                        />
                      </div>
                      <div>
                        <Label>Reference Range</Label>
                        <Input 
                          value={result.referenceRange} 
                          onChange={(e) => handleResultChange(index, 'referenceRange', e.target.value)}
                          disabled={currentReport.status === "Completed"}
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input 
                          value={result.unit} 
                          onChange={(e) => handleResultChange(index, 'unit', e.target.value)}
                          disabled={currentReport.status === "Completed"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            <div>
              {currentReport?.status === "Completed" && <PrintButton />}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditingReport(false)}>
                {currentReport?.status === "Completed" ? "Close" : "Cancel"}
              </Button>
              
              {currentReport?.status !== "Completed" && (
                <Button onClick={handleSaveReport} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  Save & Mark Completed
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Reports;
