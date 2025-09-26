import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateViewProps {
  studentName: string;
  courseName: string;
  completionDate: string;
}

const CertificateView: React.FC<CertificateViewProps> = ({ studentName, courseName, completionDate }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (certificateRef.current) {
      html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Certificate-${courseName.replace(/\s+/g, '_')}-${studentName.replace(/\s+/g, '_')}.pdf`);
      });
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
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
};

export default CertificateView;