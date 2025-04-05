
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";

interface PrintButtonProps {
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  title?: string;
  className?: string;
}

export const PrintButton = ({ 
  onClick, 
  variant = "outline", 
  size = "icon",
  title = "Print",
  className = "print-hidden"
}: PrintButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Handle beforeprint and afterprint events
  useEffect(() => {
    const beforePrint = () => {
      setIsPrinting(true);
      document.body.classList.add('is-printing');
      
      // Apply any additional styles needed right before printing
      const printContent = document.querySelector('.print-page-content');
      if (printContent) {
        // Store original class list to restore after printing
        const originalClassName = printContent.className;
        (printContent as any)._originalClassName = originalClassName;
      }
    };
    
    const afterPrint = () => {
      setIsPrinting(false);
      document.body.classList.remove('is-printing');
      
      // Restore any styles changed before printing
      const printContent = document.querySelector('.print-page-content');
      if (printContent && (printContent as any)._originalClassName) {
        printContent.className = (printContent as any)._originalClassName;
        delete (printContent as any)._originalClassName;
      }
    };

    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  const handlePrint = () => {
    // Execute the onClick handler if provided
    if (onClick) {
      onClick();
    }
    
    // Force any current UI updates to complete
    setTimeout(() => {
      // Take a snapshot of the current document state before printing
      const printContent = document.querySelector('.print-page-content');
      if (printContent) {
        // Set the content to be positioned correctly for printing
        (printContent as HTMLElement).style.position = 'static';
        (printContent as HTMLElement).style.width = '100%';
      }
      
      // Trigger the print dialog
      window.print();
    }, 200);
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handlePrint}
      className={className}
      title={title}
      disabled={isPrinting}
    >
      <Printer className="h-4 w-4" />
      {size !== "icon" && <span className="ml-2">Print</span>}
    </Button>
  );
};

export default PrintButton;
