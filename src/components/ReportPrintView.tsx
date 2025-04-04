
import { format } from "date-fns";
import { Report, Patient, Test } from "@/context/LabContext";

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
    
    // For now, just assume Biochemistry category for demonstration
    categories["Biochemistry"] = [];
    
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
    <div className="p-8 max-w-4xl mx-auto bg-white print:p-0 print:max-w-none">
      {/* Header with time and title */}
      <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
        <div>{format(now, "h:mm:ss, p")}</div>
        <div>Medical Report - v2</div>
      </div>
      
      {/* Logo and title section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 7h-6l-1-7z" />
            </svg>
          </div>
        </div>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">Lab Report</h1>
        </div>
        <div>
          <img 
            src="/lovable-uploads/852c0452-f823-44bb-a2b4-9cccd3034379.png" 
            alt="NVR Diagnostics" 
            className="h-12" 
          />
        </div>
      </div>
      
      {/* Colored bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mb-6"></div>
      
      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
        <div className="flex">
          <div className="w-32 font-semibold">Patient Name:</div>
          <div>{patient.fullName}</div>
        </div>
        <div className="flex">
          <div className="w-32 font-semibold">Date:</div>
          <div>{format(new Date(report.date), "dd MMMM yyyy")}</div>
        </div>
        <div className="flex">
          <div className="w-32 font-semibold">Patient ID:</div>
          <div>{patient.id.replace('p', '')}</div>
        </div>
        <div className="flex">
          <div className="w-32 font-semibold">Gender:</div>
          <div>{patient.sex}</div>
        </div>
        <div className="flex">
          <div className="w-32 font-semibold">Doctor:</div>
          <div>Dr. Not Specified</div>
        </div>
        <div className="flex">
          <div className="w-32 font-semibold">Age:</div>
          <div>{patient.age} years</div>
        </div>
      </div>
      
      {/* Results Table */}
      <table className="w-full border-collapse mb-8">
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
            <>
              <tr key={`category-${catIndex}`}>
                <td colSpan={4} className="border px-4 py-2 bg-gray-50 font-medium">
                  {category}
                </td>
              </tr>
              {results.map((result, index) => (
                <tr key={`result-${index}`}>
                  <td className="border px-4 py-2">{result.parameter}</td>
                  <td className={`border px-4 py-2 ${
                    result.value > result.referenceRange?.replace(/[<>]/g, '') ? 'text-red-500' : ''
                  }`}>
                    {result.value}
                  </td>
                  <td className="border px-4 py-2">{result.referenceRange}</td>
                  <td className="border px-4 py-2">{result.unit}</td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
      
      {/* Bottom Colored bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mb-6"></div>
      
      {/* Footer */}
      <div className="text-center mb-8">
        <div className="font-bold text-blue-600">NVR DIAGNOSTICS</div>
        <div className="text-sm text-gray-600">Santharam Hospital, Dowlaiswaram, Rajamahendravaram - 7780377630</div>
      </div>
      
      <div className="flex justify-end text-xs text-gray-500">
        <div>Printed on: {dateString} {timeString}</div>
      </div>
      
      {/* Page number */}
      <div className="mt-16 flex justify-between text-xs text-gray-500">
        <div>about:blank</div>
        <div>1/1</div>
      </div>
    </div>
  );
};

export default ReportPrintView;
