import * as firebase from 'firebase';
import { Stream } from 'xstream';

enum AuthActionType {
  ApplyActionCode,
  CheckActionCode,
  ConfirmPasswordReset,
  CreateUserWithEmailAndPassword,
  SendPasswordResetEmail,
  SetPersistence,
  SignInAndRetrieveDataWithCredential,
  SignInAnonymously,
  SignInWithCredential,
  SignInWithCustomToken,
  SignInWithEmailAndPassword,
  SignInWithPhoneNumber,
  SignInWithPopup,
  SignInWithRedirect,
  SignOut,
  UseDeviceLanguage,
  VerifyPasswordResetCode
}

enum DatabaseActionType {
  GoOffline,
  GoOnline
}

enum ReferenceActionType {
  Push,
  Remove,
  Set,
  SetPriority,
  SetWithPriority,
  Transaction,
  Update
}

enum UserActionType {
  Unlink,
  UpdateEmail,
  UpdatePassword,
  UpdatePhoneNumber,
  UpdateProfile
}

type ActionType =
  | AuthActionType
  | DatabaseActionType
  | ReferenceActionType
  | UserActionType;

type Priority = null | number | string;

export interface FirebaseAction {
  as: (name: string) => FirebaseAction;
  type: ActionType;
  [propName: string]: any;
}

export interface UserProfile {
  displayName: null | string;
  photoURL: null | string;
}

export type ActionHandler = ((action: FirebaseAction) => Stream<any>);

export type UpdateFn = ((value: any) => any);

function action(type: ActionType, props: object = {}): FirebaseAction {
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

  function handleAction(action: FirebaseAction): Stream<any> {
    switch (action.type) {
      case AuthActionType.ApplyActionCode:
        return Stream.fromPromise(auth.applyActionCode(action.code));

      case AuthActionType.CheckActionCode:
        return Stream.fromPromise(auth.checkActionCode(action.code));

      case AuthActionType.ConfirmPasswordReset:
        return Stream.fromPromise(
          auth.confirmPasswordReset(action.code, action.newPassword)
        );

      case AuthActionType.CreateUserWithEmailAndPassword:
        return Stream.fromPromise(
          auth.createUserWithEmailAndPassword(action.email, action.password)
        );

      case AuthActionType.SendPasswordResetEmail:
        return Stream.fromPromise(auth.sendPasswordResetEmail(action.email));

      case AuthActionType.SetPersistence:
        return Stream.fromPromise(auth.setPersistence(action.persistence));

      case AuthActionType.SignInAndRetrieveDataWithCredential:
        return Stream.fromPromise(
          auth.signInAndRetrieveDataWithCredential(action.credential)
        );

      case AuthActionType.SignInAnonymously:
        return Stream.fromPromise(auth.signInAnonymously());

      case AuthActionType.SignInWithCredential:
        return Stream.fromPromise(auth.signInWithCredential(action.credential));

      case AuthActionType.SignInWithCustomToken:
        return Stream.fromPromise(auth.signInWithCustomToken(action.token));

      case AuthActionType.SignInWithEmailAndPassword:
        return Stream.fromPromise(
          auth.signInWithEmailAndPassword(action.email, action.password)
        );

      case AuthActionType.SignInWithPhoneNumber:
        return Stream.fromPromise(
          auth.signInWithPhoneNumber(action.phoneNumber, action.verifier)
        );

      case AuthActionType.SignInWithPopup:
        return Stream.fromPromise(auth.signInWithPopup(action.provider));

      case AuthActionType.SignInWithRedirect:
        return Stream.fromPromise(auth.signInWithRedirect(action.provider));

      case AuthActionType.SignOut:
        return Stream.fromPromise(auth.signOut());

      case AuthActionType.UseDeviceLanguage:
        return Stream.fromPromise(auth.useDeviceLanguage());

      case AuthActionType.VerifyPasswordResetCode:
        return Stream.fromPromise(auth.verifyPasswordResetCode(action.code));

      case DatabaseActionType.GoOffline:
        return Stream.fromPromise(db.goOffline());

      case DatabaseActionType.GoOnline:
        return Stream.fromPromise(db.goOnline());

      case ReferenceActionType.Push:
        return Stream.fromPromise(db.ref(action.refPath).push(action.value));

      case ReferenceActionType.Remove:
        return Stream.fromPromise(db.ref(action.refPath).remove());

      case ReferenceActionType.Set:
        return Stream.fromPromise(db.ref(action.refPath).set(action.value));

      case ReferenceActionType.SetPriority:
        return Stream.fromPromise(
          db.ref(action.refPath).setPriority(action.priority, () => null)
        );

      case ReferenceActionType.SetWithPriority:
        return Stream.fromPromise(
          db.ref(action.refPath).setWithPriority(action.value, action.priority)
        );

      case ReferenceActionType.Transaction:
        return Stream.fromPromise(
          db.ref(action.refPath).transaction(action.updateFn)
        );

      case ReferenceActionType.Update:
        return Stream.fromPromise(db.ref(action.refPath).update(action.values));

      case UserActionType.Unlink:
        return Stream.fromPromise(action.user.unlink());

      case UserActionType.UpdateEmail:
        return Stream.fromPromise(action.user.updateEmail(action.email));

      case UserActionType.UpdatePhoneNumber:
        return Stream.fromPromise(
          action.user.updatePhoneNumber(action.phoneNumber)
        );

      case UserActionType.UpdateProfile:
        return Stream.fromPromise(action.user.updateProfile(action.profile));

      default:
        return Stream.empty();
    }
  }

  return handleAction;
}

