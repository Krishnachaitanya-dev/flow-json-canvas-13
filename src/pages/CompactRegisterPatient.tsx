
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PaymentMode, Sex, Title, Test } from "@/context/LabContext";
import { Calendar, Search, Plus, X } from "lucide-react";
import { toast } from "sonner";

const CompactRegisterPatient = () => {
  const { addPatient, labData, addInvoice, addReport } = useLab();
  const navigate = useNavigate();
  const currentDate = format(new Date(), "yyyy-MM-dd");
  
  // Patient form state
  const [patientData, setPatientData] = useState({
    regDate: currentDate,
    title: "Mr." as Title,
    fullName: "",
    mobile: "",
    email: "",
    age: "",
    sex: "Male" as Sex,
    address: "",
    refBy: ""
  });
  
  // Test selection state
  const [testData, setTestData] = useState({
    selectedPackage: "",
    testName: "",
    testCode: ""
  });
  
  // Payment information state
  const [paymentData, setPaymentData] = useState({
    totalAmount: "0",
    discountPercentage: "0",
    discountAmount: "0",
    netAmount: "0",
    paymentMode: "Cash" as PaymentMode,
    amountPaid: "0",
    balanceAmount: "0",
    remarks: ""
  });

  // Selected tests state
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  
  // Search results
  const [searchResults, setSearchResults] = useState<Test[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Calculate discount and net amount when total or discount percentage changes
  useEffect(() => {
    const total = parseFloat(paymentData.totalAmount) || 0;
    const discountPerc = parseFloat(paymentData.discountPercentage) || 0;
    
    const discountAmt = (total * discountPerc) / 100;
    const net = total - discountAmt;
    
    setPaymentData(prev => ({
      ...prev,
      discountAmount: discountAmt.toFixed(2),
      netAmount: net.toFixed(2)
    }));
  }, [paymentData.totalAmount, paymentData.discountPercentage]);
  
  // Calculate balance when net amount or amount paid changes
  useEffect(() => {
    const net = parseFloat(paymentData.netAmount) || 0;
    const paid = parseFloat(paymentData.amountPaid) || 0;
    
    setPaymentData(prev => ({
      ...prev,
      balanceAmount: (net - paid).toFixed(2)
    }));
  }, [paymentData.netAmount, paymentData.amountPaid]);

  // Update total amount when tests change
  useEffect(() => {
    const total = selectedTests.reduce((sum, test) => sum + test.price, 0);
    setPaymentData(prev => ({
      ...prev,
      totalAmount: total.toFixed(2)
    }));
  }, [selectedTests]);

  // Search tests when name or code changes
  useEffect(() => {
    if (testData.testName || testData.testCode) {
      const results = labData.tests.filter(test => {
        const nameMatch = test.name.toLowerCase().includes(testData.testName.toLowerCase());
        const codeMatch = test.code.toLowerCase().includes(testData.testCode.toLowerCase());
        return testData.testName ? nameMatch : codeMatch;
      });
      setSearchResults(results);
      setShowResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [testData.testName, testData.testCode, labData.tests]);
  
  // Handle patient form changes
  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes for patient data
  const handlePatientSelectChange = (name: string, value: string) => {
    setPatientData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle test selection changes
  const handleTestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTestData(prev => ({ ...prev, [name]: value }));
  };

  // Add test to selected tests
  const handleAddTest = (test: Test) => {
    if (!selectedTests.some(t => t.id === test.id)) {
      setSelectedTests(prev => [...prev, test]);
    }
    setTestData({ selectedPackage: "", testName: "", testCode: "" });
    setShowResults(false);
  };

  // Remove test from selected tests
  const handleRemoveTest = (testId: string) => {
    setSelectedTests(prev => prev.filter(test => test.id !== testId));
  };
  
  // Handle payment form changes
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!patientData.fullName || !patientData.mobile) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (selectedTests.length === 0) {
      toast.error("Please select at least one test");
      return;
    }
    
    // Add patient
    const newPatient = {
      title: patientData.title,
      fullName: patientData.fullName,
      mobile: patientData.mobile,
      email: patientData.email,
      age: parseInt(patientData.age) || 0,
      sex: patientData.sex,
      address: patientData.address,
      regDate: patientData.regDate,
    };
    
    addPatient(newPatient);
    
    // Get the newly created patient's ID
    const createdPatient = labData.patients.find(
      p => p.mobile === patientData.mobile && p.fullName === patientData.fullName
    );
    
    if (createdPatient) {
      // Create invoice for the patient
      const invoiceData = {
        patientId: createdPatient.id,
        tests: selectedTests.map(test => ({ testId: test.id, price: test.price })),
        totalAmount: parseFloat(paymentData.totalAmount),
        discountPercentage: parseFloat(paymentData.discountPercentage),
        discountAmount: parseFloat(paymentData.discountAmount),
        netAmount: parseFloat(paymentData.netAmount),
        paymentMode: paymentData.paymentMode,
        amountPaid: parseFloat(paymentData.amountPaid),
        balanceAmount: parseFloat(paymentData.balanceAmount),
        date: currentDate,
        status: parseFloat(paymentData.balanceAmount) > 0 ? "Pending" : "Paid" as "Pending" | "Paid",
        remarks: paymentData.remarks
      };
      
      addInvoice(invoiceData);
      
      // Create reports for each test
      selectedTests.forEach(test => {
        const reportData = {
          testId: test.id,
          patientId: createdPatient.id,
          date: currentDate,
          status: "Pending" as "Pending" | "Completed"
        };
        
        addReport(reportData);
      });
      
      // Navigate to patient detail page
      navigate(`/patients/${createdPatient.id}`);
    } else {
      // Navigate to patients page if something went wrong
      navigate("/patients");
    }
  };

  return (
    <Layout title="Register Patient">
      <Card className="shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information Section */}
            <div>
{/*               <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Patient Information</h2> */}
              
              <div className="grid grid-cols-4 gap-4">
                {/* Row 1 */}
                <div className="space-y-1">
                  <Label htmlFor="regDate" className="text-sm">Reg. Date</Label>
                  <div className="relative">
                    <Input
                      id="regDate"
                      name="regDate"
                      type="date"
                      value={patientData.regDate}
                      onChange={handlePatientChange}
                      className="bg-yellow-50 border-gray-200"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm">Slip No.</Label>
                  <Input
                    value="Auto-generated"
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm">Patient ID</Label>
                  <div className="flex">
                    <Select
                      value="Auto"
                      onValueChange={() => {}}
                      disabled
                    >
                      <SelectTrigger className="w-24 bg-gray-50">
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={format(new Date(), "dd/MM/yyyy").replace(/\//g, "/")}
                      disabled
                      className="flex-1 ml-2 bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="refBy" className="text-sm">Ref. By</Label>
                  <Input
                    id="refBy"
                    name="refBy"
                    placeholder="Referring doctor"
                    value={patientData.refBy}
                    onChange={handlePatientChange}
                    className="bg-yellow-50 border-gray-200"
                  />
                </div>
                
                {/* Row 2 */}
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-sm">Title</Label>
                  <Select
                    value={patientData.title}
                    onValueChange={(value) => handlePatientSelectChange("title", value)}
                  >
                    <SelectTrigger className="bg-yellow-50 border-gray-200">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="fullName" className="text-sm">Full Name*</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Patient's full name"
                    value={patientData.fullName}
                    onChange={handlePatientChange}
                    required
                    className="bg-yellow-50 border-gray-200"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="mobile" className="text-sm">Mobile*</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    placeholder="10-digit number"
                    value={patientData.mobile}
                    onChange={handlePatientChange}
                    required
                    className="bg-yellow-50 border-gray-200"
                  />
                </div>
                
                {/* Row 3 */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={patientData.email}
                    onChange={handlePatientChange}
                    className="bg-yellow-50 border-gray-200"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="age" className="text-sm">Age</Label>
                  <div className="flex">
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="Age"
                      value={patientData.age}
                      onChange={handlePatientChange}
                      className="bg-yellow-50 border-gray-200"
                    />
                    <Select
                      value="Years"
                      onValueChange={() => {}}
                      disabled
                    >
                      <SelectTrigger className="w-24 ml-2 bg-gray-50">
                        <SelectValue placeholder="Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm">Sex</Label>
                  <div className="flex space-x-4 items-center h-10 px-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="male"
                        name="sex"
                        value="Male"
                        checked={patientData.sex === "Male"}
                        onChange={() => handlePatientSelectChange("sex", "Male")}
                        className="w-4 h-4 text-yellow-400 bg-yellow-50 border-gray-300"
                      />
                      <Label htmlFor="male" className="ml-2 text-sm">Male</Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="female"
                        name="sex"
                        value="Female"
                        checked={patientData.sex === "Female"}
                        onChange={() => handlePatientSelectChange("sex", "Female")}
                        className="w-4 h-4 text-yellow-400 bg-yellow-50 border-gray-300"
                      />
                      <Label htmlFor="female" className="ml-2 text-sm">Female</Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="other"
                        name="sex"
                        value="Other"
                        checked={patientData.sex === "Other"}
                        onChange={() => handlePatientSelectChange("sex", "Other")}
                        className="w-4 h-4 text-yellow-400 bg-yellow-50 border-gray-300"
                      />
                      <Label htmlFor="other" className="ml-2 text-sm">Other</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-sm">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Complete address"
                    value={patientData.address}
                    onChange={handlePatientChange}
                    className="bg-yellow-50 border-gray-200"
                  />
                </div>
              </div>
            </div>
            
            {/* Test Selection Section */}
            <div>
{/*               <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Test Selection</h2> */}
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="selectedPackage" className="text-sm">Select Package (Optional)</Label>
                  <Select
                    value={testData.selectedPackage}
                    onValueChange={(value) => setTestData(prev => ({ ...prev, selectedPackage: value }))}
                  >
                    <SelectTrigger className="bg-yellow-50 border-gray-200">
                      <SelectValue placeholder="Select a test package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Health Checkup</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Package</SelectItem>
                      <SelectItem value="cardiac">Cardiac Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1 relative">
                  <Label htmlFor="testName" className="text-sm">Test Name</Label>
                  <div className="relative">
                    <Input
                      id="testName"
                      name="testName"
                      placeholder="Search by test name"
                      value={testData.testName}
                      onChange={handleTestChange}
                      className="bg-yellow-50 border-gray-200 pr-8"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {showResults && testData.testName && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-auto">
                      {searchResults.map(test => (
                        <div
                          key={test.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          onClick={() => handleAddTest(test)}
                        >
                          <span>{test.name}</span>
                          <span className="text-xs text-gray-500">₹{test.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 relative">
                  <Label htmlFor="testCode" className="text-sm">Test Code</Label>
                  <div className="relative">
                    <Input
                      id="testCode"
                      name="testCode"
                      placeholder="Enter test code"
                      value={testData.testCode}
                      onChange={handleTestChange}
                      className="bg-yellow-50 border-gray-200 pr-8"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {showResults && testData.testCode && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-auto">
                      {searchResults.map(test => (
                        <div
                          key={test.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          onClick={() => handleAddTest(test)}
                        >
                          <span>{test.code}</span>
                          <span className="text-xs text-gray-500">₹{test.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Selected Tests */}
              {selectedTests.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm mb-2 block">Selected Tests</Label>
                  <div className="space-y-2 max-h-32 overflow-auto">
                    {selectedTests.map(test => (
                      <div key={test.id} className="flex justify-between items-center p-2 bg-yellow-50 border border-gray-200 rounded">
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-xs text-gray-500">Code: {test.code}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">₹{test.price.toFixed(2)}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gray-500 hover:text-red-500"
                            onClick={() => handleRemoveTest(test.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment Information Section */}
            <div>
{/*               <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Payment Information</h2> */}
              
              <div className="grid grid-cols-7 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="totalAmount" className="text-sm">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    value={paymentData.totalAmount}
                    onChange={handlePaymentChange}
                    className="bg-gray-50"
                    readOnly={selectedTests.length > 0}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="discountPercentage" className="text-sm">Discount (%)</Label>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    value={paymentData.discountPercentage}
                    onChange={handlePaymentChange}
                    className="bg-yellow-50 border-gray-200"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="discountAmount" className="text-sm">Discount Amount</Label>
                  <Input
                    id="discountAmount"
                    name="discountAmount"
                    type="number"
                    value={paymentData.discountAmount}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="netAmount" className="text-sm">Net Amount</Label>
                  <Input
                    id="netAmount"
                    name="netAmount"
                    type="number"
                    value={paymentData.netAmount}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="paymentMode" className="text-sm">Payment Mode</Label>
                  <Select
                    value={paymentData.paymentMode}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMode: value as PaymentMode }))}
                  >
                    <SelectTrigger className="bg-yellow-50 border-gray-200">
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
                
                <div className="space-y-1">
                  <Label htmlFor="amountPaid" className="text-sm">Amount Paid</Label>
                  <Input
                    id="amountPaid"
                    name="amountPaid"
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={handlePaymentChange}
                    className="bg-yellow-50 border-gray-200"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="balanceAmount" className="text-sm">Balance Amount</Label>
                  <Input
                    id="balanceAmount"
                    name="balanceAmount"
                    type="number"
                    value={paymentData.balanceAmount}
                    readOnly
                    className={`${parseFloat(paymentData.balanceAmount) > 0 ? 'text-red-500' : 'text-green-500'} bg-gray-50`}
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-1">
                <Label htmlFor="remarks" className="text-sm">Remarks</Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  placeholder="Additional notes"
                  value={paymentData.remarks}
                  onChange={handlePaymentChange}
                  className="bg-yellow-50 border-gray-200"
                  rows={1}
                />
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/patients")}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              >
                Register Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default CompactRegisterPatient;
