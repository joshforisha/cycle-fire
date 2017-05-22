import 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import * as firebase from 'firebase'
import actions, { Action, ActionType, makeActionHandler } from './actions'
import { Listener, Producer, Stream } from 'xstream'

export const firebaseActions = actions

interface Config {
  apiKey: string
  authDomain: string
  databaseURL: string
  messagingSenderId: string
  projectId: string
  storageBucket: string
}

interface DatabaseReference {
  child: any
  values: Stream<any>
}

const emptyListener: Listener<undefined> = {
  complete: noop,
  error: noop,
  next: noop
}

export function makeFirebaseDriver (config: Config, name: string) {
  const app = firebase.initializeApp(config, name)
  const auth = app.auth()
  const database = app.database()

  return (action$: Stream<Action>) => {
    function refEvent$ (path: string, eventType: string): Stream<any> {
      return Stream.create({
        start: listener => database.ref(path).on(eventType, snapshot => {
          if (snapshot !== null) listener.next(snapshot.val())
        }),
        stop: noop
      })
    }

    let emitError: ((err?: object) => void) = noop
    const error$ = Stream.create({
      start: listener => {
        emitError = (err: object) => {
          listener.next(err)
        }
      },
      stop: noop
    })

    const handleAction = makeActionHandler(auth, database, emitError)
    const actionListener: Listener<Action> = {
      complete: noop,
      error: err => { console.error('Firebase sink error:', err) },
      next: handleAction
    }
    action$.addListener(actionListener)

    const source = {
      auth: {
        authStateChanges: Stream.create({
          start: listener => {
            auth.onAuthStateChanged(
              (nextOrObserver: (object | Function)) => {
                listener.next(nextOrObserver)
              },
              emitError,
              () => { listener.complete() }
            )
          },
          stop: noop
        }),
        idTokenChanges: Stream.create({
          start: listener => {
            auth.onIdTokenChanged(
              (nextOrObserver: (object | Function)) => {
                listener.next(nextOrObserver)
              },
              emitError,
              () => { listener.complete() }
            )
          },
          stop: noop
        }),
        providersForEmail: (email: string) => Stream.create({
          start: listener => {
            auth.fetchProvidersForEmail(email)
              .then(providers => { listener.next(providers) })
              .catch(emitError)
          },
          stop: noop
        }),
        redirectResults: Stream.create({
          start: listener => {
            auth.getRedirectResult()
              .then(result => { listener.next(result) })
              .catch(emitError)
          },
          stop: noop
        })
      },
      database: {
        ref: (path: string): DatabaseReference => ({
          child: (childPath: string) =>
            source.database.ref(`${path}/${childPath}`),
          values: refEvent$(path, 'value')
        })
      },
      errors: error$
    }

    return source
  }
}

function noop () {}
