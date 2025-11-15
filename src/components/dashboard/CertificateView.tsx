import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CertificateViewProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId?: string;
  userId?: string;
  courseId?: string;
}

const CertificateView: React.FC<CertificateViewProps> = ({ 
  studentName, 
  courseName, 
  completionDate,
  certificateId,
  userId,
  courseId
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      setIsUploading(true);
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      // Generate PDF blob
      const pdfBlob = pdf.output('blob');
      
      // Upload to Supabase storage if certificate details are provided
      if (certificateId && userId && courseId) {
        const fileName = `${userId}/${courseId}_${Date.now()}.pdf`;
        const { data, error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(fileName, pdfBlob);

        if (uploadError) {
          toast.error('Failed to save certificate');
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('certificates')
          .getPublicUrl(fileName);

        // Update certificate record with URL
        const { error: updateError } = await supabase
          .from('certificates')
          .update({ certificate_url: urlData.publicUrl })
          .eq('id', certificateId);

        if (updateError) {
          toast.error('Failed to update certificate record');
          return;
        }

        toast.success('Certificate saved successfully');
      }
      
      // Download locally
      pdf.save(`Certificate-${courseName.replace(/\s+/g, '_')}-${studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      toast.error('Failed to generate certificate');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div ref={certificateRef} className="relative w-[800px] h-[565px] bg-cover bg-center" style={{ backgroundImage: "url('/certificate-template.png')" }}>
        {/* This is a sample positioning, it will need to be adjusted to match the new template */}
        <div className="absolute top-[210px] left-0 right-0 text-center">
          <p className="text-xl text-gray-600">Proudly Presented To</p>
          <h1 className="text-5xl font-bold text-gray-800 mt-2">{studentName}</h1>
        </div>
        <div className="absolute top-[320px] left-0 right-0 text-center">
          <p className="text-lg text-gray-600">For successfully completing the course</p>
          <h2 className="text-3xl font-semibold text-gray-700 mt-1">{courseName}</h2>
        </div>
        <div className="absolute bottom-[100px] right-[130px] text-center">
          <p className="text-lg text-gray-600">{completionDate}</p>
          <p className="text-sm text-gray-500 border-t border-gray-400 mt-1 pt-1">Completion Date</p>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button onClick={handleDownload} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CertificateView;