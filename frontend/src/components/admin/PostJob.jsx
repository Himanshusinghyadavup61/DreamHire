import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const PostJob = () => {
    const [input, setInput] = useState({
        job_id: "",
        title: "",
        department: "",
        status: "Open",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 1,
        companyId: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company) => company.name.toLowerCase() === value);
        if (selectedCompany) {
            setInput({ ...input, companyId: selectedCompany._id });
        }
    };

    const statusChangeHandler = (value) => {
        setInput({ ...input, status: value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message || "Job posted successfully.");
                navigate("/admin/jobs");
            }
        } catch (error) {
            console.error("Post job error:", error);
            toast.error(error.response?.data?.message || "Failed to post job");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-screen my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md w-full'>
                    <h2 className='text-xl font-bold text-gray-800 mb-4'>Post a New Job</h2>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label>Job ID (e.g. JOB-204)</Label>
                            <Input
                                type="text"
                                name="job_id"
                                placeholder="JOB-204"
                                value={input.job_id}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 font-mono"
                            />
                        </div>
                        <div>
                            <Label>Department</Label>
                            <Input
                                type="text"
                                name="department"
                                placeholder="e.g. Engineering, HR, Product"
                                value={input.department}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Job Title *</Label>
                            <Input
                                type="text"
                                name="title"
                                placeholder="e.g. Senior Frontend Engineer"
                                value={input.title}
                                onChange={changeEventHandler}
                                required
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select onValueChange={statusChangeHandler} defaultValue={input.status}>
                                <SelectTrigger className="w-full my-1">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='col-span-2'>
                            <Label>Description *</Label>
                            <Input
                                type="text"
                                name="description"
                                placeholder="Job overview and key responsibilities"
                                value={input.description}
                                onChange={changeEventHandler}
                                required
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Requirements (comma separated) *</Label>
                            <Input
                                type="text"
                                name="requirements"
                                placeholder="React, Node.js, MongoDB"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                required
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Salary *</Label>
                            <Input
                                type="text"
                                name="salary"
                                placeholder="e.g. ₹10,00,000 - ₹15,00,000 or 12"
                                value={input.salary}
                                onChange={changeEventHandler}
                                required
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Location *</Label>
                            <Input
                                type="text"
                                name="location"
                                placeholder="e.g. Bengaluru, Remote"
                                value={input.location}
                                onChange={changeEventHandler}
                                required
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Job Type *</Label>
                            <Input
                                type="text"
                                name="jobType"
                                placeholder="e.g. Full Time, Part Time, Contract"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                required
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Experience Level (years) *</Label>
                            <Input
                                type="text"
                                name="experience"
                                placeholder="e.g. 1-3 Years, Fresher, 2"
                                value={input.experience}
                                onChange={changeEventHandler}
                                required
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>No of Positions *</Label>
                            <Input
                                type="number"
                                name="position"
                                min={1}
                                value={input.position}
                                onChange={changeEventHandler}
                                required
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div className='col-span-2'>
                            <Label>Company *</Label>
                            {
                                companies.length > 0 ? (
                                    <Select onValueChange={selectChangeHandler}>
                                        <SelectTrigger className="w-full my-1">
                                            <SelectValue placeholder="Select a Company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {
                                                    companies.map((company) => {
                                                        return (
                                                            <SelectItem key={company._id} value={company?.name?.toLowerCase()}>
                                                                {company.name}
                                                            </SelectItem>
                                                        )
                                                    })
                                                }
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className='text-xs text-red-600 font-bold my-2'>*Please register a company first before posting jobs.</p>
                                )
                            }
                        </div>
                    </div> 
                    {
                        loading ? (
                            <Button className="w-full my-4" disabled> 
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait... 
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4 bg-[#7209b7] hover:bg-[#5f32ad]">
                                Post New Job
                            </Button>
                        )
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob