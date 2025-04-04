
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types for our data model
export type Title = 'Mr.' | 'Mrs.' | 'Ms.' | 'Dr.';
export type Sex = 'Male' | 'Female' | 'Other';
export type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'Insurance';
export type ReportStatus = 'Pending' | 'Completed';
export type PaymentStatus = 'Paid' | 'Pending';

export interface Patient {
  id: string;
  title: Title;
  fullName: string;
  mobile: string;
  email: string;
  age: number;
  sex: Sex;
  address: string;
  regDate: string;
  slipNo: string;
}

export interface Test {
  id: string;
  name: string;
  category: string;
  parameters: number;
  price: number;
  code: string;
}

export interface Report {
  id: string;
  testId: string;
  patientId: string;
  date: string;
  status: ReportStatus;
  results?: {
    parameter: string;
    value: string;
    referenceRange: string;
    unit: string;
  }[];
}

export interface Invoice {
  id: string;
  patientId: string;
  tests: {
    testId: string;
    price: number;
  }[];
  totalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  netAmount: number;
  paymentMode: PaymentMode;
  amountPaid: number;
  balanceAmount: number;
  date: string;
  status: PaymentStatus;
  remarks?: string;
}

export interface LabData {
  patients: Patient[];
  tests: Test[];
  reports: Report[];
  invoices: Invoice[];
}

// Initial data for the application
const initialLabData: LabData = {
  patients: [
    {
      id: 'p1',
      title: 'Mr.',
      fullName: 'John Smith',
      mobile: '555-123-4567',
      email: 'john@example.com',
      age: 45,
      sex: 'Male',
      address: '123 Main St, Anytown, USA',
      regDate: '2023-10-15',
      slipNo: 'SN001',
    },
    {
      id: 'p2',
      title: 'Mrs.',
      fullName: 'Sarah Johnson',
      mobile: '555-987-6543',
      email: 'sarah@example.com',
      age: 32,
      sex: 'Female',
      address: '456 Oak Ave, Somewhere, USA',
      regDate: '2023-10-16',
      slipNo: 'SN002',
    },
    {
      id: 'p3',
      title: 'Mr.',
      fullName: 'Michael Chen',
      mobile: '555-456-7890',
      email: 'michael@example.com',
      age: 28,
      sex: 'Male',
      address: '789 Pine Rd, Elsewhere, USA',
      regDate: '2023-10-17',
      slipNo: 'SN003',
    },
    {
      id: 'p4',
      title: 'Ms.',
      fullName: 'Emily Rodriguez',
      mobile: '555-789-0123',
      email: 'emily@example.com',
      age: 35,
      sex: 'Female',
      address: '101 Cedar Ln, Nowhere, USA',
      regDate: '2023-10-18',
      slipNo: 'SN004',
    },
  ],
  tests: [
    {
      id: 't1',
      name: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      parameters: 3,
      price: 25.00,
      code: 'CBC001',
    },
    {
      id: 't2',
      name: 'Lipid Profile',
      category: 'Biochemistry',
      parameters: 4,
      price: 35.00,
      code: 'LIP001',
    },
    {
      id: 't3',
      name: 'Blood Glucose',
      category: 'Biochemistry',
      parameters: 1,
      price: 15.00,
      code: 'GLU001',
    },
    {
      id: 't4',
      name: 'Liver Function Test',
      category: 'Biochemistry',
      parameters: 3,
      price: 40.00,
      code: 'LFT001',
    },
    {
      id: 't5',
      name: 'Thyroid Profile',
      category: 'Endocrinology',
      parameters: 3,
      price: 45.00,
      code: 'THY001',
    },
  ],
  reports: [
    {
      id: 'r1',
      testId: 't1',
      patientId: 'p1',
      date: '2023-10-15',
      status: 'Completed',
      results: [
        { parameter: 'Hemoglobin', value: '14.5', referenceRange: '13.5-17.5', unit: 'g/dL' },
        { parameter: 'WBC Count', value: '7500', referenceRange: '4500-11000', unit: 'cells/μL' },
        { parameter: 'Platelet Count', value: '250000', referenceRange: '150000-450000', unit: 'cells/μL' },
      ]
    },
    {
      id: 'r2',
      testId: 't2',
      patientId: 'p2',
      date: '2023-10-16',
      status: 'Completed',
      results: [
        { parameter: 'Total Cholesterol', value: '220', referenceRange: '<200', unit: 'mg/dL' },
        { parameter: 'HDL Cholesterol', value: '45', referenceRange: '>40', unit: 'mg/dL' },
        { parameter: 'LDL Cholesterol', value: '130', referenceRange: '<100', unit: 'mg/dL' },
        { parameter: 'Triglycerides', value: '140', referenceRange: '<150', unit: 'mg/dL' },
      ]
    },
    {
      id: 'r3',
      testId: 't3',
      patientId: 'p3',
      date: '2023-10-17',
      status: 'Completed',
      results: [
        { parameter: 'Fasting Blood Glucose', value: '92', referenceRange: '70-99', unit: 'mg/dL' },
      ]
    },
    {
      id: 'r4',
      testId: 't4',
      patientId: 'p4',
      date: '2023-10-18',
      status: 'Pending',
    },
  ],
  invoices: [
    {
      id: 'i1',
      patientId: 'p1',
      tests: [{ testId: 't1', price: 25.00 }],
      totalAmount: 25.00,
      discountPercentage: 0,
      discountAmount: 0,
      netAmount: 25.00,
      paymentMode: 'Cash',
      amountPaid: 25.00,
      balanceAmount: 0,
      date: '2023-10-15',
      status: 'Paid',
    },
    {
      id: 'i2',
      patientId: 'p2',
      tests: [{ testId: 't2', price: 35.00 }],
      totalAmount: 35.00,
      discountPercentage: 0,
      discountAmount: 0,
      netAmount: 35.00,
      paymentMode: 'Card',
      amountPaid: 35.00,
      balanceAmount: 0,
      date: '2023-10-16',
      status: 'Paid',
    },
    {
      id: 'i3',
      patientId: 'p3',
      tests: [{ testId: 't3', price: 15.00 }],
      totalAmount: 15.00,
      discountPercentage: 0,
      discountAmount: 0,
      netAmount: 15.00,
      paymentMode: 'Cash',
      amountPaid: 15.00,
      balanceAmount: 0,
      date: '2023-10-17',
      status: 'Paid',
    },
    {
      id: 'i4',
      patientId: 'p4',
      tests: [{ testId: 't4', price: 40.00 }],
      totalAmount: 40.00,
      discountPercentage: 0,
      discountAmount: 0,
      netAmount: 40.00,
      paymentMode: 'UPI',
      amountPaid: 0,
      balanceAmount: 40.00,
      date: '2023-10-18',
      status: 'Pending',
    },
  ],
};

