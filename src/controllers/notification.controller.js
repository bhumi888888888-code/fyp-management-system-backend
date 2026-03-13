import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import Notification from "../models/notification.model.js";
import * as userServices from "../services/userServices.js"
import * as notificationServices from "../services/notificationService.js"


export const getNotifications = asyncHandler(async(req,res,next)=>{
  const userId = req.user._id;
  const role = req.user.role;

  console.log("Notification userId:", userId);
  // const user = await userServices.getUserById(userId);

  let query = {};

  if(role === "Admin"){
    query.type = { $in : ["request"] };
  }else {
    query.user = userId;
  }

  const notifications = await Notification.find(query).sort( {createdAt: -1 });
  const unreadOnly = notifications.filter(n => !n.isRead)
  const readOnly = notifications.filter(n => n.isRead)
  const highPriorityMessages = notifications.filter((n) => n.priority === " high")

  const now  =new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0);


  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999);

  const thisWeekNotifications = notifications.filter(n => {
    const created = new Date(n.createdAt);
    return created >= startOfWeek && created <= endOfWeek;
  })

  res.status(200).json({
    success: true,
    message : "Notifications fetched successfully.",
    data: {
      notifications,
      unreadOnly: unreadOnly.length,
      readOnly: readOnly.length,
      highPriorityMessages: highPriorityMessages.length,
      thisWeekNotifications: thisWeekNotifications.length,
    }
  })

})


export const markAsRead = asyncHandler(async(req,res,next) => {
   const { id } = req.params;
   const userId = req.user._id;


  const notification = await notificationServices.markAsRead(id,userId)
  if(!notification) {
   return next(new ErrorHandler("Notification not found",404))
  }

  res.status(200).json({
    success:true,
    message: "Notification marked as read",
    data: { notification },
  });

  //  const notification = await Notification.findById(id);

  //  if(notification.user._id.toString() !== userId.toString()){
  //    return next(new ErrorHandler("Not aauthorized to read this notification",403))
  //  }

  //  notification.isPread = true;
  //  await notification.save()


});


export const markAllAsRead = asyncHandler(async(req,res,next)=> {
  const userId = req.user._id;

   await notificationServices.markAllAsRead(userId);

   res.status(200).json({
    success: true,
    message: "All notifications marked as read",
   })



})

export const deleteNotification = asyncHandler(async(req,res,next)=>{
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await notificationServices.deleteNotification(id, userId);
  if(!notification){
    return next(new ErrorHandler("Notification not found.", 404))
  }

  res.status(200).json({
    success:true,
    messsage: "Notification deleted successfully."
  })
})


