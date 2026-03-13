import mongoose from "mongoose";


const deadlineSchema = new mongoose.Schema({
  name: {
    type:String,
    required: [true, "Deadline name/title is required."],
    trim: true,
    maxlength:[100, "Deadline name/title cannot be more than 100 characters."],
  },
  dueDate:{
    type: Date,
    required: [true, "Due Date is required."],
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Created by is required."],
  },
  project:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Project",
    required: [true, "Project ID is required."],
  },

},{timestamps:true})

// indexinf for better query performace
deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ project: 1 });
deadlineSchema.index({ createdBy: 1 });

const Deadline = mongoose.models.Deadline || mongoose.model("Deadline", deadlineSchema);
export default Deadline;
