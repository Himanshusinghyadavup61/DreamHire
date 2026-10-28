import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'accepted', 'rejected'],
        default:'pending'
    }
},{timestamps:true});

// Challenge 3: Compound unique index prevents any applicant from applying to the same job twice, even under concurrent spam bot floods
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application  = mongoose.model("Application", applicationSchema);