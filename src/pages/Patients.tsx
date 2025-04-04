
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, MapPin, Phone, Plus, Search, User } from "lucide-react";

const Patients = () => {
  const { labData } = useLab();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter patients based on search query
  const filteredPatients = labData.patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    return (
      patient.fullName.toLowerCase().includes(query) ||
      patient.mobile.toLowerCase().includes(query) ||
      patient.address.toLowerCase().includes(query)
    );
  });

  return (
    <Layout title="Patients">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients by name or phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate("/register-patient")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>
      
      <div className="space-y-4">
        {filteredPatients.map(patient => (
          <Link key={patient.id} to={`/patients/${patient.id}`}>
            <div className="p-4 border rounded-lg hover:border-primary transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{patient.fullName}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <span>{patient.age} years, {patient.sex}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{patient.mobile}</span>
                  </div>
                  {patient.address && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery 
              ? "No patients match your search criteria" 
              : "No patients found. Add a patient to get started."}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Patients;
