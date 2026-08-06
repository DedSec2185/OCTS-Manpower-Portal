import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi';
import { DESIGNATION_OPTIONS, PROJECT_OPTIONS } from '../../utils/constants';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import '../../../src/styles/employee-form.css';

export function EmployeeSearch() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('');
  const [designation, setDesignation] = useState('');
  const [project, setProject] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() && !designation && !project) {
      toast.error('Please enter a search term, select a designation, or select a project');
      return;
    }

    try {
      setLoading(true);
      const response = await employeeApi.searchEmployees({
        q: query.trim() || undefined,
        field: field || undefined,
        designation: designation || undefined,
        project: project || undefined,
      });
      setResults(response.data.items);
      setSearched(true);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-inputs">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, passport, phone, CDC no..."
            className="search-input"
          />

          <select value={field} onChange={(e) => setField(e.target.value)} className="search-select">
            <option value="">All Fields</option>
            <option value="full_name">Name</option>
            <option value="passport_number">Passport</option>
            <option value="aadhar_number">Aadhar</option>
            <option value="phone_number">Phone</option>
            <option value="cdc_number">CDC No</option>
            <option value="designation">Designation</option>
          </select>

          <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="search-select">
            <option value="">All Designations</option>
            {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={project} onChange={(e) => setProject(e.target.value)} className="search-select">
            <option value="">All Projects</option>
            {PROJECT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={18} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner />}

      {searched && !loading && results.length === 0 && (
        <div className="search-empty">
          <p>No employees found matching your criteria.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          <h3>Search Results ({results.length})</h3>
          <div className="results-list">
            {results.map((employee) => (
              <div key={employee.id} className="result-card">
                <div className="result-header">
                  <h4>{employee.full_name}</h4>
                  <span className="badge badge-primary">{employee.designation}</span>
                </div>
                <div className="result-info">
                  <p><strong>Passport:</strong> {employee.passport_number}</p>
                  <p><strong>Project:</strong> {employee.current_project || 'None'}</p>
                  <p><strong>Status:</strong> {employee.current_status}</p>
                  <p><strong>Phone:</strong> {employee.phone_number || 'N/A'}</p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/employee/${employee.id}`)}
                >
                  <Eye size={16} /> View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
