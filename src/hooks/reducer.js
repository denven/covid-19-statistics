export const SET_OTHER_OVERALL = "SET_OTHER_OVERALL";
export const SET_CHINA_OVERALL = "SET_CHINA_OVERALL";
export const SET_GLOBAL_OVERALL = "SET_GLOBAL_OVERALL";
export const SET_GLOBAL_MAP = "SET_GLOBAL_MAP";
export const SET_CHINA_MAP = "SET_CHINA_MAP";
export const SET_GLOBAL_TABLE = "SET_GLOBAL_TABLE";
export const SET_LOAD_STATUS = "SET_LOAD_STATUS";

export default function reducer(state, action) {

  switch (action.type) {
    case SET_LOAD_STATUS:
      return { ...state, loaded: action.loaded };

    case SET_OTHER_OVERALL:
      return { ...state, otherOverall: action.otherToll };

    case SET_CHINA_OVERALL:
      return { ...state, chinaOverall: action.chinaToll };

    case SET_GLOBAL_OVERALL:
      return { ...state, globalOverall: action.globalToll };

    case SET_GLOBAL_MAP:
      return { ...state, globalMap: action.globalMap };

    case SET_GLOBAL_TABLE:
      return { ...state, tableData: action.tableData }; 

    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}
