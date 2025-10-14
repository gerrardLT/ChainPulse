import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL || 'http://localhost:8080/v1/graphql',
})

// WebSocket link for subscriptions
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url:
            process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_WS_URL ||
            'ws://localhost:8080/v1/graphql',
        })
      )
    : null

// Split links based on operation type
const splitLink =
  typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          )
        },
        wsLink,
        httpLink
      )
    : httpLink

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

