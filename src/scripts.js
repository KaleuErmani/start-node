import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(express.json()) 
app.use(cors())

const users = [
    {id: 1, name: 'alice', available: true},
    {id: 2, name: 'joão', available: true},
    {id: 3, name: 'cleber', available: true},
    {id: 4, name: 'felipe', available: false}
]

app.get('/users', (request, response) => {
    if(users.lenght === 0) {
       return response.status(404).json({message: 'Nenhum usuario encontrado!'})
    }
    response.json(users)
})

app.post('/users', (request, response) => {
    const {name, available} = request.body

    if (!name) {
        return response.status(404).json({message: 'Nome de usuario é obrigatorio!'})
    }

    const newUser = {
        id: uuidv4(),
        name: name,
        available: available ?? true
    }

    users.push(newUser)

    response.status(201).json({message: 'Usuario adicionado com sucesso!', user: newUser})
})

app.put('/users/:id', (request, response) => {
    const { id } = request.params

    const { name: updateUser, available} = request.body

    const user = users.find(user => user.id == (id))

    if(!user) {
        return response.status(404).json({message: 'usuario não encontrado!'})
    }

    user.name = updateUser 
    user.available  = available

    const updates = request.body
    Object.keys(updates).forEach(key => {
        if (key in user) {
            user[key] = updates[key]
        }
    })

    response.status(200).json({message: 'Usuario atualizado com sucesso!', user})
})

app.get('/users/filtered', (request, response) => {
    const { filter } = request.query
  
    let filteredUsers = users
  
    if (filter === 'ativo') {
      filteredUsers = filteredUsers.filter(user => user.available === true)
    } else if (filter === 'inativo') {
      filteredUsers = filteredUsers.filter(user => user.available === false)
    }
  
    response.status(200).json(filteredUsers)
  })

  app.delete('/users/:id', (request, response) => {
    const { id} = request.params

    const userIndex = users.findIndex(user => user.id === (id))

    if (userIndex === -1) {
        return response.status(404).json({message: 'Usuario não encontrado.'})
    }   

    const [deletedUser] = users.splice(userIndex, 1)
    response.status(200).json({message: 'usuario removido com sucesso', user: deletedUser})
  })



  const adminUsers = []

app.post('/signup', async (request, response) => {
    try {
      const { username, password } = request.body
  
      const hashedPassword = await bcrypt.hash(password, 10)
  
      const existingUser = adminUsers.find(user => user.username === username)
  
      if (existingUser) {
        return response.status(400).json({message: 'Usuário já existe.'})
      }
  
      const newUser = {
        id: uuidv4(),
        username,
        password: hashedPassword
      }
  
      adminUsers.push(newUser)
  
      response.status(201).json({message: 'Admin cadastrado com sucesso.', user: newUser})
    } catch {
      response.status(500).json({message: 'Erro ao cadastrar admin.'})
    }
  })

  app.post('/login', async (request, response) => {
    try {
      const { username, password } = request.body
  
      const user = adminUsers.find(user => user.username === username)
  
      if (!user) {
        return response.status(404).json({message: 'Admin não encontrado.'})
      }
  
      const isMatch = await bcrypt.compare(password, user.password)
  
      if (!isMatch) {
        return response.status(400).json({message: 'Senha incorreta.'})
      }
  
      response.status(200).json({message: 'Login de admim realizado com sucesso.'})
    } catch {
      response.status(500).json({message: 'Erro ao fazer login.'})
    }
  })


app.listen(3000, () => {
    console.log('O servidor esta rodando na porta 3000.')
})