
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLab } from "@/context/LabContext";
import { toast } from "sonner";

interface NewTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestAdded?: () => void;
}

const NewTestDialog = ({ open, onOpenChange, onTestAdded }: NewTestDialogProps) => {
  const { addTest } = useLab();
  
  const [testData, setTestData] = useState({
    name: "",
    category: "",
    parameters: "0",
    price: "",
    code: "",
    description: "",
    instructions: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = () => {
    // Validate required fields
    if (!testData.name || !testData.category || !testData.price || !testData.code) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      // Add the new test
      addTest({
        name: testData.name,
        category: testData.category,
        parameters: parseInt(testData.parameters) || 0,
        price: parseFloat(testData.price) || 0,
        code: testData.code,
        description: testData.description,
        instructions: testData.instructions
      });
      
      // Reset form
      setTestData({
        name: "",
        category: "",
        parameters: "0",
        price: "",
        code: "",
        description: "",
        instructions: ""
      });
      
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
      <DialogContent className="sm:max-w-[550px] rounded-xl border border-slate-200 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
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
            
            <div className="space-y-2">
              <Label htmlFor="parameters" className="text-sm font-medium">
                Parameters Count
              </Label>
              <Input
                id="parameters"
                name="parameters"
                type="number"
                value={testData.parameters}
                onChange={handleInputChange}
                placeholder="e.g., 5"
                min={0}
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
                rows={3}
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
                rows={3}
                className="bg-yellow-50 border-gray-200"
              />
            </div>
          </div>
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
