import 'firebase/auth';
import 'firebase/database';
import {
  User as FirebaseUser,
  app as firebaseApp,
  auth as firebaseAuth
} from 'firebase/app';

export enum ActionType {
  AuthApplyActionCode,
  AuthCheckActionCode,
  AuthConfirmPasswordReset,
  AuthCreateUserWithEmailAndPassword,
  AuthSendPasswordResetEmail,
  AuthSetPersistence,
  AuthSignInAndRetrieveDataWithCredential,
  AuthSignInAnonymously,
  AuthSignInWithCredential,
  AuthSignInWithCustomToken,
  AuthSignInWithEmailAndPassword,
  AuthSignInWithPhoneNumber,
  AuthSignInWithPopup,
  AuthSignInWithRedirect,
  AuthSignOut,
  AuthUseDeviceLanguage,
  AuthVerifyPasswordResetCode,
  DatabaseGoOffline,
  DatabaseGoOnline,
  ReferencePush,
  ReferenceRemove,
  ReferenceSet,
  ReferenceSetPriority,
  ReferenceSetWithPriority,
  ReferenceTransaction,
  ReferenceUpdate,
  UserUnlink,
  UserUpdateEmail,
  UserUpdatePassword,
  UserUpdatePhoneNumber,
  UserUpdateProfile
}

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

export type ActionHandler = ((action: FirebaseAction) => Promise<any>);

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
      action(ActionType.AuthApplyActionCode, { code }),

    checkActionCode: (code: string) =>
      action(ActionType.AuthCheckActionCode, { code }),

    confirmPasswordReset: (code: string, newPassword: string) =>
      action(ActionType.AuthConfirmPasswordReset, { code, newPassword }),

    createUserWithEmailAndPassword: (email: string, password: string) =>
      action(ActionType.AuthCreateUserWithEmailAndPassword, {
        email,
        password
      }),

    sendPasswordResetEmail: (email: string) =>
      action(ActionType.AuthSendPasswordResetEmail, { email }),

    setPersistence: (persistence: firebaseAuth.Auth.Persistence) =>
      action(ActionType.AuthSetPersistence, { persistence }),

    signInAndRetrieveDataWithCredential: (
      credential: firebaseAuth.AuthCredential
    ) =>
      action(ActionType.AuthSignInAndRetrieveDataWithCredential, {
        credential
      }),

    signInAnonymously: () => action(ActionType.AuthSignInAnonymously),

    signInWithCredential: (credential: firebaseAuth.AuthCredential) =>
      action(ActionType.AuthSignInWithCredential, { credential }),

    signInWithCustomToken: (token: string) =>
      action(ActionType.AuthSignInWithCustomToken, { token }),

    signInWithEmailAndPassword: (email: string, password: string) =>
      action(ActionType.AuthSignInWithEmailAndPassword, { email, password }),

    signInWithPhoneNumber: (
      phoneNumber: string,
      verifier: firebaseAuth.ApplicationVerifier
    ) =>
      action(ActionType.AuthSignInWithPhoneNumber, { phoneNumber, verifier }),

    signInWithPopup: (provider: firebaseAuth.AuthProvider) =>
      action(ActionType.AuthSignInWithPopup, { provider }),

    signInWithRedirect: (provider: firebaseAuth.AuthProvider) =>
      action(ActionType.AuthSignInWithRedirect, { provider }),

    signOut: () => action(ActionType.AuthSignOut),

    useDeviceLanguage: () => action(ActionType.AuthUseDeviceLanguage),

    user: (user: FirebaseUser) => ({
      unlink: () => action(ActionType.UserUnlink, { user }),

      updateEmail: (email: string) =>
        action(ActionType.UserUpdateEmail, { email, user }),

      updatePassword: (password: string) =>
        action(ActionType.UserUpdatePassword, { password, user }),

      updatePhoneNumber: (phoneNumber: string) =>
        action(ActionType.UserUpdatePhoneNumber, { phoneNumber, user }),

      updateProfile: (profile: UserProfile) =>
        action(ActionType.UserUpdateProfile, { profile, user })
    }),

    verifyPasswordResetCode: (code: string) =>
      action(ActionType.AuthVerifyPasswordResetCode, { code })
  },

  database: {
    goOffline: () => action(ActionType.DatabaseGoOffline),

    goOnline: () => action(ActionType.DatabaseGoOnline),

    ref: (refPath: string) => ({
      push: (value: any) =>
        action(ActionType.ReferencePush, { refPath, value }),

      remove: () => action(ActionType.ReferenceRemove, { refPath }),

      set: (value: any) => action(ActionType.ReferenceSet, { refPath, value }),

      setPriority: (priority: Priority) =>
        action(ActionType.ReferenceSetPriority, { priority, refPath }),

      setWithPriority: (value: any, priority: Priority) =>
        action(ActionType.ReferenceSetWithPriority, {
          priority,
          refPath,
          value
        }),

      transaction: (updateFn: UpdateFn) =>
        action(ActionType.ReferenceTransaction, { refPath, updateFn }),

      update: (values: any) =>
        action(ActionType.ReferenceUpdate, { refPath, values })
    })
  }
};

