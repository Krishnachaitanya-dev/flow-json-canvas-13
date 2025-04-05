
import { useState, useEffect } from "react";
import { Test, TestResultType, useLab } from "@/context/LabContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define the Parameter interface for our internal use
interface Parameter {
  parameter: string;
  unit: string;
  referenceRange: string;
}

// Define an extended test type for internal use that includes our Parameter array
interface ExtendedTest extends Omit<Test, 'parameters'> {
  parameterCount: number; // Store the original numeric parameter count here
  parameters: Parameter[]; // This is our array of parameter objects for UI
}

interface EditTestDialogProps {
  test: Test | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const EditTestDialog = ({ test, open, onOpenChange, onUpdate }: EditTestDialogProps) => {
  const { updateTest, labData } = useLab();
  
  const [testData, setTestData] = useState<ExtendedTest>({
    id: "",
    name: "",
    category: "",
    parameterCount: 0,
    parameters: [],
    price: 0,
    code: "",
    resultType: "Numeric" as TestResultType
  });
  
  const [newParameter, setNewParameter] = useState<Parameter>({
    parameter: "",
    unit: "",
    referenceRange: ""
  });
  
  // Initialize the form with test data when test changes
  useEffect(() => {
    if (test) {
      // Initialize parameters based on test name or just empty array for new resultType
      let initialParameters: Parameter[] = [];
      
      if (test.resultType !== "Positive/Negative") {
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
      }
      
      setTestData({
        ...test,
        parameterCount: test.parameters, // Store the original numeric parameter count
        parameters: initialParameters, // Use our array of Parameter objects
        resultType: test.resultType || "Numeric" // Default to Numeric if not specified
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
    if (name === "resultType") {
      // Only set resultType as Numeric or Positive/Negative (enforcing the TypeScript type)
      const typedValue = value as TestResultType;
      
      // If switching to Positive/Negative, clear parameters
      if (typedValue === "Positive/Negative") {
        setTestData(prev => ({
          ...prev,
          resultType: typedValue,
          parameters: [],
          parameterCount: 0
        }));
      } else {
        setTestData(prev => ({
          ...prev,
          resultType: typedValue
        }));
      }
    } else {
      setTestData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
    if (!testData.name || !testData.category || testData.price <= 0) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Update the test with the new data, converting our ExtendedTest to Test format
    updateTest({
      id: testData.id,
      name: testData.name,
      category: testData.category,
      parameters: testData.parameterCount, // Use the numeric parameter count for the API
      price: testData.price,
      code: testData.code,
      description: testData.description,
      instructions: testData.instructions,
      resultType: testData.resultType
    });
    
    toast.success("Test updated successfully");
    
    // Call the onUpdate callback if provided
    if (onUpdate) onUpdate();
    
    // Close the dialog
    onOpenChange(false);
  };

  // Filter out any empty categories
  const validCategories = labData.categories.filter(category => category && category.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-50">
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
              className="bg-white border-gray-200"
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
              className="bg-white border-gray-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="after:content-['*'] after:ml-0.5 after:text-red-500">Category</Label>
            <Select
              value={testData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {validCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                {validCategories.length === 0 && (
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                )}
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
              className="bg-white border-gray-200"
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
            className="bg-white border-gray-200"
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
            className="bg-white border-gray-200"
            rows={3}
          />
        </div>
        
        {/* Result Type Selection */}
        <div className="space-y-3 mt-4">
          <Label>Result Type</Label>
          <RadioGroup 
            value={testData.resultType} 
            onValueChange={(value) => handleSelectChange("resultType", value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Numeric" id="numeric-edit" />
              <Label htmlFor="numeric-edit">Numeric Parameters</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Positive/Negative" id="positive-negative-edit" />
              <Label htmlFor="positive-negative-edit">Positive/Negative</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Parameters Section - Only show if Numeric is selected */}
        {testData.resultType === "Numeric" && (
          <div className="space-y-3 mt-4">
            <Label>Parameters</Label>
            <div className="bg-white rounded-md border border-gray-200 p-4">
              {testData.parameters.map((param, index) => (
                <div key={index} className="flex mb-3 items-center gap-2">
                  <div className="w-1/3">
                    <Input
                      value={param.parameter}
                      onChange={(e) => handleParameterChange(index, "parameter", e.target.value)}
                      placeholder="Parameter name"
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="w-1/5">
                    <Input
                      value={param.unit}
                      onChange={(e) => handleParameterChange(index, "unit", e.target.value)}
                      placeholder="Unit (e.g., mg/dL)"
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={param.referenceRange}
                      onChange={(e) => handleParameterChange(index, "referenceRange", e.target.value)}
                      placeholder="Reference range"
                      className="bg-white border-gray-200"
                    />
                  </div>
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
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium mb-3">Add New Parameter</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1/3">
                    <Input
                      value={newParameter.parameter}
                      onChange={(e) => handleNewParameterChange("parameter", e.target.value)}
                      placeholder="Parameter name"
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="w-1/5">
                    <Input
                      value={newParameter.unit}
                      onChange={(e) => handleNewParameterChange("unit", e.target.value)}
                      placeholder="Unit (e.g., mg/dL)"
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={newParameter.referenceRange}
                      onChange={(e) => handleNewParameterChange("referenceRange", e.target.value)}
                      placeholder="Reference range"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddParameter}
                  className="flex items-center gap-1 mt-2 w-full justify-center"
                  disabled={newParameter.parameter.trim() === ""}
                >
                  <Plus className="h-4 w-4" /> Add Parameter
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Update Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTestDialog;
