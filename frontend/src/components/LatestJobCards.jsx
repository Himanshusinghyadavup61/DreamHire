import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    return (
        <div onClick={()=> navigate(`/description/${job._id}`)} className='p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer'>
            <div>
                <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                <p className='text-sm text-gray-500'>India</p>
            </div>
            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-gray-600'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-4 flex-wrap'>
                {job?.department && <Badge variant="secondary" className="font-semibold text-gray-700">{job?.department}</Badge>}
                <Badge className={job?.status === 'Closed' ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200'} variant="outline">
                    {job?.status || 'Open'}
                </Badge>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position || 1} Positions</Badge>
                <Badge className={'text-[#F83002] font-bold'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{job?.salary ? (typeof job?.salary === 'number' || /^\d+$/.test(job?.salary) ? `${job?.salary} LPA` : job?.salary) : "Not disclosed"}</Badge>
            </div>

        </div>
    )
}

export default LatestJobCards