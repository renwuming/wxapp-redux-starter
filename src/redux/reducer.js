import { combineReducers } from '../vendors/redux.min.js';
import reduceReducers from '../vendors/reduce-reducers.js';

import { updateObject, updateItemInArray } from '../libs/utils.js';

// import reducers
import {
    // action
    UPDATE_USERINFO,
    UPDATE_SESSIONID,
    // reducer
    userReducer
} from './models/user.js';
// import reducers
import {
    // action
    UPDATE_ENTITIES,
    // reducer
    entitiesReducer
} from './models/entities.js';

import {
    // action
    UPDATE_PAPERS_LIST,
    // reducer
    papersReducer
} from './models/papers.js';


// ------------------------------------
// crossReducer start
// ------------------------------------
function crossReducer(state, action) {
    switch (action.type) {
        case UPDATE_USERINFO:
        case UPDATE_SESSIONID:
        case UPDATE_PAPERS_LIST:
            let payload = action.payload,
                normalizeData = payload.normalizeData;

            return updateObject(state, {
                entities: entitiesReducer(state.entities, {
                    type: UPDATE_ENTITIES,
                    payload: {
                        entities: normalizeData.entities
                    }
                })
            });
        default:
            return state;
    }
}
// ------------------------------------
// crossReducer end
// ------------------------------------

export const rootReducer = reduceReducers(
    combineReducers({
        entities: entitiesReducer,
        user: userReducer,
        papers: papersReducer
    }),
    crossReducer
);
