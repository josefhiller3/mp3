
// source: https://www.youtube.com/watch?v=bJkRnvIT5jQ
// Load required packages


var mongoose = require('mongoose');
const express = require('express');

const user = express();
user.use(express.json());


// Define our user schema
var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    pendingTasks: [String],
    dateCreated: {type: Date, default: Date.now}
});

// Export the Mongoose model
const User = mongoose.model('User', UserSchema);

module.exports = function(router) {
    router.post('/users', async (req, res) => {
    try {
      const { name, email, pendingTasks } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      const newUser = new User({ name, email, pendingTasks });
      const savedUser = await newUser.save();
      res.status(201).json({ message: 'User created successfully', data: savedUser });
   
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error', data: err.message });
    }
    
    });

    router.get('/users', async (req, res) => {

      try {
        let where = {};
        let sort = {};
        let select = {};
        let skip = 0;
        let limit = 0;
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
          const count = await User.countDocuments(where);
          return res.status(200).json({ message: 'OK', data: count });
        }

        const users = await User.find(where).sort(sort).select(select).skip(skip).limit(limit);
        if (users.length === 0) {
            return res.status(200).json({ message: '', data: []});
        }  
        res.status(200).json({ message: 'OK', data: users });
    }
  
     catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
     }
    });

    router.get('/users/:id', async (req, res) => {
      try {
        let select = {};
        if (req.query.select) {
          try {
            select = JSON.parse(req.query.select);
          } catch {
            return res.status(400).json({ message: 'Invalid select query' });
          }
        }
        const user = await User.findById(req.params.id).select(select);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'OK', data: user });
      } catch (err) {
        if (err.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid ID format' });
        }
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
      }
  
    });

    router.put('/users/:id', async (req, res) => {
        try {
            const { name, email, pendingTasks } = req.body;
            if (!name || !email) {
                return res.status(400).json({ message: 'Name and email are required' });
            }
            const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, email, pendingTasks}, { new: true, overwrite: true});
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'OK', data: updatedUser });
        }
        catch (err) {
            if (err.name === 'CastError') {
               return res.status(400).json({ message: 'Invalid ID format' });
            }
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
        
    }) ;

    router.delete('/users/:id', async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) {
               return res.status(404).json({ message: 'User not found' });
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






