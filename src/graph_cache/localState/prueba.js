import gql from 'graphql-tag'

const todos = {
	defaults: {
		todos: [
			{
				text: 'prueba',
				__typename: 'Todo'
			}
		]
	},
	resolvers: {
		Mutation: {
			addTodo: (_, { text }, { cache }) => {
				const newTodo = {
					text,
					__typename: 'Todo'
				}

				const query = gql`
					query GetTodos {
						todos @client {
							text
						}
					}
				`
				const previous = cache.readQuery({ query })
				const data = {
					todos: previous.todos.concat([newTodo])
				}
				cache.writeData({ data })

				return newTodo
			}
		},
		Query: {}
	}
}

export default todos
