export const ROLES = {
  ADMIN: 'admin',
  CLERK: 'clerk',
  USER: 'user',
};

export const EMPLOYEE_STATUS = {
  AVAILABLE: 'available',
  ACTIVE: 'active',
  SIGNED_OFF: 'signed_off',
  CANCELLED: 'cancelled',
};

export const DESIGNATION_OPTIONS = [
  'Welder',
  '6G ARC Welder',
  'Rigger',
  'Scaffolder',
  'Fitter',
  'Helper',
  'Fireman',
  'Gas Cutter',
  'Grinder',
  'Electrician',
  'Rigger/Scaffolder',
  'Welder/Fitter',
  'Painter',
  'Carpenter',
  'Mechanic',
  'Operator',
  'Supervisor',
  'Material Assistant',
  'ROUSTABOAT',
  'Other',
];

export const PROJECT_OPTIONS = [
  'Molobhoy - rescue boat insulation',
  'ADEC - Panna',
  'OCS - Panna',
  'OCS - Tapti',
  'Technocrats',
];

export const DOC_TYPES = {
  cv: 'CV / Resume',
  passport_copy: 'Passport Copy',
  ned_pass_copy: 'NED Pass Copy',
  aadhar_card: 'Aadhar Card',
  pan_card: 'PAN Card',
  bank_details: 'Bank Details (Passbook / Cheque)',
  insurance: 'Insurance Document',
  pass_cancellation: 'Pass Cancellation',
  trade_cert: 'Trade Certificate',
  bosiet_cert: 'BOSIET Certificate',
  medical_cert: 'Medical Certificate',
  pcc_certificate: 'PCC Document',
  photo: 'Photo',
  other_docs: 'Other Documents',
};

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export const MARITAL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
];

export const MEDICAL_STATUS_OPTIONS = ['FIT', 'UNFIT'];

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
