
import React from "react";
import { format } from "date-fns";
import { Report, Patient, Test } from "@/context/LabContext";
import { Microscope } from "lucide-react";

interface ReportPrintViewProps {
  report: Report;
  patient: Patient;
  test: Test;
}

// Separate header component for better print control
const ReportHeader = ({ logo = true }: { logo?: boolean }) => {
  return (
    <>
      <div className="print-header flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
            <Microscope className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">Lab Report</h1>
        </div>
        {logo && (
          <div className="w-[100px] h-[48px] flex items-center justify-end">
            <img 
              src="/lovable-uploads/852c0452-f823-44bb-a2b4-9cccd3034379.png" 
              alt="NVR Diagnostics" 
              className="h-10"
              style={{ 
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact'
              }}
            />
          </div>
        )}
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mb-4"></div>
    </>
  );
};

// Separate footer component for better print control
const ReportFooter = ({ dateString, timeString }: { dateString: string, timeString: string }) => {
  return (
    <>
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mb-3"></div>
      <div className="text-center mb-3">
        <div className="font-bold text-blue-600 text-lg">NVR DIAGNOSTICS</div>
        <div className="text-xs text-gray-600">Santharam Hospital, Dowlaiswaram, Rajamahendravaram - 7780377630</div>
      </div>
      <div className="flex justify-end text-xs text-gray-500">
        <div>Printed on: {dateString} {timeString}</div>
      </div>
    </>
  );
};

const ReportPrintView = ({ report, patient, test }: ReportPrintViewProps) => {
  // Get current date and time for the printed timestamp
  const now = new Date();
  const timeString = format(now, "h:mm a");
  const dateString = format(now, "M/d/yyyy");
  
  // Handle multiline results display with categories
  const getResultsByCategory = () => {
    if (!report.results) return [];
    
    // Group by categories if available
    const categories: Record<string, any[]> = {};
    
    if (test.name === "Lipid Profile") {
      categories["Lipid Profile"] = report.results;
    } else if (test.name === "Complete Blood Count" || test.name === "CBC") {
      categories["Complete Blood Count (CBC)"] = report.results;
    } else {
      // Put all results under test name category
      categories[test.name] = report.results;
    }
    
    return categories;
  };
  
  const resultCategories = getResultsByCategory();

  return (
    <div className="print-page-content p-6">
      {/* Always show header and footer in the report view since print options are removed */}
      <ReportHeader />
      
      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
        <div className="flex">
          <span className="font-semibold w-28">Patient Name:</span>
          <span>{patient.fullName}</span>
        </div>
        <div className="flex">
          <span className="font-semibold w-28">Date:</span>
          <span>{format(new Date(report.date), "d MMM yyyy")}</span>
        </div>
        
        <div className="flex">
          <span className="font-semibold w-28">Patient ID:</span>
          <span>{patient.id.replace('p', '')}</span>
        </div>
        <div className="flex">
          <span className="font-semibold w-28">Gender:</span>
          <span>{patient.sex}</span>
        </div>
        
        <div className="flex">
          <span className="font-semibold w-28">Doctor:</span>
          <span>Dr. Not Specified</span>
        </div>
        <div className="flex">
          <span className="font-semibold w-28">Age:</span>
          <span>{patient.age} years</span>
        </div>
      </div>
      
      {/* Results Section - Either Table (for Numeric) or Positive/Negative Result */}
      {test.resultType === "Positive/Negative" ? (
        // Positive/Negative Result Display
        <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{test.name} Result</h2>
          <div className="flex items-center justify-center p-6">
            <div className={`text-2xl font-bold ${
              report.positiveNegativeResult === "Positive" 
                ? "text-red-600" 
                : report.positiveNegativeResult === "Negative"
                  ? "text-green-600" 
                  : "text-gray-600"
            }`}>
              {report.positiveNegativeResult || "Pending"}
            </div>
          </div>
          {test.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">{test.description}</p>
            </div>
          )}
        </div>
      ) : (
        // Numeric Results Table
        <table className="w-full border-collapse mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Test Name</th>
              <th className="border px-4 py-2 text-left">Result</th>
              <th className="border px-4 py-2 text-left">Reference Range</th>
              <th className="border px-4 py-2 text-left">Unit</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(resultCategories).map(([category, results], catIndex) => (
              <React.Fragment key={`category-${catIndex}`}>
                <tr>
                  <td colSpan={4} className="border px-4 py-2 bg-gray-50 font-medium">
                    {category}
                  </td>
                </tr>
                {results.map((result, index) => {
                  // Check if result is outside reference range
                  const isAbnormal = (() => {
                    if (!result.referenceRange) return false;
                    
                    // Extract numbers from the reference range
                    const rangeMatch = result.referenceRange.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
                    if (rangeMatch) {
                      const min = parseFloat(rangeMatch[1]);
                      const max = parseFloat(rangeMatch[2]);
                      return parseFloat(result.value) < min || parseFloat(result.value) > max;
                    }
                    
                    // Handle ranges with < or > symbols
                    if (result.referenceRange.includes('<')) {
                      const maxVal = parseFloat(result.referenceRange.replace(/[^0-9.]/g, ''));
                      return parseFloat(result.value) >= maxVal;
                    }
                    
                    if (result.referenceRange.includes('>')) {
                      const minVal = parseFloat(result.referenceRange.replace(/[^0-9.]/g, ''));
                      return parseFloat(result.value) <= minVal;
                    }
                    
                    return false;
                  })();
                  
                  return (
                    <tr key={`result-${index}`}>
                      <td className="border px-4 py-2">{result.parameter}</td>
                      <td className={`border px-4 py-2 ${isAbnormal ? 'text-red-500 font-medium' : ''}`}>
                        {result.value}
                      </td>
                      <td className="border px-4 py-2">{result.referenceRange}</td>
                      <td className="border px-4 py-2">{result.unit}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      
      {/* Always show footer */}
      <ReportFooter dateString={dateString} timeString={timeString} />
    </div>
  );
};

export default ReportPrintView;
