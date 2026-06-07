'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Briefcase, Building, Activity, CheckCircle, XCircle, Trash2, Eye, MapPin } from 'lucide-react';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{totalUsers: number, activeJobs: number, totalCompanies: number, totalApplications: number} | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Usher Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Custom Delete Confirm Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'job' | 'user', title: string } | null>(null);

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    try {
      const baseUrl = api.defaults.baseURL || 'http://localhost:5125/api/v1';
      const origin = new URL(baseUrl).origin;
      return `${origin}${url}`;
    } catch {
      return `http://localhost:5125${url}`;
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users?pageSize=50'),
        api.get('/admin/jobs?pageSize=50')
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.items);
      setJobs(jobsRes.data.data.items);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
      toast.error("Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerDeleteUser = (id: string, name: string) => {
    setItemToDelete({ id, type: 'user', title: name });
    setDeleteConfirmOpen(true);
  };

  const triggerDeleteJob = (id: string, title: string) => {
    setItemToDelete({ id, type: 'job', title });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    setDeleteConfirmOpen(false);
    try {
      if (itemToDelete.type === 'user') {
        await api.delete(`/admin/users/${itemToDelete.id}`);
        toast.success('User deleted successfully');
      } else {
        await api.delete(`/jobs/${itemToDelete.id}`);
        toast.success('Job deleted successfully');
      }
      fetchDashboardData();
    } catch (error) {
      toast.error(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setActionLoading(false);
      setItemToDelete(null);
    }
  };

  const handleModerateJob = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/jobs/${id}/moderate`, { status });
      toast.success(`Job marked as ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update job status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewProfile = async (id: string) => {
    setProfileLoading(true);
    setIsProfileOpen(true);
    try {
      const res = await api.get(`/admin/users/${id}/profile`);
      setSelectedProfile(res.data.data);
    } catch (error) {
      toast.error('Failed to load user profile');
      setIsProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>Global Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-2 tracking-wide">
            Manage users, moderate job postings, and oversee platform activity.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-[oklch(0.26_0.046_248/0.6)] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[oklch(0.60_0.022_82)]">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16 bg-muted" /> : <div className="text-3xl font-light text-foreground">{stats?.totalUsers || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card border-[oklch(0.26_0.046_248/0.6)] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[oklch(0.60_0.022_82)]">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16 bg-muted" /> : <div className="text-3xl font-light text-foreground">{stats?.activeJobs || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card border-[oklch(0.26_0.046_248/0.6)] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[oklch(0.60_0.022_82)]">Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16 bg-muted" /> : <div className="text-3xl font-light text-foreground">{stats?.totalCompanies || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card border-[oklch(0.26_0.046_248/0.6)] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[oklch(0.60_0.022_82)]">Total Applications</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16 bg-muted" /> : <div className="text-3xl font-light text-foreground">{stats?.totalApplications || 0}</div>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl gap-1">
          <TabsTrigger value="jobs" className="text-[10px] tracking-[0.15em] uppercase font-medium rounded-lg px-4 py-2 text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Manage Jobs</TabsTrigger>
          <TabsTrigger value="users" className="text-[10px] tracking-[0.15em] uppercase font-medium rounded-lg px-4 py-2 text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Manage Users</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-base font-light text-card-foreground" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>Job Postings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Moderate, approve, and delete listings.</p>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="p-6 text-center"><Skeleton className="h-32 w-full bg-muted" /></div>
              ) : jobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted">
                      <tr>
                        <th className="px-6 py-3 font-medium">Job Title</th>
                        <th className="px-6 py-3 font-medium">Company</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[oklch(0.20_0.042_248/0.5)]">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-muted transition-colors">
                          <td className="px-6 py-4 font-medium text-card-foreground">{job.title}</td>
                          <td className="px-6 py-4 text-[oklch(0.60_0.022_82)]">{job.company}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] tracking-wider uppercase font-semibold border ${
                              job.status === 'Active'
                                ? 'bg-[oklch(0.30_0.08_142/0.1)] text-[oklch(0.60_0.08_142)] border-[oklch(0.30_0.08_142/0.2)]'
                                : job.status === 'Pending'
                                ? 'bg-[oklch(0.28_0.05_48/0.1)] text-[oklch(0.68_0.05_48)] border-[oklch(0.28_0.05_48/0.2)]'
                                : 'bg-[oklch(0.25_0.02_248/0.1)] text-[oklch(0.50_0.02_248)] border-[oklch(0.25_0.02_248/0.2)]'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            {job.status === 'Pending' && (
                              <button onClick={() => handleModerateJob(job.id, 'Active')} disabled={actionLoading} className="p-1.5 rounded-lg text-[oklch(0.60_0.08_142)] hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-[oklch(0.30_0.08_142/0.3)]" title="Approve Job">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {job.status === 'Active' && (
                              <button onClick={() => handleModerateJob(job.id, 'Closed')} disabled={actionLoading} className="p-1.5 rounded-lg text-[oklch(0.68_0.05_48)] hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-[oklch(0.28_0.05_48/0.3)]" title="Close Job">
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => triggerDeleteJob(job.id, job.title)} disabled={actionLoading} className="p-1.5 rounded-lg text-[oklch(0.55_0.06_24)] hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-[oklch(0.25_0.06_24/0.3)]" title="Delete Job">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Briefcase className="mx-auto h-8 w-8 mb-3 opacity-50" />
                  <p>No jobs found.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-base font-light text-card-foreground" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>User Directory</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage employers and ushers on the platform.</p>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="p-6 text-center"><Skeleton className="h-32 w-full bg-muted" /></div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted">
                      <tr>
                        <th className="px-6 py-3 font-medium">Name / Email</th>
                        <th className="px-6 py-3 font-medium">Role</th>
                        <th className="px-6 py-3 font-medium">Registered</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[oklch(0.20_0.042_248/0.5)]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-muted transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-card-foreground">{u.fullName}</div>
                            <div className="text-[10px] text-muted-foreground">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] tracking-wider uppercase bg-muted text-[oklch(0.60_0.022_248)] border border-[oklch(0.26_0.044_248/0.4)]">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[oklch(0.60_0.022_82)] text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            {u.role === 'Usher' && (
                              <button onClick={() => handleViewProfile(u.id)} disabled={actionLoading} className="p-1.5 rounded-lg text-[oklch(0.60_0.022_82)] hover:bg-muted transition-colors border border-transparent hover:border-[oklch(0.26_0.044_248/0.5)]" title="View Profile">
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            {u.role !== 'Admin' && (
                              <button onClick={() => triggerDeleteUser(u.id, u.fullName)} disabled={actionLoading} className="p-1.5 rounded-lg text-[oklch(0.55_0.06_24)] hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-[oklch(0.25_0.06_24/0.3)]" title="Delete User">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="mx-auto h-8 w-8 mb-3 opacity-50" />
                  <p>No users found.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={(open) => {
        setIsProfileOpen(open);
        if (!open) setSelectedProfile(null);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[92vh] overflow-y-auto bg-card border-[oklch(0.26_0.046_248/0.6)] shadow-[0_24px_80px_oklch(0.08_0.030_248/0.9)] text-card-foreground">
          {profileLoading ? (
            <div className="flex justify-center items-center py-20">
              <Skeleton className="h-12 w-12 rounded-full bg-muted" />
            </div>
          ) : selectedProfile && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-[oklch(0.26_0.044_248/0.6)] bg-muted">
                    {selectedProfile.avatarUrl ? (
                      <img src={getImageUrl(selectedProfile.avatarUrl)} className="h-full w-full object-cover" alt={selectedProfile.fullName} />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-foreground font-bold text-xl uppercase">
                        {selectedProfile.fullName?.substring(0, 2) || 'US'}
                      </div>
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-light text-foreground tracking-tight">
                      {selectedProfile.fullName}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedProfile.location || 'Cairo, Egypt'}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.30_0.044_248)]" />
                      <span>{selectedProfile.email}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Photos Section */}
              {selectedProfile.usherProfile && (selectedProfile.usherProfile.formalPhotoUrl || selectedProfile.usherProfile.casualPhotoUrl) && (
                <div className="mb-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-semibold">
                    Candidate Photos
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProfile.usherProfile.formalPhotoUrl ? (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-[oklch(0.12_0.034_248)]">
                        <img src={getImageUrl(selectedProfile.usherProfile.formalPhotoUrl)} alt="Formal Photo" className="w-full h-full object-cover" />
                        <div className="absolute bottom-3 left-3 bg-[oklch(0.14_0.042_248/0.8)] backdrop-blur px-2.5 py-0.5 rounded text-[8px] tracking-widest uppercase text-white font-medium">Formal</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border border-dashed border-[oklch(0.24_0.044_248/0.4)] text-muted-foreground"><span className="text-[10px] uppercase tracking-wider">No Formal Photo</span></div>
                    )}
                    {selectedProfile.usherProfile.casualPhotoUrl ? (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-[oklch(0.12_0.034_248)]">
                        <img src={getImageUrl(selectedProfile.usherProfile.casualPhotoUrl)} alt="Casual Photo" className="w-full h-full object-cover" />
                        <div className="absolute bottom-3 left-3 bg-[oklch(0.14_0.042_248/0.8)] backdrop-blur px-2.5 py-0.5 rounded text-[8px] tracking-widest uppercase text-white font-medium">Casual</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border border-dashed border-[oklch(0.24_0.044_248/0.4)] text-muted-foreground"><span className="text-[10px] uppercase tracking-wider">No Casual Photo</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Details */}
              {selectedProfile.usherProfile && (
                <div className="mb-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-semibold">
                    Profile Details
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[oklch(0.12_0.034_248/0.6)] border border-[oklch(0.20_0.044_248/0.4)] rounded-xl p-4">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Age</span>
                      <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">{selectedProfile.usherProfile.age ? `${selectedProfile.usherProfile.age} yrs` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Height</span>
                      <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">{selectedProfile.usherProfile.height || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Appearance</span>
                      <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">{selectedProfile.usherProfile.appearance || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Experience</span>
                      <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">{selectedProfile.usherProfile.yearsOfExperience !== null ? `${selectedProfile.usherProfile.yearsOfExperience} years` : 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Expected Salary</span>
                      <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">{selectedProfile.usherProfile.expectedSalaryPerDay ? `${selectedProfile.usherProfile.expectedSalaryPerDay} EGP/day` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[440px] bg-card border border-[oklch(0.26_0.046_248/0.6)] shadow-[0_24px_80px_oklch(0.08_0.030_248/0.9)] text-card-foreground rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-light text-foreground tracking-tight flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-[oklch(0.55_0.06_24)]" />
              <span>Delete {itemToDelete?.type === 'user' ? 'User Account' : 'Job Posting'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-card-foreground">"{itemToDelete?.title}"</strong>?
              This action is permanent and cannot be undone. All associated data will be removed or hidden.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => {
                setDeleteConfirmOpen(false);
                setItemToDelete(null);
              }}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-[oklch(0.26_0.044_248/0.6)] text-[oklch(0.80_0.010_82)] hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-[oklch(0.55_0.06_24)] text-white hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {actionLoading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
