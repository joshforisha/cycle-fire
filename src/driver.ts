import 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import * as firebase from 'firebase'
import { Action, makeActionHandler } from './actions'
import { Listener, MemoryStream, Stream } from 'xstream'

export interface ActionResponse {
  name?: string
  stream: Stream<any>
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  messagingSenderId: string
  projectId: string
  storageBucket: string
}

interface ReferenceSource {
  child: (path: string) => ReferenceSource
  events: EventLookup
  value: MemoryStream<any>
}

export interface FirebaseSource {
  auth: {
    authState: MemoryStream<Function | firebase.User>
    idToken: MemoryStream<Function | firebase.User>
    providersForEmail: (email: string) => MemoryStream<string[]>
    redirectResult: MemoryStream<firebase.auth.UserCredential>
  }
  database: {
    ref: (path: string) => ReferenceSource
  }
  responses: (name: string) => Stream<any>
}

type EventLookup = (eventType: string) => MemoryStream<any>

type FirebaseDriver = (action$: Stream<Action>) => FirebaseSource

function refEvents (ref: firebase.database.Reference): EventLookup {
  const makeCallback = (listener: Listener<any>) => (
    (snapshot: firebase.database.DataSnapshot) => {
      if (snapshot !== null) {
        listener.next(snapshot.val())
      }
    }
  )

  return (eventType: string) => {
    let callback: (
      a: firebase.database.DataSnapshot | null,
      b?: string | undefined
    ) => any

    return Stream.createWithMemory({
      start: listener => {
        callback = makeCallback(listener)
        ref.on(eventType, callback)
      },

      stop: () => {
        ref.off(eventType, callback)
      }
    })
  }
}

export function makeFirebaseDriver (
  config: FirebaseConfig,
  appName: string
): FirebaseDriver {
  const app = firebase.initializeApp(config, appName)
  const auth = app.auth()
  const db = app.database()
  const handleAction = makeActionHandler(app)

  function firebaseDriver (action$: Stream<Action>): FirebaseSource {
    const response$: Stream<ActionResponse> = action$
      .map(action => ({ name: action.name, stream: handleAction(action) }))

    response$.addListener({
      complete: () => {},
      error: () => {},
      next: () => {}
    })

    const firebaseSource = {
      auth: {
        authState: Stream.createWithMemory({
          start: (listener: Listener<Function | firebase.User>) => {
            auth.onAuthStateChanged(
              (nextOrObserver: (Function | firebase.User)) => {
                listener.next(nextOrObserver)
              },
              err => { listener.error(err) },
              () => { listener.complete() }
            )
          },
          stop: () => {}
        }),

        idToken: Stream.createWithMemory({
          start: (listener: Listener<Function | firebase.User>) => {
            auth.onIdTokenChanged(
              (nextOrObserver: (Function | firebase.User)) => {
                listener.next(nextOrObserver)
              },
              err => { listener.error(err) },
              () => { listener.complete() }
            )
          },
          stop: () => {}
        }),

        providersForEmail: (email: string) => Stream.createWithMemory({
          start: (listener: Listener<string[]>) => {
            auth.fetchProvidersForEmail(email)
              .catch(err => { listener.error(err) })
              .then(providers => { listener.next(providers) })
          },
          stop: () => {}
        }),

        redirectResult: Stream.createWithMemory({
          start: (listener: Listener<firebase.auth.UserCredential>) => {
            auth.getRedirectResult()
              .catch(err => { listener.error(err) })
              .then(result => { listener.next(result) })
          },
          stop: () => {}
        })
      },

      database: {
        ref: (path: string) => {
          const dbRef = db.ref(path)
          const events: EventLookup = refEvents(dbRef)

          const reference = {
            child: (childPath: string) => {
              const fullPath = [path, childPath].join('/').replace(/\/\//g, '')
              return firebaseSource.database.ref(fullPath)
            },
            events: events,
            value: events('value')
          }

          return reference
        }
      },

      responses: (responseName: string) => (
        response$
          .filter(response => response.name === responseName)
          .map(response => response.stream)
          .flatten()
      )
    }

    return firebaseSource
  }

  return firebaseDriver
}
