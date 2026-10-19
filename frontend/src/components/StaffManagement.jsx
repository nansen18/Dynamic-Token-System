import React, { useState, useEffect } from 'react';
import { 
  UserCog, 
  UserPlus, 
  Mail, 
  Lock, 
  Building2, 
  Tv, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  RefreshCw, 
  Key,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function StaffManagement({ counters = [], onClose }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Staff@' + Math.floor(1000 + Math.random() * 9000));
  const [department, setDepartment] = useState('Hospital');
  const [selectedCounterId, setSelectedCounterId] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.getStaffList();
      if (res.data) {
        setStaffList(res.data);
      }
    } catch (err) {
      setError('Failed to load staff accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    const matchedCounter = counters.find(c => c.id === selectedCounterId);

    setSubmitting(true);
    try {
      const res = await api.createStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        department,
        counterId: selectedCounterId || '',
        counterNumber: matchedCounter ? matchedCounter.counterNumber : ''
      });

      setSuccessMsg(`Staff account for ${res.staff.name} created successfully! Password: ${password}`);
      setName('');
      setEmail('');
      setPassword('Staff@' + Math.floor(1000 + Math.random() * 9000));
      setShowAddModal(false);
      await fetchStaff();
    } catch (err) {
      setError(err.message || 'Failed to create staff account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Staff Account Provisioning</h2>
              <p className="text-xs text-slate-400">Authorized administrative management of officer terminal access</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStaff}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setError('');
              setSuccessMsg('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create New Staff Officer</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg shadow-rose-500/10">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Staff Table / Cards */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Active Officer Directory</span>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {staffList.length} Authorized
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">MongoDB Atlas Synced</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-xs">Loading authorized staff accounts from database...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <UserCog className="h-10 w-10 mx-auto mb-3 opacity-30 text-amber-400" />
            <p className="text-sm font-medium text-slate-300">No staff officer accounts provisioned yet.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Create New Staff Officer" above to provision the first account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Officer Name</th>
                  <th className="px-6 py-3.5 font-semibold">Email & Credentials</th>
                  <th className="px-6 py-3.5 font-semibold">Department Sector</th>
                  <th className="px-6 py-3.5 font-semibold">Assigned Desk</th>
                  <th className="px-6 py-3.5 font-semibold">Account Status</th>
                  <th className="px-6 py-3.5 font-semibold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <span>{staff.name}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">Officer ID: {staff.id.substring(0, 16)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <span>{staff.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
                        {staff.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {staff.counterNumber || staff.counterId || (
                        <span className="text-slate-500 italic">Unassigned (Terminal Float)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active Staff
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'Initial Setup'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create New Staff Officer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Authorized Staff Account</h3>
                  <p className="text-xs text-slate-400">Provision login credentials for a desk officer</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Officer Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Officer Marcus Vance"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Staff Email Address <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. officer.vance@nexusqueue.io"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 placeholder:text-slate-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Temporary / Initial Password <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword('Staff@' + Math.floor(1000 + Math.random() * 9000))}
                    className="text-[10px] text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Key className="h-3 w-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-amber-500 text-slate-100 font-mono text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2"
                />
                <p className="text-[10px] text-slate-500 mt-1">Share this temporary password with the officer to allow their first sign-in.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department Sector
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2"
                  >
                    <option value="Hospital">🏥 Hospital / Healthcare</option>
                    <option value="Bank">🏦 Retail Banking</option>
                    <option value="Government Office">🏛️ Government / DMV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assign Counter (Optional)
                  </label>
                  <select
                    value={selectedCounterId}
                    onChange={(e) => setSelectedCounterId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-amber-500 text-slate-100 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2"
                  >
                    <option value="">-- Terminal Float (Any) --</option>
                    {counters.map(c => (
                      <option key={c.id} value={c.id}>{c.counterNumber} ({c.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving to Atlas DB...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Authorize & Create Officer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
