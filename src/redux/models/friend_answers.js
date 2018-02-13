import Promise from '../../vendors/es6-promise.js';
import { normalize, arrayOf } from '../../vendors/normalizr.min.js';
import { GET, POST } from '../../libs/request.js';

import { updateObject } from '../../libs/utils.js';

// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_ANSWERS = 'UPDATE_ANSWERS';
// ------------------------------------
// helpers
// ------------------------------------

// ------------------------------------
// Actions
// ------------------------------------
export function updateAnswers(normalizeData) {
    return {
        type: UPDATE_ANSWERS,
        payload: {
            normalizeData,
        }
    }
}


// ------------------------------------
// Async Actions
// ------------------------------------
export const fetchFriendAnswers = () => {
    return (dispatch, getState) => {
        let state = getState(),
            oldAnswers = state.entities.answers,
            sessionid = state.entities.sessionid,
            url = `/test/friendtest`,
            params = { sessionid },
            normalizeData = {
                entities: {},
            };

        return GET(url, params, 500)
            .then(function(res) {
                let answers = res.answers;

                normalizeData.entities.answers = updateObject(oldAnswers, answers);

                dispatch(updateAnswers(
                    normalizeData
                ));
            });
    }

}

export const dispatchFriendAnswers = (answers) => {
    return (dispatch, getState) => {
        let oldAnswers = getState().entities.answers,
            normalizeData = {
                entities: {},
            };
        normalizeData.entities.answers = updateObject(oldAnswers, answers);

        dispatch(updateAnswers(
            normalizeData
        ));

        return Promise.resolve();
    }

}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [UPDATE_ANSWERS]: (answers, action) => {
        return {};
    },
}
// ------------------------------------
// Reducer
// ------------------------------------
export function answersReducer(answers = {}, action) {
    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(answers, action) : answers
}
