export const SET_OVERALL = "SET_OVERALL";
export const SET_MAP_DATA = "SET_MAP";
export const SET_TABLE_DATA = "SET_TABLE";
export const SET_LOAD_STATUS = "SET_LOAD";

export default function reducer(state, action) {

  switch (action.type) {
    case SET_LOAD_STATUS:
      return { ...state, loaded: action.loaded };
    
    case SET_OVERALL:
      return { ...state, overall: action.overall };

    case SET_MAP_DATA:
      return { ...state, mapData: action.mapData };

    case SET_TABLE_DATA:
      return { ...state, tableData: action.tableData }; 

    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}
