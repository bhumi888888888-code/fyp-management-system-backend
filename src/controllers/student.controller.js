import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import * as projectServices from "../services/projectServices.js";
import * as requestService from "../services/requestService.js";
import * as notificationService from "../services/notificationService.js";
import Notification from "../models/notification.model.js";
import * as fileServices from "../services/fileServices.js";
import cloudinary from "../config/cloudinary.js";

export const getStudentProject = asyncHandler(async(req,res,next)=>{
  const studentId = req.user._id;

  const project  = await projectServices.getProjectByStudent(studentId); // we use {project} and destructure it if we return it like {project} but if we return it noramlly like project then we get it as project here

  if(!project){
     res.status(404).json({
    success: true,
    project: null,
    message: "No project found for this student"
  })
  }

  return res.status(200).json({
    success: true,
    project,
  })
})

export const submitProposal = asyncHandler(async(req,res,next)=>{
   const {title, description} = req.body;
   const studentId = req.user._id;

   if(!title || !description){
   return next(new ErrorHandler("All fields are required.",400))
   }

   const existingProject = await projectServices.getProjectByStudent(studentId);

  //  if(existingProject && existingProject.status !== "rejected"){
  //   return next(new ErrorHandler(
  //   "You already have an active project. You can only submit a new project if the project is rejected."
  //   ,400
  //   ))
  //  }

   if (existingProject) {
  if (existingProject.status !== "rejected") {
    return next(
      new ErrorHandler(
        "You already have an active project. You can only submit a new project if the project is rejected.",
        400
      )
    );
  }

  await Project.findByIdAndDelete(existingProject._id);
}
  //  if(existingProject.status === " rejected"){
  //   await  Project.findByIdAndDelete(existingProject._id);
  //  }

   const projectData = {
   student : studentId,
   title,
   description,
   }

  const project = await projectServices.createProject(projectData);

  await User.findByIdAndUpdate(studentId,  {project: project._id})

  res.status(201).json({
  success: true,
  data : {project},
  message: "Project proposal submitted successfully."
  })

})

export const uploadFiles = asyncHandler(async(req,res,next)=>{
   const {projectId} = req.params;
   const studentId = req.user._id;

   const project = await projectServices.getProjectById(projectId);

   if(!project ||
      project.student._id.toString() !== studentId.toString() ||
      project.status === "rejected"
  ){
    return next(new ErrorHandler("Not authorized to upload files to this project.", 403))
   }

   if(!req.files || req.files.length === 0){
    return next(new ErrorHandler("No files uploaded", 400))
   }

  // const uploadedFiles = [];
  // for(let file of req.files){
  //   const result = await cloudinary.uploader.upload(file.path,{
  //     folder: `projects/${projectId}`,
  //     resource_type: "auto",
  //   })
  //   uploadedFiles.push({
  //     fileType: file.mimetype,
  //     fileUrl: result.secure_url,
  //     originalName: file.originalname,
  //   })
  // }

  const uploadedFiles = [];
for (let file of req.files) {
  uploadedFiles.push({
    fileType: file.mimetype,
    fileUrl: file.path,   // this is the Cloudinary secure URL
    originalName: file.originalname,
  });
}


    const updatedProject = await projectServices.addFilesToProject(
    projectId,
    uploadedFiles,
   )


   res.status(200).json({
    success: true,
    message: "Files uploaded successfully.",
    project: updatedProject,
   })
})

export const getAvailableSupervisors = asyncHandler(async(req,res,next)=>{

  const supervisors = await User.find({ role: "Teacher" })
  .select("name email department experties")
  .lean(); //we need data for read only purpose we dont wanna update it improves perfomace fast

  res.status(200).json({
    success:true,
    supervisors,
    message: " Available supervisors fetched successfully."
  })



  // const supervisors = await User.find({role: "teacher"});
  // res.status(200).json({
  //   success:true,
  //   supervisors
  // })
})

export const getSupervisor = asyncHandler(async(req,res,next)=>{
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
     "name email department experties"
  );

  if(!student.supervisor){
    return res.status(200).json({
      success:true,
      data: {supervisor: null},
      message: "No supervisor assigned yet"
    })
  }

  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor}
  })

})

