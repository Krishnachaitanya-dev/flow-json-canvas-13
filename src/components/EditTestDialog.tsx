
import { useState, useEffect } from "react";
import { Test, useLab } from "@/context/LabContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

// Define the Parameter interface for our internal use
interface Parameter {
  parameter: string;
  unit: string;
  referenceRange: string;
}

// Define an extended test type for internal use that includes our Parameter array
interface ExtendedTest extends Omit<Test, 'parameters'> {
  parameters: Parameter[];
  parameterCount: number; // Store the original numeric parameter count here
}

interface EditTestDialogProps {
  test: Test | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const EditTestDialog = ({ test, open, onOpenChange, onUpdate }: EditTestDialogProps) => {
  const { updateTest } = useLab();
  
  const [testData, setTestData] = useState<ExtendedTest>({
    id: "",
    name: "",
    category: "",
    parameterCount: 0, // Initialize the parameter count
    price: 0,
    code: "",
    parameters: [], // Initialize the parameters array
  });
  
  const [newParameter, setNewParameter] = useState<Parameter>({
    parameter: "",
    unit: "",
    referenceRange: ""
  });
  
  // Initialize the form with test data when test changes
  useEffect(() => {
    if (test) {
      // Initialize parameters based on test name
      let initialParameters: Parameter[] = [];
      
      if (test.name === "Complete Blood Count (CBC)" || test.name.includes("CBC")) {
        initialParameters = [
          { parameter: "Hemoglobin", unit: "g/dL", referenceRange: "13.5-17.5 (male), 12.0-15.5 (female)" },
          { parameter: "Red Blood Cells", unit: "x10^6/μL", referenceRange: "4.5-5.9 (male), 4.0-5.2 (female)" },
          { parameter: "White Blood Cells", unit: "x10^3/μL", referenceRange: "4.5-11.0" },
          { parameter: "Platelets", unit: "x10^3/μL", referenceRange: "150-450" },
          { parameter: "Hematocrit", unit: "%", referenceRange: "41-50 (male), 36-44 (female)" }
        ];
      } else if (test.name === "Lipid Profile") {
        initialParameters = [
          { parameter: "Total Cholesterol", unit: "mg/dL", referenceRange: "<200" },
          { parameter: "HDL Cholesterol", unit: "mg/dL", referenceRange: ">40" },
          { parameter: "LDL Cholesterol", unit: "mg/dL", referenceRange: "<100" },
          { parameter: "Triglycerides", unit: "mg/dL", referenceRange: "<150" }
        ];
      }
      
      setTestData({
        ...test,
        parameterCount: test.parameters, // Store the original numeric parameter count
        parameters: initialParameters, // Use our array of Parameter objects
      });
    }
  }, [test]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle parameter input changes
  const handleParameterChange = (index: number, field: keyof Parameter, value: string) => {
    const updatedParameters = [...testData.parameters];
    updatedParameters[index] = {
      ...updatedParameters[index],
      [field]: value
    };
    
    setTestData(prev => ({
      ...prev,
      parameters: updatedParameters
    }));
  };
  
  // Handle new parameter input changes
  const handleNewParameterChange = (field: keyof Parameter, value: string) => {
    setNewParameter(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add a new parameter to the list
  const handleAddParameter = () => {
    if (newParameter.parameter.trim() === "") return;
    
    setTestData(prev => ({
      ...prev,
      parameters: [...prev.parameters, { ...newParameter }],
      parameterCount: prev.parameterCount + 1 // Increment parameter count
    }));
    
    // Reset new parameter form
    setNewParameter({
      parameter: "",
      unit: "",
      referenceRange: ""
    });
  };
  
  // Remove a parameter from the list
  const handleRemoveParameter = (index: number) => {
    setTestData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index),
      parameterCount: prev.parameterCount - 1 // Decrement parameter count
    }));
  };
  
