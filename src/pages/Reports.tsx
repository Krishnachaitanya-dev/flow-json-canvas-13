
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Eye, Printer, CalendarIcon } from "lucide-react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import PrintButton from "@/components/PrintButton";
import ReportPrintView from "@/components/ReportPrintView";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Reports = () => {
  const { labData } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  // Date filter states
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [dateFilterType, setDateFilterType] = useState<"none" | "single" | "range">("none");
  
  // Filter reports based on search query and date filters
  const filteredReports = labData.reports.filter(report => {
    const query = searchQuery.toLowerCase();
    const patient = labData.patients.find(p => p.id === report.patientId);
    const test = labData.tests.find(t => t.id === report.testId);
    const reportDate = parseISO(report.date);
    
    // Check text search
    const matchesText = 
      (patient?.fullName.toLowerCase().includes(query) ?? false) ||
      (test?.name.toLowerCase().includes(query) ?? false) ||
      report.id.toLowerCase().includes(query);
    
    // Check date filter
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
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateFilterType("none");
    setFilterDate(undefined);
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
  };
  
  // Get report details
  const getReportDetails = (reportId: string) => {
    const report = labData.reports.find(r => r.id === reportId);
    if (!report) return null;
    
    const patient = labData.patients.find(p => p.id === report.patientId);
    const test = labData.tests.find(t => t.id === report.testId);
    
    if (!patient || !test) return null;
    
    return { report, patient, test };
  };

  return (
    <Layout title="Reports">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Text search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reports by test name or patient name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Single date picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={dateFilterType === "single" ? "default" : "outline"} 
                className={cn(
                  "w-full sm:w-[180px]",
                  dateFilterType === "single" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? format(filterDate, "PP") : "Single Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={(date) => {
                  setFilterDate(date);
                  if (date) {
                    setDateFilterType("single");
                  } else {
                    setDateFilterType("none");
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              <div className="p-3 border-t border-border flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => {
                  setFilterDate(undefined);
                  setDateFilterType("none");
                }}>
                  Clear
                </Button>
                <Button variant="default" size="sm" onClick={() => {
                  if (filterDate) {
                    setDateFilterType("single");
                  }
                }}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Date range picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={dateFilterType === "range" ? "default" : "outline"}
                className={cn(
                  "w-full sm:w-[180px]",
                  dateFilterType === "range" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilterType === "range" && filterStartDate && filterEndDate 
                  ? `${format(filterStartDate, "dd/MM")} - ${format(filterEndDate, "dd/MM")}`
                  : "Date Range"}
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
                        className="p-3 pointer-events-auto"
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
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setFilterStartDate(undefined);
                    setFilterEndDate(undefined);
                    setDateFilterType("none");
                  }}>
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
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear filters button */}
          {(searchQuery || dateFilterType !== "none") && (
            <Button 
              variant="ghost" 
              onClick={clearFilters} 
              className="w-full sm:w-auto"
            >
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
                <div className="flex items-center">
                  <div className={`px-2 py-1 text-xs rounded-full mr-2 ${
                    report.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {report.status}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReport(report.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {(searchQuery || dateFilterType !== "none")
              ? "No reports match your search criteria" 
              : "No reports found."
            }
          </div>
        )}
      </div>
      
      {/* Report View Modal */}
      {selectedReport && getReportDetails(selectedReport) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <div className="flex justify-between mb-6 print-hidden">
                <h2 className="text-xl font-semibold">Lab Report</h2>
                <div className="flex space-x-2">
                  <PrintButton />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedReport(null)}
                    className="print-hidden"
                  >
                    &times;
                  </Button>
                </div>
              </div>
              
              <div className="print-container">
                <ReportPrintView
                  report={getReportDetails(selectedReport)!.report}
                  patient={getReportDetails(selectedReport)!.patient}
                  test={getReportDetails(selectedReport)!.test}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Reports;
