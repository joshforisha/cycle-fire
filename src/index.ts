import xs from 'xstream'
import { initializeApp } from 'firebase'

enum ActionType {
  CreateUserWithEmailAndPassword,
  Push,
  Remove,
  Set,
  SignInWithEmailAndPassword,
  SignOut,
  Update
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
    type: ActionType.CreateUserWithEmailAndPassword
  }),
  push: (path: string, values: any) => ({
    path,
    type: ActionType.Push,
    values
  }),
  remove: (path: string) => ({
    type: ActionType.Remove,
    path
  }),
  set: (path: string, values: any) => ({
    path,
    type: ActionType.Set,
    values
  }),
  signInWithEmailAndPassword: (email: string, password: string) => ({
    email,
    password,
    type: ActionType.SignInWithEmailAndPassword
  }),
  signOut: () => ({
    type: ActionType.SignOut
  }),
  update: (path: string, values: any) => ({
    path,
    type: ActionType.Update,
    values
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
              case ActionType.Push:
                database.ref(action.path).push(action.values)
                break
              case ActionType.Remove:
                database.ref(action.path).remove()
                break
              case ActionType.Set:
                database.ref(action.path).set(action.values)
                break
              case ActionType.SignInWithEmailAndPassword:
                auth.signInWithEmailAndPassword(action.email, action.password)
                  .catch(err => listener.next(err))
                break
              case ActionType.SignOut:
                auth.signOut().then(() => {}, err => listener.next(err))
                break
              case ActionType.Update:
                database.ref(action.path).update(action.values)
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
