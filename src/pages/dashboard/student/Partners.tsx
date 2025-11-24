import PartnerCompanies from "@/components/shared/PartnerCompanies";

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partner Companies</h1>
        <p className="text-muted-foreground">Explore our MOU partnerships and career opportunities</p>
      </div>
      <PartnerCompanies />
    </div>
  );
}
