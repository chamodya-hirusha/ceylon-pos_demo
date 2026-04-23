import React, { useState, useMemo } from 'react';
import { cashiers } from '@/data/demoData';
import { Plus, Edit2, Trash2, User, Shield, Clock, Key, Check, X, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const Employees: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { userType, currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const itemsPerPage = 6;

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
    pin: '',
    active: true
  });

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewEmployee(prev => ({ ...prev, pin }));
  };

  const filteredItems = useMemo(() => {
    // Managers should not see Admins
    if (userType === 'manager') {
      return cashiers.filter(c => c.role !== 'admin');
    }
    return cashiers;
  }, [userType]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [currentPage, filteredItems]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      console.log('Updating employee:', newEmployee);
    } else {
      console.log('Adding employee:', newEmployee);
    }
    setIsAddModalOpen(false);
    setEditingEmployee(null);
    setNewEmployee({ name: '', email: '', phone: '', role: 'cashier', pin: '', active: true });
  };

  const openEditModal = (employee: any) => {
    setEditingEmployee(employee);
    setNewEmployee({
      name: employee.name,
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role,
      pin: employee.pin,
      active: employee.active
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2 lg:mt-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('employee')}</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Manage staff accounts and system access levels</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="pos-btn-primary flex items-center justify-center gap-2 py-3.5 px-6 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Add Employee</span>
        </button>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {currentEmployees.map((cashier) => (
          <div key={cashier.id} className="pos-card p-6 group hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground truncate max-w-[150px]">{cashier.name}</h3>
                  <p className="text-xs font-mono text-muted-foreground">ID: {cashier.id}</p>
                </div>
              </div>
              <span
                className={`pos-badge text-[10px] flex items-center gap-1 ${cashier.active ? 'pos-badge-success' : 'pos-badge-danger'
                  }`}
              >
                {cashier.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {cashier.active ? 'Active' : 'Locked'}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">Security PIN</span>
                </div>
                <span className="font-mono text-xs tracking-widest text-primary font-bold bg-primary/10 px-2 py-1 rounded">****</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">Access Level</span>
                </div>
                <span className="text-xs uppercase font-bold text-muted-foreground">{cashier.role || 'Cashier'}</span>
              </div>

              <div className="flex flex-col gap-1 px-1">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Joined: {cashier.joinDate || 'Jan 2024'}
                </div>
                {cashier.phone && (
                  <div className="text-[11px] text-muted-foreground truncate">{cashier.phone}</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border/50">
              {/* Managers can only edit cashiers, Admins can edit everyone */}
              {(userType === 'admin' || (userType === 'manager' && cashier.role === 'cashier')) && (
                <>
                  <button
                    onClick={() => openEditModal(cashier)}
                    className="flex-1 pos-btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="p-2.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors border border-transparent hover:border-destructive/20">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Add New Skeleton Card */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="pos-card p-6 border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-4 min-h-[300px] transition-all bg-transparent hover:bg-muted/10 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
            <span className="block text-foreground font-bold">New Employee</span>
            <span className="text-xs text-muted-foreground">Setup new staff credentials</span>
          </div>
        </button>
      </div>

      {/* Pagination for Employees */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-bold transition-all ${currentPage === page
                ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 sm:p-6 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground leading-none">
                    {editingEmployee ? 'Edit Employee Profile' : 'Enroll New Employee'}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {editingEmployee ? `Modifying access for ${editingEmployee.name}` : 'Fill in the professional details below'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingEmployee(null);
                  setNewEmployee({ name: '', email: '', phone: '', role: 'cashier', pin: '', active: true });
                }}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                title="ESC"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Personal Details</h3>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Full Name</label>
                    <input
                      required
                      type="text"
                      value={newEmployee.name}
                      onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      className="pos-input"
                      placeholder="e.g. Kasun Perera"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      className="pos-input"
                      placeholder="kasun@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      className="pos-input"
                      placeholder="+94 7X XXX XXXX"
                    />
                  </div>
                </div>

                {/* System Access */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">System Access</h3>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Access Role</label>
                    <select
                      value={newEmployee.role}
                      onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
                      className="pos-input"
                    >
                      <option value="cashier">Cashier</option>
                      <option value="manager">Store Manager</option>
                      {userType === 'admin' && <option value="admin">Administrator</option>}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Login PIN (4-Digits)</label>
                    <div className="relative">
                      <input
                        required
                        maxLength={4}
                        type="password"
                        value={newEmployee.pin}
                        onChange={e => setNewEmployee({ ...newEmployee, pin: e.target.value })}
                        className="pos-input font-mono tracking-[0.5em] pr-12"
                        placeholder="****"
                      />
                      <button
                        type="button"
                        onClick={generatePin}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Auto-generate"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Account Status</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setNewEmployee({ ...newEmployee, active: true })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all ${newEmployee.active
                          ? 'border-success/50 bg-success/10 text-success'
                          : 'border-border bg-muted/20 text-muted-foreground'
                          }`}
                      >
                        <Check className="w-4 h-4" />
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewEmployee({ ...newEmployee, active: false })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all ${!newEmployee.active
                          ? 'border-destructive/50 bg-destructive/10 text-destructive'
                          : 'border-border bg-muted/20 text-muted-foreground'
                          }`}
                      >
                        <X className="w-4 h-4" />
                        Locked
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="font-bold text-primary mb-1">Authorization Security</p>
                  New accounts are created with default POS shortcuts. PINs must be unique. Active employees can immediately access their respective dashboards.
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEmployee(null);
                    setNewEmployee({ name: '', email: '', phone: '', role: 'cashier', pin: '', active: true });
                  }}
                  className="flex-1 pos-btn-secondary py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 pos-btn-primary py-3 font-bold"
                >
                  {editingEmployee ? 'Update Profile' : 'Create Employee Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
