
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const Tests = () => {
  const { labData, addTest, addReport, addInvoice, updateTest } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [isEditingTest, setIsEditingTest] = useState(false);
  const [isAssigningTest, setIsAssigningTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [newTest, setNewTest] = useState({
    name: "",
    category: "",
    parameters: "1",
    price: "",
    code: "",
  });
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const navigate = useNavigate();
  
  // Filter tests based on search query
  const filteredTests = labData.tests.filter(test => {
    const query = searchQuery.toLowerCase();
    return (
      test.name.toLowerCase().includes(query) ||
      test.code.toLowerCase().includes(query) ||
      test.category.toLowerCase().includes(query)
    );
  });

  // Handle adding a new test
  const handleAddTest = () => {
    if (!newTest.name || !newTest.category || !newTest.price || !newTest.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    const test = {
      name: newTest.name,
      category: newTest.category,
      parameters: parseInt(newTest.parameters),
      price: parseFloat(newTest.price),
      code: newTest.code,
    };

    addTest(test);
    setIsAddingTest(false);
    setNewTest({
      name: "",
      category: "",
      parameters: "1",
      price: "",
      code: "",
    });
  };

  // Handle editing a test
  const handleEditTest = () => {
    if (!selectedTest.name || !selectedTest.category || !selectedTest.price || !selectedTest.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateTest({
      ...selectedTest,
      parameters: parseInt(selectedTest.parameters.toString()),
      price: parseFloat(selectedTest.price.toString())
    });
    
    setIsEditingTest(false);
    setSelectedTest(null);
    toast.success("Test updated successfully");
  };

  // Open edit dialog
  const openEditDialog = (test) => {
    setSelectedTest({...test});
    setIsEditingTest(true);
  };

  // Handle assigning test to a patient
  const handleAssignTest = () => {
    if (!selectedPatientId) {
      toast.error("Please select a patient");
      return;
    }

    // Create new report
    const newReport = {
      testId: selectedTest.id,
      patientId: selectedPatientId,
      date: new Date().toISOString().split('T')[0],
      status: "Pending" as "Pending" | "Completed"
    };
    
    // Create new invoice for the test
    const newInvoice = {
      patientId: selectedPatientId,
      tests: [{ testId: selectedTest.id, price: selectedTest.price }],
      totalAmount: selectedTest.price,
      discountPercentage: 0,
      discountAmount: 0,
      netAmount: selectedTest.price,
      paymentMode: "Cash" as "Cash" | "Card" | "UPI" | "Insurance",
      amountPaid: 0,
      balanceAmount: selectedTest.price,
      date: new Date().toISOString().split('T')[0],
      status: "Pending" as "Pending" | "Paid",
    };
    
    addReport(newReport);
    addInvoice(newInvoice);
    
    setIsAssigningTest(false);
    setSelectedTest(null);
    setSelectedPatientId("");
    
    const patient = labData.patients.find(p => p.id === selectedPatientId);
    toast.success(`Test assigned to ${patient?.fullName}`);

    // Optional: Navigate to patient detail page
    navigate(`/patients/${selectedPatientId}`);
  };

  return (
    <Layout title="Tests">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tests by name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddingTest(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Test
        </Button>
      </div>
      
      <div className="space-y-4">
        {filteredTests.map(test => (
          <div key={test.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{test.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Category: {test.category}
                </p>
                <p className="text-sm text-muted-foreground">
                  Code: {test.code}
                </p>
                <p className="text-sm text-muted-foreground">
                  Parameters: {test.parameters}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="text-lg font-semibold">
                  ₹{test.price.toFixed(2)}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(test)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center"
                    onClick={() => {
                      setSelectedTest(test);
                      setIsAssigningTest(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredTests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery 
              ? "No tests match your search criteria" 
              : "No tests found. Add a test to get started."}
          </div>
        )}
      </div>

      {/* Add Test Dialog */}
      <Dialog open={isAddingTest} onOpenChange={setIsAddingTest}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="name">Test Name</Label>
              <Input
                id="name"
                value={newTest.name}
                onChange={(e) => setNewTest({...newTest, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newTest.category}
                onChange={(e) => setNewTest({...newTest, category: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="code">Test Code</Label>
              <Input
                id="code"
                value={newTest.code}
                onChange={(e) => setNewTest({...newTest, code: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="parameters">Number of Parameters</Label>
              <Input
                id="parameters"
                type="number"
                min="1"
                value={newTest.parameters}
                onChange={(e) => setNewTest({...newTest, parameters: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={newTest.price}
                onChange={(e) => setNewTest({...newTest, price: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTest(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTest}>
              Add Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog open={isEditingTest} onOpenChange={setIsEditingTest}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {selectedTest && (
              <>
                <div>
                  <Label htmlFor="edit-name">Test Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedTest.name}
                    onChange={(e) => setSelectedTest({...selectedTest, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={selectedTest.category}
                    onChange={(e) => setSelectedTest({...selectedTest, category: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-code">Test Code</Label>
                  <Input
                    id="edit-code"
                    value={selectedTest.code}
                    onChange={(e) => setSelectedTest({...selectedTest, code: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-parameters">Number of Parameters</Label>
                  <Input
                    id="edit-parameters"
                    type="number"
                    min="1"
                    value={selectedTest.parameters}
                    onChange={(e) => setSelectedTest({...selectedTest, parameters: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={selectedTest.price}
                    onChange={(e) => setSelectedTest({...selectedTest, price: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTest(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTest}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Patient Dialog */}
      <Dialog open={isAssigningTest} onOpenChange={setIsAssigningTest}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Test to Patient</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {selectedTest && (
              <div>
                <p className="font-medium">{selectedTest.name}</p>
                <p className="text-sm text-muted-foreground">₹{selectedTest.price.toFixed(2)}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="patient">Select Patient</Label>
              <Select
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {labData.patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.fullName} ({patient.age} years)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssigningTest(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTest}>
              Assign Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Tests;
