import { PaginatedOrders } from './../generated/graphql'
import { getAccessToken, setAccessToken } from './../shared/accessToken'
import { createWithApollo } from './createWithApollo'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloLink, Observable } from 'apollo-link'
import { TokenRefreshLink } from 'apollo-link-token-refresh'
import { createUploadLink } from 'apollo-upload-client'
import { HttpLink } from 'apollo-link-http'
import { onError } from '@apollo/client/link/error'
import { NextPageContext } from 'next'
import { PaginatedStores } from '../generated/graphql'

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable((observer) => {
      let handle: any
      Promise.resolve(operation)
        .then((operation) => {
          const accessToken = getAccessToken()
          if (accessToken) {
            operation.setContext({
              headers: {
                authorization: `Bearer ${accessToken}`
              }
            })
          }
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          })
        })
        .catch(observer.error.bind(observer))

      return () => {
        if (handle) handle.unsubscribe()
      }
    })
)

const createClient = (ctx: NextPageContext) =>
  new ApolloClient({
    link: ApolloLink.from([
      new TokenRefreshLink({
        accessTokenField: 'accessToken',
        isTokenValidOrUndefined: () => {
          const token = getAccessToken()

          if (!token) {
            return true
          }

          try {
            const { exp } = jwtDecode(token)
            if (Date.now() >= exp * 1000) {
              return false
            } else {
              return true
            }
          } catch {
            return false
          }
        },
        fetchAccessToken: () => {
          return fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh_token`, {
            method: 'POST',
            credentials: 'include'
          })
        },
        handleFetch: (accessToken) => {
          setAccessToken(accessToken)
        },
        handleError: (err) => {
          console.warn('Your refresh token is invalid. Try to relogin')
          console.error(err)
        }
      }),
      onError(({ graphQLErrors, networkError }) => {
        console.log(graphQLErrors)
        console.log(networkError)
      }),
      requestLink,
      createUploadLink({
        uri: process.env.NEXT_PUBLIC_API_URL_GRAPHQL,
        credentials: 'include'
      })
    ]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            stores: {
              keyArgs: [],
              merge(
                existing: PaginatedStores | undefined,
                incoming: PaginatedStores
              ): PaginatedStores {
                return {
                  ...incoming,
                  stores: [...incoming.stores]
                }
              }
            },
            orders: {
              keyArgs: [],
              merge(
                existing: PaginatedOrders | undefined,
                incoming: PaginatedOrders
              ): PaginatedOrders {
                return {
                  ...incoming,
                  orders: [...incoming.orders]
                }
              }
            }
          }
        }
      }
    })
  })

export const withApollo = createWithApollo(createClient)
