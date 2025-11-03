// Load required packages
var mongoose = require('mongoose');
const express = require('express');

// const task = express();
// task.use(express.json());

// Define our task schema
var TaskSchema = new mongoose.Schema({
    
    name: String,
    description: String,
    deadline: Date,
    completed: Boolean, 
    assignedUser: {type: String, default: ""},
    assignedUserName: {type: String, default: "unassigned"},
    dateCreated: {type: Date, default: Date.now}
});

const Task = mongoose.model('Task', TaskSchema);

// Export the Mongoose model
module.exports = function(router) {
    router.get('/tasks', async (req, res) => {
        try {
            const tasks = await Task.find();
            if (tasks.length === 0) {
                return res.status(204).json({ message: 'No tasks found' });
            }
            res.status(200).json({ message: 'Tasks fetched successfully', data: tasks });
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }

    });
    router.post('/tasks', async (req, res) => {
       try {
        const {name, description, deadline, completed} = req.body;
        if (!name || !deadline) {
            return res.status(400).json({ message: 'Both name and deadline is required' });

        }
        const newTask = new Task({name, description, deadline, completed});
        const savedTask = await newTask.save();
        res.status(201).json({ message: 'Task created successfully', data: savedTask });
   
       }
       catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
       }
    });

    router.get('/tasks/:id', async (req, res) => {
        try {
            const task = await Task.findById(req.params.id);
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json({ message: 'OK', data: task });

        }
        catch (err) {
            if (err.name === 'CastError') {
                return res.status(400).json({ message: 'Invalid ID format' });
            }
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    });

    router.put('/tasks/:id', async (req, res) => {
        try {
            const {name, description, deadline, completed, assignedUser, assignedUserName} = req.body;
            if (!name || !deadline) {
                return res.status(400).json({ message: 'Name and deadline are required' });
            }
            const updatedTask = await Task.findByIdAndUpdate(req.params.id, {name, description, deadline, completed, assignedUser, assignedUserName}, { new: true, overwrite: true});
            if (!updatedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json({ message: 'OK', data: updatedTask});
        }
        catch (err) {
            if (err.name === 'CastError') {
               return res.status(400).json({ message: 'Invalid ID format' });
            }
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
        
    });

    router.delete('/tasks/:id', async (req, res) => {
        try {
          const deletedTask = await Task.findByIdAndDelete(req.params.id);
          if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found'});
          }
          res.status(204).send();
          } catch (err) {
            if (err.name === 'CastError') {
                return res.status(400).json({ message: 'Invalid ID format' });
            }
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
          }
    
    });


    return router;
}

