import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";

interface PartnerCompany {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  image_url: string | null;
  website: string | null;
  mou_signed_date: string | null;
}

export default function MOUManagement() {
  const [companies, setCompanies] = useState<PartnerCompany[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<PartnerCompany | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('partner_companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setCompanies(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const companyData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      website: formData.get('website') as string,
      mou_signed_date: formData.get('mou_signed_date') as string,
      logo_url: formData.get('logo_url') as string,
      image_url: formData.get('image_url') as string,
    };

    if (editingCompany) {
      const { error } = await supabase
        .from('partner_companies')
        .update(companyData)
        .eq('id', editingCompany.id);

      if (error) {
        toast.error("Failed to update company");
      } else {
        toast.success("Company updated successfully");
        setShowDialog(false);
        setEditingCompany(null);
        fetchCompanies();
      }
    } else {
      const { error } = await supabase
        .from('partner_companies')
        .insert(companyData);

      if (error) {
        toast.error("Failed to create company");
      } else {
        toast.success("Company created successfully");
        setShowDialog(false);
        e.currentTarget.reset();
        fetchCompanies();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    const { error } = await supabase
      .from('partner_companies')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete company");
    } else {
      toast.success("Company deleted successfully");
      fetchCompanies();
    }
  };

  const openEditDialog = (company: PartnerCompany) => {
    setEditingCompany(company);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingCompany(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MOU Partner Management</h2>
          <p className="text-muted-foreground">Manage partner companies and MOU agreements</p>
        </div>
        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCompany(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Partner Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? 'Edit Partner Company' : 'Add New Partner Company'}
              </DialogTitle>
              <DialogDescription>
                {editingCompany ? 'Update partner company details' : 'Create a new MOU partner company'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  defaultValue={editingCompany?.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  defaultValue={editingCompany?.description || ''}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input 
                  id="website" 
                  name="website" 
                  type="url"
                  defaultValue={editingCompany?.website || ''}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mou_signed_date">MOU Signed Date</Label>
                <Input 
                  id="mou_signed_date" 
                  name="mou_signed_date" 
                  type="date"
                  defaultValue={editingCompany?.mou_signed_date || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input 
                  id="logo_url" 
                  name="logo_url" 
                  type="url"
                  defaultValue={editingCompany?.logo_url || ''}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Cover Image URL</Label>
                <Input 
                  id="image_url" 
                  name="image_url" 
                  type="url"
                  defaultValue={editingCompany?.image_url || ''}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCompany ? 'Update Company' : 'Create Company'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Companies</CardTitle>
          <CardDescription>Manage all MOU partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>MOU Date</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {company.description || '-'}
                  </TableCell>
                  <TableCell>
                    {company.mou_signed_date 
                      ? new Date(company.mou_signed_date).toLocaleDateString() 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {company.website ? (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Visit
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
