'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown, Plus, Search, Loader2 } from 'lucide-react';
import { customerService } from '@/services/customerService';
import type { CustomerListDto, CreateCustomerDto } from '@/types/customer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CustomerSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export default function CustomerSelector({
  value,
  onValueChange,
  disabled = false,
}: CustomerSelectorProps) {
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Quick create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Load customers
  useEffect(() => {
    if (open) {
      loadCustomers();
    }
  }, [open]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const result = await customerService.getCustomers({
        page: 1,
        pageSize: 100,
        searchTerm: searchTerm || undefined,
      });
      setCustomers(result.items);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (open && searchTerm) {
      const timer = setTimeout(() => {
        loadCustomers();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const handleCreateCustomer = async () => {
    if (!newCustomerName || !newCustomerEmail) {
      toast({
        title: tCommon('messages.error'),
        description: 'Name and email are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);

      const customerData: CreateCustomerDto = {
        fullName: newCustomerName,
        email: newCustomerEmail,
        phoneNumber: newCustomerPhone || undefined,
        customerType: 'Individual',
        preferredContactMethod: 'Email',
      };

      const result = await customerService.createCustomer(customerData);

      toast({
        title: tCommon('messages.success'),
        description: t('toasts.createSuccess'),
      });

      // Reload customers and select the new one
      await loadCustomers();
      onValueChange(result.id);

      // Reset form and close dialog
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewCustomerPhone('');
      setCreateDialogOpen(false);
      setOpen(false);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || t('toasts.createError'),
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedCustomer ? (
              <span className="truncate">
                {selectedCustomer.fullName} ({selectedCustomer.email})
              </span>
            ) : (
              <span className="text-muted-foreground">Search or create customer...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : customers.length === 0 ? (
                <CommandEmpty>
                  <div className="py-6 text-center text-sm">
                    <p className="mb-2">No customers found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCreateDialogOpen(true);
                        if (searchTerm) {
                          setNewCustomerEmail(searchTerm.includes('@') ? searchTerm : '');
                        }
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Customer
                    </Button>
                  </div>
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setCreateDialogOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="font-medium">Create New Customer</span>
                  </CommandItem>
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === customer.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {customer.email}
                          {customer.phoneNumber && ` • ${customer.phoneNumber}`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Quick Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>
              Quickly create a new customer to use for this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                placeholder="John Doe"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="john@example.com"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="+251 91 234 5678"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