export const firebaseActions = {
  auth: {
    applyActionCode: (code: string) =>
      action(AuthActionType.ApplyActionCode, { code }),

    checkActionCode: (code: string) =>
      action(AuthActionType.CheckActionCode, { code }),

    confirmPasswordReset: (code: string, newPassword: string) =>
      action(AuthActionType.ConfirmPasswordReset, { code, newPassword }),

    createUserWithEmailAndPassword: (email: string, password: string) =>
      action(AuthActionType.CreateUserWithEmailAndPassword, {
        email,
        password
      }),

    sendPasswordResetEmail: (email: string) =>
      action(AuthActionType.SendPasswordResetEmail, { email }),

    setPersistence: (persistence: firebase.auth.Auth.Persistence) =>
      action(AuthActionType.SetPersistence, { persistence }),

    signInAndRetrieveDataWithCredential: (
      credential: firebase.auth.AuthCredential
    ) =>
      action(AuthActionType.SignInAndRetrieveDataWithCredential, {
        credential
      }),

    signInAnonymously: () => action(AuthActionType.SignInAnonymously),

    signInWithCredential: (credential: firebase.auth.AuthCredential) =>
      action(AuthActionType.SignInWithCredential, { credential }),

    signInWithCustomToken: (token: string) =>
      action(AuthActionType.SignInWithCustomToken, { token }),

    signInWithEmailAndPassword: (email: string, password: string) =>
      action(AuthActionType.SignInWithEmailAndPassword, { email, password }),

    signInWithPhoneNumber: (
      phoneNumber: string,
      verifier: firebase.auth.ApplicationVerifier
    ) =>
      action(AuthActionType.SignInWithPhoneNumber, { phoneNumber, verifier }),

    signInWithPopup: (provider: firebase.auth.AuthProvider) =>
      action(AuthActionType.SignInWithPopup, { provider }),

    signInWithRedirect: (provider: firebase.auth.AuthProvider) =>
      action(AuthActionType.SignInWithRedirect, { provider }),

    signOut: () => action(AuthActionType.SignOut),

    user: (user: firebase.User) => ({
      unlink: () => action(UserActionType.Unlink, { user }),

      updateEmail: (email: string) =>
        action(UserActionType.UpdateEmail, { email, user }),

      updatePassword: (password: string) =>
        action(UserActionType.UpdatePassword, { password, user }),

      updatePhoneNumber: (phoneNumber: string) =>
        action(UserActionType.UpdatePhoneNumber, { phoneNumber, user }),

      updateProfile: (profile: UserProfile) =>
        action(UserActionType.UpdateProfile, { profile, user })
    }),

    verifyPasswordResetCode: (code: string) =>
      action(AuthActionType.VerifyPasswordResetCode, { code })
  },

  database: {
    goOffline: () => action(DatabaseActionType.GoOffline),

    goOnline: () => action(DatabaseActionType.GoOnline),

    ref: (refPath: string) => ({
      push: (value: any) =>
        action(ReferenceActionType.Push, { refPath, value }),

      remove: () => action(ReferenceActionType.Remove, { refPath }),

      set: (value: any) => action(ReferenceActionType.Set, { refPath, value }),

      setPriority: (priority: Priority) =>
        action(ReferenceActionType.SetPriority, { priority, refPath }),

      setWithPriority: (value: any, priority: Priority) =>
        action(ReferenceActionType.SetWithPriority, {
          priority,
          refPath,
          value
        }),

      transaction: (updateFn: UpdateFn) =>
        action(ReferenceActionType.Transaction, { refPath, updateFn }),

      update: (values: any) =>
        action(ReferenceActionType.Update, { refPath, values })
    })
  }
};
