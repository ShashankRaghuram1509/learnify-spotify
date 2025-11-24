import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

interface PartnerCompany {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  image_url: string | null;
  website: string | null;
  mou_signed_date: string | null;
}

export default function PartnerCompanies() {
  const [companies, setCompanies] = useState<PartnerCompany[]>([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading partner companies...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Our Partner Companies</h2>
        <p className="text-muted-foreground">Companies with MOU partnerships for placement opportunities</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id} className="overflow-hidden">
            {company.image_url && (
              <div className="h-40 overflow-hidden">
                <img 
                  src={company.image_url} 
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-3">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  {company.mou_signed_date && (
                    <CardDescription className="text-xs">
                      MOU since {new Date(company.mou_signed_date).getFullYear()}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {company.description || "No description available"}
              </p>
              {company.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Visit Website →
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No partner companies available yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}
