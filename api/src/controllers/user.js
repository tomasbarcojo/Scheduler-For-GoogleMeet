const { User } = require('../db.js')
const bcrypt = require("bcrypt");

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
        res.status(400).send({message: 'Data required'})
      }
        try {
          const user = await User.findOne({ where: { email: email } })
          if (user) {
            return res.send({ message: "User already exists", status: 400 });
          }
          const userData = { name, lastname, email, password };
          const newUser = await User.create(userData)
          return res.status(201).send(newUser)
        } catch (err){
          console.log(err)
          return res.status(500).send(err)
        }
    },

    async loginUser(req, res) {
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ where: { email: email } })
        if (!user) {
          return res.status(400).send({ message: "Cuenta inexistente, registrese", status: 400 })
        }
        const validate = await bcrypt.compare(password, user.password)
        if (!validate) return res.status(400).json({ message: 'Invalid credentials' })
        res.status(200).send(user)
      } catch (err) { 
        console.log(err)
        res.status(500).send(err)
      }
    },

    async modifyUser(req, res) {
        try {

        } catch {

        }
    },

    async deleteUser(req, res) {
        try {

        } catch {

        }
    },

}