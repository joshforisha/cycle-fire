export enum ActionType {
  CreateUser,
  Set,
  SignIn,
  SignOut
}

export default {
  [ActionType[ActionType.CreateUser]]: (email: string, password: string) => ({
    email,
    password,
    type: ActionType.CreateUser
  }),
  [ActionType[ActionType.Set]]: (path: string, value: string) => ({
    path,
    type: ActionType.Set,
    value
  }),
  [ActionType[ActionType.SignIn]]: (email: string, password: string) => ({
    email,
    password,
    type: ActionType.SignIn
  }),
  [ActionType[ActionType.SignOut]]: () => ({
    type: ActionType.SignOut
  })
}
