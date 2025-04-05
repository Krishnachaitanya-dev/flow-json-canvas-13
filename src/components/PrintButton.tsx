
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
      
      // Set print-specific styles for single page printing
      const style = document.createElement('style');
      style.id = 'print-style';
      style.innerHTML = `
        @media print {
          @page {
            size: portrait;
            margin: 8mm;
          }
          html, body {
            height: 100%;
            font-size: 11pt !important;
          }
          .print-page-content {
            page-break-after: always;
            page-break-inside: avoid;
          }
          img {
            display: block !important;
            visibility: visible !important;
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
