
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Eye, Printer, CalendarIcon } from "lucide-react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import PrintButton from "@/components/PrintButton";
import ReportPrintView from "@/components/ReportPrintView";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const Reports = () => {
  const { labData } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  // Filter reports based on search query and date filter
  const filteredReports = labData.reports.filter(report => {
    const query = searchQuery.toLowerCase();
    const patient = labData.patients.find(p => p.id === report.patientId);
    const test = labData.tests.find(t => t.id === report.testId);
    
    // Check text search
    const matchesText = 
      patient?.fullName.toLowerCase().includes(query) ||
      test?.name.toLowerCase().includes(query) ||
      report.id.toLowerCase().includes(query);
    
    // Check date filter
    let matchesDate = true;
    if (dateFilter) {
      const reportDate = parseISO(report.date);
      matchesDate = isWithinInterval(reportDate, {
        start: startOfDay(dateFilter),
        end: endOfDay(dateFilter)
      });
    }
    
    return matchesText && matchesDate;
  });
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter(undefined);
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
          
          {/* Date picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "w-full sm:w-[240px]",
                  dateFilter ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Clear filters button */}
          {(searchQuery || dateFilter) && (
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
            {searchQuery || dateFilter
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
