import { useState } from 'react';
import { orpc } from '../services/api';

export const useGenerateMonthReportPdf = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generate = async (date: string) => {
    setIsLoading(true);
    try {
      const blob = await (orpc.report as any).generateAndRenderMonthReport({ date }) as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${date}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading };
};
