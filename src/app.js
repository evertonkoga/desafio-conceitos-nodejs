const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
const messageRepositoryNotFound = { error: 'Repository not found.' };

function validateIdRepository(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id))
    return response.status(400).json({ error: 'Invalid repository ID.' })

  return next();
}

app.use('/repositories/:id', validateIdRepository);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { url, title, techs } = request.body;

  const repository = { id: uuid(), url, title, techs, likes: 0 }

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { url, title, techs } = request.body;

  const repositoryIndex = getRepositoryIndex(id);
  if (repositoryIndex < 0)
    return response.status(400).json(messageRepositoryNotFound);

  const { likes } = repositories[repositoryIndex];

  const repository = { id, url, title, techs, likes };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndex(id);
  if (repositoryIndex < 0)
    return response.status(400).json(messageRepositoryNotFound);

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndex(id);
  if (repositoryIndex < 0)
    return response.status(400).json(messageRepositoryNotFound);

  const { url, title, techs, likes } = repositories[repositoryIndex];

  let likesInNumber = parseInt(likes);
  const repository = { id, url, title, techs, likes: ++likesInNumber }

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

function getRepositoryIndex(id) {
  return repositories.findIndex(repository => repository.id == id);
}

module.exports = app;
