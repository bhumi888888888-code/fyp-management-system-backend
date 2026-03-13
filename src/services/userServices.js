import User from "../models/user.model.js"

export const createUser = async (userData) => {
  try {
    return await User.create(userData);
  } catch (error) {
    error.message = `Error creating user : ${error.message}`;
    throw error;   // ← keep original error object
  }
}


// export const createUser = async(userData) => {
//   try{
//   const user = await User.create(userData)
//   return user
//   }catch(error){
//     throw new Error(`Error creating user : ${error.message}`)
//   }
// }

export const updateUser = async(id, updateData) => {
  try {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")
  } catch (error) {
    throw new Error(`Error updating user : ${error.message}`)
  }
}

export const getUserById = async(id) => {
 return await User.findById(id).select(
  "-password -resetPasswordToken -resetPasswordExpire"
 );
}


export const deleteUser = async(id) => {
  const user = await User.findById(id);
  if(!user){
    throw new Error("User not found")
  }
  await user.deleteOne();
}

export const getAllUsers = async() => {
   const query = {role: {$ne : "Admin"}}

   const users = await User.find(query)
   .select("-password -resetPasswordToken -resetPasswordExpire")
   .sort({createdAt: -1}); //latest user 1st

   const total = await User.countDocuments(query);

    return {users, total};
}

export const assignSupervisorDirectly = async(studentId, supervisorId) => {
  const student = await User.findOne({_id: studentId, role: "Student"});
  const supervisor = await User.findOne({_id: supervisorId, role: "Teacher"});
  if(!student){
    throw new Error("Student not found")
  }
  if(!supervisor){
    throw new Error("Supervisor not found")
  }

  if(!supervisor.hasCapacity()){
   throw new Error("Supervisor's assigned student capacity has reached its maximum limit")
  }
  // if(supervisor.assignedStudents === maxStudents){
  //   throw new Error("")
  // }

   student.supervisor = supervisorId;
   supervisor.assignedStudents.push(studentId);
   await Promise.all([student.save(), supervisor.save()]);
   return { student, supervisor }
}


// if we return somthing in { } while getting it we also have to use {} if we are not using them while return we are not gonna use thme while getting it
