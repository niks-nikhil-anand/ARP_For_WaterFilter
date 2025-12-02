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
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { getAllUsers } from "@/actions/admin/users";
import { getAdminProducts } from "@/actions/admin/products";
import { createWarranty } from "@/actions/admin/warranties";

export function AddWarrantyDialog() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data states
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

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

            if (usersRes.success) setUsers(usersRes.data || []);
            if (productsRes.success) setProducts(productsRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load customers or products");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setSelectedUser(null);
        setSelectedProduct(null);
        setWarrantyType("FREE");
        setStartDate(new Date());
        setEndDate(undefined);
        setStatus("Active");
        setAmount("");
        setDuration("1");
        setDurationUnit("years");
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

    const handleNext = () => {
        if (!selectedUser || !selectedProduct) {
            toast.error("Please select both a customer and a product");
            return;
        }
        setStep(2);
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Warranty</DialogTitle>
                    <DialogDescription>
                        Step {step} of 2: {step === 1 ? "Select Customer & Product" : "Warranty Details"}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="py-4 space-y-4">
                        {step === 1 ? (
                            <>
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
                                                    ? users.find((u) => u.id === selectedUser)?.name
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
                                                        {users.map((user) => (
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
                                </div>

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
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {step === 2 && (
                        <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
                            Back
                        </Button>
                    )}
                    {step === 1 ? (
                        <Button onClick={handleNext} disabled={loading}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Warranty
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
