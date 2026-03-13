import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/user.model.js"
import Project from "../models/project.model.js"
import SupervisorRequest from "../models/supervisorRequest.model.js";
import * as userServices from "../services/userServices.js";
import * as notificationService from "../services/notificationService.js";
import * as projectServices from "../services/projectServices.js";


export const createStudent = asyncHandler(async(req,res,next)=>{
   const { name, email, password, department} = req.body;
   if(!name || !email || !password || !department){
    return next(new ErrorHandler("All feilds are required", 400))
   }

   const isAlreadyExist = await User.findOne({email});
   if(isAlreadyExist){
    return next(new ErrorHandler("Student with this email already exists.",400))
   }

   const studentInfo ={
    name,
    email,
    password,//alreaaady handled that password must me atleast 8 charcaters
    department,
    role: "Student",
   }

   const user = await userServices.createUser(studentInfo);

   res.status(201).json({
    success: true,
    user,
    message: "Student registered successfully."
   })

})

export const updateStudent = asyncHandler(async(req,res,next)=>{
  const {id} = req.params;
  const updateData = {...req.body};
  delete updateData.role; // Prevent role update

  const user = await userServices.updateUser(id, updateData);
  if(!user){
    return next(new ErrorHandler("Student not found",404))
  }

  res.status(200).json({
    success: true,
    user,
    message: "Student updated successfully"
  })

})

export const deleteStudent = asyncHandler(async(req,res,next)=> {
  const { id } = req.params;

  // const user = await User.findById(id);
  // if(!user){
  //   return next(new ErrorHandler("User not found",404))
  // }
  // await user.deleteOne();

  const user = await userServices.getUserById(id);
  if(!user){
    return next(new ErrorHandler("Student not found", 404))
  }

  if(user.role !== "Student"){
    return next(new ErrorHandler("User is not a student.",400))
  }

  await userServices.deleteUser(id);

  res.status(200).json({
    success: true,
    messsage: "User deleted successfully"
  })



})

export const createTeacher = asyncHandler(async(req,res,next)=>{
  const {name, email, password, department, maxStudents, experties} = req.body;
  if(!name || !email || !password || !department||  !maxStudents || !experties){
    return next(new ErrorHandler("All fields are required.",400))
  }

  const isEmailExist = await User.findOne({email});
  if(isEmailExist){
    return next(new ErrorHandler("User with this email already exists.", 400))
  }

  const teacherInfo = {
    name,
    email,
    password,
    department,
    maxStudents,
    experties: Array.isArray(experties)
    ? experties
    : typeof experties === "string" && experties.trim() !== ""
    ? experties.split(",").map(s => s.trim()) //coverts multiple experties into an array
    : [],
    role: "Teacher",
  }

  const user = await userServices.createUser(teacherInfo);

  res.status(201).json({
    sucess: true,
    message: "Teacher registered successfully",
    user,
  })

})

export const updateTeacher = asyncHandler(async(req,res,next)=>{
  const { id } = req.params;
  const updateData = {...req.body};
  delete updateData.role ;

 const user = await userServices.updateUser(id, updateData)

 if(!user){
  return next(new ErrorHandler("Teacher not found.",404))
 }

  res.status(200).json({
    success: true,
    message:"Teacher updated successfully.",
    user,
  })


})

export const deleteTeacher = asyncHandler(async(req,res,next)=>{
  const {id} = req.params;

  const user = await userServices.getUserById(id);

  if(!user){
    return next(new ErrorHandler("Teacher not found.",404))
  }

  if(user.role !== "Teacher"){
    return next(new ErrorHandler("User is not a teacher.",400))
  }

  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully."
  })

})

export const getAllUsers = asyncHandler(async(req,res,next)=>{
  const {users} = await userServices.getAllUsers();//cause we are returning it in {}so we are fdoin {users} if we returned users in getAllUsers without brackets then we can get users here like users
  res.status(200).json({
    success: true,
    message: "Users fetched successsully.",
    users
  })
})

