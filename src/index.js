const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  if (!id) {
    return next();
  }

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  request.todo = todo;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }
  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/users", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const newTodo = {
    title,
    deadline: new Date(deadline),
    done: false,
    id: uuidv4(),
    created_at: new Date(),
  };
  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;
  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { todo } = request;
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user, todo } = request;
  user.todos.splice(todo, 1);
  return response.status(204).send();
});

module.exports = app;
