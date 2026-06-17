import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import Loader from '../../../../shared/components/Loader';
import useToast from '../../../../shared/hooks/useToast';
import { IoClose } from 'react-icons/io5';
import { useChecklistExport } from '../../../../shared/hooks/admin/useChecklist';
import { exportChecklistEntries } from '../../../../core/api/admin';

const date = new Date();

date.setMonth(date.getMonth() - 2);

const twoMonthsAgo = date.toISOString().split('T')[0];

export default function ExportLogbookModal({
  isShowExportLogbookModal,
  setIsShowExportLogbookModal,
  documentNumber,
  setChecklistToExport,
}) {
  const [formData, setFormData] = useState({
    documentNumber: documentNumber || null,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, documentNumber }));
  }, [documentNumber]);

  const { showError, showSuccess } = useToast();

  const handleSubmit = async () => {
    const { documentNumber, startDate, endDate } = formData;

    if (!documentNumber) {
      showError('Missing document number.');
      return;
    }

    if (!startDate || !endDate) {
      showError('Missing required date.');
      return;
    }

    try {
      const blob = await exportChecklistEntries(
        documentNumber,
        startDate,
        endDate,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logbook_${documentNumber}_${startDate}_${endDate}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('Logbook exported successfully');
      handleCancel();
    } catch (err) {
      showError(
        err.response?.data?.message ??
          'Unable to export logbook. Please try again.',
      );
    }

    setFormData({
      documentNumber: '',
      startDate: '',
      endDate: '',
    });
    setIsShowExportLogbookModal(false);
    setChecklistToExport(null);
  };

  const handleCancel = () => {
    setFormData({
      documentNumber: '',
      startDate: '',
      endDate: '',
    });
    setIsShowExportLogbookModal(false);
  };

  return (
    <Modal
      isOpen={isShowExportLogbookModal}
      onClose={() => setIsShowExportLogbookModal(false)}
      position={'center'}
      width="max-w-[460px]"
      // className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Export Logbook
          </p>
          <p className="text-sm font-geist text-tertiary">
            Enter date range for export
          </p>
        </div>

        <div className="flex-1 gap-3 flex flex-col mt-7">
          {/* <div className="flex items-center">
            <InputField
              label="Document number"
              id="documentNumber"
              className="mb-1"
              value={formData?.documentNumber}
              required
              type="text"
              readOnly
            />
          </div> */}
          <div className="flex items-center">
            <InputField
              label="Start date"
              id="startDate"
              className="mb-1"
              value={formData?.startDate}
              required
              type="date"
              min={twoMonthsAgo}
              max={formData?.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center">
            <InputField
              label="End date"
              id="endDate"
              className="mb-1"
              value={formData?.endDate}
              required
              type="date"
              min={formData?.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => handleCancel()}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white flex gap-2"
            onClick={() => handleSubmit()}
            // disabled={isLoading}
          >
            Continue
            {/* {isLoading && <Loader size="border-white! h-4.5 w-4.5" />} */}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
