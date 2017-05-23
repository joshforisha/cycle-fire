# @joshforisha/cycle-firebase

[![build](https://img.shields.io/travis/joshforisha/cycle-firebase.svg)](https://travis-ci.org/joshforisha/cycle-firebase)
[![npm](https://img.shields.io/npm/v/@joshforisha/cycle-firebase.svg)](https://www.npmjs.com/package/@joshforisha/cycle-firebase)
[![firebase](https://img.shields.io/badge/firebase-v4-ba8baf.svg)](https://github.com/firebase/firebase-js-sdk/releases/tag/v4)

A [Firebase](https://firebase.google.com/) driver for [Cycle.js](http://cycle.js.org).

## Example

```js
import firebaseConfig from './firebaseConfig'
import { button, div, h2 } from '@cycle/dom'
import { firebaseActions, makeFirebaseDriver } from '@joshforisha/cycle-firebase'
import { run } from '@cycle/run'

function main (sources) {
  const action$ = sources.DOM.select('.shuffle').events('click')
    .map(() => Math.ceil(Math.random() * 99))
    .map(firebaseActions.database.ref('test').set)

  const vdom$ = sources.firebase.database.ref('test').values
    .map(value =>
      div([
        h2(value),
        button('.shuffle', 'Shuffle')
      ])
    )

  return {
    DOM: vdom$,
    firebase: action$
  }
}

run(main, {
  DOM: makeDOMDriver('Application'),
  firebase: makeFirebaseDriver(firebaseConfig)
})
```

## API

### <a id="firebaseActions"></a> `firebaseActions`

Write effects to the connected Firebase database are requested by calling an _action generator_&mdash;a function defined on the `firebaseActions` object&mdash;and passed to the `firebase` sink.

* `firebaseActions: object` containing:
  * `auth: object` containing:
    * <a id="firebaseActions.auth.applyActionCode"></a> `applyActionCode(code: string)` – triggers [`Auth.applyActionCode`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#applyActionCode)
    * <a id="firebaseActions.auth.checkActionCode"></a> `checkActionCode(code: string)` – triggers [`Auth.checkActionCode`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#checkActionCode)
    * <a id="firebaseActions.auth.confirmPasswordReset"></a> `confirmPasswordReset(code: string, newPassword: string)` – triggers [`Auth.confirmPasswordReset`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#confirmPasswordReset)
    * <a id="firebaseActions.auth.createUserWithEmailAndPassword"></a> `createUserWithEmailAndPassword(email: string, password: string)` – triggers [`Auth.createUserWithEmailAndPassword`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#createUserWithEmailAndPassword)
    * <a id="firebaseActions.auth.sendPasswordResetEmail"></a> `sendPasswordResetEmail(email: string)` – triggers [`Auth.sendPasswordResetEmail`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#sendPasswordResetEmail)
    * <a id="firebaseActions.auth.signInAnonymously"></a> `signInAnonymously()` – triggers [`Auth.signInAnonymously`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInAnonymously)
    * <a id="firebaseActions.auth.signInWithCredential"></a> `signInWithCredential(credential: AuthCredential)` – triggers [`Auth.signInWithCredential`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithCredential)
    * <a id="firebaseActions.auth.signInWithCustomToken"></a> `signInWithCustomToken(token: string)` – triggers [`Auth.signInWithCustomToken`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithCustomToken)
    * <a id="firebaseActions.auth.signInWithEmailAndPassword"></a> `signInWithEmailAndPassword(email: string, password: string)` – triggers [`Auth.signInWithEmailAndPassword`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithEmailAndPassword)
    * <a id="firebaseActions.auth.signInWithPopup"></a> `signInWithPopup(provider: AuthProvider)` – triggers [`Auth.signInWithPopup`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithPopup)
    * <a id="firebaseActions.auth.signOut"></a> `signOut()` – triggers [`Auth.signOut`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signOut)
  * `database: object` containing:
    * <a id="firebaseActions.database.goOffline"></a> `goOffline()` – triggers [`Database.goOffline`](https://firebase.google.com/docs/reference/js/firebase.database.Database#goOffline)
    * <a id="firebaseActions.database.goOnline"></a> `goOnline()` – triggers [`Database.goOnline`](https://firebase.google.com/docs/reference/js/firebase.database.Database#goOnline)
    * `ref(path: string) => object` containing:
      * <a id="firebaseActions.database.ref.push"></a> `push(value: any)` – triggers [`Reference.push`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#push)
      * <a id="firebaseActions.database.ref.remove"></a> `remove()` – triggers [`Reference.remove`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove)
      * <a id="firebaseActions.database.ref.set"></a> `set(value: any)` – triggers [`Reference.set`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#set)
      * <a id="firebaseActions.database.ref.setPriority"></a> `setPriority(priority: (string|null|number)` – triggers [`Reference.setPriority`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#setPriority)
      * <a id="firebaseActions.database.ref.setWithPriority"></a> `setWithPriority(value: any, priority: (string|null|number)` – triggers [`Reference.setWithPriority`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority)
      * <a id="firebaseActions.database.ref.transaction"></a> `transaction(updateFn: (value: any) => any` – triggers [`Reference.transaction`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction)
      * <a id="firebaseActions.database.ref.update"></a> `update(values: any)` – triggers [`Reference.update`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#update)

#### <a id="firebaseAction-as"></a> `<action>.as(name: string)`

Effectively attaches a `name` to the action's response stream, allowing for lookup using the source's [`responses()`](#source.responses).

```js
import { firebaseActions } from '@joshforisha/cycle-firebase'
import xs from 'xstream'

function Cycle (sources) {
  const setAction = firebaseActions.database.ref('test')
    .set('newValue')
    .as('setTestValue')

  sources.firebase.responses('setTestValue').addListener({
    error: err => { console.error(err) },
    next: response => { console.log(response) }
  })

  return {
    firebase: xs.of(setAction)
  }
}
```

### <a id="makeFirebaseDriver"></a> `makeFirebaseDriver(config, name?)`

* `config: object`
  * `apiKey: string`
  * `authDomain: string`
  * `databaseURL: string`
  * `messagingSenderId: string`
  * `projectId: string`
  * `storageBucket: string`
* `name?: string`

Initializes a connection to a Firebase database by calling [`firebase.initializeApp()`](https://firebase.google.com/docs/reference/js/firebase#.initializeApp), returning a _source_ object containing the following:

* `auth: object` containing:
  * <a id="source.auth.authState"></a> `authState` – a stream emitting values from [`Auth.onAuthStateChanged`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onAuthStateChanged)
  * <a id="source.auth.idToken"></a> `idToken` – a stream emitting values from [`Auth.onIdTokenChanged`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onIdTokenChanged)
  * <a id="source.auth.providersForEmail"></a> `providersForEmail(email: string)` – returns a stream emitting values from [`Auth.fetchProvidersForEmail`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#fetchProvidersForEmail)
  * <a id="source.auth.redirectResult"></a> `redirectResult` – a stream emitting values from [`Auth.getRedirectResult`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#getRedirectResult)
* `database: object` containing:
  * <a id="source.database.ref"></a> `ref(path: string)` – returns an object containing:
    * <a id="source.database.ref.child"></a> `child(path: string)` – returns a child reference of this same object type
    * <a id="source.database.ref.values"></a> `values` – a stream of the ref's values, utilizing [`Reference.on`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#on)
* <a id="source.responses"></a> `responses(name: string)` – returns a stream of responses from action requests that were named using [`<action>.as()`](#firebaseAction-as).
