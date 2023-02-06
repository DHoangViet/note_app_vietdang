import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    content: {
        type: String,
    },
}, { timestamps: true } );

const NotificationModel = mongoose.model('Notification', notificationSchema);
export default NotificationModel;