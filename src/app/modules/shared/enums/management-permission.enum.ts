export enum ManagementPermission {
  CG_UserOp          = 'CG_UserNew,CG_UserDel',
  CG_UserEditAndDel  = 'CG_UserEdit,CG_UserDel',
  CG_UserSearch      = 'CG_UserSearch',
  CG_UserNew         = 'CG_UserNew',
  CG_UserDel         = 'CG_UserDel',
  CG_UserEdit        = 'CG_UserEdit',

  CG_RoleOp     = 'CG_RoleNew,CG_RoleDel',
  CG_RoleSearch = 'CG_RoleSearch',
  CG_RoleNew    = 'CG_RoleNew',
  CG_RoleEdit   = 'CG_RoleEdit',
  CG_RoleDel    = 'CG_RoleDel',

  CG_Log = 'CG_DebugLogSearch,CG_ManagerLogSearch,CG_ServiceLogSearch',
  CG_DebugLogSearch   = 'CG_DebugLogSearch',
  CG_ManagerLogSearch = 'CG_ManagerLogSearch',
  CG_ServiceLogSearch = 'CG_ServiceLogSearch',

  CG_ApplicationOp       = 'CG_ApplicationSearch,CG_ApplicationNew,CG_ApplicationEdit,CG_ApplicationDel,' +
                              'CG_ApplicationDelToken,CG_ApplicationGenApiKey,CG_ApplicationSetPermission',
  CG_ApplicationSearch   = 'CG_ApplicationSearch',
  CG_ApplicationNew      = 'CG_ApplicationNew',
  CG_ApplicationEdit     = 'CG_ApplicationEdit',
  CG_ApplicationDel      = 'CG_ApplicationDel',
  CG_ApplicationDelToken = 'CG_ApplicationDelToken',
  CG_ApplicationGenApiKey = 'CG_ApplicationGenApiKey',
  CG_ApplicationSetPermission = 'CG_ApplicationSetPermission',

  CG_SettingEdit = 'CG_SettingEdit',

  CG_System = 'CG_UserSearch,CG_RoleSearch,CG_ApplicationSearch,CG_SettingEdit'
}
