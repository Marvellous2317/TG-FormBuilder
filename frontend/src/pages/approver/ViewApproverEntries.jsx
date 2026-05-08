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

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`${docTitle}`, margin, 20);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Document No: ${docNumber}`, margin, 28);
    // doc.text(`Entity name: ${docTitle}`, margin, 33);

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 37, pageWidth - margin, 37);

    let yPos = 43;
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
      const entryValue = formData[entryId]?.value ?? entry.value ?? '';

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
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        if (sectionFields.length > 0 && sectionRows.length > 0) {
          const headers = sectionFields.map((f) => f.name);
          const tableRows = sectionRows.map((row) =>
            sectionFields.map((f) => {
              const fieldId = f.entryId || f.id;
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

    const signatureDataUrl = user?.signature;
    if (signatureDataUrl) {
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
      showError('Something went wrong');
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
      showError('Something went wrong');
    }
  };

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.type === 'number' && e.config?.fieldRef) {
        scope[e.config.fieldRef] = formData[e.entryId]?.value ?? e.value ?? '';
      }
    });
    const { value, error } = evaluateFormula(expression, scope);
    return error ? 'Invalid formula' : (value ?? '');
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
