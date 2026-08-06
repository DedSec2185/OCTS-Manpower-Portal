import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { EmployeeSearch } from '../components/employee/EmployeeSearch';
import '../styles/dashboard.css';

export function SearchPage() {
  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="dashboard-page-header">
          <div className="header-left">
            <h1>Search Employees</h1>
          </div>
        </div>

        <div className="dashboard-section">
          <EmployeeSearch />
        </div>
      </main>
    </div>
  );
}
