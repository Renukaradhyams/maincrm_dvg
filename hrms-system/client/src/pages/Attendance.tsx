import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { UserCheck, Calendar, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import { API } from '../services/api';

export default function Attendance() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    API.getEmployees()
      .then((res: any) => {
        if (res && res.employees) {
          setEmployees(res.employees);
        }
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Attendance & Shift Roster Desk" subtitle="Daily Staff Attendance Tracking & Floor Shift Allocations">
      <div className="space-y-6">
        {/* Date Selector & Controls */}
        <div className="card-glass p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#C9952A]" />
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#1E2D4E]/60 tracking-wider">Attendance Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-modern mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="badge b-sel font-bold text-xs py-1.5 px-3">Active Employees: {employees.length}</span>
          </div>
        </div>

        {/* Attendance Register */}
        <div className="card-glass overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1E2D4E] uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#C9952A]" />
              <span>Daily Staff Attendance Register</span>
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 font-bold">Loading attendance records...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold">No active employees found in directory.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#1E2D4E] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Emp Code</th>
                    <th className="p-4">Employee Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Shift</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Check In</th>
                    <th className="p-4">Check Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-black text-[#1E2D4E]">{emp.employeeCode || `EMP-${emp.id}`}</td>
                      <td className="p-4 font-bold text-[#1E2D4E]">{emp.fullName}</td>
                      <td className="p-4 text-gray-600">{emp.department || 'Retail Sales'}</td>
                      <td className="p-4 text-gray-600">General Shift (10 AM - 9 PM)</td>
                      <td className="p-4">
                        <span className="badge b-sel">PRESENT</span>
                      </td>
                      <td className="p-4 text-gray-600 font-mono">10:00 AM</td>
                      <td className="p-4 text-gray-600 font-mono">09:00 PM</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