export function makeActionHandler(app: firebaseApp.App): ActionHandler {
  const auth = app.auth();
  const db = app.database();

  function handleAction(action: FirebaseAction): Promise<any> {
    switch (action.actionType) {
      case ActionType.AuthApplyActionCode:
        return auth.applyActionCode(action.code);

      case ActionType.AuthCheckActionCode:
        return auth.checkActionCode(action.code);

      case ActionType.AuthConfirmPasswordReset:
        return auth.confirmPasswordReset(action.code, action.newPassword);

      case ActionType.AuthCreateUserWithEmailAndPassword:
        return auth.createUserWithEmailAndPassword(
          action.email,
          action.password
        );

      case ActionType.AuthSendPasswordResetEmail:
        return auth.sendPasswordResetEmail(action.email);

      case ActionType.AuthSetPersistence:
        return auth.setPersistence(action.persistence);

      case ActionType.AuthSignInAndRetrieveDataWithCredential:
        return auth.signInAndRetrieveDataWithCredential(action.credential);

      case ActionType.AuthSignInAnonymously:
        return auth.signInAnonymously();

      case ActionType.AuthSignInWithCredential:
        return auth.signInWithCredential(action.credential);

      case ActionType.AuthSignInWithCustomToken:
        return auth.signInWithCustomToken(action.token);

      case ActionType.AuthSignInWithEmailAndPassword:
        return auth.signInWithEmailAndPassword(action.email, action.password);

      case ActionType.AuthSignInWithPhoneNumber:
        return auth.signInWithPhoneNumber(action.phoneNumber, action.verifier);

      case ActionType.AuthSignInWithPopup:
        return auth.signInWithPopup(action.provider);

      case ActionType.AuthSignInWithRedirect:
        return auth.signInWithRedirect(action.provider);

      case ActionType.AuthSignOut:
        return auth.signOut();

      case ActionType.AuthUseDeviceLanguage:
        return auth.useDeviceLanguage();

      case ActionType.AuthVerifyPasswordResetCode:
        return auth.verifyPasswordResetCode(action.code);

      case ActionType.DatabaseGoOffline:
        return db.goOffline();

      case ActionType.DatabaseGoOnline:
        return db.goOnline();

      case ActionType.ReferencePush:
        return new Promise(resolve => {
          db
            .ref(action.refPath)
            .push(action.value)
            .then(value => resolve(value));
        });

      case ActionType.ReferenceRemove:
        return db.ref(action.refPath).remove();

      case ActionType.ReferenceSet:
        return db.ref(action.refPath).set(action.value);

      case ActionType.ReferenceSetPriority:
        return db.ref(action.refPath).setPriority(action.priority, () => null);

      case ActionType.ReferenceSetWithPriority:
        return db
          .ref(action.refPath)
          .setWithPriority(action.value, action.priority);

      case ActionType.ReferenceTransaction:
        return db.ref(action.refPath).transaction(action.updateFn);

      case ActionType.ReferenceUpdate:
        return db.ref(action.refPath).update(action.values);

      case ActionType.UserUnlink:
        return action.user.unlink();

      case ActionType.UserUpdateEmail:
        return action.user.updateEmail(action.email);

      case ActionType.UserUpdatePhoneNumber:
        return action.user.updatePhoneNumber(action.phoneNumber);

      case ActionType.UserUpdateProfile:
        return action.user.updateProfile(action.profile);

      default:
        return new Promise((_resolve, reject) => {
          reject(new Error('No matching action type'));
        });
    }
  }

  return handleAction;
}
