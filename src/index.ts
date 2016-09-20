import xs from 'xstream'
import { initializeApp } from 'firebase'

enum ActionType {
  CreateUserWithEmailAndPassword,
  Set,
  SignInWithEmailAndPassword,
  SignOut
}

interface Config {
  apiKey: string
  authDomain: string
  databaseURL: string
  storageBucket: string
}

export const firebaseActions = {
  createUserWithEmailAndPassword: (email: string, password: string) => ({
    email,
    password,
    type: ActionType.CreateUser
  }),
  set: (path: string, value: string) => ({
    path,
    type: ActionType.Set,
    value
  }),
  signInWithEmailAndPassword: (email: string, password: string) => ({
    email,
    password,
    type: ActionType.SignIn
  }),
  signOut: () => ({
    type: ActionType.SignOut
  })
}

export function makeFirebaseDriver (options: Config, name: string) {
  const app = initializeApp(options, name)
  const auth = app.auth()
  const database = app.database()

  return output$ => ({
    currentUser: xs.create({
      start: listener => {
        app.auth().onAuthStateChanged(user => {
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
              case ActionType.CreateUserWithEmailAndPassword:
                auth.createUserWithEmailAndPassword(action.email, action.password)
                  .catch(err => listener.next(err))
                break
              case ActionType.Set:
                database.ref(action.path).set(action.value)
                break
              case ActionType.SignInWithEmailAndPassword:
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
