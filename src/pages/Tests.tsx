import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useLab, Test } from "@/context/LabContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileEdit, Trash2, Search, Plus, Copy, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import EditTestDialog from "@/components/EditTestDialog";
import NewTestDialog from "@/components/NewTestDialog";
import AddCategoryDialog from "@/components/AddCategoryDialog";

const Tests = () => {
  const { labData, deleteTest } = useLab();
  const [tests, setTests] = useState<Test[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTestDialogOpen, setNewTestDialogOpen] = useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  
  // Get unique categories from tests
  const categories = ["All", ...new Set(labData.tests.map(test => test.category))];
  
  // Filter tests based on search and category
  useEffect(() => {
    let filtered = [...labData.tests];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }
    
    setTests(filtered);
  }, [labData.tests, searchQuery, selectedCategory]);
  
  const handleTestUpdate = () => {
    setEditDialogOpen(false);
    setEditingTest(null);
  };
  
  const handleTestDelete = (testId: string) => {
    try {
      deleteTest(testId);
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Failed to delete test");
    }
  };
  
  const handleEditTest = (test: Test) => {
    setEditingTest(test);
    setEditDialogOpen(true);
  };

  // Function to get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hematology':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'Biochemistry':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'Endocrinology':
        return 'bg-gradient-to-r from-teal-500 to-green-500';
      case 'Microbiology':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      case 'Immunology':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'Pathology':
        return 'bg-gradient-to-r from-gray-500 to-slate-700';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500';
    }
  };

  return (
    <Layout title="Tests">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search tests by name or code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setNewTestDialogOpen(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Test
              </Button>
              <Button 
                onClick={() => setAddCategoryDialogOpen(true)}
                className="bg-futuristic-purple hover:bg-futuristic-purple/90 text-white flex items-center gap-2"
              >
                <FolderPlus className="h-4 w-4" /> Add Category
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("All")}
              className={selectedCategory === "All" ? "bg-teal-500 hover:bg-teal-600" : ""}
            >
              All
            </Button>
            {categories.filter(cat => cat !== "All").map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-teal-500 hover:bg-teal-600" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {tests.map((test) => (
              <div key={test.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className={`p-4 text-white ${getCategoryColor(test.category)}`}>
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold">{test.name}</h3>
                    <Copy className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
                  </div>
                  <Badge className="mt-1 bg-white/20 text-white hover:bg-white/30">
                    {test.category}
                  </Badge>
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-500">Code: {test.code}</span>
                    <span className="font-semibold text-lg text-teal-600">₹{test.price.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Parameters: {test.parameters}
                  </div>
                  
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 border-gray-200"
                      onClick={() => handleEditTest(test)}
                    >
                      <FileEdit className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 text-red-600 hover:text-red-700 border-gray-200 hover:bg-red-50"
                      onClick={() => handleTestDelete(test.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tests found</h3>
            <p className="mb-6 text-gray-500">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding tests to your catalog"}
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mx-auto"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Edit Test Dialog */}
      <EditTestDialog
        test={editingTest}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleTestUpdate}
      />
      
      {/* New Test Dialog */}
      <NewTestDialog
        open={newTestDialogOpen}
        onOpenChange={setNewTestDialogOpen}
        onTestAdded={() => {
          setSearchQuery("");
          setSelectedCategory("All");
        }}
      />
      
      {/* Add Category Dialog */}
      <AddCategoryDialog
        open={addCategoryDialogOpen}
        onOpenChange={setAddCategoryDialogOpen}
      />
    </Layout>
  );
};

export default Tests;
