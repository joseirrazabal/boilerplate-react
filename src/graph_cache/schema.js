const typeDefs = `
  type Query {
    todos: [Todo]
  }
  type Mutation {
    addTodo(text: String!): Todo
	}

  type Todo {
    text: String!
  }
`

export default typeDefs
