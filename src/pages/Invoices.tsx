
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab, Invoice, Patient } from "@/context/LabContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, FileText, Printer, CreditCard } from "lucide-react";
import { format } from "date-fns";
import InvoiceDetailsDialog from "@/components/InvoiceDetailsDialog";
import UpdateInvoiceDialog from "@/components/UpdateInvoiceDialog";

const Invoices = () => {
  const { labData } = useLab();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Filter invoices based on search query and filters
  const filteredInvoices = labData.invoices
    .filter(invoice => {
      const patient = labData.patients.find(p => p.id === invoice.patientId);
      const patientName = patient?.fullName.toLowerCase() || "";
      const invoiceId = invoice.id.toLowerCase();
      
      return patientName.includes(searchQuery.toLowerCase()) || 
             invoiceId.includes(searchQuery.toLowerCase());
    })
    .filter(invoice => statusFilter === "all" ? true : invoice.status === statusFilter)
    .filter(invoice => dateFilter ? invoice.date === dateFilter : true)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get patient data for an invoice
  const getPatientForInvoice = (patientId: string): Patient | undefined => {
    return labData.patients.find(p => p.id === patientId);
  };
  
  // Calculate total revenue
  const totalRevenue = labData.invoices
    .filter(invoice => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.netAmount, 0);
  
  // Calculate pending payments
  const pendingPayments = labData.invoices
    .filter(invoice => invoice.status === "Pending")
    .reduce((sum, invoice) => sum + invoice.balanceAmount, 0);

  return (
    <Layout title="Invoices">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="futuristic-card-solid bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-amber-900">₹{totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="futuristic-card-solid bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-700">Pending Payments</p>
                  <h3 className="text-2xl font-bold text-rose-900">₹{pendingPayments.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 bg-rose-200 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              placeholder="Search by patient name or invoice ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </div>
        
        {/* Invoices Table */}
        <Card className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[10%]">Invoice ID</TableHead>
                  <TableHead className="w-[20%]">Patient</TableHead>
                  <TableHead className="w-[15%]">Date</TableHead>
                  <TableHead className="w-[15%] text-right">Amount</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[15%]">Payment Mode</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => {
                    const patient = getPatientForInvoice(invoice.patientId);
                    return (
                      <TableRow key={invoice.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{invoice.id.replace('i', '#')}</TableCell>
                        <TableCell>{patient?.fullName || "Unknown Patient"}</TableCell>
                        <TableCell>{format(new Date(invoice.date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-right">₹{invoice.netAmount.toFixed(2)}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>{invoice.paymentMode}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setViewInvoice(invoice);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditInvoice(invoice);
                                setIsEditOpen(true);
                              }}
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setViewInvoice(invoice);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No invoices found. Please adjust your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      
      {/* Invoice Details Dialog */}
      <InvoiceDetailsDialog
        invoice={viewInvoice}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      
      {/* Update Invoice Dialog */}
      <UpdateInvoiceDialog
        invoice={editInvoice}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </Layout>
  );
};

export default Invoices;
