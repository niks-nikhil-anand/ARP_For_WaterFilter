'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateServiceEvent } from '@/actions/admin/serviceEvents'
import { toast } from 'sonner'

interface EditEventDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event: any
    agents: any[]
    onSuccess: () => void
}

export function EditEventDialog({ open, onOpenChange, event, agents, onSuccess }: EditEventDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        actionDate: '',
        status: '',
        agentId: '',
        description: '',
        remarks: '',
        feedback: ''
    })

    useEffect(() => {
        if (event) {
            setFormData({
                actionDate: event.actionDate ? new Date(event.actionDate).toISOString().split('T')[0] : '',
                status: event.status || 'PENDING',
                agentId: event.assignedTo?.id?.toString() || 'unassigned',
                description: event.description || '',
                remarks: event.remarks || '',
                feedback: event.feedback || ''
            })
        }
    }, [event])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!event) return

        setLoading(true)
        try {
            const updateData: any = {
                status: formData.status,
                description: formData.description,
                remarks: formData.remarks,
                feedback: formData.feedback,
                agentId: formData.agentId === 'unassigned' ? null : parseInt(formData.agentId)
            }

            if (formData.actionDate) {
                updateData.actionDate = new Date(formData.actionDate)
            }

            const result = await updateServiceEvent(event.id, updateData)

            if (result.success) {
                toast.success('Event updated successfully')
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error(result.error || 'Failed to update event')
            }
        } catch (error) {
            console.error('Update error:', error)
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Service Event #{event?.id}</DialogTitle>
                    <DialogDescription>
                        Modify event details, assignment, and status.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="actionDate">Action Date</Label>
                            <Input
                                id="actionDate"
                                type="date"
                                value={formData.actionDate}
                                onChange={(e) => handleChange('actionDate', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="agent">Assigned Agent</Label>
                        <Select value={formData.agentId} onValueChange={(val) => handleChange('agentId', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select agent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {agents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id.toString()}>
                                        {agent.user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Event description..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            value={formData.remarks}
                            onChange={(e) => handleChange('remarks', e.target.value)}
                            placeholder="Internal remarks..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea
                            id="feedback"
                            value={formData.feedback}
                            onChange={(e) => handleChange('feedback', e.target.value)}
                            placeholder="Customer feedback..."
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
