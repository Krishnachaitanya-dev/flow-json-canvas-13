
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, MapPin, Phone, Plus, Search, User, UserRoundPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card className="mb-8 border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border border-slate-200 rounded-xl focus:ring-futuristic-purple focus:border-futuristic-purple"
              />
            </div>
            <Button 
              onClick={() => navigate("/register-patient")}
              className="bg-gradient-to-r from-futuristic-purple to-futuristic-blue text-white hover:opacity-90 rounded-xl min-w-[150px]"
            >
              <UserRoundPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {filteredPatients.map(patient => (
          <Link key={patient.id} to={`/patients/${patient.id}`}>
            <div className="p-6 bg-white rounded-xl border border-slate-100 hover:border-futuristic-purple/30 hover:bg-futuristic-purple/5 transition-all duration-300 hover:shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-futuristic-purple to-futuristic-blue flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">{patient.fullName}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <User className="h-3 w-3 mr-1 text-futuristic-purple/70" />
                      <span>{patient.age} years, {patient.sex}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Phone className="h-3 w-3 mr-1 text-futuristic-purple/70" />
                      <span>{patient.mobile}</span>
                    </div>
                    {patient.address && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1 text-futuristic-purple/70" />
                        <span>{patient.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-futuristic-purple/50" />
              </div>
            </div>
          </Link>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-futuristic-purple/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-futuristic-purple" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No patients found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery 
                ? "No patients match your search criteria" 
                : "You haven't added any patients yet."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate("/register-patient")}
                className="mt-4 bg-futuristic-purple hover:bg-futuristic-pink text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Patient
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Patients;
