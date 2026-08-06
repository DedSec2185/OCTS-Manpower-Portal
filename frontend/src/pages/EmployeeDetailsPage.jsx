import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { DocumentUploader } from '../components/employee/DocumentUploader';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmployeeDetailsCard, DetailItem } from '../components/employee/EmployeeDetailsCard';
import { EmployeeEditModal } from '../components/employee/EmployeeEditModal';
import toast from 'react-hot-toast';
import { employeeApi } from '../api/employeeApi';
import { formatDate, getStatusBadgeColor } from '../utils/validators';
import '../styles/dashboard.css';

export function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isClerk } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'user') {
      setActiveTab('deployment');
    }
  }, [user]);

  const handleDelete = async () => {
    try {
      await employeeApi.deleteEmployee(id);
      toast.success('Employee deleted successfully');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to delete employee');
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getEmployee(id);
      setEmployee(response.data);
    } catch (error) {
      toast.error('Failed to load employee details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <Navbar />
        <main className="main-content">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="dashboard">
        <Sidebar />
        <Navbar />
        <main className="main-content">
          <p>Employee not found</p>
        </main>
      </div>
    );
  }

  const isLimitedView = user?.role === 'user';

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Header */}
        <div className="employee-header">
          <div className="employee-header-info">
            <h1>{employee.full_name}</h1>
            <p className="employee-designation">{employee.designation}</p>
            <span
              className="badge"
              style={{ backgroundColor: getStatusBadgeColor(employee.current_status) }}
            >
              {employee.current_status}
            </span>
          </div>
          <div className="employee-header-actions">
            {isAdmin && (
              <>
                <button className="btn btn-primary animate-hover" onClick={() => navigate(`/admin/edit/${employee.id}`)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-danger animate-hover" onClick={() => setIsDeleteOpen(true)}>
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {!isLimitedView && <button className={`tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>👤 Personal Info</button>}
          {!isLimitedView && <button className={`tab ${activeTab === 'passport' ? 'active' : ''}`} onClick={() => setActiveTab('passport')}>📕 Passport & Docs</button>}
          {!isLimitedView && <button className={`tab ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => setActiveTab('bank')}>💳 Bank Details</button>}
          {!isLimitedView && <button className={`tab ${activeTab === 'certs' ? 'active' : ''}`} onClick={() => setActiveTab('certs')}>🎓 Certifications</button>}
          <button className={`tab ${activeTab === 'deployment' ? 'active' : ''}`} onClick={() => setActiveTab('deployment')}>✈️ Deployment</button>
          {(isAdmin || isClerk) && <button className={`tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>📁 Documents</button>}
          {!isLimitedView && <button className={`tab ${activeTab === 'professional' ? 'active' : ''}`} onClick={() => setActiveTab('professional')}>💼 Professional</button>}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'personal' && !isLimitedView && (
            <EmployeeDetailsCard title="Personal Information" icon="👤">
              <div className="info-grid">
                <DetailItem label="Full Name" value={employee.full_name} />
                <DetailItem label="Father's Name" value={employee.father_name} />
                <DetailItem label="Mother's Name" value={employee.mother_name} />
                <DetailItem label="Date of Birth" value={formatDate(employee.dob)} />
                <DetailItem label="Gender" value={employee.gender} />
                <DetailItem label="Nationality" value={employee.nationality} />
                <DetailItem label="Religion" value={employee.religion} />
                <DetailItem label="Marital Status" value={employee.marital_status} />
                <DetailItem label="Blood Group" value={employee.blood_group} />
                <DetailItem label="Phone" value={employee.phone_number} />
                <DetailItem label="Emergency Phone" value={employee.emergency_contact_number} />
                <DetailItem label="Email" value={employee.email} />
                <DetailItem label="Address" value={employee.permanent_address} fullWidth />
              </div>
            </EmployeeDetailsCard>
          )}

          {activeTab === 'passport' && !isLimitedView && (
            <EmployeeDetailsCard title="Passport & National Identity" icon="📕">
              <div className="info-grid">
                <DetailItem label="Passport Number" value={employee.passport_number} />
                <DetailItem label="Issue Date" value={formatDate(employee.passport_issue_date)} />
                <DetailItem label="Expiry Date" value={formatDate(employee.passport_expiry_date)} />
                <DetailItem label="Issue Place" value={employee.passport_issue_place} />
                <DetailItem label="Aadhar Number" value={employee.aadhar_number ? '*'.repeat(8) + employee.aadhar_number.slice(-4) : 'N/A'} />
                <DetailItem label="CDC Number" value={employee.cdc_number} />
                <DetailItem label="CDC Validity" value={formatDate(employee.cdc_validity)} />
              </div>
            </EmployeeDetailsCard>
          )}

          {activeTab === 'bank' && !isLimitedView && (
            <EmployeeDetailsCard title="Bank Account & Nominee Details" icon="">
              <div className="info-grid">
                <DetailItem label="Bank Name" value={employee.bank_name} />
                <DetailItem label="Account Number" value={employee.bank_account_number} />
                <DetailItem label="IFSC Code" value={employee.bank_ifsc_code} />
                <DetailItem label="Nominee Name" value={employee.nominee_name} />
                <DetailItem label="Nominee Number" value={employee.nominee_number} />
                <DetailItem label="Nominee Address" value={employee.nominee_address} fullWidth />
              </div>
            </EmployeeDetailsCard>
          )}

          {activeTab === 'certs' && !isLimitedView && (
            <>
              <EmployeeDetailsCard title="Safety Certifications" icon="🎓">
                <div className="info-grid">
                  <DetailItem label="BOSIET" value={employee.bosiet_done ? `✓ Expires: ${formatDate(employee.bosiet_expiry_date)}` : 'Not Done'} />
                  <DetailItem label="H2S" value={employee.h2s_done ? `✓ Expires: ${formatDate(employee.h2s_expiry_date)}` : 'Not Done'} />
                  <DetailItem label="STCW" value={employee.stcw_done ? '✓' : 'Not Done'} />
                  <DetailItem label="PDO Induction" value={employee.pdo_induction_done ? '✓' : 'Not Done'} />
                  <DetailItem label="Medical Fitness" value={employee.medical_fitness_status} />
                  <DetailItem label="Medical Cert Expiry" value={formatDate(employee.medical_cert_expiry)} />
                </div>
              </EmployeeDetailsCard>

              <div style={{ marginTop: '1.5rem' }}>
                <EmployeeDetailsCard title="PPE Sizes & Equipment" icon="">
                  <div className="info-grid">
                    <DetailItem label="Boiler Suit Size" value={employee.ppe_boiler_suit_size} />
                    <DetailItem label="PPE Issue Date" value={formatDate(employee.ppe_issue_date)} />
                    <DetailItem label="Shoes Size" value={employee.ppe_shoe_size} />
                  </div>
                </EmployeeDetailsCard>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <EmployeeDetailsCard title="Trade Certificate" icon="">
                  <div className="info-grid">
                    <DetailItem label="Has Trade Certificate?" value={employee.trade_certificate_status ? 'Yes' : 'No'} />
                    <DetailItem label="Issue Date" value={formatDate(employee.trade_certificate_issue_date)} />
                    <DetailItem label="Place of Issue" value={employee.trade_certificate_issue_place} />
                  </div>
                </EmployeeDetailsCard>
              </div>
            </>
          )}

          {activeTab === 'deployment' && (
            <EmployeeDetailsCard title="Deployment & Company Status" icon="✈️">
              <div className="info-grid">
                <DetailItem label="Current Status" value={employee.current_status} />
                <DetailItem label="Current Project" value={employee.current_project || 'Unassigned'} />
                <DetailItem label="Joining Date" value={formatDate(employee.joining_date)} />
                <DetailItem label="Sign On Date" value={formatDate(employee.sign_on_date)} />
                <DetailItem label="Sign Off Date" value={formatDate(employee.sign_off_date)} />
                <DetailItem label="PCC Validity" value={formatDate(employee.pcc_validity)} />
                {employee.exit_date && <DetailItem label="Exit Date" value={formatDate(employee.exit_date)} />}
                {employee.exit_remarks && <DetailItem label="Exit Remarks" value={employee.exit_remarks} fullWidth />}
              </div>
            </EmployeeDetailsCard>
          )}

          {activeTab === 'documents' && (isAdmin || isClerk) && (
            <DocumentUploader
              employeeId={employee.id}
              isAdmin={isAdmin}
              isClerk={isClerk}
              employee={employee}
              onUpload={loadEmployee}
            />
          )}

          {activeTab === 'professional' && !isLimitedView && (
            <EmployeeDetailsCard title="Professional Experience" icon="💼">
              <div className="info-grid">
                <DetailItem label="Experience (Years)" value={employee.total_experience_years} />
                {isAdmin && <DetailItem label="Salary / Day" value={employee.per_day_salary ? `${employee.per_day_salary}` : 'N/A'} />}
                <DetailItem label="Experience Details" value={employee.experience_details} fullWidth />
                <DetailItem label="Education" value={employee.education} fullWidth />
                <DetailItem label="Skills" value={employee.skills} fullWidth />
              </div>
            </EmployeeDetailsCard>
          )}
        </div>

        <EmployeeEditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          employee={employee}
          onSuccess={loadEmployee}
        />

        <ConfirmModal
          isOpen={isDeleteOpen}
          title="Delete Employee"
          message="Are you sure you want to delete this employee? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
          danger
        />
      </main>
    </div>
  );
}
