import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { employeeApi } from '../../api/employeeApi';
import { DocumentUploader } from './DocumentUploader';
import { DESIGNATION_OPTIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, MEDICAL_STATUS_OPTIONS, PROJECT_OPTIONS } from '../../utils/constants';
import { formatDateInput } from '../../utils/validators';
import '../../../src/styles/employee-form.css';

const prepareEmployeeData = (emp) => {
  if (!emp) return {};
  const formatted = { ...emp };
  const dateFields = [
    'dob', 'passport_issue_date', 'passport_expiry_date', 'cdc_validity', 
    'cdc_received_date', 'bosiet_issue_date', 'bosiet_expiry_date', 
    'h2s_issue_date', 'h2s_expiry_date', 'stcw_issue_date', 'stcw_expiry_date', 
    'medical_cert_expiry', 'pcc_validity', 'sign_on_date', 'sign_off_date', 
    'pass_cancellation_date'
  ];
  dateFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatDateInput(formatted[field]);
    }
  });
  return formatted;
};

export function EmployeeForm({ employee, onSuccess, onDone }) {
  const { isAdmin, isClerk } = useContext(AuthContext);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: prepareEmployeeData(employee)
  });
  const [loading, setLoading] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(employee?.id || null);
  const [currentEmployeeObj, setCurrentEmployeeObj] = useState(employee || null);
  const [justCreated, setJustCreated] = useState(false);

  useEffect(() => {
    if (employee) {
      reset(prepareEmployeeData(employee));
      setCurrentEmployeeId(employee.id);
      setCurrentEmployeeObj(employee);
    }
  }, [employee, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Clean data: convert empty strings to null for backend validation
      const cleanedData = { ...data };
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '') {
          cleanedData[key] = null;
        }
      });

      let response;
      if (currentEmployeeId) {
        // UPDATE: save changes and trigger onSuccess to navigate away
        response = await employeeApi.updateEmployee(currentEmployeeId, cleanedData);
        toast.success(`Employee ${response.data.full_name} updated successfully!`);
        setCurrentEmployeeObj(response.data);
        if (onSuccess) onSuccess(response.data);
      } else {
        // CREATE: stay on page so document uploader becomes available
        response = await employeeApi.createEmployee(cleanedData);
        toast.success(`Employee ${response.data.full_name} created successfully! You can now upload documents below.`);
        setCurrentEmployeeId(response.data.id);
        setCurrentEmployeeObj(response.data);
        setJustCreated(true);
      }
    } catch (error) {
      const errDetail = error.response?.data?.detail;
      if (Array.isArray(errDetail)) {
        // FastAPI Pydantic validation errors
        const msgs = errDetail.map(err => err.msg || 'Validation error').join(', ');
        toast.error(`Validation Failed: ${msgs}`);
      } else if (typeof errDetail === 'string') {
        toast.error(errDetail);
      } else {
        toast.error('Failed to save employee');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-form-wrapper">
    <form onSubmit={handleSubmit(onSubmit)} className="employee-form">
      <div className="form-section">
        <fieldset>
          <legend>Basic Information</legend>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                {...register('full_name', { required: 'Full name is required' })}
                placeholder="Enter full name"
              />
              {errors.full_name && <span className="error">{errors.full_name.message}</span>}
            </div>
            <div className="form-group">
              <label>Designation *</label>
              <select {...register('designation', { required: 'Designation is required' })}>
                <option value="">Select designation</option>
                {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.designation && <span className="error">{errors.designation.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Father's Name</label>
              <input type="text" {...register('father_name')} placeholder="Enter father's name" />
            </div>
            <div className="form-group">
              <label>Mother's Name</label>
              <input type="text" {...register('mother_name')} placeholder="Enter mother's name" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" {...register('dob')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select {...register('gender')}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Nationality</label>
              <input type="text" {...register('nationality')} placeholder="e.g., Indian" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Marital Status</label>
              <select {...register('marital_status')}>
                <option value="">Select status</option>
                {MARITAL_STATUS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <input type="text" {...register('blood_group')} placeholder="e.g., O+" />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend>Passport Information</legend>
          <div className="form-row">
            <div className="form-group">
              <label>Passport Number *</label>
              <input
                type="text"
                {...register('passport_number', { required: 'Passport number is required' })}
                placeholder="Enter passport number"
              />
              {errors.passport_number && <span className="error">{errors.passport_number.message}</span>}
            </div>
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" {...register('passport_issue_date')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" {...register('passport_expiry_date')} />
            </div>
            <div className="form-group">
              <label>Issue Place</label>
              <input type="text" {...register('passport_issue_place')} placeholder="City/Country" />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend>CDC / NED Pass</legend>
          <div className="form-row">
            <div className="form-group">
              <label>CDC Number</label>
              <input type="text" {...register('cdc_number')} placeholder="Enter CDC/NED Pass number" />
            </div>
            <div className="form-group">
              <label>CDC Validity</label>
              <input type="date" {...register('cdc_validity')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CDC Received Date</label>
              <input type="date" {...register('cdc_received_date')} />
            </div>
            <div className="form-group">
              <label>CDC Issue Place</label>
              <input type="text" {...register('cdc_issue_place')} />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend>Identity Documents</legend>
          <div className="form-row">
            <div className="form-group">
              <label>Aadhar Number (12 digits)</label>
              <input
                type="text"
                {...register('aadhar_number', {
                  pattern: {
                    value: /^\d{12}$/,
                    message: 'Aadhar number must be exactly 12 digits'
                  }
                })}
                placeholder="Enter 12-digit Aadhar (optional)"
                maxLength="12"
              />
              {errors.aadhar_number && <span className="error">{errors.aadhar_number.message}</span>}
            </div>
            <div className="form-group">
              <label>Civil ID Number</label>
              <input type="text" {...register('civil_id_number')} />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend>Contact Information</legend>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                {...register('phone_number', { required: 'Phone number is required' })}
                placeholder="+91-xxxxxxxxxx"
              />
              {errors.phone_number && <span className="error">{errors.phone_number.message}</span>}
            </div>
            <div className="form-group">
              <label>Alt Phone Number</label>
              <input type="text" {...register('phone_number_alt')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Emergency Contact Number</label>
              <input type="text" {...register('emergency_contact_number')} placeholder="+91-xxxxxxxxxx" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" {...register('email')} placeholder="email@example.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>PIN Code</label>
              <input type="text" {...register('pin_code')} />
            </div>
          </div>

          <div className="form-group">
            <label>Permanent Address</label>
            <textarea {...register('permanent_address')} rows="3" placeholder="Enter full address"></textarea>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend>Bank Account Details</legend>
          <div className="form-row">
            <div className="form-group">
              <label>Bank Name</label>
              <input type="text" {...register('bank_name')} placeholder="Enter bank name" />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input type="text" {...register('bank_account_number')} placeholder="Enter account number" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>IFSC Code</label>
              <input type="text" {...register('bank_ifsc_code')} placeholder="e.g. SBIN0001234" />
            </div>
          </div>
          
          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.8rem', color: '#94a3b8' }}>Nominee Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Nominee Name</label>
              <input type="text" {...register('nominee_name')} placeholder="Enter nominee name" />
            </div>
            <div className="form-group">
              <label>Nominee Mobile Number</label>
              <input type="text" {...register('nominee_number')} placeholder="Enter nominee number" />
            </div>
          </div>
          <div className="form-group">
            <label>Nominee Present Address</label>
            <textarea {...register('nominee_address')} rows="2" placeholder="Enter nominee address"></textarea>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend>Safety Certifications</legend>
          <div className="form-row">
            <div className="form-group">
              <label>
                <input type="checkbox" {...register('bosiet_done')} />
                BOSIET Completed
              </label>
            </div>
            <div className="form-group">
              <label>BOSIET Issue Date</label>
              <input type="date" {...register('bosiet_issue_date')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>BOSIET Expiry Date</label>
              <input type="date" {...register('bosiet_expiry_date')} />
            </div>
            <div className="form-group">
              <label>BOSIET Cert Number</label>
              <input type="text" {...register('bosiet_cert_number')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <input type="checkbox" {...register('h2s_done')} />
                H2S Completed
              </label>
            </div>
            <div className="form-group">
              <label>H2S Expiry Date</label>
              <input type="date" {...register('h2s_expiry_date')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <input type="checkbox" {...register('stcw_done')} />
                STCW Completed
              </label>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" {...register('pdo_induction_done')} />
                PDO Induction Done
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Medical Fitness Status</label>
              <select {...register('medical_fitness_status')}>
                <option value="">Select status</option>
                {MEDICAL_STATUS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Medical Cert Expiry</label>
              <input type="date" {...register('medical_cert_expiry')} />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend>PPE & Trade Certificate</legend>
          <h4 style={{ marginBottom: '0.8rem', color: '#94a3b8' }}>Personal Protective Equipment (PPE)</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Boiler Suit Size</label>
              <input type="text" {...register('ppe_boiler_suit_size')} placeholder="e.g. XL, 42" />
            </div>
            <div className="form-group">
              <label>PPE Issue Date</label>
              <input type="date" {...register('ppe_issue_date')} />
            </div>
            <div className="form-group">
              <label>Shoes Size</label>
              <input type="text" {...register('ppe_shoe_size')} placeholder="e.g. 9, 10" />
            </div>
          </div>

          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.8rem', color: '#94a3b8' }}>Trade Certificate Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Has Trade Certificate?</label>
              <select {...register('trade_certificate_status')}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Certificate Issue Date</label>
              <input type="date" {...register('trade_certificate_issue_date')} />
            </div>
            <div className="form-group">
              <label>Place of Issue</label>
              <input type="text" {...register('trade_certificate_issue_place')} placeholder="Enter place of issue" />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend>Deployment & Company Details</legend>
          <div className="form-row">
            <div className="form-group">
              <label>Joining Date</label>
              <input type="date" {...register('joining_date')} />
            </div>
            <div className="form-group">
              <label>PCC Validity</label>
              <input type="date" {...register('pcc_validity')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sign Off Date</label>
              <input type="date" {...register('sign_off_date')} />
            </div>
            <div className="form-group">
              <label>Pass Cancellation Date</label>
              <input type="date" {...register('pass_cancellation_date')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Current Status</label>
              <select {...register('current_status')}>
                <option value="available">Available</option>
                <option value="active">Active</option>
                <option value="signed_off">Signed Off</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Current Project Assignment</label>
              <select {...register('current_project')}>
                <option value="">-- No Project (Unassigned) --</option>
                {PROJECT_OPTIONS.map(proj => (
                  <option key={proj} value={proj}>{proj}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" {...register('photo_received')} />
                Photo Received
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Received Documents</label>
            <textarea {...register('received_documents')} rows="2" placeholder="List of received documents"></textarea>
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea {...register('remarks')} rows="2" placeholder="Additional remarks"></textarea>
          </div>
        </fieldset>
      </div>

      {currentEmployeeId && isAdmin && (
        <div className="form-section admin-exit-section" style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '1rem' }}>
          <fieldset>
            <legend style={{ color: '#f59e0b' }}>Admin-Only Exit & Sign-On Settings</legend>
            <div className="form-row">
              <div className="form-group">
                <label>Sign On Date</label>
                <input type="date" {...register('sign_on_date')} />
              </div>
              <div className="form-group">
                <label>Exit Date</label>
                <input type="date" {...register('exit_date')} />
              </div>
            </div>
            <div className="form-group">
              <label>Exit Remarks</label>
              <textarea {...register('exit_remarks')} rows="2" placeholder="Describe reasons for exit, deactivation, or offboarding details..."></textarea>
            </div>
          </fieldset>
        </div>
      )}

      <div className="form-section">
        <fieldset>
          <legend>Professional & Salary Information</legend>
          <div className="form-row">
            <div className="form-group">
              <label>Total Experience (Years)</label>
              <input type="number" step="0.5" {...register('total_experience_years')} />
            </div>
            <div className="form-group">
              <label>Per Day Salary (INR/USD)</label>
              <input
                type="text"
                {...register('per_day_salary')}
                placeholder="e.g. 2400 + 200"
                disabled={employee?.id && !isAdmin}
              />
              {employee?.id && !isAdmin && (
                <span className="field-hint" style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Only administrators can modify salary settings.
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Experience Details</label>
            <textarea {...register('experience_details')} rows="3" placeholder="Describe work experience"></textarea>
          </div>

          <div className="form-group">
            <label>Education</label>
            <textarea {...register('education')} rows="3" placeholder="Educational qualifications"></textarea>
          </div>

          <div className="form-group">
            <label>Skills</label>
            <textarea {...register('skills')} rows="3" placeholder="List skills separated by commas"></textarea>
          </div>
        </fieldset>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : currentEmployeeId ? 'Update Employee Details' : 'Create Employee'}
        </button>
        {!currentEmployeeId && (
          <button type="reset" className="btn btn-secondary">
            Clear Form
          </button>
        )}
        {justCreated && onDone && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginLeft: '0.5rem', background: '#10b981', color: '#fff', border: 'none' }}
            onClick={onDone}
          >
            ✓ Done — Go Back to Dashboard
          </button>
        )}
      </div>
    </form>

    <div className="form-section" style={{ marginTop: '2rem' }}>
      <fieldset>
        <legend>Document Uploads</legend>
        {currentEmployeeId ? (
          <DocumentUploader 
            employeeId={currentEmployeeId} 
            isAdmin={isAdmin} 
            isClerk={isClerk} 
            employee={currentEmployeeObj} 
            onUpload={async () => {
              try {
                const response = await employeeApi.getEmployee(currentEmployeeId);
                setCurrentEmployeeObj(response.data);
              } catch (e) {
                console.error('Failed to refresh employee after doc update');
              }
            }}
          />
        ) : (
          <p className="text-muted" style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', color: '#94a3b8' }}>
            ⚠️ Document upload will be available immediately after the employee record is created.
          </p>
        )}
      </fieldset>
    </div>
    </div>
  );
}
