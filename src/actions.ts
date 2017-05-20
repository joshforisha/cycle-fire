import * as firebase from 'firebase'

export enum ActionType {
  ApplyActionCode,
  ConfirmPasswordReset,
  CreateUserWithEmailAndPassword,
  GoOffline,
  GoOnline,
  Push,
  Remove,
  SendPasswordResetEmail,
  Set,
  SetPriority,
  SetWithPriority,
  SignInAnonymously,
  SignInWithCredential,
  SignInWithCustomToken,
  SignInWithEmailAndPassword,
  SignInWithPopup,
  SignOut,
  Transaction,
  Update
}

export interface Action {
  type: ActionType
  [propName: string]: any
}

export function applyActionCode (code: string) {
  return {
    code,
    type: ActionType.ApplyActionCode
  }
}

export function createUserWithEmailAndPassword (
  email: string,
  password: string
) {
  return {
    email,
    password,
    type: ActionType.CreateUserWithEmailAndPassword
  }
}

export function goOffline () {
  return {
    type: ActionType.GoOffline
  }
}

export function goOnline () {
  return {
    type: ActionType.GoOnline
  }
}

export function push (path: string, values: any) {
  return {
    path,
    type: ActionType.Push,
    values
  }
}

export function remove (path: string) {
  return {
    type: ActionType.Remove,
    path
  }
}

export function sendPasswordResetEmail (email: string) {
  return {
    email,
    type: ActionType.SendPasswordResetEmail
  }
}

export function set (path: string, value: any) {
  return {
    path,
    type: ActionType.Set,
    value
  }
}

export function setPriority (
  path: string,
  priority: (string | null | number)
) {
  return {
    path,
    priority,
    type: ActionType.SetPriority
  }
}

export function setWithPriority (
  path: string,
  value: any,
  priority: (string | null | number)
) {
  return {
    path,
    priority,
    type: ActionType.SetWithPriority,
    value
  }
}

export function signInAnonymously () {
  return {
    type: ActionType.SignInAnonymously
  }
}

export function signInWithCredential (
  credential: firebase.auth.AuthCredential
) {
  return {
    credential,
    type: ActionType.SignInWithCredential
  }
}

export function signInWithCustomToken (token: string) {
  return {
    token,
    type: ActionType.SignInWithCustomToken
  }
}

export function signInWithEmailAndPassword (
  email: string,
  password: string
) {
  return {
    email,
    password,
    type: ActionType.SignInWithEmailAndPassword
  }
}

export function signInWithPopup (provider: firebase.auth.AuthProvider) {
  return {
    provider,
    type: ActionType.SignInWithPopup,
  }
}

export function signOut () {
  return {
    type: ActionType.SignOut
  }
}

export function transaction (
  path: string,
  transactionUpdate: (value: any) => any
) {
  return {
    path,
    transactionUpdate,
    type: ActionType.Transaction
  }
}

export function update (path: string, values: any) {
  return {
    path,
    type: ActionType.Update,
    values
  }
}

const actions = {
  applyActionCode,
  createUserWithEmailAndPassword,
  goOffline,
  goOnline,
  push,
  remove,
  sendPasswordResetEmail,
  set,
  setPriority,
  setWithPriority,
  signInAnonymously,
  signInWithCredential,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  transaction,
  update
}
export default actions

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
          .catch(emitError)
        break
      case ActionType.Remove:
        database.ref(action.path).remove()
          .catch(emitError)
        break
      case ActionType.SendPasswordResetEmail:
        auth.sendPasswordResetEmail(action.email)
          .catch(emitError)
        break
      case ActionType.Set:
        database.ref(action.path).set(action.value)
          .catch(emitError)
        break
       case ActionType.SetPriority:
         database.ref(action.path).setPriority(action.priority, () => {})
           .catch(emitError)
         break
      case ActionType.SetWithPriority:
        database.ref(action.path)
          .setWithPriority(action.value, action.priority)
          .catch(emitError)
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
        database.ref(action.path).transaction(action.transactionUpdate)
          .catch(emitError)
        break
      case ActionType.Update:
        database.ref(action.path).update(action.values)
          .catch(emitError)
        break
      default:
        console.warn('Unhandled Firebase action:', action)
    }
  }
}
