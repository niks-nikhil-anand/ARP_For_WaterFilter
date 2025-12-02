"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  ShieldCheck,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { getAllWarranties } from "@/actions/admin/warranties";
import { toast } from "sonner";

type Warranty = {
  id: number;
  productId: number;
  product: {
    productName: string | null;
    company: string;
    type: string;
  };
  order: {
    customerName: string;
    customerPhone: string | null;
    customerEmail: string | null;
    status: string;
  };
  warrantyType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  isActive: boolean;
  additionalWarranty: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Helper function to truncate text
const truncateText = (text: string, wordLimit: number = 5): string => {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
};

const WarrantyManagementPage = () => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<keyof Warranty | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const [expirationValue, setExpirationValue] = useState<string>("");
  const [expirationUnit, setExpirationUnit] = useState<"days" | "months" | "years">("days");

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  const warrantyStatuses = ["Active", "Expired", "Expiring Soon"];

  useEffect(() => {
    loadWarranties();
  }, []);

  const loadWarranties = async () => {
    setLoading(true);
    const result = await getAllWarranties();
    if (result.success && result.data) {
      const mappedWarranties = result.data.map((w: any) => ({
        ...w,
        status: calculateStatus(w.startDate, w.endDate, w.isActive),
      }));
      setWarranties(mappedWarranties);
    } else {
      toast.error(result.error || "Failed to load warranties");
    }
    setLoading(false);
  };

  const calculateStatus = (startDate: Date, endDate: Date, isActive: boolean) => {
    if (!isActive) return "Inactive";
    const today = new Date();
    const end = new Date(endDate);
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) return "Expired";
    if (daysRemaining <= 90) return "Expiring Soon";
    return "Active";
  };

  const calculateDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Filtering and sorting logic
  const filteredAndSortedWarranties = useMemo(() => {
    const filtered = warranties.filter((warranty) => {
      const matchesSearch =
        warranty.product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || warranty.status === statusFilter;

      let matchesExpiration = true;
      if (expirationValue && !isNaN(Number(expirationValue))) {
        const today = new Date();
        const value = Number(expirationValue);
        let targetDate = new Date();

        if (expirationUnit === "days") {
          targetDate.setDate(today.getDate() + value);
        } else if (expirationUnit === "months") {
          targetDate.setMonth(today.getMonth() + value);
        } else if (expirationUnit === "years") {
          targetDate.setFullYear(today.getFullYear() + value);
        }

        const endDate = new Date(warranty.endDate);
        // Check if warranty expires between now and target date
        // Also ensure it hasn't already expired if we're looking for "about to expire"
        matchesExpiration = endDate >= today && endDate <= targetDate;
      }

      return matchesSearch && matchesStatus && matchesExpiration;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [warranties, searchTerm, statusFilter, sortField, sortOrder, expirationValue, expirationUnit]);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWarranties = filteredAndSortedWarranties.slice(
    startIndex,
    endIndex
  );

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: warranties.length,
      active: warranties.filter((w) => w.status === "Active").length,
      expiringSoon: warranties.filter((w) => w.status === "Expiring Soon").length,
      expired: warranties.filter((w) => w.status === "Expired").length,
    };
  }, [warranties]);

  // Sort handler
  const handleSort = (field: keyof Warranty) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleView = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setViewDialogOpen(true);
  };

  const getSortIcon = (field: keyof Warranty) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    );
  };

  const getStatusBadge = (status: string, endDate: Date) => {
    const daysRemaining = calculateDaysRemaining(endDate);

    const variants: Record<
      string,
      { className: string; icon: React.ReactNode }
    > = {
      Active: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      "Expiring Soon": {
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      Expired: {
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
      Inactive: {
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
    };

    const variant = variants[status] || variants.Inactive;

    return (
      <Badge className={variant.className}>
        <span className="flex items-center">
          {variant.icon}
          {status}
          {status === "Active" && daysRemaining > 0 && (
            <span className="ml-1">({daysRemaining}d)</span>
          )}
          {status === "Expiring Soon" && (
            <span className="ml-1">({daysRemaining}d)</span>
          )}
        </span>
      </Badge>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-[90vh] max-h-[92vh] overflow-y-auto">
      <div className="container mx-auto py-10 px-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Warranty Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Track and manage product warranties and expiration dates
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Total Warranties</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="border rounded-lg p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats.active}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Expiring Soon</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats.expiringSoon}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Expired</span>
              </div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                {stats.expired}
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="relative sm:col-span-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product or customer name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {warrantyStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiration Filter */}
            <div className="sm:col-span-5 flex gap-2 items-center">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Expires in:</span>
              <Input
                type="number"
                placeholder="Value"
                value={expirationValue}
                onChange={(e) => {
                  setExpirationValue(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-24"
                min="0"
              />
              <Select
                value={expirationUnit}
                onValueChange={(value: "days" | "months" | "years") => {
                  setExpirationUnit(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
              {expirationValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setExpirationValue("");
                    setCurrentPage(1);
                  }}
                  title="Clear expiration filter"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("id")}
                    </div>
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("startDate")}
                  >
                    <div className="flex items-center">
                      Start Date
                      {getSortIcon("startDate")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("endDate")}
                  >
                    <div className="flex items-center">
                      End Date
                      {getSortIcon("endDate")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-center"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Loading warranties...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentWarranties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldCheck className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No warranties found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentWarranties.map((warranty) => (
                    <TableRow key={warranty.id}>
                      <TableCell className="font-medium">
                        #{warranty.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2 max-w-xs">
                          <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm" title={warranty.product.productName || ''}>
                              {truncateText(warranty.product.productName || 'Unknown Product', 6)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {warranty.product.company}
                            </div>
                            <div className="mt-1">
                              {new Date(warranty.endDate) > new Date() ? (
                                <Badge variant="outline" className="w-fit bg-green-50 text-green-700 border-green-200 text-[10px] px-1 py-0 h-5">
                                  Warranty Available
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="w-fit bg-red-50 text-red-700 border-red-200 text-[10px] px-1 py-0 h-5">
                                  Warranty Expired
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{warranty.order.customerName}</span>
                          <span className="text-xs text-muted-foreground">{warranty.order.customerPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(warranty.startDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(warranty.endDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(warranty.status, warranty.endDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(warranty)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Warranty Details</DialogTitle>
            <DialogDescription>
              Complete information about the warranty coverage
            </DialogDescription>
          </DialogHeader>
          {selectedWarranty && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="mt-1">
                    {getStatusBadge(selectedWarranty.status, selectedWarranty.endDate)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                  <p className="font-medium mt-1">{selectedWarranty.warrantyType}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Product Information</h4>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="font-medium">{selectedWarranty.product.productName}</p>
                  <p className="text-sm text-muted-foreground">{selectedWarranty.product.company} • {selectedWarranty.product.type}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Customer Information</h4>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="font-medium">{selectedWarranty.order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedWarranty.order.customerPhone}</p>
                  <p className="text-sm text-muted-foreground">{selectedWarranty.order.customerEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                  <p className="font-medium mt-1">{formatDate(selectedWarranty.startDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                  <p className="font-medium mt-1">{formatDate(selectedWarranty.endDate)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarrantyManagementPage;
