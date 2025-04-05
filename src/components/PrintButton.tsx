
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
      
      // Make sure only the print content is visible
      const printContent = document.querySelector('.print-page-content');
      
      if (printContent) {
        // Set all other elements to not display
        const allElements = document.querySelectorAll('body > *:not(.print-container)');
        allElements.forEach(el => {
          if (!el.classList.contains('print-page-content') && !el.closest('.print-page-content')) {
            (el as HTMLElement).style.display = 'none';
          }
        });
        
        // Make sure the print content is visible
        (printContent as HTMLElement).style.display = 'block';
        (printContent as HTMLElement).style.visibility = 'visible';
        (printContent as HTMLElement).style.position = 'absolute';
        (printContent as HTMLElement).style.top = '0';
        (printContent as HTMLElement).style.left = '0';
        (printContent as HTMLElement).style.width = '210mm';
        (printContent as HTMLElement).style.height = 'auto';
        (printContent as HTMLElement).style.margin = '0';
        (printContent as HTMLElement).style.padding = '0';
        (printContent as HTMLElement).style.backgroundColor = 'white';
        (printContent as HTMLElement).style.zIndex = '9999';
      }
    };
    
    const afterPrint = () => {
      setIsPrinting(false);
      document.body.classList.remove('is-printing');
      
      // Restore visibility of all elements
      const allElements = document.querySelectorAll('body > *');
      allElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
      
      // Restore print content styling
      const printContent = document.querySelector('.print-page-content');
      if (printContent) {
        (printContent as HTMLElement).style.position = '';
        (printContent as HTMLElement).style.top = '';
        (printContent as HTMLElement).style.left = '';
        (printContent as HTMLElement).style.width = '';
        (printContent as HTMLElement).style.height = '';
        (printContent as HTMLElement).style.margin = '';
        (printContent as HTMLElement).style.padding = '';
        (printContent as HTMLElement).style.backgroundColor = '';
        (printContent as HTMLElement).style.zIndex = '';
        (printContent as HTMLElement).style.visibility = '';
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
      // Prepare both report and invoice print content
      const printContent = document.querySelector('.print-page-content');
      const dialogContent = document.querySelector('[role="dialog"]');
      
      if (printContent) {
        // Reset any potentially problematic CSS
        (printContent as HTMLElement).style.overflow = 'visible';
        (printContent as HTMLElement).style.visibility = 'visible';
        (printContent as HTMLElement).style.display = 'block';
        
        if (dialogContent) {
          (dialogContent as HTMLElement).style.maxHeight = 'none';
          (dialogContent as HTMLElement).style.maxWidth = 'none';
          (dialogContent as HTMLElement).style.overflow = 'visible';
        }
        
        // Apply explicit styles for .print-hidden to ensure they're hidden
        const printHiddenElements = document.querySelectorAll('.print-hidden');
        printHiddenElements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
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
