
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format, parseISO } from "date-fns";

const Reports = () => {
  const { labData } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  
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

  return (
    <Layout title="Reports">
      <div className="mb-6 relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search reports by patient or test"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
                <div className={`px-2 py-1 text-xs rounded-full ${
                  report.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {report.status}
                </div>
              </div>
              
              {report.results && (
                <div className="mt-4 border-t pt-2">
                  <h4 className="text-sm font-medium mb-2">Results:</h4>
                  <div className="space-y-1">
                    {report.results.map((result, index) => (
                      <div key={index} className="grid grid-cols-4 text-sm">
                        <div className="font-medium">{result.parameter}</div>
                        <div>{result.value} {result.unit}</div>
                        <div className="text-gray-500">Ref: {result.referenceRange}</div>
                      </div>
                    ))}
                  </div>
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
    </Layout>
  );
};

export default Reports;