// Context type
interface LabContextType {
  labData: LabData;
  addPatient: (patient: Omit<Patient, 'id' | 'slipNo'>) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;
  addTest: (test: Omit<Test, 'id'>) => void;
  updateTest: (test: Test) => void;
  deleteTest: (id: string) => void;
  addReport: (report: Omit<Report, 'id'>) => void;
  updateReport: (report: Report) => void;
  deleteReport: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => void;
}

// Create context
const LabContext = createContext<LabContextType | undefined>(undefined);

// Provider component
export const LabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [labData, setLabData] = useState<LabData>(() => {
    const savedData = localStorage.getItem('labData');
    return savedData ? JSON.parse(savedData) : initialLabData;
  });

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('labData', JSON.stringify(labData));
  }, [labData]);

  // Generate unique ID
  const generateId = (prefix: string): string => {
    return `${prefix}${new Date().getTime()}`;
  };

  // Patient functions
  const addPatient = (patient: Omit<Patient, 'id' | 'slipNo'>) => {
    const newPatient: Patient = {
      ...patient,
      id: generateId('p'),
      slipNo: `SN${String(labData.patients.length + 1).padStart(3, '0')}`,
    };
    setLabData(prev => ({
      ...prev,
      patients: [...prev.patients, newPatient],
    }));
    toast.success("Patient added successfully");
  };

  const updatePatient = (patient: Patient) => {
    setLabData(prev => ({
      ...prev,
      patients: prev.patients.map(p => (p.id === patient.id ? patient : p)),
    }));
    toast.success("Patient updated successfully");
  };

  const deletePatient = (id: string) => {
    // Check if patient has reports or invoices
    const hasReports = labData.reports.some(r => r.patientId === id);
    const hasInvoices = labData.invoices.some(i => i.patientId === id);
    
    if (hasReports || hasInvoices) {
      toast.error("Cannot delete patient with associated reports or invoices");
      return;
    }
    
    setLabData(prev => ({
      ...prev,
      patients: prev.patients.filter(p => p.id !== id),
    }));
    toast.success("Patient deleted successfully");
  };

  // Test functions
  const addTest = (test: Omit<Test, 'id'>) => {
    const newTest: Test = {
      ...test,
      id: generateId('t'),
    };
    setLabData(prev => ({
      ...prev,
      tests: [...prev.tests, newTest],
    }));
    toast.success("Test added successfully");
  };

  const updateTest = (test: Test) => {
    setLabData(prev => ({
      ...prev,
      tests: prev.tests.map(t => (t.id === test.id ? test : t)),
    }));
    toast.success("Test updated successfully");
  };

  const deleteTest = (id: string) => {
    // Check if test is used in reports or invoices
    const hasReports = labData.reports.some(r => r.testId === id);
    const hasInvoices = labData.invoices.some(i => i.tests.some(t => t.testId === id));
    
    if (hasReports || hasInvoices) {
      toast.error("Cannot delete test with associated reports or invoices");
      return;
    }
    
    setLabData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.id !== id),
    }));
    toast.success("Test deleted successfully");
  };

  // Report functions
  const addReport = (report: Omit<Report, 'id'>) => {
    const newReport: Report = {
      ...report,
      id: generateId('r'),
    };
    setLabData(prev => ({
      ...prev,
      reports: [...prev.reports, newReport],
    }));
    toast.success("Report added successfully");
  };

  const updateReport = (report: Report) => {
    setLabData(prev => ({
      ...prev,
      reports: prev.reports.map(r => (r.id === report.id ? report : r)),
    }));
    toast.success("Report updated successfully");
  };

  const deleteReport = (id: string) => {
    setLabData(prev => ({
      ...prev,
      reports: prev.reports.filter(r => r.id !== id),
    }));
    toast.success("Report deleted successfully");
  };

  // Invoice functions
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId('i'),
    };
    setLabData(prev => ({
      ...prev,
      invoices: [...prev.invoices, newInvoice],
    }));
    toast.success("Invoice added successfully");
  };

  const updateInvoice = (invoice: Invoice) => {
    setLabData(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => (i.id === invoice.id ? invoice : i)),
    }));
    toast.success("Invoice updated successfully");
  };

  const deleteInvoice = (id: string) => {
    setLabData(prev => ({
      ...prev,
      invoices: prev.invoices.filter(i => i.id !== id),
    }));
    toast.success("Invoice deleted successfully");
  };

  // Export data to JSON file
  const exportData = () => {
    const dataStr = JSON.stringify(labData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `nvr_diagnostics_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Data exported successfully");
  };

  // Import data from JSON file
  const importData = (jsonData: string) => {
    try {
      const parsedData = JSON.parse(jsonData) as LabData;
      
      // Validate the data structure
      if (!parsedData.patients || !parsedData.tests || !parsedData.reports || !parsedData.invoices) {
        throw new Error("Invalid data structure");
      }
      
      setLabData(parsedData);
      toast.success("Data imported successfully");
    } catch (error) {
      toast.error("Failed to import data. Please check the file format.");
      console.error("Import error:", error);
    }
  };

  return (
    <LabContext.Provider
      value={{
        labData,
        addPatient,
        updatePatient,
        deletePatient,
        addTest,
        updateTest,
        deleteTest,
        addReport,
        updateReport,
        deleteReport,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        exportData,
        importData,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

// Custom hook to use the LabContext
export const useLab = () => {
  const context = useContext(LabContext);
  if (context === undefined) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
