
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Tests = () => {
  const { labData, addTest } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [newTest, setNewTest] = useState({
    name: "",
    category: "",
    parameters: "",
    price: "",
    code: "",
  });
  
  // Filter tests based on search query
  const filteredTests = labData.tests.filter(test => {
    const query = searchQuery.toLowerCase();
    return (
      test.name.toLowerCase().includes(query) ||
      test.category.toLowerCase().includes(query) ||
      test.code.toLowerCase().includes(query)
    );
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTest(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select change
  const handleSelectChange = (value: string) => {
    setNewTest(prev => ({ ...prev, category: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTest.name || !newTest.category || !newTest.parameters || !newTest.price) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Add new test
    addTest({
      name: newTest.name,
      category: newTest.category,
      parameters: parseInt(newTest.parameters),
      price: parseFloat(newTest.price),
      code: newTest.code || `T${Math.floor(1000 + Math.random() * 9000)}`,
    });
    
    // Reset form and close dialog
    setNewTest({
      name: "",
      category: "",
      parameters: "",
      price: "",
      code: "",
    });
    setDialogOpen(false);
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
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Test</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Test Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={newTest.name}
                  onChange={handleChange}
                  placeholder="e.g. Complete Blood Count"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select
                  value={newTest.category}
                  onValueChange={handleSelectChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hematology">Hematology</SelectItem>
                    <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                    <SelectItem value="Microbiology">Microbiology</SelectItem>
                    <SelectItem value="Serology">Serology</SelectItem>
                    <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                    <SelectItem value="Immunology">Immunology</SelectItem>
                    <SelectItem value="Pathology">Pathology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parameters">Number of Parameters*</Label>
                <Input
                  id="parameters"
                  name="parameters"
                  type="number"
                  value={newTest.parameters}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)*</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={newTest.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Test Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={newTest.code}
                  onChange={handleChange}
                  placeholder="e.g. CBC001 (auto-generated if left blank)"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Test</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {filteredTests.map(test => (
          <div key={test.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium">{test.name}</h3>
                  <div className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                    {test.code}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {test.category}
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-sm">
                    {test.parameters} parameter{test.parameters > 1 ? 's' : ''}
                  </div>
                  <div className="font-medium">
                    ₹{test.price.toFixed(2)}
                  </div>
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
    </Layout>
  );
};

export default Tests;
