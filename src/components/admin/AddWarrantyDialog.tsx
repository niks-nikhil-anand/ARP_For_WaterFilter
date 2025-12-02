"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAllUsers } from "@/actions/admin/users";
import { getAdminProducts } from "@/actions/admin/products";
import { createWarranty } from "@/actions/admin/warranties";
import { createCustomerUser } from "@/actions/common/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, Package, Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";

export function AddWarrantyDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data states
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [localUsers, setLocalUsers] = useState<any[]>([]);

    // Customer Creation State
    const [showCreateCustomer, setShowCreateCustomer] = useState(false);
    const [creatingCustomer, setCreatingCustomer] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        password: ''
    });

    // Form states
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [openUserSelect, setOpenUserSelect] = useState(false);
    const [openProductSelect, setOpenProductSelect] = useState(false);

    const [warrantyType, setWarrantyType] = useState<string>("FREE");
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<string>("Active");
    const [amount, setAmount] = useState<string>("");

    const [duration, setDuration] = useState<string>("1");
    const [durationUnit, setDurationUnit] = useState<"months" | "years">("years");

    useEffect(() => {
        if (open) {
            fetchData();
            resetForm();
        }
    }, [open]);

    useEffect(() => {
        calculateEndDate();
    }, [startDate, duration, durationUnit]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, productsRes] = await Promise.all([
                getAllUsers(),
                getAdminProducts()
            ]);

            if (usersRes.success) {
                setUsers(usersRes.data || []);
                setLocalUsers(usersRes.data || []);
            }
            if (productsRes.success) setProducts(productsRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load customers or products");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedUser(null);
        setSelectedProduct(null);
        setWarrantyType("FREE");
        setStartDate(new Date());
        setEndDate(undefined);
        setStatus("Active");
        setAmount("");
        setDuration("1");
        setDurationUnit("years");
        setShowCreateCustomer(false);
        setNewCustomerData({ name: '', email: '', mobile: '', address: '', password: '' });
    };

    const calculateEndDate = () => {
        if (!startDate || !duration) {
            setEndDate(undefined);
            return;
        }

        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum <= 0) {
            setEndDate(undefined);
            return;
        }

        const newEndDate = new Date(startDate);
        if (durationUnit === "years") {
            newEndDate.setFullYear(newEndDate.getFullYear() + durationNum);
        } else {
            newEndDate.setMonth(newEndDate.getMonth() + durationNum);
        }
        // Subtract one day to make it accurate (e.g., Jan 1 to Dec 31)
        newEndDate.setDate(newEndDate.getDate() - 1);
        setEndDate(newEndDate);
    };

    const handleCreateCustomer = async () => {
        if (!newCustomerData.name || !newCustomerData.mobile || !newCustomerData.email) {
            toast.error('Please fill in all required customer fields');
            return;
        }

        setCreatingCustomer(true);
        try {
            const result = await createCustomerUser(newCustomerData);
            if (result.success && result.data) {
                toast.success('Customer created successfully');
                // Update local list
                const newCustomer = {
                    id: result.data.id,
                    name: result.data.name,
                    email: result.data.email,
                    mobile: result.data.mobile
                };
                setLocalUsers(prev => [newCustomer, ...prev]);
                // Auto select
                setSelectedUser(result.data.id);
                setShowCreateCustomer(false);
                setNewCustomerData({ name: '', email: '', mobile: '', address: '', password: '' });
            } else {
                toast.error(result.error || 'Failed to create customer');
            }
        } catch (error) {
            toast.error('Failed to create customer');
        } finally {
            setCreatingCustomer(false);
        }
    };


    const handleSubmit = async () => {
        if (!selectedUser || !selectedProduct || !startDate || !endDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        if ((warrantyType === "EXTENDED" || warrantyType === "PAID") && !amount) {
            toast.error("Please enter the warranty amount");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createWarranty({
                customerId: selectedUser,
                productId: selectedProduct,
                warrantyType,
                startDate,
                endDate,
                status,
                warrantyAmount: amount ? Number(amount) : null,
            });

            if (result.success) {
                toast.success("Warranty added successfully");
                setOpen(false);
                window.location.reload(); // Refresh to show new warranty
            } else {
                toast.error(result.error || "Failed to add warranty");
            }
        } catch (error) {
            console.error("Error creating warranty:", error);
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Warranty
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Warranty</DialogTitle>
                    <DialogDescription>
                        Create a new warranty for a customer.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                        {/* Left Column: Customer & Product */}
                        <div className="space-y-6">
                            {/* Customer Card */}
                            <Card className={`shadow-sm transition-colors ${selectedUser
                                ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10'
                                : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                                }`}>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${selectedUser
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                <User className="h-5 w-5" />
                                            </div>
                                            Customer Details
                                        </div>
                                        {!showCreateCustomer && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-xs"
                                                onClick={() => setShowCreateCustomer(true)}
                                            >
                                                <Plus className="mr-2 h-3 w-3" />
                                                New Customer
                                            </Button>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!showCreateCustomer ? (
                                        <div className="space-y-2">
                                            <Label>Customer</Label>
                                            <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openUserSelect}
                                                        className="w-full justify-between"
                                                    >
                                                        {selectedUser
                                                            ? localUsers.find((u) => u.id === selectedUser)?.name
                                                            : "Select customer..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search customer..." />
                                                        <CommandList>
                                                            <CommandEmpty>No customer found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {localUsers.map((user) => (
                                                                    <CommandItem
                                                                        key={user.id}
                                                                        value={user.name + " " + user.mobile}
                                                                        onSelect={() => {
                                                                            setSelectedUser(user.id);
                                                                            setOpenUserSelect(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                selectedUser === user.id ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span>{user.name}</span>
                                                                            <span className="text-xs text-muted-foreground">{user.mobile}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {selectedUser && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3" />
                                                        {localUsers.find(u => u.id === selectedUser)?.email}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">New Customer Details</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => setShowCreateCustomer(false)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label htmlFor="newCustName" className="text-xs">Name *</Label>
                                                    <Input
                                                        id="newCustName"
                                                        value={newCustomerData.name}
                                                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="Name"
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="newCustMobile" className="text-xs">Mobile *</Label>
                                                    <Input
                                                        id="newCustMobile"
                                                        value={newCustomerData.mobile}
                                                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, mobile: e.target.value }))}
                                                        placeholder="Mobile"
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="newCustEmail" className="text-xs">Email *</Label>
                                                    <Input
                                                        id="newCustEmail"
                                                        value={newCustomerData.email}
                                                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                                                        placeholder="Email"
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="newCustPass" className="text-xs">Password</Label>
                                                    <Input
                                                        id="newCustPass"
                                                        type="password"
                                                        value={newCustomerData.password}
                                                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, password: e.target.value }))}
                                                        placeholder="Default: 123456"
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <Label htmlFor="newCustAddr" className="text-xs">Address</Label>
                                                    <Input
                                                        id="newCustAddr"
                                                        value={newCustomerData.address}
                                                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                                                        placeholder="Address (Optional)"
                                                        className="h-8"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleCreateCustomer}
                                                disabled={creatingCustomer}
                                                className="w-full h-8 mt-2"
                                                size="sm"
                                            >
                                                {creatingCustomer ? (
                                                    <div className="flex items-center">
                                                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                                        Creating...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Plus className="mr-2 h-3 w-3" />
                                                        Create & Auto-fill
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Product Card */}
                            <Card className={`shadow-sm transition-colors ${selectedProduct
                                ? 'border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-900/10'
                                : 'border-purple-100 dark:border-purple-900'
                                }`}>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                            <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        Product Selection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label>Product</Label>
                                        <Popover open={openProductSelect} onOpenChange={setOpenProductSelect}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openProductSelect}
                                                    className="w-full justify-between"
                                                >
                                                    {selectedProduct
                                                        ? products.find((p) => p.id === selectedProduct)?.productName
                                                        : "Select product..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search product..." />
                                                    <CommandList>
                                                        <CommandEmpty>No product found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {products.map((product) => (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.productName || product.company}
                                                                    onSelect={() => {
                                                                        setSelectedProduct(product.id);
                                                                        setOpenProductSelect(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedProduct === product.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span>{product.productName}</span>
                                                                        <span className="text-xs text-muted-foreground">{product.company} - {product.type}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Warranty Details */}
                        <div className="space-y-6">
                            <Card className="shadow-sm border-orange-100 dark:border-orange-900">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                            <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        Warranty Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Warranty Type</Label>
                                            <Select value={warrantyType} onValueChange={setWarrantyType}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FREE">Free</SelectItem>
                                                    <SelectItem value="PAID">Paid</SelectItem>
                                                    <SelectItem value="EXTENDED">Extended</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={status} onValueChange={setStatus}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 flex flex-col">
                                            <Label>Start Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !startDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={setStartDate}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        formatters={{
                                                            formatWeekdayName: (date) => format(date, "EEEEE"),
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Duration</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    className="w-20"
                                                />
                                                <Select
                                                    value={durationUnit}
                                                    onValueChange={(v: "months" | "years") => setDurationUnit(v)}
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="months">Months</SelectItem>
                                                        <SelectItem value="years">Years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>End Date (Auto-calculated)</Label>
                                        <Input
                                            value={endDate ? format(endDate, "PPP") : "Select start date and duration"}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>

                                    {(warrantyType === "PAID" || warrantyType === "EXTENDED") && (
                                        <div className="space-y-2">
                                            <Label>Amount Paid</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Warranty
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
