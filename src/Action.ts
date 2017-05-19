import * as firebase from 'firebase'

export enum ActionType {
  ApplyActionCode,
  CheckActionCode,
  ConfirmPasswordReset,
  CreateUserWithEmailAndPassword,
  GoOffline,
  GoOnline,
  Push,
  Remove,
  SendPasswordResetEmail,
  Set,
  SignInAnonymously,
  SignInWithCredential,
  SignInWithCustomToken,
  SignInWithEmailAndPassword,
  SignInWithPopup,
  SignOut,
  Transaction,
  Update
}

interface Action {
  type: ActionType
  [propName: string]: any
}
export default Action

export const actions = {
  applyActionCode: (code: string) => ({
    code,
    type: ActionType.ApplyActionCode
  }),
  checkActionCode: (code: string) => ({
    code,
    type: ActionType.CheckActionCode
  }),
  createUserWithEmailAndPassword: (email: string, password: string) => ({
    email,
    password,
    type: ActionType.CreateUserWithEmailAndPassword
  }),
  goOffline: () => ({
    type: ActionType.GoOffline
  }),
  goOnline: () => ({
    type: ActionType.GoOnline
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
  sendPasswordResetEmail: (email: string) => ({
    email,
    type: ActionType.SendPasswordResetEmail
  }),
  set: (path: string, values: any) => ({
    path,
    type: ActionType.Set,
    values
  }),
  signInAnonymously: () => ({
    type: ActionType.SignInAnonymously
  }),
  signInWithCredential: (credential: firebase.auth.AuthCredential) => ({
    credential,
    type: ActionType.SignInWithCredential
  }),
  signInWithCustomToken: (token: string) => ({
    token,
    type: ActionType.SignInWithCustomToken
  }),
  signInWithEmailAndPassword: (email: string, password: string) => ({
    email,
    password,
    type: ActionType.SignInWithEmailAndPassword
  }),
  signInWithPopup: (provider: firebase.auth.AuthProvider) => ({
    provider,
    type: ActionType.SignInWithPopup,
  }),
  signOut: () => ({
    type: ActionType.SignOut
  }),
  transaction: (path: string, updateFn: (value: any) => any) => ({
    path,
    type: ActionType.Transaction,
    updateFn
  }),
  update: (path: string, values: any) => ({
    path,
    type: ActionType.Update,
    values
  })
}

export function makeActionHandler (
  auth: firebase.auth.Auth,
  database: firebase.database.Database,
  emitError: ((err: any) => void)
): ((action: Action) => void) {
  return action => {
    switch (action.type) {
      case ActionType.ApplyActionCode:
        auth.applyActionCode(action.code)
          .catch(emitError)
        break
      case ActionType.CheckActionCode:
        auth.checkActionCode(action.code)
          .catch(emitError)
        break
      case ActionType.CreateUserWithEmailAndPassword:
        auth.createUserWithEmailAndPassword(action.email, action.password)
          .catch(emitError)
        break
      case ActionType.GoOffline:
        database.goOffline()
        break
      case ActionType.GoOnline:
        database.goOnline()
        break
      case ActionType.Push:
        database.ref(action.path).push(action.values)
        break
      case ActionType.Remove:
        database.ref(action.path).remove()
        break
      case ActionType.SendPasswordResetEmail:
        auth.sendPasswordResetEmail(action.email)
          .catch(emitError)
        break
      case ActionType.Set:
        database.ref(action.path).set(action.values)
        break
      case ActionType.SignInAnonymously:
        auth.signInAnonymously()
          .catch(emitError)
        break
      case ActionType.SignInWithCredential:
        auth.signInWithCredential(action.credential)
          .catch(emitError)
        break
      case ActionType.SignInWithCustomToken:
        auth.signInWithCustomToken(action.token)
          .catch(emitError)
        break
      case ActionType.SignInWithEmailAndPassword:
        auth.signInWithEmailAndPassword(action.email, action.password)
          .catch(emitError)
        break
      case ActionType.SignInWithPopup:
        auth.signInWithPopup(action.provider)
          .catch(emitError)
        break
      case ActionType.SignOut:
        auth.signOut()
          .catch(emitError)
        break
      case ActionType.Transaction:
        database.ref(action.path).transaction(action.updateFn)
          .catch(emitError)
        break
      case ActionType.Update:
        database.ref(action.path).update(action.values)
        break
      default:
        console.warn('Unhandled Firebase action:', action)
    }
  }
}
