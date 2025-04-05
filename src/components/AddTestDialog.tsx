
// import { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Test, useLab } from "@/context/LabContext";
// import { Check, Search, X } from "lucide-react";
// import { Input } from "./ui/input";
// import { toast } from "sonner";

// interface AddTestDialogProps {
//   patientId: string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onTestAdded?: () => void;
// }

// const AddTestDialog = ({ patientId, open, onOpenChange, onTestAdded }: AddTestDialogProps) => {
//   const { labData, addReport, addInvoice } = useLab();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredTests, setFilteredTests] = useState<Test[]>([]);
//   const [selectedTests, setSelectedTests] = useState<Test[]>([]);
//   const currentDate = new Date().toISOString().split('T')[0];

//   // Filter tests based on search query
//   useEffect(() => {
//     if (open) {
//       if (searchQuery.trim() === "") {
//         setFilteredTests([...labData.tests]);
//       } else {
//         const filtered = labData.tests.filter(test => 
//           test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
//           test.code.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//         setFilteredTests(filtered);
//       }
//     }
//   }, [searchQuery, labData.tests, open]);

//   // Reset state when dialog opens
//   useEffect(() => {
//     if (open) {
//       setSearchQuery("");
//       setSelectedTests([]);
//       setFilteredTests([...labData.tests]);
//     }
//   }, [open, labData.tests]);

//   const toggleTestSelection = (test: Test) => {
//     if (selectedTests.find(t => t.id === test.id)) {
//       setSelectedTests(prev => prev.filter(t => t.id !== test.id));
//     } else {
//       setSelectedTests(prev => [...prev, test]);
//     }
//   };

//   const handleSubmit = () => {
//     if (selectedTests.length === 0) {
//       toast.error("Please select at least one test");
//       return;
//     }

//     try {
//       // Create reports for each selected test
//       selectedTests.forEach(test => {
//         addReport({
//           testId: test.id,
//           patientId: patientId,
//           date: currentDate,
//           status: "Pending"
//         });
//       });

//       // Create an invoice for these tests
//       const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);
      
//       addInvoice({
//         patientId: patientId,
//         tests: selectedTests.map(test => ({ testId: test.id, price: test.price })),
//         totalAmount: totalAmount,
//         discountPercentage: 0,
//         discountAmount: 0,
//         netAmount: totalAmount,
//         paymentMode: "Cash",
//         amountPaid: 0,
//         balanceAmount: totalAmount,
//         date: currentDate,
//         status: "Pending"
//       });

//       toast.success(`${selectedTests.length} tests added successfully`);
      
//       if (onTestAdded) {
//         onTestAdded();
//       }
      
//       onOpenChange(false);
//     } catch (error) {
//       console.error("Error adding tests:", error);
//       toast.error("Failed to add tests");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px] rounded-xl border border-slate-200 p-0 overflow-hidden">
//         <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-futuristic-purple/10 to-futuristic-blue/10">
//           <DialogTitle className="text-xl font-semibold">Add New Test</DialogTitle>
//         </DialogHeader>
        
//         <div className="px-6 py-4">
//           <div className="mb-4 relative">
//             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//               <Search className="h-4 w-4 text-slate-400" />
//             </div>
//             <Input
//               placeholder="Search tests by name or code"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>
          
//           <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
//             <div>
//               <Label className="text-sm font-medium text-slate-600 mb-2 block">
//                 Select Test
//               </Label>
              
//               <div className="space-y-1 rounded-md border border-slate-200">
//                 {filteredTests.map(test => (
//                   <div 
//                     key={test.id}
//                     onClick={() => toggleTestSelection(test)}
//                     className={`flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
//                       selectedTests.find(t => t.id === test.id) ? 'bg-futuristic-purple/5 border-l-4 border-futuristic-purple' : ''
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
//                         selectedTests.find(t => t.id === test.id) 
//                           ? 'bg-futuristic-purple text-white' 
//                           : 'border border-slate-300'
//                       }`}>
//                         {selectedTests.find(t => t.id === test.id) && <Check className="h-3 w-3" />}
//                       </div>
//                       <div>
//                         <div className="font-medium">{test.name}</div>
//                         <div className="text-xs text-slate-500">Code: {test.code}</div>
//                       </div>
//                     </div>
//                     <div className="font-medium">₹{test.price.toFixed(2)}</div>
//                   </div>
//                 ))}
                
//                 {filteredTests.length === 0 && (
//                   <div className="px-4 py-6 text-center text-slate-500">
//                     No tests found matching your search
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
          
//           {selectedTests.length > 0 && (
//             <div className="mt-4 pt-4 border-t border-slate-200">
//               <div className="flex justify-between items-center text-sm font-medium mb-2">
//                 <span>Selected Tests ({selectedTests.length})</span>
//                 <span>Total: ₹{selectedTests.reduce((sum, test) => sum + test.price, 0).toFixed(2)}</span>
//               </div>
              
