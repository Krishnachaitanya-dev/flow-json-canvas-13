
import { format } from "date-fns";
import { Report, Patient, Test } from "@/context/LabContext";
import { Microscope } from "lucide-react";

interface ReportPrintViewProps {
  report: Report;
  patient: Patient;
  test: Test;
}

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
    } else {
      // Put all results under test name category
      categories[test.name] = report.results;
    }
    
    return categories;
  };
  
  const resultCategories = getResultsByCategory();

  return (
    <div className="print-page-content max-w-4xl mx-auto bg-white">
      {/* Logo and title section */}
      <div className="print-header flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center">
            <Microscope className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">Lab Report</h1>
        </div>
        <div className="w-[100px] h-[48px] flex items-center justify-end">
          <img 
            src="/lovable-uploads/852c0452-f823-44bb-a2b4-9cccd3034379.png" 
            alt="NVR Diagnostics" 
            className="h-10 print-visible"
            style={{ printColorAdjust: 'exact' }}
          />
        </div>
      </div>
      
      {/* Colored bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mb-4"></div>
      
      {/* Patient Information - Compact layout */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
        <div className="flex">
          <div className="w-28 font-semibold">Patient Name:</div>
          <div>{patient.fullName}</div>
        </div>
        <div className="flex">
          <div className="w-28 font-semibold">Date:</div>
          <div>{format(new Date(report.date), "d MMM yyyy")}</div>
        </div>
        
        <div className="flex">
          <div className="w-28 font-semibold">Patient ID:</div>
          <div>{patient.id.replace('p', '')}</div>
        </div>
        <div className="flex">
          <div className="w-28 font-semibold">Gender:</div>
          <div>{patient.sex}</div>
        </div>
        
        <div className="flex">
          <div className="w-28 font-semibold">Doctor:</div>
          <div>Dr. Not Specified</div>
        </div>
        <div className="flex">
          <div className="w-28 font-semibold">Age:</div>
          <div>{patient.age} years</div>
        </div>
      </div>
      
      {/* Results Table - Compact styling */}
      <table className="w-full border-collapse mb-4 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">Test Name</th>
            <th className="border px-2 py-1 text-left">Result</th>
            <th className="border px-2 py-1 text-left">Reference Range</th>
            <th className="border px-2 py-1 text-left">Unit</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(resultCategories).map(([category, results], catIndex) => (
            <>
              <tr key={`category-${catIndex}`}>
                <td colSpan={4} className="border px-2 py-1 bg-gray-50 font-medium">
                  {category}
                </td>
              </tr>
              {results.map((result, index) => {
                const isAbnormal = result.value > result.referenceRange?.replace(/[<>]/g, '');
                return (
                  <tr key={`result-${index}`}>
                    <td className="border px-2 py-1">{result.parameter}</td>
                    <td className={`border px-2 py-1 ${isAbnormal ? 'text-red-500' : ''}`}>
                      {result.value}
                    </td>
                    <td className="border px-2 py-1">{result.referenceRange}</td>
                    <td className="border px-2 py-1">{result.unit}</td>
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </table>
      
      {/* Bottom Colored bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mb-3"></div>
      
      {/* Footer - Compact footer */}
      <div className="text-center mb-3 text-sm">
        <div className="font-bold text-blue-600 text-lg">NVR DIAGNOSTICS</div>
        <div className="text-xs text-gray-600">Santharam Hospital, Dowlaiswaram, Rajamahendravaram - 7780377630</div>
      </div>
      
      {/* Printed timestamp - right aligned */}
      <div className="flex justify-end text-xs text-gray-500">
        <div>Printed on: {dateString} {timeString}</div>
      </div>
    </div>
  );
};

export default ReportPrintView;
