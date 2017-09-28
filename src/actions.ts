import * as firebase from 'firebase';

export enum AuthActionType {
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

export enum DatabaseActionType {
  GoOffline,
  GoOnline
}

export enum ReferenceActionType {
  Push,
  Remove,
  Set,
  SetPriority,
  SetWithPriority,
  Transaction,
  Update
}

export enum UserActionType {
  Unlink,
  UpdateEmail,
  UpdatePassword,
  UpdatePhoneNumber,
  UpdateProfile
}

export type ActionType =
  | AuthActionType
  | DatabaseActionType
  | ReferenceActionType
  | UserActionType;

type Priority = null | number | string;

export interface FirebaseAction {
  actionType: ActionType;
  as: (category: string) => FirebaseAction;
  [propName: string]: any;
}

export interface UserProfile {
  displayName: null | string;
  photoURL: null | string;
}

export type ActionHandler = ((action: FirebaseAction) => firebase.Promise<any>);

export type UpdateFn = ((value: any) => any);

function action(actionType: ActionType, props: object = {}): FirebaseAction {
  return Object.assign(
    {
      actionType,
      as: (category: string) =>
        action(actionType, Object.assign({ category }, props))
    },
    props
  );
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

    useDeviceLanguage: () => action(AuthActionType.UseDeviceLanguage),

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

export function makeActionHandler(app: firebase.app.App): ActionHandler {
  const auth = app.auth();
  const db = app.database();

  function handleAction(action: FirebaseAction): firebase.Promise<any> {
    switch (action.actionType) {
      case AuthActionType.ApplyActionCode:
        return auth.applyActionCode(action.code);

      case AuthActionType.CheckActionCode:
        return auth.checkActionCode(action.code);

      case AuthActionType.ConfirmPasswordReset:
        return auth.confirmPasswordReset(action.code, action.newPassword);

      case AuthActionType.CreateUserWithEmailAndPassword:
        return auth.createUserWithEmailAndPassword(
          action.email,
          action.password
        );

      case AuthActionType.SendPasswordResetEmail:
        return auth.sendPasswordResetEmail(action.email);

      case AuthActionType.SetPersistence:
        return auth.setPersistence(action.persistence);

      case AuthActionType.SignInAndRetrieveDataWithCredential:
        return auth.signInAndRetrieveDataWithCredential(action.credential);

      case AuthActionType.SignInAnonymously:
        return auth.signInAnonymously();

      case AuthActionType.SignInWithCredential:
        return auth.signInWithCredential(action.credential);

      case AuthActionType.SignInWithCustomToken:
        return auth.signInWithCustomToken(action.token);

      case AuthActionType.SignInWithEmailAndPassword:
        return auth.signInWithEmailAndPassword(action.email, action.password);

      case AuthActionType.SignInWithPhoneNumber:
        return auth.signInWithPhoneNumber(action.phoneNumber, action.verifier);

      case AuthActionType.SignInWithPopup:
        return auth.signInWithPopup(action.provider);

      case AuthActionType.SignInWithRedirect:
        return auth.signInWithRedirect(action.provider);

      case AuthActionType.SignOut:
        return auth.signOut();

      case AuthActionType.UseDeviceLanguage:
        return auth.useDeviceLanguage();

      case AuthActionType.VerifyPasswordResetCode:
        return auth.verifyPasswordResetCode(action.code);

      case DatabaseActionType.GoOffline:
        return db.goOffline();

      case DatabaseActionType.GoOnline:
        return db.goOnline();

      case ReferenceActionType.Push:
        return db.ref(action.refPath).push(action.value);

      case ReferenceActionType.Remove:
        return db.ref(action.refPath).remove();

      case ReferenceActionType.Set:
        return db.ref(action.refPath).set(action.value);

      case ReferenceActionType.SetPriority:
        return db.ref(action.refPath).setPriority(action.priority, () => null);

      case ReferenceActionType.SetWithPriority:
        return db
          .ref(action.refPath)
          .setWithPriority(action.value, action.priority);

      case ReferenceActionType.Transaction:
        return db.ref(action.refPath).transaction(action.updateFn);

      case ReferenceActionType.Update:
        return db.ref(action.refPath).update(action.values);

      case UserActionType.Unlink:
        return action.user.unlink();

      case UserActionType.UpdateEmail:
        return action.user.updateEmail(action.email);

      case UserActionType.UpdatePhoneNumber:
        return action.user.updatePhoneNumber(action.phoneNumber);

      case UserActionType.UpdateProfile:
        return action.user.updateProfile(action.profile);

      default:
        return new Promise((_resolve, reject) => {
          reject(new Error('No matching action type'));
        });
    }
  }

  return handleAction;
}
