export const findModuleCodeByName = (
  modules: Array<{ name: string; code: string }>,
  moduleName: String
) => {
  let _moduleFound = modules.find((el: any) => el.name === moduleName);
  return _moduleFound?.code;
};

export const findModuleNameByCode = (
  modules: Array<{ name: string; code: string }>,
  moduleCode: String
) => {
  let _moduleFound = modules.find((el: any) => el.name === moduleCode);
  return _moduleFound?.name;
};
