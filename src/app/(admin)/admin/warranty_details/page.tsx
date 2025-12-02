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
import { Label } from "@/components/ui/label";
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
  FileText,
  Pencil,
} from "lucide-react";
import { getAllWarranties, updateWarranty } from "@/actions/admin/warranties";
import { toast } from "sonner";
import jsPDF from "jspdf";

type Warranty = {
  id: number;
  productId: number;
  product: {
    productName: string | null;
    company: string;
    type: string;
    description: string | null;
    color: string | null;
    price: any; // Decimal
    featuredImageUrl: string | null;
  };
  order: {
    customerName: string;
    customerPhone: string | null;
    customerEmail: string | null;
    customerAltPhone: string | null;
    apartmentNo: string | null;
    locality: string | null;
    landmark: string | null;
    pincode: string | null;
    state: string | null;
    country: string | null;
    status: string;
  };
  warrantyType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  isActive: boolean;
  additionalWarranty: boolean;
  warrantyAmount: number | null;
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<{
    warrantyType: string;
    startDate: string;
    endDate: string;
    status: string;
    warrantyAmount: string;
  }>({
    warrantyType: '',
    startDate: '',
    endDate: '',
    status: '',
    warrantyAmount: ''
  });

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

  const handleEdit = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setEditForm({
      warrantyType: warranty.warrantyType,
      startDate: new Date(warranty.startDate).toISOString().split('T')[0],
      endDate: new Date(warranty.endDate).toISOString().split('T')[0],
      status: warranty.status,
      warrantyAmount: warranty.warrantyAmount ? warranty.warrantyAmount.toString() : ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedWarranty) return;

    // Validate End Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedEndDate = new Date(editForm.endDate);

    if (selectedEndDate < today) {
      toast.error("End Date cannot be in the past");
      return;
    }

    try {
      setIsUpdating(true);
      const result = await updateWarranty(selectedWarranty.id, {
        warrantyType: editForm.warrantyType,
        startDate: new Date(editForm.startDate),
        endDate: new Date(editForm.endDate),
        status: editForm.status,
        warrantyAmount: (editForm.warrantyType === 'EXTENDED' || editForm.warrantyType === 'paid') && editForm.warrantyAmount
          ? Number(editForm.warrantyAmount)
          : null
      });

      if (result.success) {
        toast.success('Warranty updated successfully');
        setEditDialogOpen(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to update warranty');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('An error occurred while updating');
    } finally {
      setIsUpdating(false);
    }
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

  const generateReceipt = (warranty: Warranty) => {
    try {
      const doc = new jsPDF();
      const themeColor = [41, 128, 185]; // Blue
      const secondaryColor = [100, 100, 100];

      // Helper to format currency
      const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN')}`;

      // --- Background Watermark ---
      doc.setTextColor(245, 245, 245);
      doc.setFontSize(60);
      doc.setFont('helvetica', 'bold');
      doc.text('SAMARTH', 105, 150, { align: 'center', angle: 45 });

      // --- Header Section ---
      // Top Bar
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.rect(0, 0, 210, 6, 'F');

      // Logo Placeholder (Left)
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.roundedRect(15, 15, 20, 20, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SE', 25, 28, { align: 'center' });

      // Company Name (Left)
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Samarth Enterprise', 40, 22);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('WaterFilter Management System', 40, 28);
      doc.text('GSTIN: 27ABCDE1234F1Z5', 40, 33); // Mock GSTIN

      // Receipt Title (Right)
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('WARRANTY RECEIPT', 195, 25, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`# WAR-${warranty.id.toString().padStart(6, '0')}`, 195, 33, { align: 'right' });

      // --- Info Grid ---
      const gridY = 45;

      // Left Column: Company Address
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Issued By:', 15, gridY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text('123, Enterprise Hub, Business District', 15, gridY + 5);
      doc.text('Mumbai, Maharashtra - 400001', 15, gridY + 10);
      doc.text('Phone: +91 98765 43210', 15, gridY + 15);
      doc.text('Email: contact@samarth-enterprise.com', 15, gridY + 20);

      // Right Column: Issued To
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Issued To:', 110, gridY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(warranty.order.customerName, 110, gridY + 5);
      if (warranty.order.customerEmail) doc.text(warranty.order.customerEmail, 110, gridY + 10);
      if (warranty.order.customerPhone) doc.text(warranty.order.customerPhone, 110, gridY + 15);

      // Address
      const address = [
        warranty.order.apartmentNo,
        warranty.order.locality,
        warranty.order.landmark,
        warranty.order.state,
        warranty.order.pincode
      ].filter(Boolean).join(', ');

      if (address) {
        const splitAddress = doc.splitTextToSize(address, 80);
        doc.text(splitAddress, 110, gridY + 20);
      }

      // --- Warranty Details Bar ---
      const payY = 85;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, payY, 180, 15, 2, 2, 'F');

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      // Status
      doc.setFont('helvetica', 'bold');
      doc.text('Status:', 25, payY + 9);
      doc.setFont('helvetica', 'normal');
      const statusColor = warranty.status === 'Active' ? [39, 174, 96] : [192, 57, 43];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(warranty.status, 40, payY + 9);

      // Type
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Type:', 80, payY + 9);
      doc.setFont('helvetica', 'normal');
      doc.text(warranty.warrantyType, 95, payY + 9);

      // Duration
      doc.setFont('helvetica', 'bold');
      doc.text('Period:', 140, payY + 9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formatDate(warranty.startDate)} - ${formatDate(warranty.endDate)}`, 155, payY + 9);

      // --- Product Details ---
      let yPos = 115;

      // Headers
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.rect(15, yPos, 180, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Product Details', 20, yPos + 6);

      // Row 1
      yPos += 10;
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPos, 180, 45, 'F'); // Increased height for more rows

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Product Name:', 20, yPos + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(warranty.product.productName || 'N/A', 50, yPos + 6);

      doc.setFont('helvetica', 'bold');
      doc.text('Company:', 110, yPos + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(warranty.product.company, 130, yPos + 6);

      doc.setFont('helvetica', 'bold');
      doc.text('Type:', 20, yPos + 14);
      doc.setFont('helvetica', 'normal');
      doc.text(warranty.product.type, 50, yPos + 14);

      doc.setFont('helvetica', 'bold');
      doc.text('Color:', 20, yPos + 22); // Moved to new line
      doc.setFont('helvetica', 'normal');
      doc.text(warranty.product.color || 'N/A', 50, yPos + 22);

      if (warranty.product.description) {
        doc.setFont('helvetica', 'bold');
        doc.text('Description:', 20, yPos + 30); // Moved down
        doc.setFont('helvetica', 'normal');
        doc.text(truncateText(warranty.product.description, 60), 50, yPos + 30); // Increased truncate limit
      }

      // --- Footer Section ---
      const pageHeight = doc.internal.pageSize.height;

      // Terms
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms & Conditions:', 15, pageHeight - 50);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('1. This receipt serves as proof of warranty coverage.', 15, pageHeight - 45);
      doc.text('2. Warranty covers manufacturing defects only.', 15, pageHeight - 41);
      doc.text('3. Physical damage is not covered under warranty.', 15, pageHeight - 37);

      // Authorized Signatory - REMOVED
      // doc.setTextColor(0, 0, 0);
      // doc.text('For Samarth Enterprise', 150, pageHeight - 50);
      // doc.setDrawColor(0, 0, 0);
      // doc.line(150, pageHeight - 35, 190, pageHeight - 35);
      // doc.text('Authorized Signatory', 150, pageHeight - 30);

      // Bottom Bar
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.rect(0, pageHeight - 10, 210, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Thank you for choosing Samarth Enterprise!', 105, pageHeight - 4, { align: 'center' });

      // Save
      const fileName = `Warranty_Receipt_${warranty.id}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
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
                  <TableHead>Type</TableHead>
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
                        <div className="flex flex-col">
                          <Badge variant="outline" className="w-fit">
                            {warranty.warrantyType}
                          </Badge>
                          {(warranty.warrantyType === 'EXTENDED' || warranty.warrantyType === 'paid') && warranty.warrantyAmount && (
                            <span className="text-xs text-muted-foreground mt-1">
                              ₹{Number(warranty.warrantyAmount).toLocaleString()}
                            </span>
                          )}
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
                            onClick={() => handleEdit(warranty)}
                            title="Edit Warranty"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateReceipt(warranty)}
                            title="Download Receipt"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
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
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Warranty Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="warrantyType" className="text-right">
                Type
              </Label>
              <Select
                value={editForm.warrantyType}
                onValueChange={(value) => setEditForm({ ...editForm, warrantyType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="EXTENDED">EXTENDED</SelectItem>
                  <SelectItem value="paid">PAID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(editForm.warrantyType === 'EXTENDED' || editForm.warrantyType === 'paid') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="warrantyAmount" className="text-right">
                  Amount Paid
                </Label>
                <Input
                  id="warrantyAmount"
                  type="number"
                  className="col-span-3"
                  value={editForm.warrantyAmount}
                  onChange={(e) => setEditForm({ ...editForm, warrantyAmount: e.target.value })}
                  placeholder="Enter amount"
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
                value={editForm.startDate}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                className="col-span-3"
                value={editForm.endDate}
                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Warranty Details</DialogTitle>
            <DialogDescription>
              Complete information about the warranty coverage
            </DialogDescription>
          </DialogHeader>
          {selectedWarranty && <div className="space-y-4">
            {/* Status & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <div className="mt-1">
                  {getStatusBadge(selectedWarranty.status, selectedWarranty.endDate)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Warranty Type</h4>
                <p className="font-medium mt-1">
                  {selectedWarranty.warrantyType}
                  {(selectedWarranty.warrantyType === 'EXTENDED' || selectedWarranty.warrantyType === 'paid') && selectedWarranty.warrantyAmount && (
                    <span className="ml-2 text-muted-foreground">
                      (₹{Number(selectedWarranty.warrantyAmount).toLocaleString()})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md border">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDate(selectedWarranty.startDate)}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDate(selectedWarranty.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product Information
              </h4>
              <div className="bg-muted/50 p-3 rounded-md space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedWarranty.product.productName || 'Unknown Product'}</p>
                    <p className="text-sm text-muted-foreground">{selectedWarranty.product.company} • {selectedWarranty.product.type}</p>
                  </div>
                  {selectedWarranty.product.price && (
                    <Badge variant="secondary">₹{Number(selectedWarranty.product.price).toLocaleString()}</Badge>
                  )}
                </div>

                {selectedWarranty.product.color && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Color: </span>
                    {selectedWarranty.product.color}
                  </div>
                )}

                {selectedWarranty.product.description && (
                  <div className="text-sm border-t pt-2 mt-2">
                    <span className="text-muted-foreground block mb-1">Description:</span>
                    <p className="text-muted-foreground/80 line-clamp-2">{selectedWarranty.product.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Customer Details
              </h4>
              <div className="bg-muted/50 p-3 rounded-md space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Name</span>
                    <span className="text-sm font-medium">{selectedWarranty.order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    <span className="text-sm">{selectedWarranty.order.customerPhone}</span>
                  </div>
                  {selectedWarranty.order.customerEmail && (
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground block">Email</span>
                      <span className="text-sm">{selectedWarranty.order.customerEmail}</span>
                    </div>
                  )}
                  {selectedWarranty.order.customerAltPhone && (
                    <div>
                      <span className="text-xs text-muted-foreground block">Alt Phone</span>
                      <span className="text-sm">{selectedWarranty.order.customerAltPhone}</span>
                    </div>
                  )}
                </div>

                {/* Address Section */}
                {(selectedWarranty.order.apartmentNo || selectedWarranty.order.locality || selectedWarranty.order.pincode) && (
                  <div className="border-t pt-2 mt-2">
                    <span className="text-xs text-muted-foreground block mb-1">Address</span>
                    <p className="text-sm text-muted-foreground/90">
                      {[
                        selectedWarranty.order.apartmentNo,
                        selectedWarranty.order.landmark,
                        selectedWarranty.order.locality,
                        selectedWarranty.order.state,
                        selectedWarranty.order.country,
                        selectedWarranty.order.pincode ? `Pin: ${selectedWarranty.order.pincode}` : null
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          }
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedWarranty && (
              <Button
                variant="outline"
                onClick={() => generateReceipt(selectedWarranty)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Download Receipt
              </Button>
            )}
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarrantyManagementPage;