export const requestSupervisor = asyncHandler(async(req,res,next)=>{
  const {teacherId, message} = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);
  if(!student){
    return next(new ErrorHandler("Student not found",404))
  }
  if(student.supervisor){
    return next(new ErrorHandler("You already have a supervisor assigend",400))
  }

  const supervisor = await User.findById(teacherId);
  if(!supervisor || supervisor.role !== "Teacher"){
    return next(new ErrorHandler("Invaild supervisor selected.",400))
  }

  if(supervisor.maxStudents === supervisor.assignedStudents.length){
    return next(new ErrorHandler(
      "Selected supervisor has reached maximum student capacity.",
      400
    ))
  }

  const requestInfo={
    student: studentId,
    supervisor: teacherId,
    message,
  }

  const request = await requestService.createRequest(requestInfo);

  await notificationService.notifyUser(
    teacherId,
    `${student.name} has requested ${supervisor.name} to be their supervisor.`,
    "request",
    "/teacher/requests",
    "medium"
  );


  res.status(200).json({
    success: true,
    data: { request },
    message: "Supervisor request submitted successfully."
  })
  // const request = await SupervisorRequest.create(requestInfo);

  // await student.save()

  // res.status()

})

export const getDashboardStats = asyncHandler(async(req,res,next)=>{
  const studentId = req.user._id;

  const project = await Project.findOne({student: studentId})
  .sort({createdAt: -1})
  .populate("supervisor", "name")
  .lean();

  const now = new Date();
  const upcomingDeadlines = await Project.find({
    student: studentId ,
    deadline: {$gte : now }
  }).select("title description deadline")
  .sort({deadline: -1})
  .limit(3)
  .lean();

  const topNotifications = await Notification.find({user : studentId})
  .populate("user", "name")
  .sort({createdAt: -1})
  .limit(3)
  .lean();


  const feedbackNotifications = project?.feedback && project?.feedback.length > 0
  ? project.feedback
  .sort((a, b)=> new Date(b.createdAt)- new Date(a.createdAt))
  .slice(0, 2)
  : [];

  const supervisorName = project?.supervisor?.name || null ;

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully.",
    data: {
      project,
      upcomingDeadlines,
      topNotifications,
      feedbackNotifications,
      supervisorName
    }
  })

})

export const getFeedback = asyncHandler(async(req,res,next)=>{
  const {projectId} = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);
  if(!project || project.student._id.toString() !== studentId.toString()){
    return next (new ErrorHandler("Not authorized to view feedback for this project.", 403));
  }

  const sortedFeedback = project.feedback.sort((a,b)=> new Date(b.createdAt) -  new Date(a.createdAt)).map((f)=>( {
    _id: f._id,
    title: f.title,
    message: f.message,
    type: f.type,
    createdAt: f.createdAt,
    supervisorName: f.supervisorId?.name,
    supervisorEmail: f.supervisorId?.email,
  }))

  res.status(200).json({
    success: true,
    data: {
      feedback: sortedFeedback
    },
  })
})

export const downloadFile = asyncHandler(async(req,res,next)=>{
  const {projectId, fileId} = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);
  if(!project){
    return next(new ErrorHandler("Project not found.", 404));
  }
  if(project.student._id.toString() !== studentId.toString()){
    return next(new ErrorHandler("Not authorized to download file.",403))
  }
  const file = project.files.id(fileId);
  if(!file){
    return next(new ErrorHandler("File not found.",404))
  }

  return res.status(200).json({
    success: true,
    fileUrl: file.fileUrl,
    originalName: file.originalName,
  })

  // fileServices.streamDownload(file.fileUrl, res, file.originalName)


})





// export const getStudentProject = asyncHandler(async(req,res,next)=>{
//    const studentId = req.user._id;

//    const student = await User.findById({studentId});
//    if(!student){
//     return next(new ErrorHandler("Student not found.", 404))
//    }

//    const project = await Project.findOne({student});
//    if(!project){
//     return next(new ErrorHandler("Project not found.",404))
//    }

//    res.status(200).json({
//     success: true,
//     project
//    })

// })

// while comparing the ids we convert them into stirngs
// if(!project || project.student.toString() !== studentId.toString()){
