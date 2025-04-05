
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
      
      // Hide all elements except the print content
      const allElements = document.querySelectorAll('body > *:not(.print-container)');
      allElements.forEach(el => {
        if (!el.classList.contains('print-page-content') && !el.closest('.print-page-content')) {
          (el as HTMLElement).style.display = 'none';
        }
      });
      
      // Set print content to be visible and positioned correctly
      const printContent = document.querySelector('.print-page-content');
      if (printContent) {
        (printContent as HTMLElement).style.position = 'static';
        (printContent as HTMLElement).style.width = '100%';
        (printContent as HTMLElement).style.maxWidth = '210mm';
        (printContent as HTMLElement).style.margin = '0 auto';
        (printContent as HTMLElement).style.padding = '10mm';
        (printContent as HTMLElement).style.backgroundColor = 'white';
      }
    };
    
    const afterPrint = () => {
      setIsPrinting(false);
      document.body.classList.remove('is-printing');
      
      // Restore the visibility of all elements
      const allElements = document.querySelectorAll('body > *');
      allElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
      
      // Restore print content styling
      const printContent = document.querySelector('.print-page-content');
      if (printContent) {
        (printContent as HTMLElement).style.position = '';
        (printContent as HTMLElement).style.width = '';
        (printContent as HTMLElement).style.maxWidth = '';
        (printContent as HTMLElement).style.margin = '';
        (printContent as HTMLElement).style.padding = '';
        (printContent as HTMLElement).style.backgroundColor = '';
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
      // Ensure dialog content is visible and properly sized before printing
      const printContent = document.querySelector('.print-page-content');
      const dialogContent = document.querySelector('[role="dialog"]');
      
      if (printContent) {
        // Prepare the content for printing
        (printContent as HTMLElement).style.overflow = 'visible';
        
        if (dialogContent) {
          (dialogContent as HTMLElement).style.maxHeight = 'none';
          (dialogContent as HTMLElement).style.maxWidth = 'none';
        }
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
