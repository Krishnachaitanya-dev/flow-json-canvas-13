
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useLab, Invoice } from "@/context/LabContext";
import { Microscope, Phone, Mail, MapPin, Calendar, CreditCard } from "lucide-react";
import PrintButton from "./PrintButton";

interface InvoiceDetailsDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceDetailsDialog = ({ invoice, open, onOpenChange }: InvoiceDetailsDialogProps) => {
  const { labData } = useLab();
  
  if (!invoice) return null;
  
  const patient = labData.patients.find(p => p.id === invoice.patientId);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Invoice #{invoice.id.replace('i', '')}</span>
            <div className="print-hidden">
              <PrintButton title="Print Invoice" />
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="print-page-content p-6 @print:p-0 @print:max-w-[21cm] @print:mx-auto">
          {/* Laboratory Header */}
          <div className="flex flex-col items-center mb-6 @print:mb-4">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mr-3 @print:h-10 @print:w-10">
                <Microscope className="h-6 w-6 text-white @print:h-5 @print:w-5" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold @print:text-lg">NVR DIAGNOSTICS</h2>
                <p className="text-sm text-gray-500">Santharam Hospital, Dowlaiswaram</p>
              </div>
            </div>
          </div>
          
          <div className="h-1 w-full bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mb-6 @print:mb-4"></div>
          
          {/* Patient and Invoice Information */}
          <div className="mb-6 @print:mb-4">
            <h3 className="font-bold text-gray-700 mb-2 text-center">Patient Information</h3>
            <div className="flex flex-col items-center mb-4">
              <p className="font-semibold text-lg">{patient?.fullName}</p>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <span className="mr-1">ID:</span> {patient?.id.replace('p', '')}
              </div>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <Phone className="h-3.5 w-3.5 mr-2" /> {patient?.mobile}
              </div>
              {patient?.email && (
                <div className="text-sm text-gray-600 flex items-center mt-1">
                  <Mail className="h-3.5 w-3.5 mr-2" /> {patient?.email}
                </div>
              )}
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-2" /> {patient?.address || "N/A"}
              </div>
            </div>
          </div>
          
          {/* Invoice Details */}
          <div className="mb-6 @print:mb-4">
            <h3 className="font-bold text-gray-700 mb-2 text-center">Invoice Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg @print:p-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="font-medium">Invoice Number:</span>
                  <span className="ml-1">{invoice.id.replace('i', 'INV-')}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Date:</span>
                  <span className="ml-1">{format(new Date(invoice.date), "dd MMM yyyy")}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Payment Status:</span>
                  <span className="ml-1">
                    <Badge 
                      variant={invoice.status === "Paid" ? "outline" : "secondary"}
                      className={`${
                        invoice.status === "Paid" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      {invoice.status}
                    </Badge>
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Payment Method:</span>
                  <span className="ml-1 flex items-center inline-flex">
                    <CreditCard className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>{invoice.paymentMode}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Test Items Table */}
          <div className="mb-6 @print:mb-4">
            <h3 className="font-bold text-gray-700 mb-2 text-center">Test Details</h3>
            <div className="overflow-x-auto">
              <Table className="w-full @print:text-sm">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="w-[70%]">Test Name</TableHead>
                    <TableHead className="w-[30%] text-right">Price (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.tests.map((item, index) => {
                    const test = labData.tests.find(t => t.id === item.testId);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{test?.name || "Unknown Test"}</TableCell>
                        <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="flex justify-end mb-6 @print:mb-4">
            <div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg @print:p-3">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal:</span>
                <span>₹{invoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Discount ({invoice.discountPercentage}%):</span>
                <span>₹{invoice.discountAmount.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-lg mb-2">
                <span>Total:</span>
                <span>₹{invoice.netAmount.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between mb-2">
                <span className="font-medium">Amount Paid:</span>
                <span>₹{invoice.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Balance Due:</span>
                <span className={invoice.balanceAmount > 0 ? "text-red-600" : "text-green-600"}>
                  ₹{invoice.balanceAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Terms and Notes */}
          <div className="mb-4 @print:text-sm">
            <h3 className="font-bold text-gray-700 mb-2 text-center">Terms & Notes</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Results will be provided within 24-48 hours after sample collection.</li>
              <li>Payment is due on receipt unless other arrangements have been made.</li>
              <li>For any inquiries about this invoice, please contact our billing department.</li>
              <li>We accept Cash, Credit/Debit Cards, UPI and other digital payment methods.</li>
            </ul>
          </div>
          
          {/* Thank You Note */}
          <div className="text-center py-3 bg-blue-50 rounded-lg mb-4">
            <p className="text-blue-800 font-medium">Thank you for choosing NVR Diagnostics!</p>
            <p className="text-sm text-blue-600">We care about your health and wellness.</p>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-4 @print:mt-2">
            <p>This is a computer-generated invoice and doesn't require a signature.</p>
            <p className="mt-1">© {new Date().getFullYear()} NVR Diagnostics. All Rights Reserved.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;
