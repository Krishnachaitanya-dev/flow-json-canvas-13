
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

const Tests = () => {
  const { labData } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter tests based on search query
  const filteredTests = labData.tests.filter(test => {
    const query = searchQuery.toLowerCase();
    return (
      test.name.toLowerCase().includes(query) ||
      test.code.toLowerCase().includes(query) ||
      test.category.toLowerCase().includes(query)
    );
  });

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Test
        </Button>
      </div>
      
      <div className="space-y-4">
        {filteredTests.map(test => (
          <div key={test.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{test.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Category: {test.category}
                </p>
                <p className="text-sm text-muted-foreground">
                  Code: {test.code}
                </p>
                <p className="text-sm text-muted-foreground">
                  Parameters: {test.parameters}
                </p>
              </div>
              <div className="text-lg font-semibold">
                ₹{test.price.toFixed(2)}
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