//               <div className="space-y-2 max-h-[100px] overflow-y-auto">
//                 {selectedTests.map(test => (
//                   <div key={test.id} className="flex justify-between items-center bg-slate-50 rounded-md px-3 py-2">
//                     <span>{test.name}</span>
//                     <div className="flex items-center">
//                       <span className="text-sm mr-2">₹{test.price.toFixed(2)}</span>
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6 text-slate-400 hover:text-red-500"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           toggleTestSelection(test);
//                         }}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
        
//         <DialogFooter className="bg-slate-50 px-6 py-4 gap-2">
//           <Button
//             variant="outline"
//             onClick={() => onOpenChange(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSubmit}
//             className="bg-futuristic-purple hover:bg-futuristic-purple/90 text-white"
//           >
//             Add Tests
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddTestDialog;

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Test, useLab } from "@/context/LabContext";
import { Check, Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface AddTestDialogProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestAdded?: () => void;
}

const AddTestDialog = ({ patientId, open, onOpenChange, onTestAdded }: AddTestDialogProps) => {
  const { labData, addReport, addInvoice } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  const currentDate = new Date().toISOString().split('T')[0];

  // Filter tests based on search query
  useEffect(() => {
    if (open) {
      if (searchQuery.trim() === "") {
        setFilteredTests([...labData.tests]);
      } else {
        const filtered = labData.tests.filter(test => 
          test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          test.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTests(filtered);
      }
    }
  }, [searchQuery, labData.tests, open]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedTests([]);
      setFilteredTests([...labData.tests]);
    }
  }, [open, labData.tests]);

  const toggleTestSelection = (test: Test) => {
    if (selectedTests.find(t => t.id === test.id)) {
      setSelectedTests(prev => prev.filter(t => t.id !== test.id));
    } else {
      setSelectedTests(prev => [...prev, test]);
    }
  };

  const handleSubmit = () => {
    if (selectedTests.length === 0) {
      toast.error("Please select at least one test");
      return;
    }

    try {
      // Create reports for each selected test
      selectedTests.forEach(test => {
        addReport({
          testId: test.id,
          patientId: patientId,
          date: currentDate,
          status: "Pending"
        });
      });

      // Create an invoice for these tests
      const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);
      
      addInvoice({
        patientId: patientId,
        tests: selectedTests.map(test => ({ testId: test.id, price: test.price })),
        totalAmount: totalAmount,
        discountPercentage: 0,
        discountAmount: 0,
        netAmount: totalAmount,
        paymentMode: "Cash",
        amountPaid: 0,
        balanceAmount: totalAmount,
        date: currentDate,
        status: "Pending"
      });

      toast.success(`${selectedTests.length} tests added successfully`);
      
      if (onTestAdded) {
        onTestAdded();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding tests:", error);
      toast.error("Failed to add tests");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-xl border border-slate-200 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-futuristic-purple/10 to-futuristic-blue/10">
          <DialogTitle className="text-xl font-semibold">Add New Test</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              placeholder="Search tests by name or code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            <div>
              <Label className="text-sm font-medium text-slate-600 mb-2 block">
                Select Test
              </Label>
              
              <div className="space-y-1 rounded-md border border-slate-200">
                {filteredTests.length > 0 ? (
                  filteredTests.map(test => (
                    <div 
                      key={test.id}
                      onClick={() => toggleTestSelection(test)}
                      className={`flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedTests.find(t => t.id === test.id) ? 'bg-futuristic-purple/5 border-l-4 border-futuristic-purple' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          selectedTests.find(t => t.id === test.id) 
                            ? 'bg-futuristic-purple text-white' 
                            : 'border border-slate-300'
                        }`}>
                          {selectedTests.find(t => t.id === test.id) && <Check className="h-3 w-3" />}
                        </div>
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-xs text-slate-500">Code: {test.code}</div>
                        </div>
                      </div>
                      <div className="font-medium">₹{test.price.toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-slate-500">
                    No tests found matching your search
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {selectedTests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm font-medium mb-2">
                <span>Selected Tests ({selectedTests.length})</span>
                <span>Total: ₹{selectedTests.reduce((sum, test) => sum + test.price, 0).toFixed(2)}</span>
              </div>
              
              <div className="space-y-2 max-h-[100px] overflow-y-auto">
                {selectedTests.map(test => (
                  <div key={test.id} className="flex justify-between items-center bg-slate-50 rounded-md px-3 py-2">
                    <span>{test.name}</span>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">₹{test.price.toFixed(2)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTestSelection(test);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-slate-50 px-6 py-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-futuristic-purple hover:bg-futuristic-purple/90 text-white"
          >
            Add Tests
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestDialog;
