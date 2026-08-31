import { Analysis, JDMatchResponse } from '@/types';
import toast from 'react-hot-toast';

export const exportAnalysisToPDF = async (analysis: Analysis) => {
  const loadingToast = toast.loading('Generating PDF...');
  
  try {
    // Import jsPDF dynamically to avoid SSR issues
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${analysis.analysisType} Analysis Report`, margin, yPosition);
    yPosition += 15;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date(analysis.createdAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Overall Score
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Score: ${analysis.overallScore}%`, margin, yPosition);
    yPosition += 12;

    // Category Scores
    doc.setFontSize(14);
    doc.text('Category Breakdown:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    analysis.microCategories.forEach((category) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${category.categoryName}: ${category.categoryScore}%`, margin + 5, yPosition);
      yPosition += 6;
      const descLines = doc.splitTextToSize(category.categoryDescription, pageWidth - 2 * margin - 10);
      doc.setFontSize(9);
      doc.setTextColor(100);
      descLines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin + 10, yPosition);
        yPosition += 5;
      });
      doc.setTextColor(0);
      doc.setFontSize(10);
      yPosition += 5;
    });

    // Analysis Text
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Analysis:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const analysisLines = doc.splitTextToSize(analysis.analysisText, pageWidth - 2 * margin);
    analysisLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    // Suggestions
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Suggestions for Improvement:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const suggestionLines = doc.splitTextToSize(analysis.suggestions, pageWidth - 2 * margin);
    suggestionLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${totalPages} | NextStep AI © ${new Date().getFullYear()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`${analysis.analysisType}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded successfully!', { id: loadingToast });
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error('Failed to generate PDF', { id: loadingToast });
  }
};

export const exportJDMatchToPDF = async (match: JDMatchResponse) => {
  const loadingToast = toast.loading('Generating PDF...');
  
  try {
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Description Match Report', margin, yPosition);
    yPosition += 15;

    // Job Details
    if (match.jobTitle) {
      doc.setFontSize(14);
      doc.text(`Position: ${match.jobTitle}`, margin, yPosition);
      yPosition += 10;
    }
    if (match.companyName) {
      doc.text(`Company: ${match.companyName}`, margin, yPosition);
      yPosition += 10;
    }

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date(match.createdAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Overall Match Score
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const scoreColor = match.overallMatchScore >= 80 ? [16, 185, 129] :
                       match.overallMatchScore >= 60 ? [245, 158, 11] :
                       match.overallMatchScore >= 40 ? [249, 115, 22] : [239, 68, 68];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`Overall Match: ${match.overallMatchScore}%`, margin, yPosition);
    doc.setTextColor(0);
    yPosition += 15;

    // Category Scores
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Breakdown:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    match.matchCategories.forEach((category) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${category.categoryName}: ${category.categoryScore}%`, margin + 5, yPosition);
      yPosition += 6;
      const descLines = doc.splitTextToSize(category.categoryDescription, pageWidth - 2 * margin - 10);
      doc.setFontSize(9);
      doc.setTextColor(100);
      descLines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin + 10, yPosition);
        yPosition += 5;
      });
      doc.setTextColor(0);
      doc.setFontSize(10);
      yPosition += 5;
    });

    // Match Analysis
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Match Analysis:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const analysisLines = doc.splitTextToSize(match.matchAnalysis, pageWidth - 2 * margin);
    analysisLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    // Missing Skills
    if (match.missingSkills) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text('Missing Skills:', margin, yPosition);
      doc.setTextColor(0);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillsLines = doc.splitTextToSize(match.missingSkills, pageWidth - 2 * margin);
      skillsLines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
    }

    // Missing Keywords
    if (match.missingKeywords) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(234, 179, 8);
      doc.text('Missing Keywords:', margin, yPosition);
      doc.setTextColor(0);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const keywordsLines = doc.splitTextToSize(match.missingKeywords, pageWidth - 2 * margin);
      keywordsLines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
    }

    // Suggestions
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const suggestionLines = doc.splitTextToSize(match.suggestions, pageWidth - 2 * margin);
    suggestionLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${totalPages} | NextStep AI © ${new Date().getFullYear()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = match.jobTitle 
      ? `${match.jobTitle.replace(/[^a-z0-9]/gi, '_')}_Match_${new Date().toISOString().split('T')[0]}.pdf`
      : `JD_Match_${new Date().toISOString().split('T')[0]}.pdf`;
    
    doc.save(fileName);
    toast.success('PDF downloaded successfully!', { id: loadingToast });
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error('Failed to generate PDF', { id: loadingToast });
  }
};