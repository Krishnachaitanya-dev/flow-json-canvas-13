
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
      // Add a class to body for print-specific styles
      document.body.classList.add('is-printing');
    };
    
    const afterPrint = () => {
      setIsPrinting(false);
      // Clean up any print-specific classes
      document.body.classList.remove('is-printing');
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
    
    // Add a small delay to allow any UI updates to complete
    setTimeout(() => {
      // Add print-specific class to body
      document.body.classList.add('is-printing');
      
      // Set print-specific styles for single page printing with improved scaling
      const style = document.createElement('style');
      style.id = 'print-style';
      style.innerHTML = `
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          html, body {
            height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            font-size: 10pt !important;
          }
          
          .print-page-content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            margin: 0 auto !important;
            padding: 5mm !important;
            page-break-inside: avoid !important;
            overflow: visible !important;
          }
          
          table { 
            font-size: 9pt !important;
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 0.5cm !important;
          }
          
          th, td {
            padding: 1mm 2mm !important;
          }
          
          .print-header {
            display: flex !important;
            visibility: visible !important;
            margin-bottom: 0.5cm !important;
          }
          
          img {
            display: block !important;
            visibility: visible !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .print-hidden {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      window.print();
      
      // Clean up print styles
      setTimeout(() => {
        const printStyle = document.getElementById('print-style');
        if (printStyle) {
          printStyle.remove();
        }
      }, 500);
    }, 300);
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
