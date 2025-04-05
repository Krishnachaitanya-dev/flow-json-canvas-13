import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Check, FileText, CalendarIcon } from "lucide-react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import PrintButton from "@/components/PrintButton";
import { toast } from "sonner";
import ReportPrintView from "@/components/ReportPrintView";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const Reports = () => {
  const { labData, updateReport } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [reportResults, setReportResults] = useState<any[]>([]);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);
  
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [dateFilterType, setDateFilterType] = useState<"none" | "single" | "range">("none");
  
  const filteredReports = labData.reports.filter(report => {
    const query = searchQuery.toLowerCase();
    const patient = labData.patients.find(p => p.id === report.patientId);
    const test = labData.tests.find(t => t.id === report.testId);
    const reportDate = parseISO(report.date);
    
    const matchesText = 
      patient?.fullName.toLowerCase().includes(query) ||
      test?.name.toLowerCase().includes(query);
    
    let matchesDate = true;
    if (dateFilterType === "single" && filterDate) {
      matchesDate = isSameDay(reportDate, filterDate);
    } else if (dateFilterType === "range" && filterStartDate && filterEndDate) {
      matchesDate = isWithinInterval(reportDate, {
        start: startOfDay(filterStartDate),
        end: endOfDay(filterEndDate)
      });
    }
    
    return matchesText && matchesDate;
  });

  const handleEditReport = (report: any) => {
    const test = labData.tests.find(t => t.id === report.testId);
    
    let initialResults = report.results || [];
    if (initialResults.length === 0 && test) {
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
    setIsPrintView(false);
  };

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

  const handleResultChange = (index: number, field: string, value: string) => {
    const updatedResults = [...reportResults];
    updatedResults[index] = { ...updatedResults[index], [field]: value };
    setReportResults(updatedResults);
  };

  const handlePrintView = (report: any) => {
    setIsEditingReport(false);
    setTimeout(() => {
      setCurrentReport(report);
      setIsPrintView(true);
    }, 100);
  };

  const clearDateFilters = () => {
    setDateFilterType("none");
    setFilterDate(undefined);
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
  };

  return (
    <Layout title="Reports">
      <div className="mb-6 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports by patient or test"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={dateFilterType === "single" ? "default" : "outline"} 
                className="flex items-center"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? format(filterDate, "PP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={(date) => {
                  setFilterDate(date);
                  setDateFilterType(date ? "single" : "none");
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
              <div className="p-3 border-t border-border flex justify-between">
                <Button variant="ghost" size="sm" onClick={clearDateFilters}>
                  Clear
                </Button>
                <Button variant="default" size="sm" onClick={() => {
                  setDateFilterType("single");
                }}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={dateFilterType === "range" ? "default" : "outline"}
                className="flex items-center"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilterType === "range" && filterStartDate && filterEndDate 
                  ? `${format(filterStartDate, "dd/MM")} - ${format(filterEndDate, "dd/MM")}`
                  : "Date range"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <div className="p-3 border-b border-border">
                <div className="grid gap-2">
                  <Label>From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left"
                      >
                        {filterStartDate ? format(filterStartDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterStartDate}
                        onSelect={setFilterStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2 mt-2">
                  <Label>To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left"
                      >
                        {filterEndDate ? format(filterEndDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterEndDate}
                        onSelect={setFilterEndDate}
                        disabled={(date) => 
                          filterStartDate ? date < filterStartDate : false
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="ghost" size="sm" onClick={clearDateFilters}>
                    Clear
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      if (filterStartDate && filterEndDate) {
                        setDateFilterType("range");
                      }
                    }}
                    disabled={!filterStartDate || !filterEndDate}
                  >
                    Apply Range
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {dateFilterType !== "none" && (
            <Button variant="ghost" size="sm" onClick={clearDateFilters}>
              Clear filters
            </Button>
          )}
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
                  
                  {report.status === "Completed" && (
                    <PrintButton 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePrintView(report)}
                      className="flex items-center"
                      title="Print Report"
                    />
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
            {dateFilterType !== "none"
              ? "No reports match your date filter"
              : searchQuery 
                ? "No reports match your search criteria" 
                : "No reports found."}
          </div>
        )}
      </div>

      <Dialog open={isEditingReport} onOpenChange={setIsEditingReport}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentReport?.status === "Completed" ? "Edit Test Results" : "Enter Test Results"}</DialogTitle>
            <DialogDescription>Enter or modify test results below.</DialogDescription>
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
          
          <DialogFooter className="flex items-center justify-between">
            <div>
              {currentReport?.status === "Completed" && (
                <PrintButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditingReport(false);
                    setTimeout(() => {
                      handlePrintView(currentReport);
                    }, 100);
                  }}
                  className="flex items-center"
                />
              )}
            </div>
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

      <Dialog 
        open={isPrintView} 
        onOpenChange={(open) => {
          if (!open) setIsPrintView(false);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader className="print-hidden">
            <DialogTitle>Lab Report</DialogTitle>
            <DialogDescription>Preview the report before printing.</DialogDescription>
          </DialogHeader>
          
          {currentReport && (
            <div className="print-container">
              <div className="print-only-warning bg-yellow-100 p-4 mb-4 rounded border border-yellow-400 print-hidden">
                <p className="font-semibold">Preview before printing</p>
              </div>
              
              <ReportPrintView
                report={currentReport}
                patient={labData.patients.find(p => p.id === currentReport.patientId)!}
                test={labData.tests.find(t => t.id === currentReport.testId)!}
              />
              
              <div className="flex justify-end mt-4 print-hidden">
                <PrintButton />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Reports;
