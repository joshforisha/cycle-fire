import { ActionType } from 'actions'
import firebase from 'firebase'
import xs from 'xstream'

export interface Config {
  apiKey: string
  authDomain: string
  databaseURL: string
  storageBucket: string
}

export function makeFirebaseDriver (config: Config) {
  const app = firebase.initializeApp(config)
  const auth = app.auth()
  const database = app.database()

  return output$ => ({
    currentUser: xs.create({
      start: listener => {
        firebase.auth().onAuthStateChanged(user => {
          listener.next(user)
        })
      },
      stop: () => {}
    }),
    error: xs.create({
      start: listener => {
        output$.addListener({
          complete: () => {},
          error: err => console.error('Firebase sink error:', err),
          next: action => {
            switch (action.type) {
              case ActionType.CreateUser:
                auth.createUserWithEmailAndPassword(action.email, action.password)
                  .catch(err => listener.next(err))
                break
              case ActionType.Set:
                database.ref(action.path).set(action.value)
                break
              case ActionType.SignIn:
                auth.signInWithEmailAndPassword(action.email, action.password)
                  .catch(err => listener.next(err))
                break
              case ActionType.SignOut:
                auth.signOut().then(() => {}, err => listener.next(err))
                break
            }
          }
        })
      },
      stop: () => {}
    }),
    get: path => xs.create({
      start: listener => {
        return database.ref(path).on('value', snapshot => {
          listener.next(snapshot.val())
        })
      },
      stop: () => {}
    })
  })
}
