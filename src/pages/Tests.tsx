import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Edit, Trash2, FileSpreadsheet, Beaker, Flame, Tag } from "lucide-react";
// import { PlusCircle, Search, Edit, Trash2, FileSpreadsheet, Beaker, Flame, Tag, Flask } from "lucide-react";
// import { PlusCircle, Search, Edit, Trash2, FileSpreadsheet, Beaker, Flame, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Test } from "@/context/LabContext";
import EditTestDialog from "@/components/EditTestDialog";

const Tests = () => {
  const { labData, deleteTest } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  
  const filteredTests = labData.tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         test.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const categories = Array.from(new Set(labData.tests.map((test) => test.category)));
  
  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
  };
  
  const handleDeleteConfirm = (testId: string) => {
    setTestToDelete(testId);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleDeleteTest = () => {
    if (testToDelete) {
      deleteTest(testToDelete);
      setIsDeleteConfirmOpen(false);
      setTestToDelete(null);
    }
  };

  return (
    <Layout title="Tests">
      <Card className="mb-8 border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tests by name or code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border border-slate-200 rounded-xl focus:ring-futuristic-teal focus:border-futuristic-teal"
              />
            </div>
            
            <Button 
              onClick={() => setIsAddTestOpen(true)}
              className="bg-gradient-to-r from-futuristic-teal to-futuristic-cyan text-white hover:opacity-90 rounded-xl min-w-[150px]"
            >
              <Beaker className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? 
                "bg-futuristic-teal text-white hover:bg-futuristic-cyan" : 
                "border-futuristic-teal/30 text-futuristic-teal hover:bg-futuristic-teal/10"}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 
                  "bg-futuristic-teal text-white hover:bg-futuristic-cyan" : 
                  "border-futuristic-teal/30 text-futuristic-teal hover:bg-futuristic-teal/10"}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <Card key={test.id} className="overflow-hidden bg-white border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className={`p-4 text-white ${getCategoryColor(test.category)}`}>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">{test.name}</CardTitle>
                <Flask className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm text-white/80 mt-1 flex items-center gap-1">
                <Tag className="h-3 w-3" /> {test.category}
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs text-futuristic-dark py-1 px-2 bg-slate-100 rounded-full">
                    Code: {test.code}
                  </div>
                  <p className="text-lg font-bold text-futuristic-teal">₹{test.price.toFixed(2)}</p>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Parameters: {test.parameters}
                </p>
                
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTest(test)}
                    className="flex-1 border border-slate-200 hover:bg-futuristic-teal/10 hover:text-futuristic-teal hover:border-futuristic-teal/30"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConfirm(test.id)}
                    className="flex-1 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTests.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-futuristic-teal/10 rounded-full flex items-center justify-center">
              <Flask className="h-8 w-8 text-futuristic-teal" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No tests found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery || selectedCategory
                ? "No tests match your search criteria"
                : "You haven't added any tests yet."}
            </p>
            {!searchQuery && !selectedCategory && (
              <Button
                onClick={() => setIsAddTestOpen(true)}
                className="mt-4 bg-futuristic-teal hover:bg-futuristic-cyan text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Test
              </Button>
            )}
          </div>
        )}
      </div>
      
      <EditTestDialog
        test={selectedTest}
        open={selectedTest !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTest(null);
        }}
      />
      
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white border-none rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test
              and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-slate-200 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              className="bg-red-500 text-white hover:bg-red-600 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
        <DialogContent className="bg-white border-none rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>This feature will be implemented soon.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddTestOpen(false)} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

function getCategoryColor(category: string) {
  const colors = {
    "Biochemistry": "bg-gradient-to-r from-futuristic-blue to-futuristic-cyan",
    "Hematology": "bg-gradient-to-r from-futuristic-red to-futuristic-pink",
    "Microbiology": "bg-gradient-to-r from-futuristic-teal to-futuristic-cyan",
    "Immunology": "bg-gradient-to-r from-futuristic-purple to-futuristic-blue",
    "Pathology": "bg-gradient-to-r from-futuristic-yellow to-futuristic-orange"
  } as Record<string, string>;
  
  return colors[category] || "bg-gradient-to-r from-futuristic-teal to-futuristic-cyan";
}

export default Tests;
