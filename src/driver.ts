import 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import * as firebase from 'firebase'
import { Action, makeActionHandler } from './actions'
import { Listener, Stream } from 'xstream'

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

export interface FirebaseDatabaseSource {
  ref: (path: string) => FirebaseReferenceSource
}

export interface FirebaseReferenceSource {
  child: (path: string) => FirebaseReferenceSource
  events: (eventType: string) => Stream<any>
  value: Stream<any>
}

export interface FirebaseSource {
  database: FirebaseDatabaseSource
}

type FirebaseDriver = (action$: Stream<Action>) => FirebaseSource

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
        authState: Stream.create({
          start: listener => {
            auth.onAuthStateChanged(
              (nextOrObserver: (Function | object)) => {
                listener.next(nextOrObserver)
              },
              err => { listener.error(err) },
              () => { listener.complete() }
            )
          },
          stop: () => {}
        }),
        idToken: Stream.create({
          start: listener => {
            auth.onIdTokenChanged(
              (nextOrObserver: (Function | object)) => {
                listener.next(nextOrObserver)
              },
              err => { listener.error(err) },
              () => { listener.complete() }
            )
          },
          stop: () => {}
        }),
        providersForEmail: (email: string) => Stream.create({
          start: listener => {
            auth.fetchProvidersForEmail(email)
              .catch(err => { listener.error(err) })
              .then(providers => { listener.next(providers) })
          },
          stop: () => {}
        }),
        redirectResult: Stream.create({
          start: listener => {
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

          function events (eventType: string): Stream<any> {
            const makeCallback = (listener: Listener<any>) => (
              (snapshot: firebase.database.DataSnapshot) => {
                if (snapshot !== null) {
                  listener.next(snapshot.val())
                }
              }
            )
            let callback: (
              a: firebase.database.DataSnapshot | null,
              b?: string | undefined
            ) => any
            return Stream.create({
              start: listener => {
                callback = makeCallback(listener)
                dbRef.on(eventType, callback)
              },
              stop: () => {
                dbRef.off(eventType, callback)
              }
            })
          }

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
