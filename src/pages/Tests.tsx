
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useLab, Test } from "@/context/LabContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MoreHorizontal, FileEdit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import EditTestDialog from "@/components/EditTestDialog";
import NewTestDialog from "@/components/NewTestDialog";

const Tests = () => {
  const { labData, deleteTest } = useLab();
  const [tests, setTests] = useState<Test[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTestDialogOpen, setNewTestDialogOpen] = useState(false);
  
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
    // Refresh the tests list
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

  return (
    <Layout title="Tests">
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader className="bg-gradient-to-r from-futuristic-blue/10 to-futuristic-teal/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <span>Test Catalog</span>
              <Badge variant="outline" className="ml-2 bg-white">
                {tests.length} tests
              </Badge>
            </CardTitle>
            <Button 
              onClick={() => setNewTestDialogOpen(true)}
              className="bg-futuristic-blue hover:bg-futuristic-blue/90 text-white"
            >
              <Plus className="mr-1 h-4 w-4" /> Add Test
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                placeholder="Search by test name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-full sm:w-64">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {tests.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[80px]">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Parameters</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map(test => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.code}</TableCell>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-100">
                          {test.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{test.parameters}</TableCell>
                      <TableCell className="text-right font-medium">{test.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => handleEditTest(test)}>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Edit Test
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleTestDelete(test.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No tests found</h3>
              <p className="mb-6">
                {searchQuery || selectedCategory !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding tests to your catalog"}
              </p>
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
            </div>
          )}
        </CardContent>
      </Card>
      
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
          // Reset filters when a new test is added
          setSearchQuery("");
          setSelectedCategory("All");
        }}
      />
    </Layout>
  );
};

export default Tests;
