
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLab, Invoice, PaymentMode } from "@/context/LabContext";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UpdateInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateInvoiceDialog = ({ invoice, open, onOpenChange }: UpdateInvoiceDialogProps) => {
  const { updateInvoice, labData } = useLab();
  
  const [paymentData, setPaymentData] = useState({
    paymentMode: "Cash" as PaymentMode,
    amountPaid: 0,
    date: "",
    remarks: ""
  });

  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  
  useEffect(() => {
    if (invoice) {
      setCurrentInvoice(invoice);
      setPaymentData({
        paymentMode: invoice.paymentMode,
        amountPaid: invoice.amountPaid,
        date: format(new Date(), "yyyy-MM-dd"),
        remarks: invoice.remarks || ""
      });
      setRemainingAmount(invoice.balanceAmount);
    }
  }, [invoice]);
  
  const handlePaymentModeChange = (value: string) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMode: value as PaymentMode
    }));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setPaymentData(prev => ({
      ...prev,
      amountPaid: newAmount
    }));
  };
  
  const handleRemarksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPaymentData(prev => ({
      ...prev,
      remarks: e.target.value
    }));
  };
  
  const handleUpdate = () => {
    if (!currentInvoice) return;
    
    const totalPaidAmount = currentInvoice.amountPaid + paymentData.amountPaid;
    
    if (paymentData.amountPaid <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (totalPaidAmount > currentInvoice.netAmount) {
      toast.error("Payment amount cannot exceed the total bill amount");
      return;
    }
    
    const newBalanceAmount = currentInvoice.netAmount - totalPaidAmount;
    const newStatus = newBalanceAmount <= 0 ? "Paid" : "Pending";
    
    // Update the invoice
    updateInvoice({
      ...currentInvoice,
      paymentMode: paymentData.paymentMode,
      amountPaid: totalPaidAmount,
      balanceAmount: newBalanceAmount,
      status: newStatus,
      remarks: paymentData.remarks
    });
    
    // Reset and close
    onOpenChange(false);
  };
  
  if (!currentInvoice) return null;
  
  const patient = labData.patients.find(p => p.id === currentInvoice.patientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Update Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Patient:</span>
              <span>{patient?.fullName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Invoice Number:</span>
              <span>{currentInvoice.id.replace('i', 'INV-')}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Total Amount:</span>
              <span>₹{currentInvoice.netAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Amount Paid:</span>
              <span>₹{currentInvoice.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Balance Due:</span>
              <span className="text-red-600">₹{currentInvoice.balanceAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select 
                  value={paymentData.paymentMode} 
                  onValueChange={handlePaymentModeChange}
                >
                  <SelectTrigger id="paymentMode">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Pay (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  max={currentInvoice.balanceAmount}
                  value={paymentData.amountPaid || ""}
                  onChange={handleAmountChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Add payment remarks or notes..."
                value={paymentData.remarks}
                onChange={handleRemarksChange}
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Update Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateInvoiceDialog;
