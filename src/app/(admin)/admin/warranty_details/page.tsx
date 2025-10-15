"use client";

import React, { useState, useMemo } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  ShieldCheck,
  Package,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

// Demo data based on Prisma WarrantyDetails model
const demoWarranties = [
  {
    id: 1,
    productId: 1,
    productName: "Kent Grand Plus RO + UV + UF + TDS Controller Water Purifier",
    details:
      "Comprehensive warranty covering all parts and free service visits. Includes membrane replacement and filter changes.",
    startDate: new Date("2024-10-01"),
    endDate: new Date("2025-10-01"),
    status: "Active",
    daysRemaining: 352,
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-01"),
  },
  {
    id: 2,
    productId: 2,
    productName: "Aquaguard Aura RO + UV + UF + Active Copper Water Purifier",
    details:
      "Standard manufacturer warranty. Covers manufacturing defects and component failures. Service charges apply after 6 months.",
    startDate: new Date("2024-10-03"),
    endDate: new Date("2025-10-03"),
    status: "Active",
    daysRemaining: 354,
    createdAt: new Date("2024-10-03"),
    updatedAt: new Date("2024-10-03"),
  },
  {
    id: 3,
    productId: 3,
    productName: "Livpure Glo Star RO + UV + Mineralizer Water Purifier",
    details:
      "Extended warranty with free AMC for first year. Includes 2 free filter replacements and unlimited service calls.",
    startDate: new Date("2024-09-28"),
    endDate: new Date("2025-09-28"),
    status: "Active",
    daysRemaining: 349,
    createdAt: new Date("2024-09-28"),
    updatedAt: new Date("2024-09-28"),
  },
  {
    id: 4,
    productId: 4,
    productName: "AO Smith Z9 Green RO Hot & Cold Water Purifier",
    details:
      "2-year comprehensive warranty covering all components including hot/cold tank and RO membrane.",
    startDate: new Date("2024-10-05"),
    endDate: new Date("2026-10-05"),
    status: "Active",
    daysRemaining: 721,
    createdAt: new Date("2024-10-05"),
    updatedAt: new Date("2024-10-05"),
  },
  {
    id: 5,
    productId: 5,
    productName: "Blue Star Aristo RO + UV + UF Water Purifier",
    details:
      "Standard 1-year warranty. Free installation and first service. Additional charges for parts replacement.",
    startDate: new Date("2023-10-01"),
    endDate: new Date("2024-10-01"),
    status: "Expired",
    daysRemaining: -13,
    createdAt: new Date("2023-10-01"),
    updatedAt: new Date("2024-10-14"),
  },
  {
    id: 6,
    productId: 6,
    productName: "HUL Pureit Copper+ RO Water Purifier",
    details:
      "Premium warranty covering copper cartridge and all filtration components. Includes annual maintenance.",
    startDate: new Date("2024-09-20"),
    endDate: new Date("2025-09-20"),
    status: "Active",
    daysRemaining: 341,
    createdAt: new Date("2024-09-20"),
    updatedAt: new Date("2024-09-20"),
  },
  {
    id: 7,
    productId: 7,
    productName: "Aquaguard Marvel RO + UV + Active Copper Water Purifier",
    details:
      "Warranty covers electrical and mechanical failures. Free service for first 3 months.",
    startDate: new Date("2024-10-10"),
    endDate: new Date("2025-10-10"),
    status: "Active",
    daysRemaining: 361,
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-10"),
  },
  {
    id: 8,
    productId: 8,
    productName:
      "Kent Supreme Alkaline RO + UV + UF + TDS Controller Water Purifier",
    details:
      "Comprehensive warranty with alkaline cartridge coverage. Includes free installation and demo.",
    startDate: new Date("2024-10-07"),
    endDate: new Date("2025-10-07"),
    status: "Active",
    daysRemaining: 358,
    createdAt: new Date("2024-10-07"),
    updatedAt: new Date("2024-10-07"),
  },
  {
    id: 9,
    productId: 9,
    productName: "AO Smith X2 UV + UF Water Purifier",
    details:
      "Basic warranty covering UV lamp and UF membrane. Service charges apply after warranty period.",
    startDate: new Date("2024-09-15"),
    endDate: new Date("2025-09-15"),
    status: "Active",
    daysRemaining: 336,
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2024-09-15"),
  },
  {
    id: 10,
    productId: 10,
    productName:
      "Blue Star Eleanor RO + UV + UF + Taste Enhancer Water Purifier",
    details:
      "Standard manufacturer warranty. Taste enhancer cartridge covered for 6 months only.",
    startDate: new Date("2024-10-12"),
    endDate: new Date("2025-10-12"),
    status: "Active",
    daysRemaining: 363,
    createdAt: new Date("2024-10-12"),
    updatedAt: new Date("2024-10-12"),
  },
  {
    id: 11,
    productId: 11,
    productName: "Havells Max RO + UV + Mineralizer Water Purifier",
    details:
      "Extended warranty with mineralizer cartridge replacement included. Free service for 1 year.",
    startDate: new Date("2023-09-10"),
    endDate: new Date("2024-09-10"),
    status: "Expired",
    daysRemaining: -34,
    createdAt: new Date("2023-09-10"),
    updatedAt: new Date("2024-10-14"),
  },
  {
    id: 12,
    productId: 12,
    productName: "Aquasure Amaze RO + UV + MTDS Water Purifier",
    details:
      "Standard 1-year warranty covering all components. MTDS controller covered separately for 2 years.",
    startDate: new Date("2024-10-11"),
    endDate: new Date("2025-10-11"),
    status: "Active",
    daysRemaining: 362,
    createdAt: new Date("2024-10-11"),
    updatedAt: new Date("2024-10-11"),
  },
  {
    id: 13,
    productId: 13,
    productName: "Faber Galaxy Plus RO + UV + UF + MAT Water Purifier",
    details:
      "Premium warranty with MAT (Mineral Adjustment Technology) coverage. Includes 4 free service visits.",
    startDate: new Date("2024-10-14"),
    endDate: new Date("2025-10-14"),
    status: "Active",
    daysRemaining: 365,
    createdAt: new Date("2024-10-14"),
    updatedAt: new Date("2024-10-14"),
  },
  {
    id: 14,
    productId: 14,
    productName:
      "Livpure Pep Pro Plus RO + UV + UF + Taste Enhancer Water Purifier",
    details:
      "Comprehensive warranty covering all filtration stages and taste enhancer module.",
    startDate: new Date("2024-09-05"),
    endDate: new Date("2025-09-05"),
    status: "Active",
    daysRemaining: 326,
    createdAt: new Date("2024-09-05"),
    updatedAt: new Date("2024-09-05"),
  },
  {
    id: 15,
    productId: 1,
    productName: "Kent Grand Plus RO + UV + UF + TDS Controller Water Purifier",
    details:
      "Warranty about to expire. Renewal available at discounted rates. Contact service center.",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2025-01-15"),
    status: "Expiring Soon",
    daysRemaining: 93,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-14"),
  },
];

