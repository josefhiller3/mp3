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
          let where = {};
          let sort = {};
          let select = {};
          let skip = 0;
          let limit = 100;
          let to_count = false;
          if (req.query.where) {
            try {
                where = JSON.parse(req.query.where);
            } catch (err) {
                return res.status(400).json({ message: 'Invalid where query' });
            }
          }
          if (req.query.sort) {
            try {
                sort = JSON.parse(req.query.sort);
            } catch (err) {
                return res.status(400).json({ message: 'Invalid sort query' });
            }
          }
          if (req.query.select) {
            try {
                select = JSON.parse(req.query.select);
            } catch {
                return res.status(400).json({ message: 'Invalid select query' });
            }
          }

          if (req.query.skip) {
            try {
                skip = parseInt(req.query.skip);
            } catch {
                return res.status(400).json({ message: 'Invalid skip query' });
            }
          }
          if (req.query.limit) {
            try {
                limit = parseInt(req.query.limit);
            } catch {
                return res.status(400).json({ message: 'Invalid limit query' });
            }
          }

          if (req.query.count && req.query.count === 'true') {
            to_count = true;
          }
          if (to_count) {
            const count = await Task.countDocuments(where);
            return res.status(200).json({ message: 'OK', data: count });
          }
          const tasks = await Task.find(where).sort(sort).select(select).skip(skip).limit(limit);
          if (tasks.length === 0) {
            return res.status(200).json({ message: 'OK', data: []});

          }
          res.status(200).json({ message: 'OK', data: tasks });

        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
        //     const tasks = await Task.find();
        //     if (tasks.length === 0) {
        //         return res.status(204).json({ message: 'No tasks found' });
        //     }
        //     res.status(200).json({ message: 'Tasks fetched successfully', data: tasks });
        // } catch (err) {
        //     res.status(500).json({ message: 'Internal Server Error', error: err.message });
        // }

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
            let select = {};
            if (req.query.select) {
                try {
                  select = JSON.parse(req.query.select);
                } catch { 
                  return res.status(400).json({ message: 'Invalid select query' });
                }
            }
            const task = await Task.findById(req.params.id).select(select);
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json({ message: 'OK', data: task });
        } catch (err) {
            if (err.name === 'CastError') {
                return res.status(400).json({ message: 'Invalid ID format' });
            }
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }

        // try {
        //     const task = await Task.findById(req.params.id);
        //     if (!task) {
        //         return res.status(404).json({ message: 'Task not found' });
        //     }
        //     res.status(200).json({ message: 'OK', data: task });

        // }
        // catch (err) {
        //     if (err.name === 'CastError') {
        //         return res.status(400).json({ message: 'Invalid ID format' });
        //     }
        //     res.status(500).json({ message: 'Internal Server Error', error: err.message });
        // }
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

