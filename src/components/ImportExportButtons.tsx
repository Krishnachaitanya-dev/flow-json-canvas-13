
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useLab } from "@/context/LabContext";
import { toast } from 'sonner';

const ImportExportButtons = () => {
  const { exportData, importData } = useLab();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      
      const file = target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            importData(event.target.result as string);
          } catch (error) {
            toast.error("Failed to import data");
            console.error(error);
          }
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={exportData}
        title="Export Data"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleImport}
        title="Import Data"
      >
        <Upload className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ImportExportButtons;
