import React from 'react';
import { Download, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi';
import { DOC_TYPES } from '../../utils/constants';
import { downloadFile } from '../../utils/validators';
import '../../../src/styles/components.css';

export function DocumentUploader({ employeeId, isClerk, isAdmin, onUpload, employee }) {
  const [uploading, setUploading] = React.useState(null);

  const handleFileUpload = async (docType, file) => {
    try {
      setUploading(docType);
      await employeeApi.uploadDocument(employeeId, docType, file);
      toast.success(`${DOC_TYPES[docType]} uploaded successfully`);
      if (onUpload) onUpload();
    } catch (error) {
      toast.error(`Failed to upload ${DOC_TYPES[docType]}`);
    } finally {
      setUploading(null);
    }
  };

  const handleDownload = async (docType) => {
    try {
      const response = await employeeApi.downloadDocument(employeeId, docType);
      const filename = `${employee.full_name}_${docType}.pdf`;
      downloadFile(response.data, filename);
    } catch (error) {
      toast.error(`Failed to download ${DOC_TYPES[docType]}`);
    }
  };

  const handleDelete = async (docType) => {
    if (!window.confirm(`Are you sure you want to remove the ${DOC_TYPES[docType]}?`)) return;
    try {
      setUploading(docType);
      await employeeApi.deleteDocument(employeeId, docType);
      toast.success(`${DOC_TYPES[docType]} removed successfully`);
      if (onUpload) onUpload(); // refresh employee object
    } catch (error) {
      toast.error(`Failed to remove ${DOC_TYPES[docType]}`);
    } finally {
      setUploading(null);
    }
  };

  const hasPermissionToUpload = isClerk || isAdmin;
  const canDownloadAll = isAdmin || isClerk;
  const canDownloadCV = isClerk || isAdmin;

  const docTypes = [
    'cv',
    'passport_copy',
    'ned_pass_copy',
    'aadhar_card',
    'pan_card',
    'insurance',
    'pass_cancellation',
    'trade_cert',
    'bosiet_cert',
    'medical_cert',
    'pcc_certificate',
    'photo',
    'other_docs',
  ];

  return (
    <div className="documents-container">
      <h3>📋 Documents</h3>

      <div className="documents-grid">
        {docTypes.map((docType) => {
          const hasDoc = employee?.[`has_${docType}`];
          const canDownload = docType === 'cv' ? canDownloadCV : canDownloadAll;
          const docLabel = DOC_TYPES[docType];

          return (
            <div key={docType} className="document-card">
              <div className="doc-header">
                <h4>{docLabel}</h4>
                <span className={`doc-status ${hasDoc ? 'uploaded' : 'missing'}`}>
                  {hasDoc ? '✓ Uploaded' : '○ Missing'}
                </span>
              </div>

              <div className="doc-actions">
                {hasPermissionToUpload && (
                  <label className="btn btn-secondary btn-sm">
                    Upload
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(docType, e.target.files[0]);
                        }
                      }}
                      disabled={uploading === docType}
                    />
                  </label>
                )}

                {hasDoc && canDownload && (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(docType)}
                    >
                      <Download size={14} /> Download
                    </button>
                    {hasPermissionToUpload && (
                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', marginLeft: '0.5rem' }}
                        onClick={() => handleDelete(docType)}
                        title="Remove Document"
                      >
                        <AlertCircle size={14} /> Remove
                      </button>
                    )}
                  </>
                )}

                {!canDownload && (
                  <span className="text-warning text-sm">
                    <AlertCircle size={14} /> No permission
                  </span>
                )}
              </div>

              {uploading === docType && <span className="uploading">Uploading...</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