  const handleSubmit = () => {
    if (!testData.name || !testData.category || testData.price <= 0) return;
    
    // Update the test with the new data
    updateTest({
      id: testData.id,
      name: testData.name,
      category: testData.category,
      parameters: testData.parameterCount, // Use the numeric parameter count for the API
      price: testData.price,
      code: testData.code,
      description: testData.description,
      instructions: testData.instructions
    });
    
    // Call the onUpdate callback if provided
    if (onUpdate) onUpdate();
    
    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Test</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="testId">Test ID</Label>
            <Input
              id="testId"
              value={testData.code}
              placeholder="T001"
              readOnly
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-red-500">Test Name</Label>
            <Input
              id="name"
              name="name"
              value={testData.name}
              onChange={handleInputChange}
              placeholder="Complete Blood Count (CBC)"
              className="bg-yellow-50 border-gray-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="after:content-['*'] after:ml-0.5 after:text-red-500">Category</Label>
            <Select
              value={testData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger className="bg-yellow-50 border-gray-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hematology">Hematology</SelectItem>
                <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                <SelectItem value="Microbiology">Microbiology</SelectItem>
                <SelectItem value="Immunology">Immunology</SelectItem>
                <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                <SelectItem value="Pathology">Pathology</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price" className="after:content-['*'] after:ml-0.5 after:text-red-500">Price (₹)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={testData.price}
              onChange={handleInputChange}
              min={0}
              className="bg-yellow-50 border-gray-200"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="after:content-['*'] after:ml-0.5 after:text-red-500">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Evaluates overall health and detects a wide range of disorders."
            value={testData.description || ""}
            onChange={handleInputChange}
            className="bg-yellow-50 border-gray-200"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instructions">Preparation Instructions</Label>
          <Textarea
            id="instructions"
            name="instructions"
            placeholder="Enter preparation instructions (optional)"
            value={testData.instructions || ""}
            onChange={handleInputChange}
            className="bg-yellow-50 border-gray-200"
            rows={3}
          />
        </div>
        
        <div className="space-y-4">
          <Label>Parameters</Label>
          <div className="space-y-4 border rounded-md p-4">
            {testData.parameters.map((param, index) => (
              <div key={index} className="grid grid-cols-[1fr_150px_1fr_40px] gap-2 items-center">
                <Input
                  value={param.parameter}
                  onChange={(e) => handleParameterChange(index, "parameter", e.target.value)}
                  placeholder="Parameter name"
                  className="bg-yellow-50 border-gray-200"
                />
                <Input
                  value={param.unit}
                  onChange={(e) => handleParameterChange(index, "unit", e.target.value)}
                  placeholder="Unit (e.g., mg/dL)"
                  className="bg-yellow-50 border-gray-200"
                />
                <Input
                  value={param.referenceRange}
                  onChange={(e) => handleParameterChange(index, "referenceRange", e.target.value)}
                  placeholder="Reference range"
                  className="bg-yellow-50 border-gray-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveParameter(index)}
                  className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Add New Parameter</h4>
              <div className="grid grid-cols-[1fr_150px_1fr_auto] gap-2 items-center">
                <Input
                  value={newParameter.parameter}
                  onChange={(e) => handleNewParameterChange("parameter", e.target.value)}
                  placeholder="Parameter name"
                  className="bg-yellow-50 border-gray-200"
                />
                <Input
                  value={newParameter.unit}
                  onChange={(e) => handleNewParameterChange("unit", e.target.value)}
                  placeholder="Unit (e.g., mg/dL)"
                  className="bg-yellow-50 border-gray-200"
                />
                <Input
                  value={newParameter.referenceRange}
                  onChange={(e) => handleNewParameterChange("referenceRange", e.target.value)}
                  placeholder="Reference range"
                  className="bg-yellow-50 border-gray-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddParameter}
                  className="flex items-center gap-1"
                  disabled={newParameter.parameter.trim() === ""}
                >
                  <Plus className="h-4 w-4" /> Add Parameter
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          >
            Update Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTestDialog;
