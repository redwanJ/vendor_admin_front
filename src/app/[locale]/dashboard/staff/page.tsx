'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { usersService } from '@/services/usersService';
import { rolesService, type RoleDto } from '@/services/rolesService';
import type { UserListDto, InviteStaffDto } from '@/types/user';
import StaffHeader from '@/components/staff/StaffHeader';
import StaffFilters from '@/components/staff/StaffFilters';
import StaffTable from '@/components/staff/StaffTable';
import InviteStaffDialog from '@/components/staff/InviteStaffDialog';

export default function StaffPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();
  const t = useTranslations('staff');
  const tCommon = useTranslations('common');

  const [users, setUsers] = useState<UserListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roles, setRoles] = useState<RoleDto[]>([]);

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await usersService.getUsers({
        searchTerm: searchTerm || undefined,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        page: currentPage,
        pageSize,
      });

      setUsers(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description:
          error.response?.data?.error || t('toasts.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, selectedStatuses, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Load roles
  const loadRoles = useCallback(async () => {
    try {
      const result = await rolesService.getRoles(true);
      // Filter to show only vendor roles (VendorOwner and VendorStaff)
      const vendorRoles = result.filter(role =>
        role.name === 'VendorOwner' || role.name === 'VendorStaff'
      );
      setRoles(vendorRoles);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || 'Failed to load roles',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Invite staff handler
  const handleInviteStaff = async (data: InviteStaffDto) => {
    try {
      await usersService.inviteStaff(data);
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.inviteSuccess'),
      });
      loadUsers(); // Reload the list
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || t('toasts.inviteError'),
        variant: 'destructive',
      });
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  // Filter handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((values: string[]) => {
    setSelectedStatuses(values);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  // Status options
  const statusOptions = [
    { label: t('status.Active'), value: 'Active' },
    { label: t('status.Inactive'), value: 'Inactive' },
    { label: t('status.Pending'), value: 'Pending' },
    { label: t('status.Suspended'), value: 'Suspended' },
  ];

  // Show skeleton on initial load
  if (loading && users.length === 0 && totalCount === 0) {
    return (
      <div className="space-y-6">
        <StaffHeader onInvite={() => setInviteDialogOpen(true)} />
        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StaffHeader onInvite={() => setInviteDialogOpen(true)} />

      <StaffFilters
        searchTerm={searchTerm}
        selectedStatuses={selectedStatuses}
        statusOptions={statusOptions}
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onClearAll={handleClearFilters}
      />

      <StaffTable
        data={users}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={(user) => router.push(`/${locale}/dashboard/staff/${user.id}`)}
        onEdit={(user) => router.push(`/${locale}/dashboard/staff/${user.id}/edit`)}
      />

      <InviteStaffDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSubmit={handleInviteStaff}
        roles={roles}
      />
    </div>
  );
}
