import * as firebase from 'firebase';
import { Stream } from 'xstream';

enum ActionType {
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
  SetPriority,
  SetWithPriority,
  SignInAndRetrieveDataWithCredential,
  SignInAnonymously,
  SignInWithCredential,
  SignInWithCustomToken,
  SignInWithEmailAndPassword,
  SignInWithPhoneNumber,
  SignInWithPopup,
  SignInWithRedirect,
  SignOut,
  Transaction,
  Update,
  VerifyPasswordResetCode
}

type Priority = string | null | number;

export interface Action {
  as: (name: string) => Action;
  type: ActionType;
  [propName: string]: any;
}

export type ActionHandler = ((action: Action) => Stream<any>);

export type UpdateFn = ((value: any) => any);

function action(type: ActionType, props: object = {}): Action {
  return Object.assign(
    {
      as: (name: string) => action(type, Object.assign({}, props, { name })),
      type
    },
    props
  );
}

export function makeActionHandler(app: firebase.app.App): ActionHandler {
  const auth = app.auth();
  const db = app.database();

  function handleAction(action: Action): Stream<any> {
    switch (action.type) {
      case ActionType.ApplyActionCode:
        return Stream.fromPromise(auth.applyActionCode(action.code));
      case ActionType.CheckActionCode:
        return Stream.fromPromise(auth.checkActionCode(action.code));
      case ActionType.ConfirmPasswordReset:
        return Stream.fromPromise(
          auth.confirmPasswordReset(action.code, action.newPassword)
        );
      case ActionType.CreateUserWithEmailAndPassword:
        return Stream.fromPromise(
          auth.createUserWithEmailAndPassword(action.email, action.password)
        );
      case ActionType.GoOffline:
        return Stream.fromPromise(db.goOffline());
      case ActionType.GoOnline:
        return Stream.fromPromise(db.goOnline());
      case ActionType.Push:
        return Stream.fromPromise(db.ref(action.refPath).push(action.value));
      case ActionType.Remove:
        return Stream.fromPromise(db.ref(action.refPath).remove());
      case ActionType.SendPasswordResetEmail:
        return Stream.fromPromise(auth.sendPasswordResetEmail(action.email));
      case ActionType.Set:
        return Stream.fromPromise(db.ref(action.refPath).set(action.value));
      case ActionType.SetPriority:
        return Stream.fromPromise(
          db.ref(action.refPath).setPriority(action.priority, () => null)
        );
      case ActionType.SetWithPriority:
        return Stream.fromPromise(
          db.ref(action.refPath).setWithPriority(action.value, action.priority)
        );
      case ActionType.SignInAndRetrieveDataWithCredential:
        return Stream.fromPromise(
          auth.signInAndRetrieveDataWithCredential(action.credential)
        );
      case ActionType.SignInAnonymously:
        return Stream.fromPromise(auth.signInAnonymously());
      case ActionType.SignInWithCredential:
        return Stream.fromPromise(auth.signInWithCredential(action.credential));
      case ActionType.SignInWithCustomToken:
        return Stream.fromPromise(auth.signInWithCustomToken(action.token));
      case ActionType.SignInWithEmailAndPassword:
        return Stream.fromPromise(
          auth.signInWithEmailAndPassword(action.email, action.password)
        );
      case ActionType.SignInWithPhoneNumber:
        return Stream.fromPromise(
          auth.signInWithPhoneNumber(action.phoneNumber, action.verifier)
        );
      case ActionType.SignInWithPopup:
        return Stream.fromPromise(auth.signInWithPopup(action.provider));
      case ActionType.SignInWithRedirect:
        return Stream.fromPromise(auth.signInWithRedirect(action.provider));
      case ActionType.SignOut:
        return Stream.fromPromise(auth.signOut());
      case ActionType.Transaction:
        return Stream.fromPromise(
          db.ref(action.refPath).transaction(action.updateFn)
        );
      case ActionType.Update:
        return Stream.fromPromise(db.ref(action.refPath).update(action.values));
      case ActionType.VerifyPasswordResetCode:
        return Stream.fromPromise(auth.verifyPasswordResetCode(action.code));
      default:
        return Stream.empty();
    }
  }

  return handleAction;
}

export const firebaseActions = {
  auth: {
    applyActionCode: (code: string) =>
      action(ActionType.ApplyActionCode, { code }),

    checkActionCode: (code: string) =>
      action(ActionType.CheckActionCode, { code }),

    confirmPasswordReset: (code: string, newPassword: string) =>
      action(ActionType.ConfirmPasswordReset, { code, newPassword }),

    createUserWithEmailAndPassword: (email: string, password: string) =>
      action(ActionType.CreateUserWithEmailAndPassword, { email, password }),

    sendPasswordResetEmail: (email: string) =>
      action(ActionType.SendPasswordResetEmail, { email }),

    signInAndRetrieveDataWithCredential: (
      credential: firebase.auth.AuthCredential
    ) => action(ActionType.SignInAndRetrieveDataWithCredential, { credential }),

    signInAnonymously: () => action(ActionType.SignInAnonymously),

    signInWithCredential: (credential: firebase.auth.AuthCredential) =>
      action(ActionType.SignInWithCredential, { credential }),

    signInWithCustomToken: (token: string) =>
      action(ActionType.SignInWithCustomToken, { token }),

    signInWithEmailAndPassword: (email: string, password: string) =>
      action(ActionType.SignInWithEmailAndPassword, { email, password }),

    signInWithPhoneNumber: (
      phoneNumber: string,
      verifier: firebase.auth.ApplicationVerifier
    ) => action(ActionType.SignInWithPhoneNumber, { phoneNumber, verifier }),

    signInWithPopup: (provider: firebase.auth.AuthProvider) =>
      action(ActionType.SignInWithPopup, { provider }),

    signInWithRedirect: (provider: firebase.auth.AuthProvider) =>
      action(ActionType.SignInWithRedirect, { provider }),

    signOut: () => action(ActionType.SignOut),

    verifyPasswordResetCode: (code: string) =>
      action(ActionType.VerifyPasswordResetCode, { code })
  },
  database: {
    goOffline: () => action(ActionType.GoOffline),

    goOnline: () => action(ActionType.GoOnline),

    ref: (refPath: string) => ({
      push: (value: any) => action(ActionType.Push, { refPath, value }),

      remove: () => action(ActionType.Remove, { refPath }),

      set: (value: any) => action(ActionType.Set, { refPath, value }),

      setPriority: (priority: Priority) =>
        action(ActionType.SetPriority, { priority, refPath }),

      setWithPriority: (value: any, priority: Priority) =>
        action(ActionType.SetWithPriority, { priority, refPath, value }),

      transaction: (updateFn: UpdateFn) =>
        action(ActionType.Transaction, { refPath, updateFn }),

      update: (values: any) => action(ActionType.Update, { refPath, values })
    })
  }
};
