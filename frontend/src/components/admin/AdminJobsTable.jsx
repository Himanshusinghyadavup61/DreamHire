import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Badge } from '../ui/badge'
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { setAllAdminJobs } from '@/redux/jobSlice'

const AdminJobsTable = () => { 
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs || []);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => { 
        const jobs = allAdminJobs || [];
        const filteredJobs = jobs.filter((job) => {
            if (!searchJobByText) return true;
            const search = searchJobByText.toLowerCase();
            return job?.title?.toLowerCase().includes(search) || 
                   job?.company?.name?.toLowerCase().includes(search) ||
                   job?.department?.toLowerCase().includes(search) ||
                   job?.job_id?.toLowerCase().includes(search) ||
                   job?.status?.toLowerCase().includes(search);
        });
        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText]);

    const deleteJobHandler = async (e, jobId) => {
        e.stopPropagation();
        e.preventDefault();

        // If not in confirm state yet, prompt inline on the button
        if (confirmId !== jobId) {
            setConfirmId(jobId);
            return;
        }

        try {
            setDeletingId(jobId);
            const res = await axios.delete(`${JOB_API_END_POINT}/delete/${jobId}`, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message || "Job deleted successfully.");
                const updatedJobs = (allAdminJobs || []).filter(job => job._id !== jobId);
                dispatch(setAllAdminJobs(updatedJobs));
                setFilterJobs(prev => prev.filter(job => job._id !== jobId));
                setOpenPopoverId(null);
                setConfirmId(null);
            }
        } catch (error) {
            console.error("Delete job error:", error);
            const errorMsg = error.response?.data?.message || "Failed to delete job.";
            toast.error(errorMsg);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <Table>
                <TableCaption>A list of your posted jobs and recruitment statuses</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                                    No jobs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filterJobs?.map((job) => (
                                <TableRow key={job._id}>
                                    <TableCell className="font-mono text-xs font-semibold text-gray-700">
                                        {job?.job_id || 'N/A'}
                                    </TableCell>
                                    <TableCell className="font-medium">{job?.company?.name || 'N/A'}</TableCell>
                                    <TableCell className="font-medium">{job?.title}</TableCell>
                                    <TableCell>{job?.department || 'General'}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="outline" 
                                            className={job?.status === 'Closed' ? 'border-red-500 text-red-600 bg-red-50' : 'border-green-500 text-green-700 bg-green-50'}
                                        >
                                            {job?.status || 'Open'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{job?.createdAt ? job.createdAt.split("T")[0] : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Popover 
                                            open={openPopoverId === job._id} 
                                            onOpenChange={(open) => {
                                                setOpenPopoverId(open ? job._id : null);
                                                if (!open) setConfirmId(null);
                                            }}
                                        >
                                            <PopoverTrigger className="p-1 hover:bg-gray-100 rounded-md transition">
                                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-44 p-2 space-y-1" align="end">
                                                <div 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/jobs/${job._id}/applicants`);
                                                    }} 
                                                    className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer text-sm font-medium text-gray-700'
                                                >
                                                    <Eye className='w-4 h-4 text-blue-600'/>
                                                    <span>Applicants</span>
                                                </div>
                                                <div 
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => deleteJobHandler(e, job._id)} 
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm font-medium transition ${
                                                        confirmId === job._id 
                                                            ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                                                            : 'text-red-600 hover:bg-red-50'
                                                    } ${deletingId === job._id ? 'opacity-50 pointer-events-none' : ''}`}
                                                >
                                                    <Trash2 className={`w-4 h-4 ${confirmId === job._id ? 'text-white' : 'text-red-600'}`} />
                                                    <span>
                                                        {deletingId === job._id 
                                                            ? 'Deleting...' 
                                                            : confirmId === job._id 
                                                                ? 'Confirm Delete?' 
                                                                : job?.status === 'Closed' ? 'Delete Closed Job' : 'Delete Job'}
                                                    </span>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))
                        )
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable