import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';


// ImageOptionsModal.jsx
export default function ImageOptionsModal({ 
  isImageOptionsModal, 
  setIsImageOptionsModal, 
  onSave, 
  initialValue 
}) {
  const [config, setConfig] = useState({
    required: false,
    instructions: 'Click to upload or take a photo',
    ...initialValue
  });

  const handleSave = () => {
    onSave(config);
    setIsImageOptionsModal(false);
  };

  return (
    <Modal
      isOpen={isImageOptionsModal}
      onClose={() => setIsImageOptionsModal(false)}
      title="Image Configuration"
    >
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <input
            type="text"
            value={config.instructions}
            onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
            placeholder="Enter instructions for the user"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="required"
            checked={config.required}
            onChange={(e) => setConfig({ ...config, required: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="required" className="text-sm text-gray-700">
            Required field
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setIsImageOptionsModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}