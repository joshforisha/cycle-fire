import 'firebase/auth';
import 'firebase/database';
import xs, { Listener, MemoryStream, Stream } from 'xstream';
import { FirebaseAction, makeActionHandler } from './actions';
import {
  User as FirebaseUser,
  auth as firebaseAuth,
  database as firebaseDatabase,
  initializeApp
} from 'firebase/app';

export interface ActionResponse {
  name?: string;
  stream: Stream<any>;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket: string;
}

export interface ReferenceSource {
  child: (path: string) => ReferenceSource;
  events: EventLookup;
  value: MemoryStream<any>;
}

export interface ResultStream {
  action: FirebaseAction;
}

export type ResultMemoryStream = MemoryStream<any> & ResultStream;

export interface FirebaseSource {
  auth: {
    authState: MemoryStream<FirebaseUser | null>;
    currentUser: MemoryStream<FirebaseUser | null>;
    idToken: MemoryStream<FirebaseUser | null>;
    providersForEmail: (email: string) => MemoryStream<string[]>;
    redirectResult: MemoryStream<firebaseAuth.UserCredential>;
  };
  database: {
    ref: (path: string) => ReferenceSource;
    refFromURL: (url: string) => ReferenceSource;
  };
  select: (category: string) => Stream<any>;
}

export type EventLookup = (eventType: string) => MemoryStream<any>;

export type FirebaseDriver = (
  action$: Stream<FirebaseAction>
) => FirebaseSource;

export function makeFirebaseDriver(
  config: FirebaseConfig,
  appName?: string
): FirebaseDriver {
  const app = initializeApp(config, appName);
  const auth = app.auth();
  const db = app.database();
  const handleAction = makeActionHandler(app);

  function createResult$(action: FirebaseAction): ResultMemoryStream {
    const result$ = Stream.createWithMemory({
      start: listener => {
        try {
          const promise = handleAction(action);
          promise
            .catch(err => {
              listener.error(err);
            })
            .then(result => {
              listener.next(result);
              listener.complete();
            });
        } catch (err) {
          listener.error(err);
        }
      },

      stop: () => {}
    });
    Object.defineProperty(result$, 'action', {
      value: action,
      writable: false
    });
    result$.addListener({
      complete: () => {},
      error: () => {},
      next: () => {}
    });
    return result$ as ResultMemoryStream;
  }

  function firebaseDriver(action$: Stream<FirebaseAction>): FirebaseSource {
    const result$$ = action$.map(createResult$);
    result$$.addListener({
      complete: () => {},
      error: () => {},
      next: () => {}
    });

    const firebaseSource = {
      auth: {
        authState: Stream.createWithMemory({
          start: (listener: Listener<FirebaseUser | null>) => {
            auth.onAuthStateChanged(
              (user: FirebaseUser) => {
                listener.next(user);
              },
              err => {
                listener.error(err);
              },
              () => {
                listener.complete();
              }
            );
          },
          stop: () => null
        }),

        currentUser: Stream.createWithMemory({
          start: (listener: Listener<FirebaseUser | null>) => {
            let currentUser: FirebaseUser | null = null;
            auth.onIdTokenChanged(
              (_user: FirebaseUser) => {
                if (auth.currentUser !== currentUser) {
                  currentUser = auth.currentUser;
                  listener.next(currentUser);
                }
              },
              err => {
                listener.error(err);
              },
              () => {
                listener.complete();
              }
            );
          },
          stop: () => null
        }),

        idToken: Stream.createWithMemory({
          start: (listener: Listener<FirebaseUser | null>) => {
            auth.onIdTokenChanged(
              (user: FirebaseUser) => {
                listener.next(user);
              },
              err => {
                listener.error(err);
              },
              () => {
                listener.complete();
              }
            );
          },
          stop: () => null
        }),

        providersForEmail: (email: string) =>
          Stream.createWithMemory({
            start: (listener: Listener<string[]>) => {
              auth
                .fetchProvidersForEmail(email)
                .catch(err => {
                  listener.error(err);
                })
                .then(providers => {
                  listener.next(providers);
                });
            },
            stop: () => null
          }),

        redirectResult: Stream.createWithMemory({
          start: (listener: Listener<firebaseAuth.UserCredential>) => {
            auth
              .getRedirectResult()
              .catch(err => {
                listener.error(err);
              })
              .then(result => {
                listener.next(result);
              });
          },
          stop: () => null
        })
      },

      database: {
        ref: (path: string) => sourceReference(db.ref(path)),
        refFromURL: (url: string) => sourceReference(db.refFromURL(url))
      },

      select: (category: string) =>
        typeof category === 'undefined'
          ? result$$
          : result$$.filter(
              result$ =>
                result$.hasOwnProperty('action') &&
                result$.action.category === category
            )
    };

    return firebaseSource;
  }

  return firebaseDriver;
}

function makeReferenceEventsCallback(
  listener: Listener<any>
): (snapshot: firebaseDatabase.DataSnapshot) => void {
  return (snapshot: firebaseDatabase.DataSnapshot) => {
    if (snapshot !== null) {
      listener.next(snapshot.val());
    }
  };
}

function refEvents(ref: firebaseDatabase.Reference): EventLookup {
  return (eventType: string) => {
    let callback: (
      a: firebaseDatabase.DataSnapshot | null,
      b?: string | undefined
    ) => any;

    return Stream.createWithMemory({
      start: listener => {
        callback = makeReferenceEventsCallback(listener);
        ref.on(eventType, callback);
      },

      stop: () => {
        ref.off(eventType, callback);
      }
    });
  };
}

function sourceReference(dbRef: firebaseDatabase.Reference): ReferenceSource {
  const events: EventLookup = refEvents(dbRef);

  return {
    child: (path: string) => sourceReference(dbRef.child(path)),
    events: events,
    value: events('value')
  };
}