type Warranty = (typeof demoWarranties)[0];

const WarrantyManagementPage = () => {
  const [warranties, setWarranties] = useState<Warranty[]>(demoWarranties);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<keyof Warranty | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(
    null
  );

  // Form states
  const [editForm, setEditForm] = useState({
    productName: "",
    details: "",
    startDate: "",
    endDate: "",
  });

  const [addForm, setAddForm] = useState({
    productName: "",
    details: "",
    startDate: "",
    endDate: "",
  });

  const warrantyStatuses = ["Active", "Expired", "Expiring Soon"];

  // Calculate warranty status and days remaining
  const calculateWarrantyStatus = (
    startDate: Date | null,
    endDate: Date | null
  ) => {
    if (!startDate || !endDate) return { status: "Unknown", daysRemaining: 0 };

    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysRemaining = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) return { status: "Expired", daysRemaining };
    if (daysRemaining <= 90) return { status: "Expiring Soon", daysRemaining };
    return { status: "Active", daysRemaining };
  };

  // Filtering and sorting logic
  const filteredAndSortedWarranties = useMemo(() => {
    let filtered = warranties.filter((warranty) => {
      const matchesSearch =
        warranty.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.details?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || warranty.status === statusFilter;

      return matchesSearch && matchesStatus;
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
  }, [warranties, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(
    filteredAndSortedWarranties.length / itemsPerPage
  );
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
      expiringSoon: warranties.filter((w) => w.status === "Expiring Soon")
        .length,
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

  // CRUD handlers
  const handleView = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setViewDialogOpen(true);
  };

  const handleEdit = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setEditForm({
      productName: warranty.productName,
      details: warranty.details || "",
      startDate: warranty.startDate
        ? new Date(warranty.startDate).toISOString().split("T")[0]
        : "",
      endDate: warranty.endDate
        ? new Date(warranty.endDate).toISOString().split("T")[0]
        : "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWarranty) {
      setWarranties(warranties.filter((w) => w.id !== selectedWarranty.id));
      setDeleteDialogOpen(false);
      setSelectedWarranty(null);
    }
  };

  const saveEdit = () => {
    if (selectedWarranty) {
      const startDate = editForm.startDate
        ? new Date(editForm.startDate)
        : null;
      const endDate = editForm.endDate ? new Date(editForm.endDate) : null;
      const { status, daysRemaining } = calculateWarrantyStatus(
        startDate,
        endDate
      );

      setWarranties(
        warranties.map((w) =>
          w.id === selectedWarranty.id
            ? {
                ...w,
                productName: editForm.productName,
                details: editForm.details || null,
                startDate,
                endDate,
                status,
                daysRemaining,
                updatedAt: new Date(),
              }
            : w
        )
      );
      setEditDialogOpen(false);
      setSelectedWarranty(null);
    }
  };

  const handleAddWarranty = () => {
    const startDate = addForm.startDate ? new Date(addForm.startDate) : null;
    const endDate = addForm.endDate ? new Date(addForm.endDate) : null;
    const { status, daysRemaining } = calculateWarrantyStatus(
      startDate,
      endDate
    );

    const newWarranty: Warranty = {
      id: Math.max(...warranties.map((w) => w.id)) + 1,
      productId: Math.floor(Math.random() * 14) + 1,
      productName: addForm.productName,
      details: addForm.details || null,
      startDate,
      endDate,
      status,
      daysRemaining,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWarranties([newWarranty, ...warranties]);
    setAddDialogOpen(false);
    setAddForm({
      productName: "",
      details: "",
      startDate: "",
      endDate: "",
    });
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

  const getStatusBadge = (status: string, daysRemaining: number) => {
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
      Unknown: {
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
    };

    const variant = variants[status] || variants.Unknown;

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
    <div className="container mx-auto py-10 px-4">
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
          <Button
            className="flex items-center gap-2"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Warranty
          </Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name or warranty details..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
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
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("productName")}
                >
                  <div className="flex items-center">
                    Product
                    {getSortIcon("productName")}
                  </div>
                </TableHead>
                <TableHead>Warranty Details</TableHead>
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
              {currentWarranties.length === 0 ? (
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
                          <div className="font-medium text-sm line-clamp-2">
                            {warranty.productName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Product ID: {warranty.productId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-md">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {warranty.details || "No details provided"}
                        </span>
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
                      {getStatusBadge(warranty.status, warranty.daysRemaining)}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(warranty)}
                          title="Edit warranty"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(warranty)}
                          title="Delete warranty"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredAndSortedWarranties.length)} of{" "}
            {filteredAndSortedWarranties.length} warranties
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Warranty Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Warranty</DialogTitle>
            <DialogDescription>
              Create a new warranty record for a product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-product">Product Name *</Label>
              <Input
                id="add-product"
                value={addForm.productName}
                onChange={(e) =>
                  setAddForm({ ...addForm, productName: e.target.value })
                }
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-details">Warranty Details</Label>
              <Textarea
                id="add-details"
                value={addForm.details}
                onChange={(e) =>
                  setAddForm({ ...addForm, details: e.target.value })
                }
                placeholder="Enter warranty coverage details, terms, and conditions..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-start-date">Start Date *</Label>
                <Input
                  id="add-start-date"
                  type="date"
                  value={addForm.startDate}
                  onChange={(e) =>
                    setAddForm({ ...addForm, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-end-date">End Date *</Label>
                <Input
                  id="add-end-date"
                  type="date"
                  value={addForm.endDate}
                  onChange={(e) =>
                    setAddForm({ ...addForm, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddWarranty}
              disabled={
                !addForm.productName || !addForm.startDate || !addForm.endDate
              }
            >
              Add Warranty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Warranty Details</DialogTitle>
            <DialogDescription>
              Complete information about the warranty
            </DialogDescription>
          </DialogHeader>
          {selectedWarranty && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-medium">Warranty ID</span>
                  </div>
                  <p className="text-lg font-semibold">
                    #{selectedWarranty.id}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Product ID</span>
                  </div>
                  <p className="text-sm">{selectedWarranty.productId}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Product Name</span>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedWarranty.productName.length > 15
                      ? `${selectedWarranty.productName.slice(0, 2)}...`
                      : selectedWarranty.productName}
                  </p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Warranty Details</span>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      {selectedWarranty.details ||
                        "No warranty details provided"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Warranty Start Date</span>
                  </div>
                  <p className="text-sm font-medium">
                    {formatDate(selectedWarranty.startDate)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Warranty End Date</span>
                  </div>
                  <p className="text-sm font-medium">
                    {formatDate(selectedWarranty.endDate)}
                  </p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-medium">Warranty Status</span>
                  </div>
                  <div>
                    {getStatusBadge(
                      selectedWarranty.status,
                      selectedWarranty.daysRemaining
                    )}
                  </div>
                  {selectedWarranty.status === "Active" && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Valid for {selectedWarranty.daysRemaining} more days
                    </p>
                  )}
                  {selectedWarranty.status === "Expiring Soon" && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ Warranty expiring in {selectedWarranty.daysRemaining}{" "}
                      days. Consider renewal.
                    </p>
                  )}
                  {selectedWarranty.status === "Expired" && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      ❌ Warranty expired{" "}
                      {Math.abs(selectedWarranty.daysRemaining)} days ago
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created At</span>
                  </div>
                  <p className="text-sm">
                    {selectedWarranty.createdAt.toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm">
                    {selectedWarranty.updatedAt.toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Warranty</DialogTitle>
            <DialogDescription>
              Update warranty information and dates
            </DialogDescription>
          </DialogHeader>
          {selectedWarranty && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product">Product Name</Label>
                <Input
                  id="edit-product"
                  value={editForm.productName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, productName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-details">Warranty Details</Label>
                <Textarea
                  id="edit-details"
                  value={editForm.details}
                  onChange={(e) =>
                    setEditForm({ ...editForm, details: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date">Start Date</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-date">End Date</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              {editForm.startDate && editForm.endDate && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm font-medium mb-2">Warranty Period:</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.ceil(
                      (new Date(editForm.endDate).getTime() -
                        new Date(editForm.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days (
                    {(
                      Math.ceil(
                        (new Date(editForm.endDate).getTime() -
                          new Date(editForm.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) / 30
                    ).toFixed(1)}{" "}
                    months)
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              warranty record{" "}
              <span className="font-semibold">#{selectedWarranty?.id}</span> for
              product{" "}
              <span className="font-semibold">
                {selectedWarranty?.productName}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Warranty
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WarrantyManagementPage;
