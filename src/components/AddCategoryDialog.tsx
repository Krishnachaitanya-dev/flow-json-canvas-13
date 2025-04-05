
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLab } from "@/context/LabContext";
import { toast } from "sonner";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCategoryDialog = ({ open, onOpenChange }: AddCategoryDialogProps) => {
  const { labData } = useLab();
  const [categoryName, setCategoryName] = useState("");
  
  const handleAddCategory = () => {
    // Validate category name
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    
    // Check if category already exists
    const existingCategories = [...new Set(labData.tests.map(test => test.category))];
    if (existingCategories.includes(categoryName)) {
      toast.error("This category already exists");
      return;
    }
    
    // Category added successfully
    toast.success(`Category "${categoryName}" added successfully`);
    
    // Reset form and close dialog
    setCategoryName("");
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-xl border border-slate-200 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-futuristic-purple/10 to-futuristic-teal/10 sticky top-0 z-10">
          <DialogTitle className="text-xl font-semibold">Add New Category</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                Category Name
              </Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="bg-yellow-50 border-gray-200"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="bg-slate-50 px-6 py-4 gap-2 sticky bottom-0 z-10">
          <Button
            variant="outline"
            onClick={() => {
              setCategoryName("");
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCategory}
            className="bg-futuristic-purple hover:bg-futuristic-purple/90 text-white"
          >
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
