import React, { useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import BasicForm from '../../shared/components/entries/BasicForm';
import { FaArrowLeft } from 'react-icons/fa';
import Loader from '../../shared/components/Loader';
import EnumForm from '../../shared/components/entries/EnumForm';
import DropdownForm from '../../shared/components/entries/DropdownForm';
import SectionForm from '../../shared/components/entries/SectionForm';
import {
  useApproverApproveChecklistEntries,
  useApproverChecklist,
  useApproverRejectChecklistEntries,
} from '../../shared/hooks/approver/useApprover';
import Button from '../../shared/components/Button';
import ApproverConfirmationModal from './components/ApproverConfirmationModal';
import { evaluateFormula } from '../../shared/utils/formula';
import useToast from '../../shared/hooks/useToast';
import Icons from '../../assets/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SignatureModal from './components/SignatureModal';
import { useAuthStore } from '../../shared/store/authStore';

export default function ViewApproverEntries() {
  let { id: checklistId, back: previousLocation } = useLoaderData();

  const { user } = useAuthStore();

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const [action, setAction] = useState('');

  const { data, isPending: isLoadingChecklistEntries } =
    useApproverChecklist(checklistId);

  const [formData, setFormData] = useState({});

  const entriesData = data?.data?.submission?.entries;

  const operator = data?.data?.submission?.assignment?.operator;

  const navigate = useNavigate();

  const { showError, showSuccess } = useToast();

  const { mutateAsync: approveEntries, isPending: isApprovingEntries } =
    useApproverApproveChecklistEntries(checklistId);

  const { mutateAsync: rejectEntries, isPending: isRejectingEntries } =
    useApproverRejectChecklistEntries(checklistId);

  const handleExportPDF = () => {
    if (!entriesData) return;

    const submission = data?.data?.submission;
    const docNumber =
      submission?.assignment?.checklist?.documentNumber || checklistId;
    const docTitle = submission?.assignment?.checklist?.title || 'N/A';
    const operatorName = operator
      ? `${operator.firstName} ${operator.lastName}`
      : 'N/A';
    const operatorSignatureDataUrl = operator?.signature || 'N/A';
    const entityName = operator?.company?.companyName || 'N/A';

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const usableWidth = pageWidth - 2 * margin;

    // Header grid: 3 columns, left+right split into 2 rows, middle full height
    const headerH = 40;
    const cellLeftW = 45;
    const cellRightW = 52;
    const cellMidW = usableWidth - cellLeftW - cellRightW;
    const headerY = margin;
    const divX1 = margin + cellLeftW;
    const divX2 = margin + cellLeftW + cellMidW;
    const halfY = headerY + headerH / 2;

    // Outer border + white fill
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, headerY, usableWidth, headerH, 'FD');

    // Vertical dividers
    doc.line(divX1, headerY, divX1, headerY + headerH);
    doc.line(divX2, headerY, divX2, headerY + headerH);

    // Horizontal dividers in left and right columns only
    doc.line(margin, halfY, divX1, halfY);
    doc.line(divX2, halfY, margin + usableWidth, halfY);

    // Top-left: entity name
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(
      entityName || 'Entity name',
      margin + 3,
      headerY + headerH / 4 + 1.5,
      { maxWidth: cellLeftW - 6 },
    );

    // Bottom-left: date
    doc.text(
      new Date().toLocaleDateString(),
      margin + 3,
      halfY + headerH / 4 + 1.5,
      { maxWidth: cellLeftW - 6 },
    );

    // Middle: document title (large, vertically centered)
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(docTitle, divX1 + cellMidW / 2, headerY + headerH / 2 + 3, {
      align: 'center',
      maxWidth: cellMidW - 8,
    });

    // Top-right: doc no
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(`Doc no - ${docNumber}`, divX2 + 3, headerY + headerH / 4 + 1.5, {
      maxWidth: cellRightW - 6,
    });

    // Bottom-right: proprietary & confidential
    doc.text(
      'Proprietary & Confidential',
      divX2 + 3,
      halfY + headerH / 4 + 1.5,
      { maxWidth: cellRightW - 6 },
    );

    const headerBottom = headerY + headerH + 4;
    let yPos = headerBottom;

    const sortedEntries = entriesData
      .slice()
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    let pendingRows = [];

    const flushPendingRows = () => {
      if (pendingRows.length === 0) return;
      autoTable(doc, {
        startY: yPos,
        body: pendingRows,
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 70, fontStyle: 'bold', textColor: [50, 50, 50] },
          1: { cellWidth: 'auto', textColor: [80, 80, 80] },
        },
        styles: { fontSize: 9, cellPadding: 3 },
        theme: 'grid',
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.1,
      });
      yPos = doc.lastAutoTable.finalY + 6;
      pendingRows = [];
    };

    sortedEntries.forEach((entry) => {
      const entryId = entry.entryId;
      const entryValue =
        entry.type === 'formular'
          ? computeFormulaValue(entry)
          : entry.type === 'section_formular'
            ? computeSectionFormulaValue(entry)
            : (formData[entryId]?.value ?? entry.value ?? '');

      const isVisible =
        entry?.config?.visible !== undefined ? entry?.config?.visible : true;
      if (!isVisible) return;

      if (entry.type === 'section') {
        flushPendingRows();

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(
          `${entry.name}${entry.config?.name ? ` - ${entry.config.name}` : ''}`,
          margin,
          yPos,
        );
        yPos += 4;

        let sectionRows;
        try {
          sectionRows = JSON.parse(entry.value || '[]');
        } catch {
          sectionRows = [];
        }

        const sectionFields = (entry.config?.items || [])
          .slice()
          .filter((f) =>
            f.config.visible !== undefined ? f.config.visible : true,
          )
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        if (sectionFields.length > 0 && sectionRows.length > 0) {
          const headers = sectionFields.map((f) => f.name);
          const sectionItems = entry.config?.items || [];
          const tableRows = sectionRows.map((row) =>
            sectionFields.map((f) => {
              const fieldId = f.entryId || f.id;
              if (f.type === 'formular') {
                const expression = f.config?.expression;
                if (!expression) return '';
                const scope = {};
                sectionItems.forEach((e) => {
                  if (e.type === 'number' && e.config?.fieldRef) {
                    const refId = e.entryId || e.id;
                    const raw = row[refId]?.value ?? e?.config?.defaultValue;
                    scope[e.config.fieldRef] =
                      raw === '' || raw == null ? 0 : Number(raw);
                  }
                });
                const { value, error } = evaluateFormula(expression, scope);
                if (error || (typeof value === 'number' && !isFinite(value)))
                  return 0;
                return value ?? 0;
              }
              return row[fieldId]?.value ?? '';
            }),
          );

          autoTable(doc, {
            startY: yPos,
            head: [headers],
            body: tableRows,
            margin: { left: margin, right: margin },
            styles: { fontSize: 8, cellPadding: 2.5 },
            headStyles: {
              fillColor: [0, 0, 0],
              textColor: 255,
              fontStyle: 'bold',
            },
            theme: 'grid',
          });
          yPos = doc.lastAutoTable.finalY + 8;
        } else {
          yPos += 6;
        }
      } else {
        pendingRows.push([entry.name, entryValue]);
      }
    });

    flushPendingRows();

    if (yPos > 265) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Submitted by: ${operatorName} (Operator)`, margin, yPos + 5);

    if (operatorSignatureDataUrl) {
      const signatureY = yPos + 12;
      const pageHeight = doc.internal.pageSize.getHeight();
      const signatureHeight = 30;
      const signatureWidth = 60;
      const formatMatch = signatureDataUrl.match(
        /^data:image\/(png|jpeg|jpg);base64,/i,
      );
      const imageFormat = formatMatch ? formatMatch[1].toUpperCase() : 'PNG';

      if (signatureY + signatureHeight + margin > pageHeight) {
        doc.addPage();
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
      }

      doc.text('Operator signature:', margin, signatureY);
      doc.addImage(
        signatureDataUrl,
        imageFormat === 'JPG' ? 'JPEG' : imageFormat,
        margin,
        signatureY + 3,
        signatureWidth,
        signatureHeight,
      );
    }

    const signatureDataUrl = user?.signature;
    if (signatureDataUrl) {
      const signatureY = yPos + 62;
      const pageHeight = doc.internal.pageSize.getHeight();
      const signatureHeight = 30;
      const signatureWidth = 60;
      const formatMatch = signatureDataUrl.match(
        /^data:image\/(png|jpeg|jpg);base64,/i,
      );
      const imageFormat = formatMatch ? formatMatch[1].toUpperCase() : 'PNG';

      if (signatureY + signatureHeight + margin > pageHeight) {
        doc.addPage();
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
      }

      doc.text('Approver signature:', margin, signatureY);
      doc.addImage(
        signatureDataUrl,
        imageFormat === 'JPG' ? 'JPEG' : imageFormat,
        margin,
        signatureY + 3,
        signatureWidth,
        signatureHeight,
      );
    }

    doc.save(`checklist-${docNumber}.pdf`);
  };

  const handleReject = async () => {
    try {
      await rejectEntries();
      showSuccess('Checklist rejected successfully');
      navigate('/approver/');
    } catch (err) {
      console.log(err);
    }
  };

  const handleApprove = async () => {
    const formDataArray = (entriesData ?? [])
      .filter((entry) => entry.entryId)
      .map((entry) => ({
        entryId: entry.entryId,
        value: formData[entry.entryId]?.value ?? entry.value ?? '',
      }));

    if (!user.signature) {
      showError('Signature is required. Please add a signature.');
      setIsSignatureModalOpen(true);
      return;
    }

    try {
      await approveEntries({ data: formDataArray });
      showSuccess('Checklist approved successfully');
      navigate('/approver/');
    } catch (err) {
      console.log(err);
    }
  };

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.type === 'number' && e.config?.fieldRef) {
        const rawValue =
          formData[e.entryId]?.value ?? e.value ?? e?.config?.defaultValue;

        scope[e.config.fieldRef] =
          rawValue === '' || rawValue == null ? 0 : Number(rawValue);
      }
    });
    const { value, error } = evaluateFormula(expression, scope);
    if (error || (typeof value === 'number' && !isFinite(value))) {
      console.log(error);
      return 0;
    }

    return value ?? 0;
  };

  const computeSectionFormulaValue = (entry) => {
    const {
      section: sectionName,
      field: fieldName,
      operation,
    } = entry.config?.items || {};
    if (!sectionName || !fieldName || !operation) return 0;

    const sectionEntry = entriesData?.find(
      (e) => e.type === 'section' && e.name === sectionName,
    );
    if (!sectionEntry) return 0;

    const sectionEntryId =
      sectionEntry.entryId || sectionEntry.id || sectionEntry.name;
    const rawValue = formData[sectionEntryId]?.value ?? sectionEntry?.value;
    const rowsData = JSON.parse(rawValue || '[]');
    if (!rowsData.length) return 0;

    const targetField = (sectionEntry.config?.items || []).find(
      (f) => f.name === fieldName,
    );
    if (!targetField) return 0;

    const targetFieldId = targetField.entryId || targetField.id;
    const values = rowsData
      .map((row) => {
        const raw = row[targetFieldId]?.value;
        const num = Number(raw);
        return isNaN(num) ? null : num;
      })
      .filter((v) => v !== null);

    if (!values.length) return 0;

    switch (operation.toLowerCase()) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'subtract':
        return values.reduce((a, b) => a - b);
      case 'multiply':
        return values.reduce((a, b) => a * b, 1);
      case 'average':
      case 'mean':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'median': {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      }
      case 'mode': {
        const freq = {};
        let maxFreq = 0;
        let mode = values[0];
        values.forEach((v) => {
          freq[v] = (freq[v] || 0) + 1;
          if (freq[v] > maxFreq) {
            maxFreq = freq[v];
            mode = v;
          }
        });
        return mode;
      }
      default:
        return 0;
    }
  };

  return (
    <div
      className={`flex ${entriesData?.length > 0 ? 'min-h-screen' : ''} w-full flex-col bg-white py-6`}
    >
      <div className="flex items-center justify-between w-full px-4 md:px-10 lg:px-25 ">
        <Link
          prefetch="intent"
          className="flex w-fit cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group px-4"
          to={
            previousLocation && previousLocation !== 'pending'
              ? `/approver/${previousLocation}`
              : '/approver'
          }
        >
          <FaArrowLeft
            className="text-primary-200 group-hover:-translate-x-0.5"
            size={16}
          />
          <p className="text-sm font-medium text-primary-200">
            {previousLocation && previousLocation !== 'pending'
              ? `Back to ${previousLocation}`
              : 'Back to dashboard'}
          </p>
        </Link>

        {previousLocation === 'approved' && (
          <Button
            onClick={handleExportPDF}
            disabled={isLoadingChecklistEntries || !entriesData}
            className="flex w-fit items-center gap-2 transition-all duration-150 ease-in-out group bg-primary-200 rounded-2xl py-3 px-5"
          >
            <img
              src={Icons.pdfIcon}
              alt="pdf icon"
              className="w-5 h-5 object-contain"
            />
            <p className="text-white font-semibold text-sm lg:text-base">
              Export as PDF
            </p>
          </Button>
        )}
      </div>

      {isLoadingChecklistEntries ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : entriesData?.length < 1 ? (
        <div className="flex justify-center mt-20 px-4 md:px-10 lg:px-25">
          <p className="text-sm font-semibold text-primary font-geist">
            No entries available
          </p>
        </div>
      ) : (
        <div className="h-full mt-5 flex-1 px-4 md:px-10 lg:px-25">
          {entriesData
            ?.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map((entry) => {
              const entryKey = entry.id || entry.entryId || entry.name;

              return (
                <div key={entryKey} className="space-y-5">
                  {(entry.type === 'text' ||
                    entry.type === 'date' ||
                    entry.type === 'time' ||
                    entry.type === 'number') && (
                    <BasicForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={previousLocation === 'pending' ? false : true}
                    />
                  )}
                  {entry.type === 'enum' && (
                    <EnumForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={previousLocation === 'pending' ? false : true}
                    />
                  )}
                  {entry.type === 'dropdown' && (
                    <DropdownForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={previousLocation === 'pending' ? false : true}
                    />
                  )}
                  {entry.type === 'section' && (
                    <SectionForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={previousLocation === 'pending' ? false : true}
                    />
                  )}
                  {entry.type === 'formular' && (
                    <BasicForm
                      entry={{
                        ...entry,
                        type: 'number',
                        value: computeFormulaValue(entry),
                      }}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly
                    />
                  )}
                  {entry.type === 'section_formular' && (
                    <BasicForm
                      entry={{
                        ...entry,
                        type: 'number',
                        value: computeSectionFormulaValue(entry),
                      }}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly
                    />
                  )}
                </div>
              );
            })}
        </div>
      )}

      {!isLoadingChecklistEntries && (
        <div className="border border-secondary-200 mt-6 py-3 px-4 md:px-10 lg:px-25 flex items-center w-full">
          <h2 className="w-1/2 text-primary text-sm font-medium">
            Submitted by
          </h2>
          <div className="flex w-1/2 flex-col items-start gap-1">
            <h2 className="text-primary text-sm font-medium">
              {operator?.firstName} {operator?.lastName}
            </h2>
            <p className="text-tertiary text-xs">Operator</p>
          </div>
        </div>
      )}

      {!isLoadingChecklistEntries && previousLocation === 'pending' && (
        <div className="border-t border-secondary-200 mt-6 pt-6 px-4 md:px-10 lg:px-25 flex items-center gap-3">
          <Button
            className="bg-tertiary-200 py-2.5 px-5 rounded-2xl text-base font-semibold text-secondary flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => {
              setIsConfirmationModalOpen(true);
              setAction('reject');
            }}
            disabled={isRejectingEntries || isLoadingChecklistEntries}
          >
            Reject
            {isRejectingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>

          <Button
            className="bg-primary-200 py-2.5 px-5 rounded-2xl text-base font-semibold text-white flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => {
              setIsConfirmationModalOpen(true);
              setAction('approve');
            }}
            disabled={isApprovingEntries || isLoadingChecklistEntries}
          >
            Approve
            {isApprovingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>
        </div>
      )}

      <ApproverConfirmationModal
        isConfirmationModalOpen={isConfirmationModalOpen}
        setIsConfirmationModalOpen={setIsConfirmationModalOpen}
        handleUpdate={handleApprove}
        isUpdating={isApprovingEntries}
        handleReject={handleReject}
        isRejecting={isRejectingEntries}
        action={action}
      />

      <SignatureModal
        isSignatureModalOpen={isSignatureModalOpen}
        setIsSignatureModalOpen={setIsSignatureModalOpen}
      />
    </div>
  );
}
