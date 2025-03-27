const express = require('express')
const mongoose = require('mongoose');
const app = express()
const connectDB = require('./db/db');
const cookieParser = require('cookie-parser');

require('dotenv').config()
require('./cronSlot/weeklySlotDuplication.js');
const adminRoutes = require('./routes/adminRoutes.js');
const patientRoutes = require('./routes/patientRoutes.js');
const doctorRoutes = require('./routes/docterRoutes.js');
const chatModel = require('./models/chatModel.js');

const http = require("http");
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

connectDB();
// io.on('connection', (socket) => {
//     console.log('A user connected');
  
//     // Join room and load previous messages
//     socket.on('joinRoom', async (data) => {
//       try {
//         const roomId = data.appointmentId.toString();
//         socket.join(roomId);
//         console.log(`User joined room: ${roomId}`);
  
//         // Find or create chat document
//         const chat = await chatModel.findOneAndUpdate(
//           { 
//             roomId: new mongoose.Types.ObjectId(roomId),
//             isDeleted: false 
//           },
//           {
//             $setOnInsert: { // Only set these if creating new document
//               roomId: new mongoose.Types.ObjectId(roomId),
//               patientId: new mongoose.Types.ObjectId(data.patientId),
//               doctorId: new mongoose.Types.ObjectId(data.doctorId),
//               messages: [] // Initialize empty messages array
//             }
//           },
//           { 
//             upsert: true,
//             new: true 
//           }
//         );
  
//         socket.emit("previousMessages", chat.messages);
//       } catch (error) {
//         console.error("Error in joinRoom:", error.message);
//       }
//     });
  
//     // Handle new chat messages
//     socket.on('chatMessage', async (data) => {
//       try {
//         const roomId = data.appointmentId.toString();
        
//         // Create new message object
//         const newMessage = {
//           text: data.message,
//           sender: data.senderType, // 'doctor' or 'patient'
//           date: new Date()
//         };
  
//         // Update chat document (create if doesn't exist)
//         const updatedChat = await chatModel.findOneAndUpdate(
//           { 
//             roomId: new mongoose.Types.ObjectId(roomId),
//             isDeleted: false 
//           },
//           {
//             $setOnInsert: { // Set these only for new documents
//               roomId: new mongoose.Types.ObjectId(roomId),
//               patientId: new mongoose.Types.ObjectId(data.patientId),
//               doctorId: new mongoose.Types.ObjectId(data.doctorId)
//             },
//             $push: { messages: newMessage } // Add to messages array
//           },
//           { 
//             upsert: true,
//             new: true 
//           }
//         );
  
//         // Broadcast to all in room
//         io.to(roomId).emit("newMessage", {
//           roomId: roomId,
//           message: newMessage
//         });
  
//       } catch (error) {
//         console.error("Error in chatMessage:", error.message);
//       }
//     });
  
//     socket.on("disconnect", () => {
//       console.log("A user disconnected");
//     });
// });
  
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', async (data) => {
        const room = data.appointmentId.toString();
        socket.join(room);
        console.log(`User joined room: ${room}`);

        try {
            const messages = await chatModel.find({
                roomId: new mongoose.Types.ObjectId(room),
                isDeleted: false,
            })

            socket.emit("previousMessages", messages);
            
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    });

    socket.on('chatMessage', async (data) => {
        try {
            console.log(data.message)
            const roomId = data.appointmentId.toString();
            console.log(roomId, "roomId>>>>>>>>>>>>>>>>>>");

            const chat = await chatModel.create({
                roomId: new mongoose.Types.ObjectId(roomId),
                patientId: new mongoose.Types.ObjectId(data.patientId),
                doctorId: new mongoose.Types.ObjectId(data.doctorId),
                message: data.message,
            });
            io.to(roomId).emit("chatMessage", chat);
        } catch (error) {
            console.error("Error fetching messages:", error);   
        }
    })

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

})

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctor', doctorRoutes);
// app.use('/api/appointments', appointmentRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 