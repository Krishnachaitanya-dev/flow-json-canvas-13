
import { useState } from "react";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Receipt } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import PrintButton from "@/components/PrintButton";

const Invoices = () => {
  const { labData } = useLab();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  
  // Filter invoices based on search query
  const filteredInvoices = labData.invoices.filter(invoice => {
    const query = searchQuery.toLowerCase();
    const patient = labData.patients.find(p => p.id === invoice.patientId);
    
    return (
      patient?.fullName.toLowerCase().includes(query) ||
      invoice.id.toLowerCase().includes(query)
    );
  });
  
  // Get invoice details
  const getInvoiceDetails = (invoiceId: string) => {
    const invoice = labData.invoices.find(i => i.id === invoiceId);
    if (!invoice) return null;
    
    const patient = labData.patients.find(p => p.id === invoice.patientId);
    const testsDetails = invoice.tests.map(t => {
      const testInfo = labData.tests.find(test => test.id === t.testId);
      return { ...t, name: testInfo?.name || "Unknown Test" };
    });
    
    return { invoice, patient, testsDetails };
  };

  return (
    <Layout title="Invoices">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices by ID or patient name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredInvoices.map(invoice => {
          const patient = labData.patients.find(p => p.id === invoice.patientId);
          
          return (
            <div 
              key={invoice.id} 
              className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
              onClick={() => setSelectedInvoice(invoice.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Invoice #{invoice.id.replace('i', '')}</h3>
                  <p className="text-sm mt-1">{patient?.fullName}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(invoice.date), "d MMM yyyy")}
                  </p>
                  <p className="text-md font-medium mt-2">
                    ₹{invoice.netAmount.toFixed(2)}
                  </p>
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  invoice.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {invoice.status}
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery 
              ? "No invoices match your search criteria" 
              : "No invoices found."}
          </div>
        )}
      </div>
      
      {/* Invoice View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">Invoice</h2>
                <div className="flex space-x-2">
                  <PrintButton />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    &times;
                  </Button>
                </div>
              </div>
              
              {selectedInvoice && getInvoiceDetails(selectedInvoice) && (
                <div className="print-container">
                  <div className="text-center font-bold text-2xl mb-4">
                    INVOICE
                  </div>
                  
                  <div className="flex justify-between mb-6">
                    <div>
                      <p className="font-bold">NVR DIAGNOSTICS</p>
                      <p>Santharam Hospital, Dowlaiswaram, Rajamahendravaram - 7780377630</p>
                      <p>Phone: +91 99089 91881, 81214 38888</p>
                      <p>Email: info@nvrdiagnostics.com</p>
                    </div>
                    <div className="text-right">
                      <img 
                        src="/lovable-uploads/77794296-1445-47b0-9505-0bf52f9b1685.png" 
                        alt="NVR Diagnostics" 
                        className="h-12 ml-auto" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border-b pb-2">
                      <p className="font-bold">Invoice Number: </p>
                      <p>#{selectedInvoice.replace('i', '')}</p>
                    </div>
                    <div className="border-b pb-2 text-right">
                      <p className="font-bold">Status: </p>
                      <p className={`inline-block px-2 py-1 rounded-full ${
                        getInvoiceDetails(selectedInvoice)?.invoice?.status === "Paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {getInvoiceDetails(selectedInvoice)?.invoice?.status}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">Date: </p>
                      <p>{format(parseISO(getInvoiceDetails(selectedInvoice)?.invoice?.date || new Date().toISOString()), "d MMMM yyyy")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Payment Method: </p>
                      <p>{getInvoiceDetails(selectedInvoice)?.invoice?.paymentMode}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2">Patient Information</h3>
                    <div className="mb-4">
                      <p className="font-bold">Name: </p>
                      <p>{getInvoiceDetails(selectedInvoice)?.patient?.fullName}</p>
                    </div>
                    <div>
                      <p className="font-bold">Patient ID: </p>
                      <p>{getInvoiceDetails(selectedInvoice)?.patient?.id.replace('p', '')}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2">Tests</h3>
                    <table className="w-full border-collapse mb-4">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-4 py-2 text-left">Test Description</th>
                          <th className="border px-4 py-2 text-left">Code</th>
                          <th className="border px-4 py-2 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getInvoiceDetails(selectedInvoice)?.testsDetails.map((test, index) => {
                          const fullTest = labData.tests.find(t => t.id === test.testId);
                          return (
                            <tr key={index}>
                              <td className="border px-4 py-2">{fullTest?.name}</td>
                              <td className="border px-4 py-2">{fullTest?.code}</td>
                              <td className="border px-4 py-2 text-right">₹{test.price.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    <div className="flex justify-end">
                      <div className="w-64">
                        <div className="flex justify-between py-2">
                          <span>Subtotal:</span>
                          <span>₹{getInvoiceDetails(selectedInvoice)?.invoice?.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Total:</span>
                          <span className="font-bold">₹{getInvoiceDetails(selectedInvoice)?.invoice?.netAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-4 text-center text-sm text-muted-foreground">
                    <p>Thank you for choosing NVR Diagnostics. For any queries, please contact our customer support.</p>
                  </div>
                  
                  <div className="mt-6 flex justify-between text-xs text-muted-foreground">
                    <div>
                      <a href="about:blank" className="text-muted-foreground hover:text-primary">about:blank</a>
                    </div>
                    <div>
                      1/1
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Invoices;
