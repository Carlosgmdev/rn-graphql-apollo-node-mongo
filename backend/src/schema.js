// El contrato público: GraphQL valida operaciones y variables contra este SDL.
export const typeDefs = `#graphql
  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  type User {
    id: ID!
    name: String!
    role: String!
  }

  type Task {
    id: ID!
    title: String!
    status: TaskStatus!
    createdAt: String!
    assignee: User
  }

  input CreateTaskInput {
    title: String!
    assigneeId: ID
  }

  type Movie {
    id: ID!
    title: String!
    director: String!
    year: Int!
    averageRating: Float
    ratingsCount: Int!
  }

  input RateMovieInput {
    movieId: ID!
    rating: Int!
  }

  type Query {
    tasks: [Task!]!
    task(id: ID!): Task
    users: [User!]!
    movies: [Movie!]!
    movie(id: ID!): Movie
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    setTaskStatus(id: ID!, status: TaskStatus!): Task!
    rateMovie(input: RateMovieInput!): Movie!
  }
`;
