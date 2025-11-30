'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Clock, IndianRupee, Wrench, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { resolveTicket } from '@/actions/agent/tickets'

interface ResolveTicketDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    ticket: any
    onResolve: (ticketId: any, resolveData: any) => void
}

export function ResolveTicketDialog({ open, onOpenChange, ticket, onResolve }: ResolveTicketDialogProps) {
    const [resolving, setResolving] = useState(false)
    const [resolveData, setResolveData] = useState({
        timeSpent: '',
        amountCollected: '',
        partsReplaced: '',
        workDescription: '',
        resolutionNotes: ''
    })

    useEffect(() => {
        if (open) {
            setResolveData({
                timeSpent: '',
                amountCollected: '',
                partsReplaced: '',
                workDescription: '',
                resolutionNotes: ''
            })
        }
    }, [open])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setResolveData({
            ...resolveData,
            [e.target.name]: e.target.value
        })
    }

    const handleResolveSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setResolving(true)

        try {
            // Extract numeric ID if it's a string like "TKT-123"
            const ticketIdStr = ticket.id.toString()
            const numericId = ticketIdStr.startsWith('TKT-')
                ? parseInt(ticketIdStr.replace('TKT-', ''))
                : parseInt(ticketIdStr)

            const result = await resolveTicket({
                ticketId: numericId,
                timeSpent: parseFloat(resolveData.timeSpent),
                amountCollected: parseFloat(resolveData.amountCollected),
                partsReplaced: resolveData.partsReplaced,
                workDescription: resolveData.workDescription,
                resolutionNotes: resolveData.resolutionNotes
            })

            if (result.success) {
                onResolve(ticket.id, resolveData)
                onOpenChange(false)
                toast.success(`Ticket ${ticket.id} has been successfully resolved!`)
            } else {
                toast.error(result.error || 'Failed to resolve ticket')
            }
        } catch (error) {
            console.error('Resolution error:', error)
            toast.error('An unexpected error occurred')
        } finally {
            setResolving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="dark:bg-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        Resolve Ticket
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        {ticket && `Ticket #${ticket.id} - ${ticket.customerName}`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleResolveSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Time Spent */}
                        <div>
                            <Label htmlFor="timeSpent" className="dark:text-white flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time Spent (hours) *
                            </Label>
                            <Input
                                id="timeSpent"
                                name="timeSpent"
                                type="number"
                                step="0.5"
                                required
                                value={resolveData.timeSpent}
                                onChange={handleInputChange}
                                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="e.g., 2.5"
                            />
                        </div>

                        {/* Amount Collected */}
                        <div>
                            <Label htmlFor="amountCollected" className="dark:text-white flex items-center gap-2">
                                <IndianRupee className="h-4 w-4" />
                                Amount Collected (₹) *
                            </Label>
                            <Input
                                id="amountCollected"
                                name="amountCollected"
                                type="number"
                                required
                                value={resolveData.amountCollected}
                                onChange={handleInputChange}
                                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="e.g., 1500"
                            />
                        </div>
                    </div>

                    {/* Parts Replaced */}
                    <div>
                        <Label htmlFor="partsReplaced" className="dark:text-white flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Parts Replaced/Used *
                        </Label>
                        <Input
                            id="partsReplaced"
                            name="partsReplaced"
                            type="text"
                            required
                            value={resolveData.partsReplaced}
                            onChange={handleInputChange}
                            className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="e.g., RO Membrane, Carbon Filter"
                        />
                    </div>

                    {/* Work Description */}
                    <div>
                        <Label htmlFor="workDescription" className="dark:text-white flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Work Description *
                        </Label>
                        <Textarea
                            id="workDescription"
                            name="workDescription"
                            required
                            value={resolveData.workDescription}
                            onChange={handleInputChange}
                            className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Describe the work performed..."
                            rows={3}
                        />
                    </div>

                    {/* Resolution Notes */}
                    <div>
                        <Label htmlFor="resolutionNotes" className="dark:text-white flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Additional Notes (Optional)
                        </Label>
                        <Textarea
                            id="resolutionNotes"
                            name="resolutionNotes"
                            value={resolveData.resolutionNotes}
                            onChange={handleInputChange}
                            className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Any additional information or recommendations..."
                            rows={2}
                        />
                    </div>

                    <Separator />

                    {/* Summary Box */}
                    {ticket && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Resolution Summary</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p className="text-blue-700 dark:text-blue-300">Customer:</p>
                                <p className="font-medium text-blue-900 dark:text-blue-100">{ticket.customerName}</p>
                                <p className="text-blue-700 dark:text-blue-300">Ticket ID:</p>
                                <p className="font-medium text-blue-900 dark:text-blue-100">{ticket.id}</p>
                                <p className="text-blue-700 dark:text-blue-300">Date:</p>
                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                    {new Date().toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="dark:border-gray-700 dark:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                            disabled={resolving}
                        >
                            {resolving ? (
                                <>
                                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                                    Resolving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Confirm Resolution
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
