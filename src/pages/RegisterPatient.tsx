
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLab } from "@/context/LabContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sex, Title } from "@/context/LabContext";
import { format } from "date-fns";

const RegisterPatient = () => {
  const { addPatient } = useLab();
  const navigate = useNavigate();
  const currentDate = format(new Date(), "yyyy-MM-dd");
  
  // Form state
  const [formData, setFormData] = useState({
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
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.mobile || !formData.age) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Add patient
    addPatient({
      title: formData.title,
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      age: parseInt(formData.age),
      sex: formData.sex,
      address: formData.address,
      regDate: formData.regDate,
    });
    
    // Navigate to patients page
    navigate("/patients");
  };

  return (
    <Layout title="Register Patient">
      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="regDate">Reg. Date</Label>
                  <Input
                    id="regDate"
                    name="regDate"
                    type="date"
                    value={formData.regDate}
                    onChange={handleChange}
                    className="bg-muted/30"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>Slip No.</Label>
                  <Input
                    value="Auto-generated"
                    disabled
                    className="bg-muted/30"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>Patient ID</Label>
                  <div className="flex items-center">
                    <Select
                      value="Auto"
                      onValueChange={() => {}}
                      disabled
                    >
                      <SelectTrigger className="w-24 bg-muted/30">
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={format(new Date(), "dd/MM/yyyy").replace(/\//g, "/")}
                      disabled
                      className="flex-1 ml-2 bg-muted/30"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="refBy">Ref. By</Label>
                  <Input
                    id="refBy"
                    name="refBy"
                    placeholder="Referring doctor"
                    value={formData.refBy}
                    onChange={handleChange}
                    className="bg-muted/30"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Select
                    value={formData.title}
                    onValueChange={(value) => handleSelectChange("title", value)}
                  >
                    <SelectTrigger className="bg-muted/30">
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
                
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="fullName">Full Name*</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Patient's full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="bg-muted/30"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="mobile">Mobile*</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    placeholder="10-digit number"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    className="bg-muted/30"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-muted/30"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="age">Age</Label>
                  <div className="flex">
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      className="bg-muted/30"
                    />
                    <Select
                      value="Years"
                      onValueChange={() => {}}
                      disabled
                    >
                      <SelectTrigger className="w-24 ml-2 bg-muted/30">
                        <SelectValue placeholder="Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label>Sex</Label>
                  <RadioGroup
                    value={formData.sex}
                    onValueChange={(value) => handleSelectChange("sex", value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Complete address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-muted/30"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/patients")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  Register Patient
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default RegisterPatient;
