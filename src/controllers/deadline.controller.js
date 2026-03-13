import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import Deadline from "../models/deadline.model.js";
import Project from "../models/project.model.js";
import { getProjectById  } from "../services/projectServices.js"

export const createDeadline = asyncHandler(async(req,res,next)=> {
  const { projectId } = req.params;
  const { name, dueDate } = req.body;
  const user = req.user._id;

  const project = await getProjectById(projectId);
  if(!project) {
    return next(new ErrorHandler("Project not found",404))
  }

  if(project.status === "completed") {
    return next(new ErrorHandler("Project is already completed",400))
  }

  if(project.status !== "approved") {
    return next(new ErrorHandler("Project is not approved",400))
  }


  if(!name || !dueDate){
    return next(new ErrorHandler("Name and due date are required", 400))
  }

  const deadlineData = {
    name, //title
    dueDate: new Date(dueDate),
    createdBy: user,
    project: project || null,
  }

  const deadline = await Deadline.create(deadlineData);

  await deadline.populate([
    {path: "createdBy", select: "name email"},
    {path :"project", select: "title student"},
  ])

  if(project) {
    await Project.findByIdAndUpdate(project._id,
      {deadline: dueDate},
      {new: true, runValidators: true}
    )
  }

  return res.status(201).json({
    success:true,
    message: "Deadline created successfully",
    data: {deadline},
  })
})
