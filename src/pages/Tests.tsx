
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  
  // Filter tests based on search query and selected category
  const filteredTests = labData.tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         test.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories from tests
  const categories = Array.from(new Set(labData.tests.map((test) => test.category)));
  
  // Handle edit test
  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
  };
  
  // Handle delete test confirmation
  const handleDeleteConfirm = (testId: string) => {
    setTestToDelete(testId);
    setIsDeleteConfirmOpen(true);
  };
  
  // Handle delete test
  const handleDeleteTest = () => {
    if (testToDelete) {
      deleteTest(testToDelete);
      setIsDeleteConfirmOpen(false);
      setTestToDelete(null);
    }
  };

  return (
    <Layout title="Tests">
      <div className="mb-6 flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tests by name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
          
          <Button 
            onClick={() => setIsAddTestOpen(true)}
            className="ml-auto sm:ml-4 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Test
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <Card key={test.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{test.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{test.category}</p>
                    <p className="text-sm mt-2">
                      <span className="font-medium">Code:</span> {test.code}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Parameters:</span> {test.parameters}
                    </p>
                    <p className="text-md font-medium mt-2">₹{test.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTest(test)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteConfirm(test.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTests.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery || selectedCategory
              ? "No tests match your search criteria"
              : "No tests found. Add a test to get started."}
          </div>
        )}
      </div>
      
      {/* Edit Test Dialog */}
      <EditTestDialog
        test={selectedTest}
        open={selectedTest !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTest(null);
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test
              and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Add Test Dialog - Placeholder, we'll implement this in a separate component */}
      <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>This feature will be implemented soon.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddTestOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Tests;
