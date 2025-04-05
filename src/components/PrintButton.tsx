
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
      
      // Apply print-specific styles to the document
      const styleElement = document.createElement('style');
      styleElement.id = 'print-styles';
      styleElement.innerHTML = `
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-hidden {
          display: none !important;
        }
        .print-page-content {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
          overflow: visible !important;
        }
        .DialogContent {
          max-width: 100% !important;
          max-height: 100% !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transform: none !important;
        }
      `;
      document.head.appendChild(styleElement);
    };
    
    const afterPrint = () => {
      setIsPrinting(false);
      document.body.classList.remove('is-printing');
      
      // Remove print-specific styles
      const styleElement = document.getElementById('print-styles');
      if (styleElement) {
        styleElement.remove();
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
        // Ensure the content is visible and properly positioned
        (printContent as HTMLElement).style.position = 'relative';
        (printContent as HTMLElement).style.width = '100%';
        (printContent as HTMLElement).style.maxWidth = '100%';
        (printContent as HTMLElement).style.overflow = 'visible';
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
