require('dotenv').config()
const { User } = require('../db.js')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

const hashPassword = (password) => new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return reject(err)
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return reject(err)
        return resolve(hash)
      })
    })
  })
  
  User.addHook('beforeCreate', (user) => hashPassword(user.password)
    .then((newPassword) => {
      user.set('password', newPassword)
    })
    .catch((err) => {
      if (err) console.log(err)
    }))

module.exports = {
    async getUsers(req, res) {
        try {
          const users = await User.findAll()
          if (users && users.length === 0) {
            return res.status(404).send({message: 'No users'})
          } else {
            return res.status(200).send(users)
          }
        } catch (err) {
          console.log(err)
          res.status(400).send({message: 'Failed to get users'})
        }
    },

    async createUser(req, res) {
      const { name, lastname, email, password } = req.body
      if (!name || !lastname || !email || !password) {
        res.status(401).send({message: 'Data required', status: 401})
      }
        try {
          const user = await User.findOne({ where: { email: email } })
          if (user) {
            return res.status(400).send({ message: "User already exists", status: 400 });
          }
          const userData = { name, lastname, email, password };
          const newUser = await User.create(userData)
          return res.status(201).send({newUser, status: 201})
        } catch (err){
          console.log(err)
          return res.status(500).send(err)
        }
    },

    async loginUser(req, res) {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).send({message: 'Data required'})
      }
      try {
        const user = await User.findOne({ where: { email: email } })
        if (!user) {
          return res.status(400).send({ message: "Non-existent account, please sign in", status: 400 })
        }
        const validate = await bcrypt.compare(password, user.password)
        if (!validate) {
          return res.status(401).json({ message: 'Invalid credentials', status: 401 })
        }
        const token = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET)
        res.header('auth-token', token)
        res.status(200).send({token: token, user, status: 200})
      } catch (err) { 
        console.log(err)
        res.status(500).send(err)
      }
    },

    // async loginUser (req, res) {
    //   const username = req.body.username
    //   const user = {name: username}

    //   const token = jwt.sign(user, ACCESS_TOKEN_SECRET)
    //   res.json({user, token: token})
    // },

    async modifyUser(req, res) {
      const { name, lastname, newpassword } = req.body
        try {
          const user = await User.findByPk(req.params.id)
          if (!user) return res.status(404).send('User does not exist')
          
          user.name = name || user.name;
          user.lastname = lastname || user.lastname;
          let changedPassword = await hashPassword(newpassword)
          user.password = changedPassword || user.password;

          await user.save()
          res.status(200).send(user)
        } catch (err) {
          console.log(err);
          res.status(500).send({message: 'Something went wrong'})
        }
    },

    async deleteUser(req, res) { // not used
        try {
          
        } catch {

        }
    },

    async getOneUser(req, res) {
      try {
        const user = await User.findByPk(req.params.id)
        if (!user) {
          res.status(404).send({message: 'User not found'})
        }
        res.status(200).send(user)
      } catch (err) {
        console.log(err)
        res.status(500).send(err)
      }
  },

  async userLogout(req, res) {
    try {
      res.send({message: 'Disconnected'})
    } catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  }

}