export const getAllProjects = asyncHandler(async(req,res,next)=>{

  const projects = await projectServices.getAllProjects();
  res.json({
    success:true,
    message: "Project fetched successfully",
    data: {projects}
  })
})

export const getDashboardStats = asyncHandler(async(req,res,next)=>{
  const [
     totalStudents,
     totalTeachers,
     totalProjects,
     pendingRequests,
     completedProjects,
     pendingProjects,
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    Project.countDocuments(),
    SupervisorRequest.countDocuments({ status: "pending" }),
    Project.countDocuments({ status: "completed" }),
    Project.countDocuments({ status: "pending" }),
  ])

  res.status(200).json({
    success:true,
    message: "Admin Dashboard Stats fetched",
    data: {
      stats: {
    totalStudents,
     totalTeachers,
     totalProjects,
     pendingRequests,
     completedProjects,
     pendingProjects,
      }
    }
  })
})

export const assignSupervisor = asyncHandler(async(req,res,next)=>{
  const {studentId, supervisorId} = req.body;

  if(!studentId || !supervisorId){
    return next(new ErrorHandler("Student ID and Supervisor ID are required",400))
  }

  const project = await Project.findOne({student: studentId});

  if(!project){
  return next (new ErrorHandler("Project not found",404))
  }

  if(project.supervisor !== null){
    return next(new ErrorHandler("Supervisor already assigned",400))
  }

 if(project.status !== "approved"){
  return next(new ErrorHandler("Project not approved yet",400))
 }else if(project.status === "pending" || project.status === "rejected"){
  return next(new ErrorHandler("Project is in pending state or rejected",400))
 }

 const { student, supervisor} = await userServices.assignSupervisorDirectly(
  studentId,
  supervisorId
);

project.supervisor = supervisor._id;
await project.save();

await notificationService.notifyUser(
  studentId,
  `You have been assigned supervisor ${supervisor.name}`,
  "approval",
  "/student/status",
  "low"
);

await notificationService.notifyUser(
  supervisorId,
  `The student ${student.name} has been officially assigned to you for FYP supervision.`,
  "general",
  "/teacher/status",
  "low"
);

res.status(200).json({
  success: true,
  message : "Supervisor assigned successfully",
  data: {student, supervisor}
})


})

export const getProject = asyncHandler(async(req,res,next)=> {
  const {id} = req.params;
  const project = await projectServices.getProjectById(id);

  if(!project){
    return next(new ErrorHandler("Project not found",404))
  }

      const user = req.user;
      const userRole = (user.role || "").toLowerCase();
      const userId = user._id?.toString() || user.id;

      const hasAccess = userRole === "admin"
      || project.student._id.toString() === userId ||
      (project.supervisor && project.supervisor._id.toString() === userId);

    if(!hasAccess) return next(new ErrorHandler(
      "Not authorized to fetch project",
      403
    ))

    return res.status(200).json({
      success: true,
      data: {project},
    })

})

export const updateProjectStatus = asyncHandler(async(req,res,next)=> {
   const {id} = req.params;
   const updateData = req.body;
   const user = req.user;

   const project = await projectServices.getProjectById(id);

   if(!project){
    return next(new ErrorHandler("Project not found",404))
   }

      const userRole = (user.role || "").toLowerCase();
      const userId = user._id?.toString() || user.id;

      const hasAccess = userRole === "admin"
      || project.student._id.toString() === userId ||
      (project.supervisor && project.supervisor._id.toString() === userId);

    if(!hasAccess) return next(new ErrorHandler(
      "Not authorized to update project status",
      403
    ))

  const updatedProject = await projectServices.updateProject(id, updateData);

  return res.status(200).json({
    success: true,
    message: "Project status updated successfully",
    data: { project: updatedProject },
  })


})

// export const getAllUsers = asyncHandler(async(req,res,next)=>{
//   const users = await User.find();
//   res.status(200).json({
//     success: true,
//     users
//   })
// })

