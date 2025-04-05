
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLab, TestResultType } from "@/context/LabContext";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface NewTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestAdded?: () => void;
}

interface TestParameter {
  name: string;
  unit: string;
  referenceRange: string;
}

const NewTestDialog = ({ open, onOpenChange, onTestAdded }: NewTestDialogProps) => {
  const { addTest, labData } = useLab();
  
  const [testData, setTestData] = useState({
    name: "",
    category: "",
    price: "",
    code: "",
    description: "",
    instructions: "",
    resultType: "Numeric" as TestResultType
  });
  
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [newParameter, setNewParameter] = useState({
    name: "",
    unit: "",
    referenceRange: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === "resultType") {
      // Ensure we only set valid TestResultType values
      const typedValue = value as TestResultType;
      
      setTestData(prev => ({
        ...prev,
        [name]: typedValue
      }));
      
      // If switching to Positive/Negative, clear parameters
      if (typedValue === "Positive/Negative") {
        setParameters([]);
      }
    } else {
      setTestData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleParameterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewParameter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addParameter = () => {
    if (!newParameter.name) {
      toast.error("Parameter name is required");
      return;
    }
    
    setParameters([...parameters, { ...newParameter }]);
    setNewParameter({ name: "", unit: "", referenceRange: "" });
  };
  
  const removeParameter = (index: number) => {
    const updatedParameters = [...parameters];
    updatedParameters.splice(index, 1);
    setParameters(updatedParameters);
  };
  
  const handleSubmit = () => {
    // Validate required fields
    if (!testData.name || !testData.category || !testData.price || !testData.code) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      // If it's a positive/negative test, no parameters are needed
      const paramCount = testData.resultType === "Positive/Negative" ? 0 : parameters.length;
      
      // Add the new test
      addTest({
        name: testData.name,
        category: testData.category,
        parameters: paramCount,
        price: parseFloat(testData.price) || 0,
        code: testData.code,
        description: testData.description,
        instructions: testData.instructions,
        resultType: testData.resultType
      });
      
      // Reset form
      setTestData({
        name: "",
        category: "",
        price: "",
        code: "",
        description: "",
        instructions: "",
        resultType: "Numeric"
      });
      setParameters([]);
      
      // Call the callback if provided
      if (onTestAdded) {
        onTestAdded();
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding test:", error);
      toast.error("Failed to add test");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-xl border border-slate-200 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-futuristic-blue/10 to-futuristic-teal/10 sticky top-0 z-10">
          <DialogTitle className="text-xl font-semibold">Add New Test</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                Test Name
              </Label>
              <Input
                id="name"
                name="name"
                value={testData.name}
                onChange={handleInputChange}
                placeholder="e.g., Complete Blood Count"
                className="bg-yellow-50 border-gray-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                Test Code
              </Label>
              <Input
                id="code"
                name="code"
                value={testData.code}
                onChange={handleInputChange}
                placeholder="e.g., CBC001"
                className="bg-yellow-50 border-gray-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                Category
              </Label>
              <Select
                value={testData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="bg-yellow-50 border-gray-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {labData.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                Price (₹)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={testData.price}
                onChange={handleInputChange}
                placeholder="e.g., 500"
                min={0}
                step={0.01}
                className="bg-yellow-50 border-gray-200"
              />
            </div>
          </div>
          
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={testData.description}
                onChange={handleInputChange}
                placeholder="Enter test description..."
                rows={2}
                className="bg-yellow-50 border-gray-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-sm font-medium">Preparation Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={testData.instructions}
                onChange={handleInputChange}
                placeholder="Enter preparation instructions..."
                rows={2}
                className="bg-yellow-50 border-gray-200"
              />
            </div>
          </div>
          
          {/* Result Type Selection */}
          <div className="border rounded-md p-4 bg-slate-50 mt-4 mb-4">
            <Label className="text-sm font-medium mb-2 block">Result Type</Label>
            <RadioGroup 
              value={testData.resultType} 
              onValueChange={(value) => handleSelectChange("resultType", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Numeric" id="numeric" />
                <Label htmlFor="numeric">Numeric Parameters</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Positive/Negative" id="positive-negative" />
                <Label htmlFor="positive-negative">Positive/Negative</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Parameters Section - Only show if Numeric is selected */}
          {testData.resultType === "Numeric" && (
            <div className="border rounded-md p-4 bg-slate-50 mt-4">
              <h3 className="text-base font-medium mb-4">Test Parameters</h3>
              
              {parameters.length > 0 && (
                <div className="mb-4 space-y-2">
                  {parameters.map((param, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="w-1/3 text-sm font-medium">{param.name}</div>
                        <div className="w-1/3 text-sm text-gray-600">{param.unit}</div>
                        <div className="w-1/3 text-sm text-gray-600">{param.referenceRange}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500"
                        onClick={() => removeParameter(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <Label htmlFor="paramName" className="text-xs">Parameter Name</Label>
                  <Input
                    id="paramName"
                    name="name"
                    value={newParameter.name}
                    onChange={handleParameterInputChange}
                    placeholder="e.g., Hemoglobin"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="paramUnit" className="text-xs">Unit</Label>
                  <Input
                    id="paramUnit"
                    name="unit"
                    value={newParameter.unit}
                    onChange={handleParameterInputChange}
                    placeholder="e.g., g/dL"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="paramRange" className="text-xs">Reference Range</Label>
                  <Input
                    id="paramRange"
                    name="referenceRange"
                    value={newParameter.referenceRange}
                    onChange={handleParameterInputChange}
                    placeholder="e.g., 12-16"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={addParameter}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Parameter
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-slate-50 px-6 py-4 gap-2 sticky bottom-0 z-10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-futuristic-blue hover:bg-futuristic-blue/90 text-white"
          >
            Add Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTestDialog;
