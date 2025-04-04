
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onClick?: () => void;
}

export const PrintButton = ({ onClick }: PrintButtonProps) => {
  const handlePrint = () => {
    // Execute the onClick handler if provided
    if (onClick) {
      onClick();
    }
    
    // Add a small delay to allow any UI updates to complete
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handlePrint}
      className="no-print"
      title="Print"
    >
      <Printer className="h-4 w-4" />
    </Button>
  );
};

export default PrintButton;
