
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onClick?: () => void;
}

export const PrintButton = ({ onClick }: PrintButtonProps) => {
  const handlePrint = () => {
    if (onClick) {
      onClick();
    }
    window.print();
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
